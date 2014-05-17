SVGElement = require './SVGElement'
SVGPoint = require './SVGPoint'

class SVGLine extends SVGElement
  SVGElement.parsers['line'] = SVGLine
  
  parse: ->
    super
    x1 = @parseUnits 'x1', 0
    y1 = @parseUnits 'y1', 0
    x2 = @parseUnits 'x2', 0
    y2 = @parseUnits 'y2', 0
    
    @p1 = new SVGPoint x1, y1
    @p2 = new SVGPoint x2, y2
    
  getBoundingBox: ->
    return [@p1.x, @p1.y, @p2.x, @p2.y]
    
  getMarkers: ->    
    angle = @p1.angleTo @p2
    return [[@p1, angle], [@p2, angle]]
    
  render: (ctx) ->
    ctx.moveTo @p1.x, @p1.y
    ctx.lineTo @p2.x, @p2.y