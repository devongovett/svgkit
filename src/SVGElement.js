import SVGTransform from './SVGTransform';
import SVGColor from './SVGColor';
import SVGLength from './SVGLength';
import {CSSStyleDeclaration} from 'cssom';

export default class SVGElement {
  constructor(document, parentNode, tagName, attributes) {
    this.document = document;
    this.parentNode = parentNode;
    this.tagName = tagName;
    this.attributes = attributes;
    this.id = this.attributes.id;
    this.childNodes = [];
    this.style = this.parseStyle();
    this.transform = SVGTransform.parse(this.attributes.transform);
  }

  static parsers = {
    g: SVGElement
  };

  parse() {
    // For subclasses.
  }

  getElementById(id) {
    for (let node of this.childNodes) {
      if (!(node instanceof SVGElement)) {
        continue;
      }

      // check if the node's id matches
      if (node.id === id) {
        return node;
      }

      // check the nodes children
      let sub = node.getElementById(id);
      if (sub) {
        return sub;
      }
    }

    // nothing found
    return null;
  }

  getBoundingBox() {
    let yMin;
    let xMax;
    let yMax;
    let xMin = yMin = xMax = yMax = 0;

    for (let i = 0; i < this.childNodes.length; i++) {
      let node = this.childNodes[i];
      let [x1, y1, x2, y2] = node.getBoundingBox();
      xMin = Math.min(xMin, x1);
      yMin = Math.min(yMin, y1);
      xMax = Math.max(xMax, x2);
      yMax = Math.max(yMax, y2);
    }

    return [xMin, yMin, xMax, yMax];
  }

  parseUnits(prop, fallback = null, units) {
    let value = SVGLength.parse(this.attributes[prop] || fallback);
    return value && value.toPixels(this.document, prop, units);
  }

  // each property in this table defines whether
  // it is inherited, and its default value
  static styleProperties = {
    // clipping, masking and compositing
    'clip-path': [false, null],
    'clip-rule': [true, 'nonzero'],
    // 'mask'
    'opacity': [true, 1], // really not inherited, supposed to be rendered off screen first for groups

    // gradients
    'stop-color': [false, 'black'],
    'stop-opacity': [false, 1],

    // color and painting
    'color': [true, null],
    // 'color-interpolation'
    // 'color-interpolation-filters'
    // 'color-profile'
    // 'color-rendering'
    'display': [false, 'inline'],
    'visibility': [true, 'visible'],
    'fill': [true, 'black'],
    'fill-opacity': [true, 1],
    'fill-rule': [true, 'nonzero'],
    // 'image-rendering'
    // 'marker'
    // 'marker-end'
    // 'marker-mid'
    // 'marker-start'
    // 'shape-rendering'
    'stroke': [true, 'none'],
    // 'stroke-dasharray': [yes, 'none']
    // 'stroke-dashoffset': [yes, 0]
    'stroke-linecap': [true, 'butt'],
    'stroke-linejoin': [true, 'miter'],
    'stroke-miterlimit': [true, 4],
    'stroke-opacity': [true, 1],
    'stroke-width': [true, 1],
    // 'text-rendering'

    // text
    // 'alignment-baseline'
    'baseline-shift': [false, 'baseline'],
    // 'dominant-baseline'
    // 'glyph-orientation-horizontal'
    // 'glyph-orientation-vertical'
    // 'kerning'
    'text-anchor': [true, 'start'],
    // 'writing-mode'
    // 'direction'
    // 'letter-spacing'
    // 'text-decoration'
    // 'unicode-bidi'
    // 'word-spacing'

    // font
    // 'font'
    // 'font-family'
    // 'font-varient'
    // 'font-style'
    'font-size': [true, 12]
  };
    // 'font-size-adjust'
    // 'font-stretch'
    // 'font-weight'

  _checkValue(v) {
    return (v != null) && v !== '';
  }

