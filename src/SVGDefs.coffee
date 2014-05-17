SVGElement = require './SVGElement'

class SVGDefs extends SVGElement
    SVGElement.parsers['defs'] = SVGDefs
    
    parse: ->
        super
        for node in @childNodes
            @document.defs[node.id] = node
            
    draw: ->
        # no drawing of definitions