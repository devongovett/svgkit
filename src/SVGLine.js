import SVGElement from './SVGElement';
import SVGPoint from './SVGPoint';

class SVGLine extends SVGElement {  
  parse() {
    super.parse(...arguments);
    let x1 = this.parseUnits('x1', 0);
    let y1 = this.parseUnits('y1', 0);
    let x2 = this.parseUnits('x2', 0);
    let y2 = this.parseUnits('y2', 0);
    
    this.p1 = new SVGPoint(x1, y1);
    return this.p2 = new SVGPoint(x2, y2);
  }
    
  getBoundingBox() {
    return [this.p1.x, this.p1.y, this.p2.x, this.p2.y];
  }
    
  getMarkers() {    
    let angle = this.p1.angleTo(this.p2);
    return [[this.p1, angle], [this.p2, angle]];
  }
    
  render(ctx) {
    ctx.moveTo(this.p1.x, this.p1.y);
    return ctx.lineTo(this.p2.x, this.p2.y);
  }
}

SVGElement.parsers['line'] = SVGLine;
