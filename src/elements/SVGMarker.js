import SVGElement from './SVGElement';
import SVGAspectRatio from '../types/SVGAspectRatio';
import SVGPoint from '../types/SVGPoint';

class SVGMarker extends SVGElement {
  parse() {
    this.orient = this.attributes.orient;
    this.markerUnits = this.attributes.markerUnits || 'strokeWidth';
    this.refX = this.parseUnits('refX', 0);
    this.refY = this.parseUnits('refY', 0);
    this.markerWidth = this.parseUnits('markerWidth', 3);
    this.markerHeight = this.parseUnits('markerHeight', 3);

    if (this.attributes.viewBox) {
      this.viewBox = this.attributes.viewBox.split(/\s+/).map(parseFloat);
      if (this.viewBox.length !== 4) { this.viewBox = null; }
    }

    this.preserveAspectRatio = SVGAspectRatio.parse(this.attributes.preserveAspectRatio);
  }

  draw() {}

  renderMarker(ctx, element, point, angle) {
    ctx.save();
    ctx.translate(point.x, point.y);

    if (this.orient === 'auto') {
      ctx.rotate(angle);
    }

    if (this.markerUnits === 'strokeWidth') {
      ctx.scale(ctx.ctx.lineWidth, ctx.ctx.lineWidth);
    }

    let transform = this.preserveAspectRatio.getTransform(this.viewBox, this.markerWidth, this.markerHeight);
    let origin = new SVGPoint(this.refX, this.refY).transform(transform);

    ctx.translate(-origin.x, -origin.y);

    if (this.style.overflow === 'hidden' || this.style.overflow === 'scroll') {
      ctx.rect(0, 0, this.markerWidth, this.markerHeight);
      ctx.clip();
    }

    transform.apply(ctx);

    this.renderChildren(ctx);
    ctx.restore();
  }
}

SVGElement.parsers['marker'] = SVGMarker;
