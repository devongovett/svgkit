import SVGElement from './SVGElement';

class SVGClipPath extends SVGElement {
  parse() {
    super.parse(...arguments);
    return this.document.defs[this.id] = this;
  }

  parseStyle() {
    return {
      fill: 'none',
      stroke: 'none'
    };
  }

  draw() {
    // no drawing of contents
  }

  apply(ctx) {
    return this.renderChildren(ctx, true);
  }
}

SVGElement.parsers['clippath'] = SVGClipPath;
