import SVGElement from './SVGElement';
import SVGEllipse from './SVGEllipse';
import Path from '../types/Path';

class SVGCircle extends SVGEllipse {
  parse() {
    this.cx = this.parseUnits('cx', 0);
    this.cy = this.parseUnits('cy', 0);
    this.r = this.parseUnits('r', 0);
    this.rx = this.ry = this.r;
  }
}

SVGElement.parsers['circle'] = SVGCircle;
