SVGElement = require './SVGElement'
SVGAspectRatio = require './SVGAspectRatio'

class SVGNode extends SVGElement  
  parse: ->
    super
    
    if @node.hasAttribute 'viewBox'
      @viewBox = @node.getAttribute('viewBox').split(/\s+/).map(parseFloat)
      @viewBox = null if @viewBox.length isnt 4
      
    @width = @height = 0
    if @viewBox
      @width = @viewBox[2]
      @height = @viewBox[3]
    
    @x = @parseUnits 'x', 0
    @y = @parseUnits 'y', 0
    @width = @parseUnits 'width', '100%'
    @height = @parseUnits 'height', '100%'
    @preserveAspectRatio = SVGAspectRatio.parse @node.getAttribute('preserveAspectRatio')
    
  applyStyles: (ctx) ->
    super    
    @preserveAspectRatio.apply(ctx, @viewBox, @width, @height)
    ctx.translate(@x, @y)

SVGElement.parsers['svg'] = SVGNode    
module.exports = SVGNode
