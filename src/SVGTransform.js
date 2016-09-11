// build transform regex
// see http://www.w3.org/TR/SVG/coords.html#TransformAttribute
// from fabric.js, thanks!
let number = '(?:[-+]?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)';
let comma_wsp = '(?:\\s+,?\\s*|,\\s*)';

let skewX = `(?:(skewX)\\s*\\(\\s*(${number})\\s*\\))`;
let skewY = `(?:(skewY)\\s*\\(\\s*(${number})\\s*\\))`;
let rotate = '(?:(rotate)\\s*\\(\\s*' +
      '(' + number + ')(?:' + comma_wsp + 
      '(' + number + ')' + comma_wsp + 
      '(' + number + '))?\\s*\\))';

let scale = `(?:(scale)\\s*\\(\\s*(${number})(?:${comma_wsp}(${number}))?\\s*\\))`;
let translate = `(?:(translate)\\s*\\(\\s*(${number})(?:${comma_wsp}(${number}))?\\s*\\))`;

let matrix = '(?:(matrix)\\s*\\(\\s*' +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' +
      '\\s*\\))';

let transform = '(?:' +
      matrix + '|' +
      translate + '|' +
      scale + '|' +
      rotate + '|' +
      skewX + '|' +
      skewY +
      ')';

let transforms = `(?:${transform}(?:${comma_wsp}${transform})*)`;
let transform_list = `^\\s*(?:${transforms}?)\\s*$`;

let reTransformList = new RegExp(transform_list);
let reTransform = new RegExp(transform, 'g');

class SVGTransform {
  constructor() {
    this.transform = [1, 0, 0, 1, 0, 0];
  }
    
  apply(ctx) {
    return ctx.transform.apply(ctx, this.transform);
  }
      
  static parse(str) {
    let m;
    if (!str || !reTransformList.test(str)) { return null; }
    
    transform = new SVGTransform();
    while (m = reTransform.exec(str)) {
      m = m.filter(match => !!match);
      let operation = m[1];
      let args = m.slice(2).map(parseFloat);
      transform[operation](...args);
    }
    
    return transform;
  }
    
  translate(x, y = 0) {
    return this.matrix(1, 0, 0, 1, x, y);
  }
      
  rotate(a, cx = 0, cy = 0) {
    a *= Math.PI / 180;
    let sin = Math.sin(a);
    let cos = Math.cos(a);
    
    if (cx || cy) {
      let x1 = (cx * cos) - (cy * sin);
      let y1 = (cx * sin) + (cy * cos);
      cx -= x1;
      cy -= y1;
    }
    
    return this.matrix(cos, sin, -sin, cos, cx, cy);
  }
    
  scale(x, y = x) {
    return this.matrix(x, 0, 0, y, 0, 0);
  }
    
  skewX(a) {
    a *= Math.PI / 180;
    return this.matrix(1, 0, Math.tan(a), 1, 0, 0);
  }
    
  skewY(a) {
    a *= Math.PI / 180;
    return this.matrix(1, Math.tan(a), 0, 1, 0, 0);
  }
    
  matrix(m11, m12, m21, m22, dx, dy) {
    let m = this.transform;
    let [m0, m1, m2, m3, m4, m5] = m;
    m[0] = (m0 * m11) + (m2 * m12);
    m[1] = (m1 * m11) + (m3 * m12);
    m[2] = (m0 * m21) + (m2 * m22);
    m[3] = (m1 * m21) + (m3 * m22);
    m[4] = (m0 * dx) + (m2 * dy) + m4;
    return m[5] = (m1 * dx) + (m3 * dy) + m5;
  }
}
          
export default SVGTransform;
