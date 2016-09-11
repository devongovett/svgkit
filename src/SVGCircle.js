import SVGElement from './SVGElement';

class SVGCircle extends SVGElement {    
    parse() {
        super.parse(...arguments);
        this.cx = this.parseUnits('cx', 0);
        this.cy = this.parseUnits('cy', 0);
        return this.r = this.parseUnits('r', 0);
    }
        
    getBoundingBox() {
        return [this.cx - this.r, this.cy - this.r, this.cx + this.r, this.cy + this.r];
    }
        
    render(ctx) {
        return ctx.circle(this.cx, this.cy, this.r);
    }
}
        
SVGElement.parsers['circle'] = SVGCircle;
