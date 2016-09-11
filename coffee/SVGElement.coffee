SVGTransform = require './SVGTransform'
SVGColor = require './SVGColor'
SVGLength = require './SVGLength'

class SVGElement
  constructor: (@document, @parentNode, @node) ->
    @id = @node.getAttribute 'id'
    @childNodes = []
    @style = {}
    @transform = null
    
  @parsers:
    g: SVGElement
    
  parse: ->
    @parseStyle()
    @transform = SVGTransform.parse @node.getAttribute 'transform'
    
    for node in @node.childNodes
      if node.tagName?
        Element = SVGElement.parsers[node.tagName.toLowerCase()]
        if not Element
          console.log "Element #{node.tagName} is not supported."
          continue
        
        el = new Element(@document, this, node)
        el.parse()
        @childNodes.push el
    
    return
    
  getElementById: (id) ->
    for node in @childNodes
      # check if the node's id matches
      return node if node.id is id
      
      # check the nodes children
      sub = node.getElementById id
      return sub if sub
    
    # nothing found  
    return null
    
  getBoundingBox: ->
    xMin = yMin = xMax = yMax = 0
    
    for node in @childNodes
      [x1, y1, x2, y2] = node.getBoundingBox()
      xMin = Math.min(xMin, x1)
      yMin = Math.min(yMin, y1)
      xMax = Math.max(xMax, x2)
      yMax = Math.max(yMax, y2)
    
    return [xMin, yMin, xMax, yMax]
      
  parseUnits: (prop, fallback = null, units) ->
    value = SVGLength.parse @node.getAttribute(prop) or fallback
    return value?.toPixels(@document, prop, units)
  
  # each property in this table defines whether 
  # it is inherited, and its default value  
  @styleProperties:
    # clipping, masking and compositing
    'clip-path': [no, null]
    'clip-rule': [yes, 'nonzero']
    # 'mask'
    'opacity': [yes, 1] # really not inherited, supposed to be rendered off screen first for groups
    
    # gradients
    'stop-color': [no, 'black']
    'stop-opacity': [no, 1]
    
    # color and painting
    'color': [yes, null]
    # 'color-interpolation'
    # 'color-interpolation-filters'
    # 'color-profile'
    # 'color-rendering'
    'display': [no, 'inline']
    'visibility': [yes, 'visible']
    'fill': [yes, 'black']
    'fill-opacity': [yes, 1]
    'fill-rule': [yes, 'nonzero']
    # 'image-rendering'
    # 'marker'
    # 'marker-end'
    # 'marker-mid'
    # 'marker-start'
    # 'shape-rendering'
    'stroke': [yes, 'none']
    # 'stroke-dasharray': [yes, 'none']
    # 'stroke-dashoffset': [yes, 0]
    'stroke-linecap': [yes, 'butt']
    'stroke-linejoin': [yes, 'miter']
    'stroke-miterlimit': [yes, 4]
    'stroke-opacity': [yes, 1]
    'stroke-width': [yes, 1]
    # 'text-rendering'
    
    # text
    # 'alignment-baseline'
    'baseline-shift': [no, 'baseline']
    # 'dominant-baseline'
    # 'glyph-orientation-horizontal'
    # 'glyph-orientation-vertical'
    # 'kerning'
    'text-anchor': [yes, 'start']
    # 'writing-mode'
    # 'direction'
    # 'letter-spacing'
    # 'text-decoration'
    # 'unicode-bidi'
    # 'word-spacing'
    
    # font
    # 'font'
    # 'font-family'
    # 'font-varient'
    # 'font-style'
    'font-size': [yes, 12]
    # 'font-size-adjust'
    # 'font-stretch'
    # 'font-weight'
    
  _checkValue: (v) ->
    v? and v isnt ''
    
  parseStyle: ->
    for prop, config of @styleProperties
      camel = prop.replace /(-)([a-z])/, (t, a, b) ->
        b.toUpperCase()
        
      window = @node.ownerDocument.defaultView
      style = window.getComputedStyle @node
      
      # check css value      
      if @_checkValue style[camel]
        @style[camel] = style[camel]
      
      # check attributes  
      else if @_checkValue @node.getAttribute(prop)
        @style[camel] = @node.getAttribute prop
      
      # check parent if inherited
      else if config[0] and @_checkValue @parentNode?.style[camel]
        @style[camel] = @parentNode?.style[camel]
      
      # use the default otherwise
      else
        @style[camel] = config[1]
      
      # if the value of 'inherit' is used, traverse up the
      # tree until an element with the property is found
      if @style[camel] is 'inherit'
        @style[camel] = @parentNode?.style[camel]
    
    # clamp opacities
    @style.fillOpacity = Math.max(0, Math.min(1, @style.fillOpacity))
    @style.strokeOpacity = Math.max(0, Math.min(1, @style.strokeOpacity))
    @style.opacity = Math.max(0, Math.min(1, @style.opacity))
    @style.stopOpacity = Math.max(0, Math.min(1, @style.stopOpacity))
        
    @style.fill = SVGColor.parse(@style.fill)
    if @style.fill is 'currentColor'
      @style.fill = @style.color
      
    @style.stroke = SVGColor.parse(@style.stroke)
    if @style.stroke is 'currentColor'
      @style.stroke = @style.color
      
    @style.color = SVGColor.parse(@style.color)
    
  draw: (ctx, clip = no) ->
    return if @style.display is 'none'
    
    # TODO: probably shouldn't be handling specific elements here
    if @style.visibility is 'hidden'
      if @node.tagName is 'G'
        @render ctx, clip
      else
        return
    
    ctx.save() unless clip
    @applyStyles ctx
    @render ctx, clip
    
    if clip
      ctx.clip @style.clipRule
  
    else if @fill isnt 'none' and @stroke isnt 'none'
      ctx.fillAndStroke @style.fillRule
    
    else if @fill isnt 'none'
      ctx.fill @style.fillRule
    
    else if @stroke isnt 'none'
      ctx.stroke()
            
    ctx.restore() unless clip
    
  render: (ctx, clip = no) ->
    return if @style.display is 'none'
    
    for node in @childNodes
      node.draw(ctx, clip)

    return
    
  applyStyles: (ctx) ->
    @transform?.apply(ctx)
          
    ctx.lineWidth parseFloat @style.strokeWidth
    ctx.lineCap @style.strokeLinecap
    ctx.lineJoin @style.strokeLinejoin
    ctx.miterLimit parseFloat @style.strokeMiterlimit
      
    @fill = @style.fill
    if m = /^url\(#([^\)]+)\)?/.exec @style.fill
      grad = @document.getElementById m[1]
      if grad?.isGradient
        @fill = grad.apply(ctx, this)
        
    unless @fill is 'none'
      ctx.fillColor(@fill)
      
    @stroke = @style.stroke
    if m = /^url\(#([^\)]+)\)?/.exec @style.stroke
      grad = @document.getElementById m[1]
      if grad?.isGradient
        @stroke = grad.apply(ctx, this)
      
    unless @stroke is 'none'
      ctx.strokeColor(@stroke)
    
    if @style.opacity isnt 1
      ctx.opacity @style.opacity
      
    if @style.fillOpacity isnt 1
      ctx.fillOpacity @style.fillOpacity
    
    if @style.strokeOpacity isnt 1
      ctx.strokeOpacity @style.strokeOpacity
        
    if m = /^url\(#([^\)]+)\)?/.exec @style.clipPath
      clipPath = @document.getElementById m[1]
      clipPath?.apply(ctx)
    
module.exports = SVGElement