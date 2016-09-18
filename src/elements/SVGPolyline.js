import SVGElement from './SVGElement';
import SVGPoint from '../types/SVGPoint';
import SVGMarkerShape from './SVGMarkerShape';
import Path from '../types/Path';

export default class SVGPolyLine extends SVGMarkerShape {
  parse() {
    this.points = [];

    let points = this.attributes.points || '';
    points = points.trim().replace(/,/g, ' ').replace(/(\d)-(\d)/g, '$1 -$2').split(/\s+/);

    // odd number of points is an error
    if (points.length % 2 !== 0) {
      points = points.slice(0, -1);
    }

    for (let i = 0; i < points.length; i += 2) {
      this.points.push(new SVGPoint(+points[i], +points[i + 1]));
    }
  }

  getPath() {
    let path = new Path;
    path.moveTo(this.points[0].x, this.points[0].y);

    for (let p of this.points.slice(1)) {
      path.lineTo(p.x, p.y);
    }

    return path;
  }
}

SVGElement.parsers['polyline'] = SVGPolyLine;
