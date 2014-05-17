SVGElement = require './SVGElement'
SVGPolyLine = require './SVGPolyLine'

class SVGPolygon extends SVGPolyLine
  SVGElement.parsers['polygon'] = SVGPolygon

  render: (ctx) ->
    super
    ctx.closePath()