class SVGPoint
  constructor: (@x, @y) ->
  angleTo: (p) ->
    return Math.atan2(p.y - @y, p.x - @x)
    
  # transform
  # var xp = this.x * v[0] + this.y * v[2] + v[4];
  # var yp = this.x * v[1] + this.y * v[3] + v[5];
  # this.x = xp;
  # this.y = yp;
    
module.exports = SVGPoint
