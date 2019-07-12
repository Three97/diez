import {Typograph, LinearGradient} from '@diez/prefabs';
import {Component, property} from '@diez/engine';
import {PoodleSurfSlices} from './PoodleSurf.sketch';
import {EdgeInsets} from './components/EdgeInsets';
import {LayoutValues, palette, typographs} from './constants';

class LocationImageDesign extends Component {
  @property strokeWidth = 3;
  @property strokeGradient = palette.gradients.gradient;
  @property widthAndHeight = 106;
}

class HeaderDesign extends Component {
  @property regionLabel = typographs.headerTitle;
  @property placeLabel = typographs.headerCaption;
  @property mapPinIcon = PoodleSurfSlices.MapPin;
  @property locationImage = new LocationImageDesign();
  @property bannerHeight = 149;
  @property labelsLayoutMargin = EdgeInsets.simple(
    LayoutValues.CompactMargin,
    LayoutValues.DefaultMargin,
  );
  @property pinIconToLabelSpacing = LayoutValues.DefaultSpacing;
  @property labelsSpacing = LayoutValues.CompactSpacing;
}

interface SharedCardDesignState {
  title: string;
  titleTypograph: Typograph;
  titleContentSpacing: number;
  gradient: LinearGradient;
  layoutMargins: EdgeInsets;
  cornerRadius: number;
}

class SharedCardDesign extends Component<SharedCardDesignState> {
  @property title = '';
  @property titleTypograph = typographs.cardTitle;
  @property titleContentSpacing = LayoutValues.DefaultMargin;
  @property gradient = palette.gradients.gradient;
  @property layoutMargins = new EdgeInsets({
    top: LayoutValues.DefaultMargin,
    bottom: LayoutValues.LooseMargin,
    left: LayoutValues.DefaultMargin,
    right: LayoutValues.DefaultMargin,
  });
  @property cornerRadius = 5;
}

class TemperatureDesign extends Component {
  @property typograph = typographs.value;
  @property icon = PoodleSurfSlices.Thermometer;
  @property iconSpacing = LayoutValues.DefaultSpacing;
}

class WetsuitDesign extends Component {
  @property headerText = 'Recommended';
  @property headerTypograph = typographs.captionHeader;
  @property valueTypograph = typographs.caption;
  @property labelSpacing = LayoutValues.CompactSpacing;
  @property iconSpacing = LayoutValues.DefaultSpacing;
  @property icon = PoodleSurfSlices.Gear;
}

class WaterTemperatureCardDesign extends Component {
  @property shared = new SharedCardDesign({
    title: 'Water temperature',
  });
  @property horizontalSpacing = LayoutValues.DefaultMargin;
  @property temperature = new TemperatureDesign();
  @property wetsuit = new WetsuitDesign();
}

const DayPartIconSize = 78;

class DayPartDesign extends Component {
  @property valueTypograph = typographs.value;
  @property unitTypograph = typographs.unit;
  @property timeTypograph = typographs.caption;
  @property valueUnitSpacing = LayoutValues.CompactSpacing;
  @property layoutMargins = new EdgeInsets();
  @property iconWidth = DayPartIconSize;
  @property iconHeight = DayPartIconSize;
}

interface ForecastCardDesignState {
  shared: SharedCardDesign;
  dayPart: DayPartDesign;
  unit: string;
  dayPartsHorizontalSpacing: number;
  dayPartVerticalSpacing: number;
  separatorWidth: number;
  separatorColor: number;
  valueUnitMargins: EdgeInsets;
}

class ForecastCardDesign extends Component<ForecastCardDesignState> {
  @property shared = new SharedCardDesign();
  @property unit = '';
  @property dayPart = new DayPartDesign();
  @property dayPartsHorizontalSpacing = LayoutValues.DefaultMargin;
  @property dayPartVerticalSpacing = LayoutValues.LooseMargin;
  @property separatorWidth = 1;
  @property separatorColor = palette.colors.whiteA40;
  @property valueUnitMargins = new EdgeInsets();
}

/**
 * The report design.
 */
export class ReportDesign extends Component {
  @property backgroundColor = palette.colors.white;
  @property contentLayoutMargins = EdgeInsets.simple(LayoutValues.DefaultMargin);
  @property contentSpacing = LayoutValues.DefaultMargin;
  @property header = new HeaderDesign();
  @property waterTemperature = new WaterTemperatureCardDesign();
  @property wind = new ForecastCardDesign({
    shared: new SharedCardDesign({
      title: 'Wind',
    }),
    unit: 'mph',
    dayPartVerticalSpacing: LayoutValues.DefaultSpacing,
    valueUnitMargins: new EdgeInsets({
      top: LayoutValues.DefaultMargin,
    }),
  });
  @property swell = new ForecastCardDesign({
    shared: new SharedCardDesign({
      title: 'Swell',
    }),
    unit: 'ft',
  });
  @property tide = new ForecastCardDesign({
    shared: new SharedCardDesign({
      title: 'Tide',
    }),
    unit: 'ft',
  });
}