  parseStyle() {
    let result = {};
    let style = this._getComputedStyle();

    for (let prop in SVGElement.styleProperties) {
      let config = SVGElement.styleProperties[prop];
      let camel = prop.replace(/(-)([a-z])/, (t, a, b) => b.toUpperCase());

      // check css value
      if (this._checkValue(style[prop])) {
        result[camel] = style[prop];

      // check attributes
      } else if (this._checkValue(this.attributes[prop])) {
        result[camel] = this.attributes[prop];

      // check parent if inherited
      } else if (config[0] && this._checkValue(this.parentNode && this.parentNode.style[camel])) {
        result[camel] = this.parentNode && this.parentNode.style[camel];

      // use the default otherwise
      } else {
        result[camel] = config[1];
      }

      // if the value of 'inherit' is used, traverse up the
      // tree until an element with the property is found
      if (result[camel] === 'inherit') {
        result[camel] = this.parentNode && this.parentNode.style[camel];
      }
    }

    // clamp opacities
    result.fillOpacity = Math.max(0, Math.min(1, result.fillOpacity));
    result.strokeOpacity = Math.max(0, Math.min(1, result.strokeOpacity));
    result.opacity = Math.max(0, Math.min(1, result.opacity));
    result.stopOpacity = Math.max(0, Math.min(1, result.stopOpacity));

    result.fill = SVGColor.parse(result.fill);
    if (result.fill === 'currentColor') {
      result.fill = result.color;
    }

    result.stroke = SVGColor.parse(result.stroke);
    if (result.stroke === 'currentColor') {
      result.stroke = result.color;
    }

    result.color = SVGColor.parse(result.color);
    return result;
  }

  _getComputedStyle() {
    let css = new CSSStyleDeclaration;
    css.cssText = this.attributes.style || '';
    return css;
  }

  draw(ctx, clip = false) {
    if (this.style.display === 'none') { return; }

    // TODO: probably shouldn't be handling specific elements here
    if (this.style.visibility === 'hidden') {
      if (this.tagName === 'g') {
        this.render(ctx, clip);
      } else {
        return;
      }
    }

    if (!clip) { ctx.save(); }
    this.applyStyles(ctx);
    this.render(ctx, clip);

    if (clip) {
      ctx.clip(this.style.clipRule);

    } else if (this.fill !== 'none' && this.stroke !== 'none') {
      ctx.fillAndStroke(this.style.fillRule);

    } else if (this.fill !== 'none') {
      ctx.fill(this.style.fillRule);

    } else if (this.stroke !== 'none') {
      ctx.stroke();
    }

    if (!clip) { return ctx.restore(); }
  }

  render(ctx, clip = false) {
    if (this.style.display === 'none') { return; }

    for (let node of this.childNodes) {
      if (node instanceof SVGElement) {
        node.draw(ctx, clip);
      }
    }
  }

  applyStyles(ctx) {
    let m;

    if (this.transform) {
      this.transform.apply(ctx);
    }

    ctx.lineWidth(parseFloat(this.style.strokeWidth));
    ctx.lineCap(this.style.strokeLinecap);
    ctx.lineJoin(this.style.strokeLinejoin);
    ctx.miterLimit(parseFloat(this.style.strokeMiterlimit));

    this.fill = this.style.fill;
    if (m = /^url\(#([^\)]+)\)?/.exec(this.style.fill)) {
      var grad = this.document.getElementById(m[1]);
      if (grad && grad.isGradient) {
        this.fill = grad.apply(ctx, this);
      }
    }

    if (this.fill !== 'none') {
      ctx.fillColor(this.fill);
    }

    this.stroke = this.style.stroke;
    if (m = /^url\(#([^\)]+)\)?/.exec(this.style.stroke)) {
      var grad = this.document.getElementById(m[1]);
      if (grad && grad.isGradient) {
        this.stroke = grad.apply(ctx, this);
      }
    }

    if (this.stroke !== 'none') {
      ctx.strokeColor(this.stroke);
    }

    if (this.style.opacity !== 1) {
      ctx.opacity(this.style.opacity);
    }

    if (this.style.fillOpacity !== 1) {
      ctx.fillOpacity(this.style.fillOpacity);
    }

    if (this.style.strokeOpacity !== 1) {
      ctx.strokeOpacity(this.style.strokeOpacity);
    }

    if (m = /^url\(#([^\)]+)\)?/.exec(this.style.clipPath)) {
      let clipPath = this.document.getElementById(m[1]);
      return clipPath && clipPath.apply(ctx);
    }
  }
}
