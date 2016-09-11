import SVGElement from './SVGElement';
import SVGAspectRatio from './SVGAspectRatio';

class SVGNode extends SVGElement {
  parse() {
    super.parse(...arguments);

    if (this.attributes.viewBox) {
      this.viewBox = this.attributes.viewBox.split(/\s+/).map(parseFloat);
      if (this.viewBox.length !== 4) { this.viewBox = null; }
    }

    this.width = this.height = 0;
    if (this.viewBox) {
      this.width = this.viewBox[2];
      this.height = this.viewBox[3];
    }

    this.x = this.parseUnits('x', 0);
    this.y = this.parseUnits('y', 0);
    this.width = this.parseUnits('width', '100%');
    this.height = this.parseUnits('height', '100%');
    return this.preserveAspectRatio = SVGAspectRatio.parse(this.attributes.preserveAspectRatio);
  }

  applyStyles(ctx) {
    super.applyStyles(...arguments);
    this.preserveAspectRatio.apply(ctx, this.viewBox, this.width, this.height);
    return ctx.translate(this.x, this.y);
  }
}

SVGElement.parsers['svg'] = SVGNode;
export default SVGNode;
