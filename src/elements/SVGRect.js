import SVGElement from './SVGElement';
import SVGShapeElement from './SVGShapeElement';

const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);

class SVGRect extends SVGShapeElement {
  parse() {
    super.parse(...arguments);

    this.x = this.parseUnits('x', 0);
    this.y = this.parseUnits('y', 0);
    this.width = this.parseUnits('width', 0);
    this.height = this.parseUnits('height', 0);
    this.rx = this.parseUnits('rx');
    this.ry = this.parseUnits('ry');

    if (!this.rx && !this.ry) {
      this.rx = this.ry = 0;

    } else if (this.rx && !this.ry) {
      this.ry = this.rx;

    } else if (this.ry && !this.rx) {
      this.rx = this.ry;
    }

    this.rx = Math.min(this.width / 2, this.rx);
    return this.ry = Math.min(this.height / 2, this.ry);
  }

  getBoundingBox() {
    return [this.x, this.y, this.x + this.width, this.y + this.height];
  }

  renderPath(ctx) {
    if (this.width === 0 || this.height === 0) { return; }

    if (this.rx === 0 && this.ry === 0) {
      return ctx.rect(this.x, this.y, this.width, this.height);
    } else {
      let {x,y,width,height,rx,ry} = this;
      let krx = rx * KAPPA;
      let kry = ry * KAPPA;

      ctx.moveTo(x + rx, y);
      ctx.lineTo((x - rx) + width, y);
      ctx.bezierCurveTo((x - rx) + width + krx, y, x + width, (y + ry) - kry, x + width, y + ry);
      ctx.lineTo(x + width, (y + height) - ry);
      ctx.bezierCurveTo(x + width, ((y + height) - ry) + kry, (x - rx) + width + krx, y + height, (x - rx) + width, y + height);
      ctx.lineTo(x + rx, y + height);
      ctx.bezierCurveTo((x + rx) - krx, y + height, x, ((y + height) - ry) + kry, x, (y + height) - ry);
      ctx.lineTo(x, y + ry);
      ctx.bezierCurveTo(x, (y + ry) - kry, (x + rx) - krx, y, x + rx, y);
      return ctx.closePath();
    }
  }
}

SVGElement.parsers['rect'] = SVGRect;
