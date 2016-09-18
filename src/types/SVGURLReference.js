const URL_REGEX = /url\(#(.+?)\)/;

export default class SVGURLReference {
  static parse(document, val) {
    if (typeof val !== 'string') {
      return null;
    }

    let match = val.match(URL_REGEX);
    if (match) {
      return new SVGURLReference(document, match[1]);
    }

    return null;
  }

  constructor(document, id) {
    this.document = document;
    this.id = id;
  }

  getReferencedElement() {
    return this.document.getElementById(this.id);
  }

  apply(ctx, element) {
    let ref = this.getReferencedElement();
    if (ref && ref.apply) {
      return ref.apply(ctx, element);
    }
  }
}
