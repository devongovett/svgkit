import SVGElement from './SVGElement';
import SVGAspectRatio from '../types/SVGAspectRatio';
import SVGViewBox from '../types/SVGViewBox';

export default class SVGNode extends SVGElement {
  constructor(...args) {
    super(...args);

    this.viewBox = SVGViewBox.parse(this.attributes.viewBox);
    this.width = this.document._width;
    this.height = this.document._height;
    if (this.viewBox) {
      this.width = this.viewBox.width;
      this.height = this.viewBox.height;
    }
  }

  parse() {
    this.x = this.parseUnits('x', 0);
    this.y = this.parseUnits('y', 0);
    this.width = this.parseUnits('width', '100%');
    this.height = this.parseUnits('height', '100%');
    this.preserveAspectRatio = SVGAspectRatio.parse(this.attributes.preserveAspectRatio);
  }

  render(ctx) {
    if (this.style.overflow === 'hidden' || this.style.overflow === 'scroll') {
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.clip();
    }

    ctx.translate(this.x, this.y);
    this.preserveAspectRatio.apply(ctx, this.viewBox, this.width, this.height);
  }
}

SVGElement.parsers['svg'] = SVGNode;
