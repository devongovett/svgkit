SVGElement = require './SVGElement'

class SVGClipPath extends SVGElement
  SVGElement.parsers['clippath'] = SVGClipPath
  
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