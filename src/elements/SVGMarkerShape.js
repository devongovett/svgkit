import SVGShapeElement from './SVGShapeElement';
import SVGPoint from '../types/SVGPoint';

export default class SVGMarkerShape extends SVGShapeElement {
  getMarkers() {
    let points = [];
    for (let c of this.path.commands) {
      let point = new SVGPoint(c.args[c.args.length - 2], c.args[c.args.length - 1]);
      points.push(point);
    }

    let res = [];
    for (let i = 0; i < points.length; i++) {
      let point = points[i];

      if (i > 0 && i < points.length - 1) {
        let prev = points[i - 1];
        let next = points[i + 1];
        res.push([point, prev.angleTo(next)]);
      } else if (i === 0) {
        let next = points[i + 1];
        res.push([point, point.angleTo(next)]);
      } else {
        let prev = points[i - 1];
        res.push([point, prev.angleTo(point)]);
      }
    }

    return res;
  }
}
