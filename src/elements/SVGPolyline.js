import SVGElement from './SVGElement';
import SVGPoint from '../types/SVGPoint';
import SVGShapeElement from './SVGShapeElement';

class SVGPolyLine extends SVGShapeElement {
  parse() {
    super.parse(...arguments);
    this.points = [];

    let points = this.attributes.points || '';
    points = points.trim().replace(/,/g, ' ').replace(/(\d)-(\d)/g, '$1 -$2').split(/\s+/);

    // odd number of points is an error
    if (points.length % 2 !== 0) {
      points = points.slice(0, -1);
    }

    let iterable = __range__(0, points.length, false);
    for (let j = 0; j < iterable.length; j += 2) {
      let i = iterable[j];
      this.points.push(new SVGPoint(+points[i], +points[i + 1]));
    }

  }

  getBoundingBox() {
    let xVal = [];
    let yVal = [];
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      xVal.push(p.x);
      yVal.push(p.y);
    }

    return [Math.min(...xVal), Math.min(...yVal), Math.max(...xVal), Math.max(...yVal)];
  }

  getMarkers() {
    let markers = [];

    for (let i = 0; i < this.points.length; i++) {
      let point = this.points[i];
      if (i < this.points.length - 1) {
        var angle = point.angleTo(this.points[i + 1]);
      }

      markers.push([point, angle]);
    }

    return markers;
  }

  renderPath(ctx) {
    ctx.moveTo(this.points[0].x, this.points[0].y);

    let iterable = this.points.slice(1);
    for (let i = 0; i < iterable.length; i++) {
      let p = iterable[i];
      ctx.lineTo(p.x, p.y);
    }

  }
}

SVGElement.parsers['polyline'] = SVGPolyLine;
export default SVGPolyLine;
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}