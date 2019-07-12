import {execAsync, isMacOS, Log} from '@diez/cli-core';
import {
  AssetFolder,
  CodegenDesignSystem,
  codegenDesignSystem,
  createDesignSystemSpec,
  GeneratedAssets,
  getColorInitializer,
  getLinearGradientInitializer,
  getTypographInitializer,
  locateFont,
  pascalCase,
  registerAsset,
  registerFont,
} from '@diez/generation';
import {pathExists} from 'fs-extra';
import {basename, extname, join, relative} from 'path';
import {Exporter, ExporterFactory, ExporterInput} from '../api';
import {cliReporters, createFolders, escapeShell, locateBinaryMacOS} from '../utils';

const sketchExtension = '.sketch';

/**
 * @param sketchtoolPath path to the `sketchtool` executable
 * @param source Sketch file from where to export
 * @param folder output folder
 */
const runExportCommand = (sketchtoolPath: string, source: string, folder: string, out: string) => {
  const output = escapeShell(join(out, folder));
  const command =
    `${sketchtoolPath} export --format=png --scales=1,2,3,4 --output=${output} ${folder} ${escapeShell(source)}`;

  return execAsync(command);
};

interface SketchColor {
  value: string;
}

interface SketchColorAsset {
  name: string;
  color: SketchColor;
}

interface SketchPoint {
  x: number;
  y: number;
}

interface SketchGradientStop {
  position: number;
  color: SketchColor;
}

const enum SketchGradientType {
  Linear = 0,
}

interface SketchLinearGradient {
  gradientType: SketchGradientType.Linear;
  from: SketchPoint;
  to: SketchPoint;
  stops: SketchGradientStop[];
}

type SketchGradient = SketchLinearGradient | {gradientType: unknown};

const isSketchLinearGradient = (gradient: SketchGradient): gradient is SketchLinearGradient => {
  return gradient.gradientType === SketchGradientType.Linear;
};

interface SketchGradientAsset {
  name: string;
  gradient: SketchGradient;
}

interface SketchAssets {
  colorAssets: SketchColorAsset[];
  gradientAssets: SketchGradientAsset[];
  // TODO: support images.
  imageCollection: never[];
}

interface SketchSharedTypograph {
  name: string;
  value: {
    textStyle: {
      MSAttributedStringColorAttribute?: {
        value: string;
      };
      NSFont: {
        attributes: {
          NSFontNameAttribute: string;
          NSFontSizeAttribute: number;
        };
        family: string;
      };
    };
  };
}

interface SketchLayer {
  ['<class>']: string;
  exportOptions: {
    exportFormats: {}[];
  };
  layers?: SketchLayer[];
  frame: {
    width: number;
    height: number;
  };
  name: string;
}

interface SketchDump {
  assets: SketchAssets;
  layerTextStyles: {
    objects: SketchSharedTypograph[];
  };
  pages: SketchLayer[];
}

const isClassOfSlice = (classType: string) =>
  classType !== 'MSArtboardGroup' && classType !== 'MSPage';

const populateAssets = (assetsDirectory: string, layers: SketchLayer[], extractedAssets: GeneratedAssets) => {
  for (const layer of layers) {
    if (layer.exportOptions.exportFormats.length && isClassOfSlice(layer['<class>'])) {
      registerAsset(
        {
          src: join(assetsDirectory, AssetFolder.Slice, `${layer.name}.png`),
          width: layer.frame.width,
          height: layer.frame.height,
        },
        AssetFolder.Slice,
        extractedAssets,
      );
    }

    if (layer.layers) {
      populateAssets(assetsDirectory, layer.layers, extractedAssets);
    }
  }
};

const populateInitializerForSketchGradient = (gradient: SketchGradient, name: string, spec: CodegenDesignSystem) => {
  if (isSketchLinearGradient(gradient)) {
    spec.gradients.push({
      name,
      initializer: getLinearGradientInitializerForSketchGradient(gradient),
    });
    return;
  }
};

