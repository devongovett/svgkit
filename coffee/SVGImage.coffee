SVGElement = require './SVGElement'
SVGAspectRatio = require './SVGAspectRatio'
path = require 'path'

DATA_URL_RE = /^data:image\/(?:jpeg|jpg|png);base64,/

class SVGImage extends SVGElement
  parse: ->
    super
    
    @x = @parseUnits 'x', 0
    @y = @parseUnits 'y', 0
    @width = @parseUnits 'width'
    @height = @parseUnits 'height'
    @href = @node.getAttribute 'xlink:href'
    @preserveAspectRatio = SVGAspectRatio.parse @node.getAttribute 'preserveAspectRatio'
    
  getBoundingBox: ->
    return [@x, @y, @x + @width, @y + @height]
    
  render: (ctx) ->
    return if @width is 0 or @height is 0
    
    # TODO: parse image to get implicit viewBox
    # @preserveAspectRatio.apply(ctx)
    
    if DATA_URL_RE.test @href
      buf = new Buffer(@href.replace(DATA_URL_RE, '').replace(/[\r\n]/g, ''), 'base64')
      ctx.image buf, @x, @y, width: @width, height: @height
      
    else if not /^http:/.test(@href)
      href = path.resolve @document.path, '..', @href
      ctx.image href, @x, @y, width: @width, height: @height
      
SVGElement.parsers['image'] = SVGImage
