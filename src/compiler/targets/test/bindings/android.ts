import {join, resolve} from 'path';
import {AndroidBinding} from '../../src/targets/android.api';

const binding: AndroidBinding = {
  sources: [join(__dirname, '..', 'sources', 'bindings', 'ChildComponent.kt')],
  dependencies: [{
    gradle: {
      name: 'meow',
      minVersion: '10.10.10',
      source: 'com.purr.scratch:meow',
    },
  }],
  assetsBinder: async ({}, {}, {resources}) => {
    const rawResources = new Map();
    resources.set('raw', rawResources);
    rawResources.set('meow', {contents: 'meow'});
    // Also check a copied asset.
    rawResources.set('meow-meow', {
      contents: resolve(__dirname, '..', 'assets', 'cat.jpg'),
      copy: true,
    });
  },
};

export = binding;
