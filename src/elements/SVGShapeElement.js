import SVGElement from './SVGElement';
import SVGPoint from '../types/SVGPoint';

export default class SVGShapeElement extends SVGElement {
  get path() {
    if (!this._path) {
      this._path = this.getPath();
    }

    return this._path;
  }

  getMarkers() {
    return [];
  }

  getBoundingBox() {
    let bbox = this.path.bbox;
    return [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY];
  }

  render(ctx, clip = false) {
    if (this.style.display === 'none') {
      return;
    }

    // Get crisp strokes for odd-width lines
    if (this.stroke) {
      let translate = (this.style.strokeWidth % 2) / 2;
      if (translate) {
        ctx.translate(translate, translate);
      }
    }

    if (this.path) {
      this.path.toFunction()(ctx);
    }

    if (clip) {
      ctx.clip(this.style.clipRule);

    } else if (this.fill && this.stroke) {
      ctx.fillAndStroke(this.style.fillRule);

    } else if (this.fill) {
      ctx.fill(this.style.fillRule);

    } else if (this.stroke) {
      ctx.stroke();
    }

    if (this.style.markerStart || this.style.markerMid || this.style.markerEnd) {
      let markers = this.getMarkers();

      if (this.style.markerStart) {
        let def = this.style.markerStart.getReferencedElement();
        def.renderMarker(ctx, this, markers[0][0], markers[0][1]);
      }

      if (this.style.markerMid) {
        let def = this.style.markerMid.getReferencedElement();
        for (let i = 1; i < markers.length - 1; i++) {
          def.renderMarker(ctx, this, markers[i][0], markers[i][1]);
        }
      }

      if (this.style.markerEnd) {
        let def = this.style.markerEnd.getReferencedElement();
        def.renderMarker(ctx, this, markers[markers.length - 1][0], markers[markers.length - 1][1]);
      }
    }
  }
}
