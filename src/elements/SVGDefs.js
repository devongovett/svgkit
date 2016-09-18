import SVGElement from './SVGElement';

class SVGDefs extends SVGElement {
    parse() {
      super.parse(...arguments);
      return this.childNodes.map((node) => this.document.defs[node.id] = node);
    }

    draw() {
      // no drawing of definitions
    }
}

SVGElement.parsers['defs'] = SVGDefs;
