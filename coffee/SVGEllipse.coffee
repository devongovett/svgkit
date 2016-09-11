SVGElement = require './SVGElement'

class SVGEllipse extends SVGElement    
    parse: ->
        super
        @cx = @parseUnits 'cx', 0
        @cy = @parseUnits 'cy', 0
        @rx = @parseUnits 'rx', 0
        @ry = @parseUnits 'ry', 0
        
    getBoundingBox: ->
        return [@cx - @rx, @cy - @ry, @cx + @rx, @cy + @ry]
        
    draw: ->
        # An rx or ry value of zero disables rendering of the element.
        super unless @rx is 0 or @ry is 0
        
    render: (ctx) ->
        ctx.ellipse @cx, @cy, @rx, @ry
        
SVGElement.parsers['ellipse'] = SVGEllipse
