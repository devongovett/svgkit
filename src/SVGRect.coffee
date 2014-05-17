SVGElement = require './SVGElement'

class SVGRect extends SVGElement
  SVGElement.parsers['rect'] = SVGRect
  KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0)
  
  parse: ->
    super
    
    @x = @parseUnits 'x', 0
    @y = @parseUnits 'y', 0
    @width = @parseUnits 'width', 0
    @height = @parseUnits 'height', 0
    @rx = @parseUnits 'rx'
    @ry = @parseUnits 'ry'
    
    if not @rx and not @ry
      @rx = @ry = 0
      
    else if @rx and not @ry
      @ry = @rx
      
    else if @ry and not @rx
      @rx = @ry
    
    @rx = Math.min(@width / 2, @rx)
    @ry = Math.min(@height / 2, @ry)
    
  getBoundingBox: ->
    return [@x, @y, @x + @width, @y + @height]
    
  render: (ctx) ->
    return if @width is 0 or @height is 0
    
    if @rx is 0 and @ry is 0
      ctx.rect @x, @y, @width, @height
    else
      {x,y,width,height,rx,ry} = this
      krx = rx * KAPPA
      kry = ry * KAPPA
      
      ctx.moveTo(x + rx, y)
      ctx.lineTo(x - rx + width, y)
      ctx.bezierCurveTo(x - rx + width + krx, y, x + width, y + ry - kry, x + width, y + ry)
      ctx.lineTo(x + width, y + height - ry)
      ctx.bezierCurveTo(x + width, y + height - ry + kry, x - rx + width + krx, y + height, x - rx + width, y + height)
      ctx.lineTo(x + rx, y + height)
      ctx.bezierCurveTo(x + rx - krx, y + height, x, y + height - ry + kry, x, y + height - ry)
      ctx.lineTo(x, y + ry)
      ctx.bezierCurveTo(x, y + ry - kry, x + rx - krx, y, x + rx, y)
      ctx.closePath()