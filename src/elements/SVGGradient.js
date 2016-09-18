import SVGElement from './SVGElement';
import SVGTransform from '../types/SVGTransform';

class SVGGradient extends SVGElement {
  isGradient = true;

  parse() {
    this.units = this.attributes.gradientUnits || 'objectBoundingBox';
    this.transform = SVGTransform.parse(this.attributes.gradientTransform);
    this.spread = this.attributes.spreadMethod || 'pad';
    this.href = this.attributes['xlink:href'];

    this.stops = [];
    let i = 0;
    for (let node of this.childNodes) {
      if (node instanceof SVGGradientStop) {
        if (i > 0 && node.offset < this.stops[i - 1].offset) {
          node.offset = this.stops[i - 1].offset;
        }

        this.stops[i++] = node;
      }
    }
  }

  draw() {
    // gradients don't get painted directly
  }

  applyHref() {
    if (this.href) {
      let grad = this.document.getElementById(this.href.slice(1));
      if (grad && grad.isGradient) {
        grad.applyHref();

        if (!this.attributes.gradientUnits) { this.units = grad.units; }
        if (!this.attributes.transform) { this.transform = grad.transform; }
        if (!this.attributes.spreadMethod) { this.spread = grad.spread; }
        if (this.stops.length === 0) { return this.stops = grad.stops; }
      }
    }
  }

  apply(ctx, element) {
    this.applyHref();

    // SVG specification says that no stops should be treated like
    // the corresponding fill or stroke had "none" specified.
    if (this.stops.length === 0) {
      return 'none';
    }

    // if one stop is defined, painting is the same as a single color
    if (this.stops.length === 1) {
      return this.stops[0].color; // TODO: opacity?
    }

    if (this.units === 'objectBoundingBox') {
      let [x1,y1,x2,y2] = element.getBoundingBox();
      let w = x2 - x1;
      let h = y2 - y1;

      // The last paragraph of section 7.11 in SVG 1.1 states that objects
      // with zero width or height bounding boxes that use gradients with
      // gradientUnits="objectBoundingBox" must not use the gradient.
      // See also pservers-grad-17-b in the SVG test suite.
      if (w === 0 || h === 0) {
        return 'black'; // use the default color
      }
    }

    return null;
  }
}

class SVGGradientStop extends SVGElement {
  parse() {
    this.opacity = this.style.stopOpacity != null ? this.style.stopOpacity : 1;
    this.color = this.style.stopColor.apply();

    let offset = this.parseUnits('offset', 0);
    this.offset = Math.max(0, Math.min(1, offset));
  }
}

SVGElement.parsers['stop'] = SVGGradientStop;

class SVGLinearGradient extends SVGGradient {
  parse() {
    super.parse();
    this.x1 = this.parseUnits('x1', 0, this.units);
    this.y1 = this.parseUnits('y1', 0, this.units);
    this.x2 = this.parseUnits('x2', 1, this.units);
    return this.y2 = this.parseUnits('y2', 0, this.units);
  }

  apply(ctx, element) {
    let ret;
    if (ret = super.apply(...arguments)) {
      return ret;
    }

    if (this.units === 'objectBoundingBox') {
      let [x1,y1,x2,y2] = element.getBoundingBox();
      if (this.transform == null) { this.transform = new SVGTransform(); }
      this.transform.matrix((x2 - x1), 0, 0, (y2 - y1), x1, y1);
    }

    // TODO: spreadMethod

    let {x1, y1, x2, y2} = this;
    if (this.transform) {
      let [m0, m1, m2, m3, m4, m5] = this.transform.transform;
      x1 = m0 * x1 + m2 * y1 + m4;
      y1 = m1 * x1 + m3 * y1 + m5;
      x2 = m0 * x2 + m2 * y2 + m4;
      y2 = m1 * x2 + m3 * y2 + m5;
    }

    let grad = ctx.linearGradient(x1, y1, x2, y2);
    for (let i = 0; i < this.stops.length; i++) {
      let stop = this.stops[i];
      grad.stop(stop.offset, stop.color, stop.opacity);
    }

    if (this.transform) { grad.transform = this.transform.transform; }
    return grad;
  }
}

SVGElement.parsers['lineargradient'] = SVGLinearGradient;

class SVGRadialGradient extends SVGGradient {
  parse() {
    super.parse();
    this.cx = this.parseUnits('cx', 0.5, this.units);
    this.cy = this.parseUnits('cy', 0.5, this.units);
    this.fx = this.parseUnits('fx', this.cx, this.units);
    this.fy = this.parseUnits('fy', this.cy, this.units);
    return this.r  = this.parseUnits('r',  0.5, this.units);
  }

  apply(ctx, element) {
    let ret;
    if (ret = super.apply(...arguments)) {
      return ret;
    }

    // A value of zero will cause the area to be painted as a single color
    // using the color and opacity of the last gradient stop.
    if (this.r === 0) {
      return this.stops[this.stops.length - 1];
    }

    if (this.units === 'objectBoundingBox') {
      let [x1,y1,x2,y2] = element.getBoundingBox();
      if (this.transform == null) { this.transform = new SVGTransform(); }
      this.transform.matrix((x2 - x1), 0, 0, (y2 - y1), x1, y1);
    }

    // TODO: spreadMethod

    let {cx, cy, fx, fy, r} = this;
    if (this.transform) {
      let [m0, m1, m2, m3, m4, m5] = this.transform.transform;
      cx = m0 * cx + m2 * cy + m4;
      cy = m1 * cx + m3 * cy + m5;
      fx = m0 * fx + m2 * fy + m4;
      fy = m1 * fx + m3 * fy + m5;
    }

    let grad = ctx.radialGradient(fx, fy, 0, cx, cy, this.r);
    for (let i = 0; i < this.stops.length; i++) {
      let stop = this.stops[i];
      grad.stop(stop.offset, stop.color, stop.opacity);
    }

    // if (this.transform) { grad.transform = this.transform.transform; }
    return grad;
  }
}

SVGElement.parsers['radialgradient'] = SVGRadialGradient;
