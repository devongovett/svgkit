SVGElement = require './SVGElement'

class SVGDefs extends SVGElement
    parse: ->
        super
        for node in @childNodes
            @document.defs[node.id] = node
            
    draw: ->
        # no drawing of definitions
        
SVGElement.parsers['defs'] = SVGDefs
