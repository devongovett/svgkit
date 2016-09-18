import SVGElement from './SVGElement';
import SVGPolyLine from './SVGPolyLine';

class SVGPolygon extends SVGPolyLine {
  renderPath(ctx) {
    super.renderPath(...arguments);
    return ctx.closePath();
  }

  getMarkers() {
    let markers = super.getMarkers();
    markers.push(markers[0]);
    return markers;
  }
}

SVGElement.parsers['polygon'] = SVGPolygon;
export default SVGPolygon;
