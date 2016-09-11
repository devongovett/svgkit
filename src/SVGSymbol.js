import SVGElement from './SVGElement';

class SVGSymbol extends SVGElement {    
    parse() {}
}
        // TODO

SVGElement.parsers['symbol'] = SVGSymbol;
