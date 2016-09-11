import dom from 'jsdom';
import fs from 'fs';
import Path from 'path';
import SVGElement from './SVGElement';
import SVGNode from './SVGNode';

class SVGDocument extends SVGNode {
  static load(path, fn) {
    return fs.readFile(path, 'utf8', function(err, contents) {
      if (err) { __guardFunc__(fn, f => f(err)); }
      return __guardFunc__(fn, f1 => f1(null, new SVGDocument(contents, path)));
    }
    );
  }
      
  static loadSync(path) {
    let contents = fs.readFileSync(path, 'utf8');
    return new SVGDocument(contents, path);
  }
    
  constructor(contents, path) {
    // make sure we have an xml doctype, or jsdom goes nuts
    if (!/<\?xml .*?\?>/.test(contents)) {
      contents = `<?xml version="1.0"?>\n${contents}`;
    }
      
    if (path) {
      this.path = Path.normalize(path);
    }
      
    let document = dom.jsdom(contents);
    let node = document.getElementsByTagName('svg')[0];
    // document.documentElement = node
    document._documentElement = node;
    
    this.defs = {};
    super(this, null, node);    
    this.parse();
  }
    
  parse() {
    super.parse(...arguments);
    this.x = 0;
    return this.y = 0;
  }
    
  getElementById(id) {
    // check defs first for performance
    if (this.defs[id]) { return this.defs[id]; }
    
    // loop through all child nodes looking for the node
    return super.getElementById(...arguments);
  }
}
      
export default SVGDocument;

// include supported elements
import './SVGPath';
import './SVGPolygon';
import './SVGPolyline';
import './SVGCircle';
import './SVGEllipse';
import './SVGLine';
import './SVGRect';
import './SVGDefs';
import './SVGUse';
import './SVGGradient';
import './SVGClipPath';
import './SVGImage';
import './SVGText';
function __guardFunc__(func, transform) {
  return typeof func === 'function' ? transform(func) : undefined;
}