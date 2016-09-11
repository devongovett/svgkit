import SVGElement from './SVGElement';

class SVGClipPath extends SVGElement {
  parse() {
    super.parse(...arguments);
    return this.document.defs[this.id] = this;
  }
    
  parseStyle() {
    this.style.fill = 'none';
    return this.style.stroke = 'none';
  }
    
  draw() {}
    // no drawing of contents
    
  apply(ctx) {
    return this.render(ctx, true);
  }
}
    
SVGElement.parsers['clippath'] = SVGClipPath;
