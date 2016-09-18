import SVGElement from './SVGElement';

export default class SVGShapeElement extends SVGElement {
  getMarkers() {
    return [];
  }

  render(ctx, clip = false) {
    if (this.style.display === 'none') {
      return;
    }

    this.renderPath(ctx, clip);

    if (clip) {
      ctx.clip(this.style.clipRule);

    } else if (this.fill && this.stroke) {
      ctx.fillAndStroke(this.style.fillRule);

    } else if (this.fill) {
      ctx.fill(this.style.fillRule);

    } else if (this.stroke) {
      ctx.stroke();
    }

    let markers = this.getMarkers();
    if (markers) {
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
