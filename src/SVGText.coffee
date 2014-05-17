SVGElement = require './SVGElement'
SVGTransform = require './SVGTransform'
SVGLength = require './SVGLength'

class SVGText extends SVGElement
  SVGElement.parsers['text'] = SVGText
  
  parse: ->
    @parseStyle()
    @transform = SVGTransform.parse @node.getAttribute 'transform'
    
    @x = @parseUnits 'x', 0
    @y = @parseUnits 'y', 0
    
    @spans = []
    for node in @node.childNodes
      if node.nodeType is 3 or node.nodeName is 'TSPAN'
        @spans.push new SVGTextSpan @document, this, node
    
  getWidth: (ctx) ->
    width = 0
    for span in @spans
      width += span.getWidth(ctx)
      
    return width
    
  draw: (ctx, clip) ->
    return if @style.display is 'none' or @style.visibility is 'hidden'
    
    ctx.save() unless clip
    
    {x,y} = this
    for span in @spans
      x = span.x if span.x?
      y = span.y if span.y?
      
      span.draw(ctx, clip, x, y)
      x += span.getWidth(ctx)
    
    ctx.restore() unless clip
    
class SVGTextSpan extends SVGElement
  constructor: (@document, @parentNode, @node) ->
    @style = {}
    @transform = null
  
    if @node.nodeType is 3 # text node
      @text = @node.nodeValue
      @style = @parentNode.style
      space = @node.parentNode.getAttribute('xml:space')
    else
      @parseStyle()
      @text = @node.textContent
      
      @x = @parseUnits 'x'
      @y = @parseUnits 'y'
      space = @node.getAttribute('xml:space') or @node.parentNode.getAttribute('xml:space')
      
    unless space is 'preserve'
      @text = @text.trim()
        
  getWidth: (ctx) ->
    return ctx.widthOfString @text
    
  applyStyles: (ctx) ->
    super
    ctx.fontSize @style.fontSize
      
  draw: (ctx, clip = no, x, y) ->
    return if @style.display is 'none' or @style.visibility is 'hidden'
    
    ctx.save() unless clip
    @applyStyles ctx
    
    switch @style.textAnchor
      when 'middle'
        x -= @getWidth(ctx) / 2
        
      when 'end'
        x -= @getWidth(ctx)
    
    switch @style.baselineShift
      when 'baseline'
        y = y # do nothing
    
      when 'sub'
        y += ctx.currentLineHeight() * 0.7 # TODO: get from font info
        
      when 'super'
        y -= ctx.currentLineHeight() * 0.7
        
      else
        value = SVGLength.parse @style.baselineShift
        if value
          v = value?.toPixels(@document, 'baselineShift', 'objectBoundingBox')
          if value.isPercentage()
            v *= ctx.currentLineHeight()
            
          y -= v
    
    y -= ctx.currentLineHeight()
    ctx.text @text, x, y, lineBreak: no
    
    ctx.restore() unless clip