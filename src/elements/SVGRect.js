import SVGElement from './SVGElement';
import SVGShapeElement from './SVGShapeElement';
import Path from '../types/Path';

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
    this.ry = Math.min(this.height / 2, this.ry);
  }

  getPath() {
    if (this.width === 0 || this.height === 0) {
      return null;
    }

    let path = new Path;

    if (this.rx === 0 && this.ry === 0) {
      path.moveTo(this.x, this.y);
      path.lineTo(this.x + this.width, this.y);
      path.lineTo(this.x + this.width, this.y + this.height);
      path.lineTo(this.x, this.y + this.height);
      path.closePath();
    } else {
      let {x,y,width,height,rx,ry} = this;
      let krx = rx * KAPPA;
      let kry = ry * KAPPA;

      path.moveTo(x + rx, y);
      path.lineTo((x - rx) + width, y);
      path.bezierCurveTo((x - rx) + width + krx, y, x + width, (y + ry) - kry, x + width, y + ry);
      path.lineTo(x + width, (y + height) - ry);
      path.bezierCurveTo(x + width, ((y + height) - ry) + kry, (x - rx) + width + krx, y + height, (x - rx) + width, y + height);
      path.lineTo(x + rx, y + height);
      path.bezierCurveTo((x + rx) - krx, y + height, x, ((y + height) - ry) + kry, x, (y + height) - ry);
      path.lineTo(x, y + ry);
      path.bezierCurveTo(x, (y + ry) - kry, (x + rx) - krx, y, x + rx, y);
      path.closePath();
    }

    return path;
  }
}

SVGElement.parsers['rect'] = SVGRect;
