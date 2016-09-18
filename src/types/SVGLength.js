export default class SVGLength {
  static parse(document, length = '') {
    let v;
    if (v = (`${length}`).trim().match(/^(-?[0-9\.]+)(px|pt|pc|mm|cm|in|em|ex|%)?$/i)) {
      if (v[1][0] === '.') {
        v[1] = '0' + v[1];
      }

      return new SVGLength(document, parseFloat(v[1]), v[2]);
    }

    return null;
  }

  constructor(document, value, units) {
    this.document = document;
    this.value = value;
    this.units = units;
  }

  toPixels(prop, units) {
    switch (this.units) {
      case 'pt': return this.value * 1.25;
      case 'pc': return this.value * 15;
      case 'mm': return this.value * 3.543307;
      case 'cm': return this.value * 35.43307;
      case 'in': return this.value * 90;

      case 'em':
      case 'ex':
        console.log('WARNING: em and ex units are not supported');
        return this.value;

      case '%':
        if (units === 'objectBoundingBox') {
          return this.value / 100;

        } else if (prop === 'offset' || prop === 'opacity' || prop === 'stopOpacity') {
          return this.value / 100;

        } else if (/x|width/.test(prop)) {
          return (this.value * this.document.width) / 100;

        } else if (/y|height/.test(prop)) {
          return (this.value * this.document.height) / 100;
        }

        return ((this.value / 100) * Math.sqrt(Math.pow(this.document.width, 2) + Math.pow(this.document.height, 2))) / Math.sqrt(2);
      default:
        return this.value;
    }
  }

  valueOf() {
    return this.toPixels();
  }

  isPercentage() {
    return this.units === '%';
  }
}
