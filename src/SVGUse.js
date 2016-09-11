import SVGElement from './SVGElement';

let stack = {};

class SVGUse extends SVGElement {
  parse() {
    super.parse(...arguments);
    
    this.ref_id = this.node.getAttribute('xlink:href').slice(1);
    this.x = this.parseUnits('x');
    this.y = this.parseUnits('y');
    this.width = this.parseUnits('width');
    this.height = this.parseUnits('height');
    
    return this._stack_id = (Math.random() * 100000) | 0;
  }
    
  getBoundingBox() {
    return [this.x, this.y, this.x + this.width, this.y + this.height];
  }
    
  draw(ctx, clip = false) {
    if (this.style.display === 'none' || this.style.visibility === 'hidden') { return; }
    
    // handle recursive use elements
    if (stack[this._stack_id]) { return; }
    stack[this._stack_id] = true;
    
    let def = this.document.getElementById(this.ref_id);
    if (!def) { return; }
    
    if (!clip) { ctx.save(); }
    
    if (this.x || this.y) {
      ctx.translate(this.x || 0, this.y || 0);
    }
    
    // parse the node again, in the context of the use element
    // TODO: this sucks, make faster so we don't have to reparse
    let { node } = def;
    let Element = SVGElement.parsers[node.tagName.toLowerCase()];
    if (!Element) { return; }
    
    let el = new Element(this.document, this, node);
    el.parse();
    el.draw(ctx, clip);
    
    if (!clip) { ctx.restore(); }
    return delete stack[this._stack_id];
  }
}

SVGElement.parsers['use'] = SVGUse;