const getLinearGradientInitializerForSketchGradient = (gradient: SketchLinearGradient) => {
  const stops = gradient.stops.map((stop) => {
    return {
      position: stop.position,
      colorInitializer: getColorInitializer(stop.color.value),
    };
  });
  return getLinearGradientInitializer(stops, gradient.from, gradient.to);
};

class SketchExporterImplementation implements Exporter {
  /**
   * ExporterFactory interface method.
   */
  static create () {
    return new this();
  }

  /**
   * ExporterFactory interface method.
   * Returns a boolean indicating if the source provided can be opened in Sketch and parsed by this module.
   */
  static async canParse (source: string) {
    const fileExists = await pathExists(source);
    return fileExists && extname(source.trim()) === sketchExtension;
  }

  /**
   * Exports assets from Sketch files.
   */
  async export (
    {source, assets, code}: ExporterInput,
    projectRoot: string,
    reporters = cliReporters,
  ) {
    if (!await SketchExporter.canParse(source)) {
      throw new Error('Invalid source file');
    }

    if (!isMacOS()) {
      throw new Error('Sketch export is only supported on macOS');
    }

    const sketchPath = await locateBinaryMacOS('com.bohemiancoding.sketch3');
    const parserCliPath = `${sketchPath}/Contents/Resources/sketchtool/bin/sketchtool`;
    if (!sketchPath || !await pathExists(parserCliPath)) {
      throw new Error('Unable to locate Sketch installation');
    }

    const designSystemName = pascalCase(basename(source, '.sketch'));
    const assetName = `${designSystemName}.sketch`;
    const assetsDirectory = join(assets, `${assetName}.contents`);

    reporters.progress(`Creating necessary folders for ${assetName}`);
    await createFolders(assetsDirectory, [AssetFolder.Slice]);
    reporters.progress(`Running sketchtool export commands for ${assetName}`);
    const [rawDump] = await Promise.all([
      execAsync(`${parserCliPath} dump ${source}`, {maxBuffer: 48 * (1 << 20)}),
      runExportCommand(parserCliPath, source, AssetFolder.Slice, assetsDirectory),
    ]);

    reporters.progress(`Extracting design tokens for ${assetName}`);
    const dump = JSON.parse(rawDump) as SketchDump;
    const codegenSpec = createDesignSystemSpec(
      designSystemName,
      assetsDirectory,
      join(code, `${assetName}.ts`),
      projectRoot,
    );

    populateAssets(relative(projectRoot, assetsDirectory), dump.pages, codegenSpec.assets);

    for (const {name, color: {value}} of dump.assets.colorAssets) {
      codegenSpec.colors.push({
        name,
        initializer: getColorInitializer(value),
      });
    }

    for (const gradient of dump.assets.gradientAssets) {
      populateInitializerForSketchGradient(gradient.gradient, gradient.name, codegenSpec);
    }

    for (const {name, value: {textStyle}} of dump.layerTextStyles.objects) {
      const fontSize = textStyle.NSFont.attributes.NSFontSizeAttribute;
      const candidateFont = await locateFont(
        textStyle.NSFont.family,
        {name: textStyle.NSFont.attributes.NSFontNameAttribute},
      );
      if (candidateFont) {
        await registerFont(candidateFont, codegenSpec.fonts);
      } else {
        Log.warning(`Unable to locate system font assets for ${textStyle.NSFont.attributes.NSFontNameAttribute}.`);
      }

      codegenSpec.typographs.push({
        name,
        initializer: getTypographInitializer(
          codegenSpec.designSystemName,
          candidateFont,
          textStyle.NSFont.attributes.NSFontNameAttribute,
          fontSize,
          textStyle.MSAttributedStringColorAttribute ?
            getColorInitializer(textStyle.MSAttributedStringColorAttribute.value) :
            undefined,
        ),
      });
    }

    return codegenDesignSystem(codegenSpec);
  }
}

/**
 * The Sketch exporter.
 */
export const SketchExporter: ExporterFactory = SketchExporterImplementation;
