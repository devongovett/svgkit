SVGTransform = require './SVGTransform'

class SVGAspectRatio
  @parse: (value = '') ->
    value = value.replace(/[\s\r\t\n]+/gm, ' ') # single spaces
           .replace(/^defer\s/, '')             # ignore defer
           .split(' ')
    
    align = value[0] or 'xMidYMid'
    meetOrSlice = value[1] or 'meet'
      
    return new SVGAspectRatio(align, meetOrSlice)
    
  constructor: (@align, @meetOrSlice) ->
    
  apply: (ctx, viewBox, width, height) ->
    return unless viewBox? and width? and height?
    
    [x, y, logicalWidth, logicalHeight] = viewBox
    logicalRatio = logicalWidth / logicalHeight
    physicalRatio = width / height
    
    # clip to the viewBox
    ctx.rect(x, y, logicalWidth, logicalHeight)
    ctx.clip()
    
    if @align is 'none'
      ctx.scale(width / logicalWidth, height / logicalHeight)
      ctx.translate(-x, -y)
      return
      
    if (logicalRatio < physicalRatio and @meetOrSlice is 'meet') or (logicalRatio >= physicalRatio and @meetOrSlice is 'slice')
      ctx.scale(height / logicalHeight)
      
      switch @align
        when 'xMinYMin', 'xMinYMid', 'xMinYMax'
          ctx.translate(-x, -y)
        
        when 'xMidYMin', 'xMidYMid', 'xMidYMax'
          ctx.translate(-x - (logicalWidth - width * logicalHeight / height) / 2, -y)
          
        else
          ctx.translate(-x - (logicalWidth - width * logicalHeight / height), -y)
          
    else
      ctx.scale(width / logicalWidth)
    
      switch @align
        when 'xMinYMin', 'xMidYMin', 'xMaxYMin'
          ctx.translate(-x, -y)
        
        when 'xMinYMid', 'xMidYMid', 'xMaxYMid'
          ctx.translate(-x, -y - (logicalHeight - height * logicalWidth / width) / 2)
      
        else
          ctx.translate(-x, -y - (logicalHeight - height * logicalWidth / width))
    
module.exports = SVGAspectRatio