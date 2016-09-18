export default class SVGPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  angleTo(p) {
    return Math.atan2(p.y - this.y, p.x - this.x);
  }

  transform(t) {
    var v = t.transform;
    var x = this.x * v[0] + this.y * v[2] + v[4];
    var y = this.x * v[1] + this.y * v[3] + v[5];
    return new SVGPoint(x, y)
  }
}
