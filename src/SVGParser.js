import Parser from 'htmlparser2/lib/WritableStream';
import SVGElement from './SVGElement';
import SVGDocument from './SVGDocument';

export default class SVGParser extends Parser {
  constructor() {
    let handler = new SVGParserHandler;
    super(handler, {decodeEntities: true, xmlMode: true, lowerCaseTags: false});
    this.document = handler.document;
  }
}

class SVGParserHandler {
  constructor() {
    this.stack = [];
    this.document = new SVGDocument;
  }

  push(element) {
    let parentNode = this.stack[this.stack.length - 1];
    if (!parentNode) {
      this.document.documentElement = element;
    } else if (parentNode.childNodes) {
      parentNode.childNodes.push(element);
    }

    this.stack.push(element);
  }

  onopentag(tagName, attributes) {
    let parentNode = this.stack[this.stack.length - 1];
    tagName = tagName.toLowerCase();
    let ElementType = SVGElement.parsers[tagName] || SVGElement;
    let element = new ElementType(this.document, parentNode, tagName, attributes);
    this.push(element);
  }

  ontext(text) {
    let parentNode = this.stack[this.stack.length - 1];
    let lastChild = parentNode && parentNode.childNodes[parentNode.childNodes.length - 1];
    if (lastChild instanceof SVGTextNode) {
      lastChild.text += text;
    } else if (parentNode) {
      let textNode = new SVGTextNode(this.document, parentNode, text);
      parentNode.childNodes.push(textNode);
    }
  }

  onclosetag() {
    let element = this.stack.pop();
    if (element instanceof SVGElement) {
      element.parse();
    }
  }
}

class SVGTextNode {
  constructor(document, parentNode, text) {
    this.document = document;
    this.parentNode = parentNode;
    this.text = text;
  }
}
