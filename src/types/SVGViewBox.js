import BBox from './BBox';

export default class SVGViewBox {
  static parse(value) {
    if (typeof value !== 'string') {
      return null;
    }

    let values = value.split(/[,\s]+/).map(parseFloat);
    if (values.length !== 4) {
      return null;
    }

    return new BBox(...values);
  }
}
