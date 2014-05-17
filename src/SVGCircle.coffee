SVGElement = require './SVGElement'

class SVGCircle extends SVGElement
    SVGElement.parsers['circle'] = SVGCircle
    
    parse: ->
        super
        @cx = @parseUnits 'cx', 0
        @cy = @parseUnits 'cy', 0
        @r = @parseUnits 'r', 0
        
    getBoundingBox: ->
        return [@cx - @r, @cy - @r, @cx + @r, @cy + @r]
        
    render: (ctx) ->
        ctx.circle @cx, @cy, @r