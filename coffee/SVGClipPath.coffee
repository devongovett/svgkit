SVGElement = require './SVGElement'

class SVGClipPath extends SVGElement
  parse: ->
    super
    @document.defs[@id] = this
    
  parseStyle: ->
    @style.fill = 'none'
    @style.stroke = 'none'
    
  draw: ->
    # no drawing of contents
    
  apply: (ctx) ->
    @render ctx, yes
    
SVGElement.parsers['clippath'] = SVGClipPath
