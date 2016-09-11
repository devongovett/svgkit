import SVGElement from './SVGElement';
import SVGPolyLine from './SVGPolyLine';

class SVGPolygon extends SVGPolyLine {
  render(ctx) {
    super.render(...arguments);
    return ctx.closePath();
  }
}

SVGElement.parsers['polygon'] = SVGPolygon;
export default SVGPolygon;
