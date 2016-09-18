import CSSOM, {CSSStyleDeclaration} from 'cssom';
import SVGElement from './SVGElement';

export default class Style extends SVGElement {
  parse() {
    this.cssText = this.childNodes[0].text || '';
    this.styleSheet = CSSOM.parse(this.cssText);
    this.document.styleSheets.push(this.styleSheet);
  }
}

SVGElement.parsers['style'] = Style;
