SVGElement = require './SVGElement'
SVGTransform = require './SVGTransform'
SVGColor = require './SVGColor'

class SVGGradient extends SVGElement
  isGradient: yes
  
  parse: ->
    @parseStyle()
    
    @units = @node.getAttribute('gradientUnits') or 'objectBoundingBox'
    @transform = SVGTransform.parse @node.getAttribute 'gradientTransform'
    @spread = @node.getAttribute('spreadMethod') or 'pad'
    @href = @node.getAttribute 'xlink:href'
    
    @stops = []
    i = 0
    for node in @node.childNodes
      if node.tagName?.toLowerCase() is 'stop'
        stop = new SVGGradientStop(@document, this, node)
        stop.parse()
      
        if i > 0 and stop.offset < @stops[i - 1].offset
          stop.offset = @stops[i - 1].offset
        
        @stops[i++] = stop
      
    return
      
  draw: ->
    # gradients don't get painted directly
    
  applyHref: -> 
    if @href
      grad = @document.getElementById @href.slice(1)
      if grad and grad.isGradient
        grad.applyHref()
      
        @units = grad.units         unless @node.hasAttribute('gradientUnits')
        @transform = grad.transform unless @node.hasAttribute('transform')
        @spread = grad.spread       unless @node.hasAttribute('spreadMethod')
        @stops = grad.stops         if @stops.length is 0
      
  apply: (ctx, element) ->
    @applyHref()
    
    # SVG specification says that no stops should be treated like
    # the corresponding fill or stroke had "none" specified.
    if @stops.length is 0
      return 'none'

    # if one stop is defined, painting is the same as a single color
    if @stops.length is 1
      return @stops[0].color # TODO: opacity?
      
    if @units is 'objectBoundingBox'
      [x1,y1,x2,y2] = element.getBoundingBox()
      w = x2 - x1
      h = y2 - y1
      
      # The last paragraph of section 7.11 in SVG 1.1 states that objects
      # with zero width or height bounding boxes that use gradients with
      # gradientUnits="objectBoundingBox" must not use the gradient.
      # See also pservers-grad-17-b in the SVG test suite.
      if w is 0 or h is 0
        return 'black' # use the default color
        
    return null
  
class SVGGradientStop extends SVGElement      
  parse: ->
    @parseStyle()
    
    @opacity = @style.stopOpacity ? 1
    @color = SVGColor.parse @style.stopColor or 'black'
    if @color is 'currentColor'
      @color = @style.color
    
    offset = @parseUnits 'offset', 0
    @offset = Math.max 0, Math.min 1, offset

class SVGLinearGradient extends SVGGradient    
  parse: ->
    super
    @x1 = @parseUnits 'x1', 0, @units
    @y1 = @parseUnits 'y1', 0, @units
    @x2 = @parseUnits 'x2', 1, @units
    @y2 = @parseUnits 'y2', 0, @units
    
  apply: (ctx, element) ->
    if ret = super
      return ret
    
    if @units is 'objectBoundingBox'
      [x1,y1,x2,y2] = element.getBoundingBox()
      @transform ?= new SVGTransform
      @transform.matrix (x2 - x1), 0, 0, (y2 - y1), x1, y1
      
    # TODO: spreadMethod
    
    grad = ctx.linearGradient @x1, @y1, @x2, @y2
    for stop in @stops
      grad.stop(stop.offset, stop.color, stop.opacity)
    
    grad.transform = @transform.transform if @transform
    return grad

SVGElement.parsers['lineargradient'] = SVGLinearGradient
    
class SVGRadialGradient extends SVGGradient
  parse: ->
    super
    @cx = @parseUnits 'cx', 0.5, @units
    @cy = @parseUnits 'cy', 0.5, @units
    @fx = @parseUnits 'fx', @cx, @units
    @fy = @parseUnits 'fy', @cy, @units
    @r  = @parseUnits 'r',  0.5, @units
    
  apply: (ctx, element) ->
    if ret = super
      return ret
    
    # A value of zero will cause the area to be painted as a single color
    # using the color and opacity of the last gradient stop.  
    if @r is 0
      return @stops[@stops.length - 1]

    if @units is 'objectBoundingBox'
      [x1,y1,x2,y2] = element.getBoundingBox()
      @transform ?= new SVGTransform
      @transform.matrix (x2 - x1), 0, 0, (y2 - y1), x1, y1
      
    # TODO: spreadMethod

    grad = ctx.radialGradient @fx, @fy, 0, @cx, @cy, @r
    for stop in @stops
      grad.stop(stop.offset, stop.color, stop.opacity)
    
    grad.transform = @transform.transform if @transform
    return grad
    
SVGElement.parsers['radialgradient'] = SVGRadialGradient
