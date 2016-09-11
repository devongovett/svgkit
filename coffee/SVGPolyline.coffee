SVGElement = require './SVGElement'
SVGPoint = require './SVGPoint'

class SVGPolyLine extends SVGElement  
  parse: ->
    super
    @points = []
    
    points = @node.getAttribute('points') or ''
    points = points.trim().replace(/,/g, ' ').replace(/(\d)-(\d)/g, '$1 -$2').split(/\s+/)
    
    # odd number of points is an error
    if points.length % 2 isnt 0
      points = points.slice(0, -1)
    
    for i in [0...points.length] by 2
      @points.push new SVGPoint +points[i], +points[i + 1]
      
    return
    
  getBoundingBox: ->
    xVal = []
    yVal = []
    for p in @points
      xVal.push p.x
      yVal.push p.y

    return [Math.min(xVal...), Math.min(yVal...), Math.max(xVal...), Math.max(yVal...)]
    
  getMarkers: ->
    markers = []
    
    for point, i in @points
      if i < @points.length - 1
        angle = point.angleTo(@points[i + 1])
        
      markers.push [point, angle]
      
    return markers
    
  render: (ctx) ->
    ctx.moveTo @points[0].x, @points[0].y
    
    for p in @points[1...]
      ctx.lineTo p.x, p.y
      
    return

SVGElement.parsers['polyline'] = SVGPolyLine    
module.exports = SVGPolyLine