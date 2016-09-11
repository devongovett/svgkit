SVGElement = require './SVGElement'
SVGPolyLine = require './SVGPolyLine'

class SVGPolygon extends SVGPolyLine
  render: (ctx) ->
    super
    ctx.closePath()

SVGElement.parsers['polygon'] = SVGPolygon
module.exports = SVGPolygon
