import SVGTransform from '../types/SVGTransform';
import SVGColor from '../types/SVGColor';
import SVGLength from '../types/SVGLength';
import SVGURLReference from '../types/SVGURLReference';
import {CSSStyleDeclaration} from 'cssom';

export default class SVGElement {
  constructor(document, parentNode, tagName, attributes) {
    this.document = document;
    this.ownerDocument = document;
    this.parentNode = parentNode;
    this.tagName = tagName;
    this.attributes = attributes;
    this.id = this.attributes.id;
    this.childNodes = [];
    this.nodeType = 1;
    this.transform = SVGTransform.parse(this.attributes.transform);
    this.className = this.attributes.class || '';
    this.style = this.parseStyle();
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

  getAttribute(attribute) {
    return this.attributes[attribute];
  }

  setAttribute(attribute, value) {
    this.attributes[attribute] = value;
  }

  matchesSelector(selector) {
    try {
      return this.document.NW.match(this, selector, this.document.documentElement);
    } catch (err) {
      return false;
    }
  }

  appendChild(child) {
    this.childNodes.push(child);
    return child;
  }

  get firstChild() {
    return this.childNodes[0];
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1];
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
    let value = SVGLength.parse(this, this.attributes[prop] || fallback);
    return value && value.toPixels(prop, units);
  }

  // each property in this table defines whether
  // it is inherited, and its default value
  static styleProperties = {
    // clipping, masking and compositing
    'clip-path': [false, null, SVGURLReference],
    'clip-rule': [true, 'nonzero'],
    'overflow': [true, 'hidden'],

    // 'mask'
    'opacity': [true, 1], // really not inherited, supposed to be rendered off screen first for groups

    // color and painting
    'color': [true, null, SVGColor],
    // 'color-interpolation'
    // 'color-interpolation-filters'
    // 'color-profile'
    // 'color-rendering'
    'display': [false, 'inline'],
    'visibility': [true, 'visible'],
    'fill': [true, 'black', SVGColor],
    'fill-opacity': [true, 1],
    'fill-rule': [true, 'nonzero'],
    // 'image-rendering'
    'marker': [true, null, SVGURLReference, false],
    'marker-end': [true, null, SVGURLReference],
    'marker-mid': [true, null, SVGURLReference],
    'marker-start': [true, null, SVGURLReference],
    // 'shape-rendering'
    'stroke': [true, 'none', SVGColor],
    // 'stroke-dasharray': [yes, 'none']
    // 'stroke-dashoffset': [yes, 0]
    'stroke-linecap': [true, 'butt'],
    'stroke-linejoin': [true, 'miter'],
    'stroke-miterlimit': [true, 4],
    'stroke-opacity': [true, 1],
    'stroke-width': [true, 1],
    // 'text-rendering'

    // gradients
    'stop-color': [false, 'black', SVGColor],
    'stop-opacity': [false, 1],

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
    'font-size': [true, 12, SVGLength]
  };
    // 'font-size-adjust'
    // 'font-stretch'
    // 'font-weight'

  _checkValue(v) {
    return (v != null) && v !== '';
  }

  parseStyle() {
    let result = {};
    let style = this.document.getComputedStyle(this);

    for (let prop in SVGElement.styleProperties) {
      let [inherited, defaultValue, Parser, allowAttribute] = SVGElement.styleProperties[prop];
      let camel = prop.replace(/(-)([a-z])/, (t, a, b) => b.toUpperCase());

      // check css value
      if (this._checkValue(style[prop])) {
        result[camel] = style[prop];

      // check attributes
      } else if (this._checkValue(this.attributes[prop]) && allowAttribute !== false) {
        result[camel] = this.attributes[prop];

      // check parent if inherited
      } else if (inherited && this.parentNode) {
        result[camel] = this.parentNode.style[camel];

      // use the default otherwise
      } else {
        result[camel] = defaultValue;
      }

      // if the value of 'inherit' is used, traverse up the
      // tree until an element with the property is found
      if (result[camel] === 'inherit') {
        result[camel] = this.parentNode && this.parentNode.style[camel];
      }

      if (Parser && result[camel] != null && !(result[camel] instanceof Parser)) {
        result[camel] = Parser.parse(this.document, result[camel], result);
      }
    }

    // clamp opacities
    result.fillOpacity = Math.max(0, Math.min(1, result.fillOpacity));
    result.strokeOpacity = Math.max(0, Math.min(1, result.strokeOpacity));
    result.opacity = Math.max(0, Math.min(1, result.opacity));
    result.stopOpacity = Math.max(0, Math.min(1, result.stopOpacity));

    if (result.marker) {
      result.markerStart = result.markerStart || result.marker;
      result.markerMid = result.markerMid || result.marker;
      result.markerEnd = result.markerEnd || result.marker;
    }

    // result.color = SVGColor.parse(result.color);
    // result.fill = SVGColor.parse(result.fill, result.color);
    // result.stroke = SVGColor.parse(result.stroke, result.color);
    // result.stopColor = SVGColor.parse(result.stopColor, result.color);
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
      // if (this.tagName === 'g') {
      //   this.render(ctx, clip);
      // } else {
      //   return;
      // }
    }

    if (!clip) { ctx.save(); }
    this.applyStyles(ctx);
    this.render(ctx, clip);

    // if (clip) {
 //      ctx.clip(this.style.clipRule);
 //
 //    } else if (this.fill !== 'none' && this.stroke !== 'none') {
 //      ctx.fillAndStroke(this.style.fillRule);
 //
 //    } else if (this.fill !== 'none') {
 //      ctx.fill(this.style.fillRule);
 //
 //    } else if (this.stroke !== 'none') {
 //      ctx.stroke();
 //    }

   this.renderChildren(ctx, clip);

    if (!clip) { ctx.restore(); }
  }

  render(ctx, clip = false) {
    if (this.style.display === 'none') { return; }
  }

  renderChildren(ctx, clip = false) {
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

    this.fill = this.style.fill && this.style.fill.apply(ctx, this);

    if (this.fill) {
      if (Array.isArray(this.fill)) {
        ctx.fillColor(this.fill.slice(0, 3), this.fill[3]);
      } else {
        ctx.fillColor(this.fill);
      }
    }

    this.stroke = this.style.stroke && this.style.stroke.apply(ctx, this);

    if (this.stroke) {
      if (Array.isArray(this.stroke)) {
        ctx.strokeColor(this.stroke.slice(0, 3), this.stroke[3]);
      } else {
        ctx.strokeColor(this.stroke);
      }
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

    // if (m = /^url\(#([^\)]+)\)?/.exec(this.style.clipPath)) {
    //   let clipPath = this.document.getElementById(m[1]);
    //   return clipPath && clipPath.apply(ctx);
    // }

    if (this.style.clipPath) {
      this.style.clipPath.apply(ctx);
    }
  }
}
