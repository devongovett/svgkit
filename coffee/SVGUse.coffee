SVGElement = require './SVGElement'

stack = {}

class SVGUse extends SVGElement
  parse: ->
    super
    
    @ref_id = @node.getAttribute('xlink:href').slice(1)
    @x = @parseUnits 'x'
    @y = @parseUnits 'y'
    @width = @parseUnits 'width'
    @height = @parseUnits 'height'
    
    @_stack_id = Math.random() * 100000 | 0
    
  getBoundingBox: ->
    return [@x, @y, @x + @width, @y + @height]
    
  draw: (ctx, clip = no) ->
    return if @style.display is 'none' or @style.visibility is 'hidden'
    
    # handle recursive use elements
    return if stack[@_stack_id]
    stack[@_stack_id] = true
    
    def = @document.getElementById @ref_id
    return unless def
    
    ctx.save() unless clip
    
    if @x or @y
      ctx.translate @x or 0, @y or 0
    
    # parse the node again, in the context of the use element
    # TODO: this sucks, make faster so we don't have to reparse
    node = def.node
    Element = SVGElement.parsers[node.tagName.toLowerCase()]
    return unless Element
    
    el = new Element(@document, this, node)
    el.parse()
    el.draw(ctx, clip)
    
    ctx.restore() unless clip
    delete stack[@_stack_id]

SVGElement.parsers['use'] = SVGUse
