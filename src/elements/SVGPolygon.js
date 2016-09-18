import SVGElement from './SVGElement';
import SVGPolyLine from './SVGPolyLine';

export default class SVGPolygon extends SVGPolyLine {
  getPath() {
    let path = super.getPath();
    path.closePath();
    return path;
  }
}

SVGElement.parsers['polygon'] = SVGPolygon;
