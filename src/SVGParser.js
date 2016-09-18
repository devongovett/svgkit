import Parser from 'htmlparser2/lib/WritableStream';
import SVGElement from './elements/SVGElement';
import SVGDocument from './SVGDocument';

export default class SVGParser extends Parser {
  constructor(path) {
    let handler = new SVGParserHandler(path);
    super(handler, {decodeEntities: true, xmlMode: true, lowerCaseTags: false});
    this.document = handler.document;
  }
}

var ignore = {
  'font-face': true,
  'font-face-src': true,
  'font-face-uri': true,
  'p': true,
  'title': true
}

class SVGParserHandler {
  constructor(path) {
    this.stack = [];
    this.document = new SVGDocument(path);
  }

  push(element) {
    let parentNode = this.stack[this.stack.length - 1];
    if (!parentNode) {
      this.document.init(element);
    } else if (parentNode.childNodes) {
      parentNode.childNodes.push(element);
    }

    this.stack.push(element);
  }

  onopentag(tagName, attributes) {
    let parentNode = this.stack[this.stack.length - 1];
    tagName = tagName.toLowerCase();
    let ElementType = SVGElement.parsers[tagName];
    if (!ElementType) {
      if (tagName.indexOf('d:') !== 0 && !ignore[tagName]) {
        console.log("Unsupported element: " + tagName);
      }

      ElementType = SVGElement;
    }

    let element = new ElementType(this.document, parentNode, tagName, attributes);
    this.push(element);
  }

  ontext(text) {
    text = text.trim();
    if (!text) {
      return;
    }

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
