import SVGElement from './SVGElement';
import SVGShapeElement from './SVGShapeElement';
import Path from '../types/Path';

const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);

export default class SVGEllipse extends SVGShapeElement {
  parse() {
    this.cx = this.parseUnits('cx', 0);
    this.cy = this.parseUnits('cy', 0);
    this.rx = this.parseUnits('rx', 0);
    this.ry = this.parseUnits('ry', 0);
  }

  draw() {
    // An rx or ry value of zero disables rendering of the element.
    if (this.rx !== 0 && this.ry !== 0) {
      return super.draw(...arguments);
    }
  }

  getPath() {
    let x = this.cx;
    let y = this.cy;
    let r1 = this.rx;
    let r2 = this.ry;

    let path = new Path;

    x -= r1;
    y -= r2;
    let ox = r1 * KAPPA;
    let oy = r2 * KAPPA;
    let xe = x + r1 * 2;
    let ye = y + r2 * 2;
    let xm = x + r1;
    let ym = y + r2;
    path.moveTo(x, ym);
    path.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    path.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    path.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    path.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    path.closePath();

    return path;
  }
}

SVGElement.parsers['ellipse'] = SVGEllipse;
