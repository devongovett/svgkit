import SVGElement from './SVGElement';
import SVGShapeElement from './SVGShapeElement';

class SVGEllipse extends SVGShapeElement {
    parse() {
        super.parse(...arguments);
        this.cx = this.parseUnits('cx', 0);
        this.cy = this.parseUnits('cy', 0);
        this.rx = this.parseUnits('rx', 0);
        return this.ry = this.parseUnits('ry', 0);
    }

    getBoundingBox() {
        return [this.cx - this.rx, this.cy - this.ry, this.cx + this.rx, this.cy + this.ry];
    }

    draw() {
        // An rx or ry value of zero disables rendering of the element.
        if (this.rx !== 0 && this.ry !== 0) { return super.draw(...arguments); }
    }

    renderPath(ctx) {
        return ctx.ellipse(this.cx, this.cy, this.rx, this.ry);
    }
}

SVGElement.parsers['ellipse'] = SVGEllipse;
