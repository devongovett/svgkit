import SVGTransform from './SVGTransform';
import SVGColor from './SVGColor';
import SVGLength from './SVGLength';

class SVGElement {
  constructor(document, parentNode, node) {
    this.document = document;
    this.parentNode = parentNode;
    this.node = node;
    this.id = this.node.getAttribute('id');
    this.childNodes = [];
    this.style = {};
    this.transform = null;
  }
    
  static parsers =
    {g: SVGElement};
    
  parse() {
    this.parseStyle();
    this.transform = SVGTransform.parse(this.node.getAttribute('transform'));
    
    for (let i = 0; i < this.node.childNodes.length; i++) {
      let node = this.node.childNodes[i];
      if (node.tagName != null) {
        let Element = SVGElement.parsers[node.tagName.toLowerCase()];
        if (!Element) {
          console.log(`Element ${node.tagName} is not supported.`);
          continue;
        }
        
        let el = new Element(this.document, this, node);
        el.parse();
        this.childNodes.push(el);
      }
    }
    
  }
    
  getElementById(id) {
    for (let i = 0; i < this.childNodes.length; i++) {
      // check if the node's id matches
      let node = this.childNodes[i];
      if (node.id === id) { return node; }
      
      // check the nodes children
      let sub = node.getElementById(id);
      if (sub) { return sub; }
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
    let value = SVGLength.parse(this.node.getAttribute(prop) || fallback);
    return __guard__(value, x => x.toPixels(this.document, prop, units));
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
    for (let prop in this.styleProperties) {
      let config = this.styleProperties[prop];
      let camel = prop.replace(/(-)([a-z])/, (t, a, b) => b.toUpperCase()
      );
        
      let window = this.node.ownerDocument.defaultView;
      let style = window.getComputedStyle(this.node);
      
      // check css value      
      if (this._checkValue(style[camel])) {
        this.style[camel] = style[camel];
      
      // check attributes  
      } else if (this._checkValue(this.node.getAttribute(prop))) {
        this.style[camel] = this.node.getAttribute(prop);
      
      // check parent if inherited
      } else if (config[0] && this._checkValue(__guard__(this.parentNode, x => x.style[camel]))) {
        this.style[camel] = __guard__(this.parentNode, x1 => x1.style[camel]);
      
      // use the default otherwise
      } else {
        this.style[camel] = config[1];
      }
      
      // if the value of 'inherit' is used, traverse up the
      // tree until an element with the property is found
      if (this.style[camel] === 'inherit') {
        this.style[camel] = __guard__(this.parentNode, x2 => x2.style[camel]);
      }
    }
    
    // clamp opacities
    this.style.fillOpacity = Math.max(0, Math.min(1, this.style.fillOpacity));
    this.style.strokeOpacity = Math.max(0, Math.min(1, this.style.strokeOpacity));
    this.style.opacity = Math.max(0, Math.min(1, this.style.opacity));
    this.style.stopOpacity = Math.max(0, Math.min(1, this.style.stopOpacity));
        
    this.style.fill = SVGColor.parse(this.style.fill);
    if (this.style.fill === 'currentColor') {
      this.style.fill = this.style.color;
    }
      
    this.style.stroke = SVGColor.parse(this.style.stroke);
    if (this.style.stroke === 'currentColor') {
      this.style.stroke = this.style.color;
    }
      
    return this.style.color = SVGColor.parse(this.style.color);
  }
    
  draw(ctx, clip = false) {
    if (this.style.display === 'none') { return; }
    
    // TODO: probably shouldn't be handling specific elements here
    if (this.style.visibility === 'hidden') {
      if (this.node.tagName === 'G') {
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
    
    for (let i = 0; i < this.childNodes.length; i++) {
      let node = this.childNodes[i];
      node.draw(ctx, clip);
    }

  }
    
  applyStyles(ctx) {
    let m;
    __guard__(this.transform, x => x.apply(ctx));
          
    ctx.lineWidth(parseFloat(this.style.strokeWidth));
    ctx.lineCap(this.style.strokeLinecap);
    ctx.lineJoin(this.style.strokeLinejoin);
    ctx.miterLimit(parseFloat(this.style.strokeMiterlimit));
      
    this.fill = this.style.fill;
    if (m = /^url\(#([^\)]+)\)?/.exec(this.style.fill)) {
      var grad = this.document.getElementById(m[1]);
      if (__guard__(grad, x1 => x1.isGradient)) {
        this.fill = grad.apply(ctx, this);
      }
    }
        
    if (this.fill !== 'none') {
      ctx.fillColor(this.fill);
    }
      
    this.stroke = this.style.stroke;
    if (m = /^url\(#([^\)]+)\)?/.exec(this.style.stroke)) {
      var grad = this.document.getElementById(m[1]);
      if (__guard__(grad, x2 => x2.isGradient)) {
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
      return __guard__(clipPath, x3 => x3.apply(ctx));
    }
  }
}
    
export default SVGElement;
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}