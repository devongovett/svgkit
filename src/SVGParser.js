import SVGElement from './elements/SVGElement';
import SVGDocument from './SVGDocument';
import {SAXStream} from 'sax';

var ignore = {
  'font-face': true,
  'font-face-src': true,
  'font-face-uri': true,
  'p': true,
  'title': true
}

export default class SVGParser extends SAXStream {
  constructor(path) {
    super(true);
    this.stack = [];
    this.document = new SVGDocument(path);

    // SAX is weird (has setters for these).
    this.onopentag = this.onOpenTag;
    this.ontext = this.onText;
    this.oncdata = this.onText;
    this.onclosetag = this.onCloseTag;
    this.ondoctype = this.onDoctype;
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

  onOpenTag({name: tagName, attributes}) {
    tagName = tagName.toLowerCase();
    let parentNode = this.stack[this.stack.length - 1];
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

  onText(text) {
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

  onCloseTag() {
    let element = this.stack.pop();
    if (element instanceof SVGElement) {
      element.parse();
    }
  }

  onDoctype(doctype) {
    const entityMatcher = /<!ENTITY ([^ ]+) "([^"]+)">/g;
    let result;
    while (result = entityMatcher.exec(doctype)) {
      let [, name, value] = result;
      if (!(name in this._parser.ENTITIES)) {
        this._parser.ENTITIES[name] = value;
      }
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
