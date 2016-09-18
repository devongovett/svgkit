import SVGElement from './SVGElement';
import SVGAspectRatio from '../types/SVGAspectRatio';
import path from 'path';

let DATA_URL_RE = /^data:image\/(?:jpeg|jpg|png);base64,/;

class SVGImage extends SVGElement {
  parse() {
    super.parse(...arguments);

    this.x = this.parseUnits('x', 0);
    this.y = this.parseUnits('y', 0);
    this.width = this.parseUnits('width');
    this.height = this.parseUnits('height');
    this.href = this.attributes['xlink:href'];
    return this.preserveAspectRatio = SVGAspectRatio.parse(this.attributes.preserveAspectRatio);
  }

  getBoundingBox() {
    return [this.x, this.y, this.x + this.width, this.y + this.height];
  }

  render(ctx) {
    if (this.width === 0 || this.height === 0) { return; }

    // TODO: parse image to get implicit viewBox
    // @preserveAspectRatio.apply(ctx)

    if (DATA_URL_RE.test(this.href)) {
      let buf = new Buffer(this.href.replace(DATA_URL_RE, '').replace(/[\r\n]/g, ''), 'base64');
      return ctx.image(buf, this.x, this.y, {width: this.width, height: this.height});

    } else if (!/^http:/.test(this.href)) {
      let href = path.resolve(this.document.path, '..', this.href);
      // return ctx.image(href, this.x, this.y, {width: this.width, height: this.height});
    }
  }
}

SVGElement.parsers['image'] = SVGImage;
