import SVGElement from './SVGElement';
import SVGPoint from '../types/SVGPoint';
import SVGMarkerShape from './SVGMarkerShape';
import Path from '../types/Path';

class SVGLine extends SVGMarkerShape {
  parse() {
    let x1 = this.parseUnits('x1', 0);
    let y1 = this.parseUnits('y1', 0);
    let x2 = this.parseUnits('x2', 0);
    let y2 = this.parseUnits('y2', 0);

    this.p1 = new SVGPoint(x1, y1);
    this.p2 = new SVGPoint(x2, y2);
  }

  getPath() {
    let path = new Path;
    path.moveTo(this.p1.x, this.p1.y);
    path.lineTo(this.p2.x, this.p2.y);
    return path;
  }
}

SVGElement.parsers['line'] = SVGLine;
