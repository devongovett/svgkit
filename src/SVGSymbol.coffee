SVGElement = require './SVGElement'

class SVGSymbol extends SVGElement
    SVGElement.parsers['symbol'] = SVGSymbol
    
    parse: ->
        # TODO