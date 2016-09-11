# build transform regex
# see http://www.w3.org/TR/SVG/coords.html#TransformAttribute
# from fabric.js, thanks!
number = '(?:[-+]?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)'
comma_wsp = '(?:\\s+,?\\s*|,\\s*)'

skewX = '(?:(skewX)\\s*\\(\\s*(' + number + ')\\s*\\))'
skewY = '(?:(skewY)\\s*\\(\\s*(' + number + ')\\s*\\))'
rotate = '(?:(rotate)\\s*\\(\\s*' +
      '(' + number + ')(?:' + comma_wsp + 
      '(' + number + ')' + comma_wsp + 
      '(' + number + '))?\\s*\\))'

scale = '(?:(scale)\\s*\\(\\s*(' + number + ')(?:' + comma_wsp + '(' + number + '))?\\s*\\))'
translate = '(?:(translate)\\s*\\(\\s*(' + number + ')(?:' + comma_wsp + '(' + number + '))?\\s*\\))'

matrix = '(?:(matrix)\\s*\\(\\s*' +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' + comma_wsp +
      '(' + number + ')' +
      '\\s*\\))'

transform = '(?:' +
      matrix + '|' +
      translate + '|' +
      scale + '|' +
      rotate + '|' +
      skewX + '|' +
      skewY +
      ')'

transforms = '(?:' + transform + '(?:' + comma_wsp + transform + ')*' + ')'
transform_list = '^\\s*(?:' + transforms + '?)\\s*$'

reTransformList = new RegExp(transform_list)
reTransform = new RegExp(transform, 'g')

class SVGTransform
  constructor: ->
    @transform = [1, 0, 0, 1, 0, 0]
    
  apply: (ctx) ->
    ctx.transform.apply(ctx, @transform)
      
  @parse: (str) ->
    return null if not str or not reTransformList.test(str)
    
    transform = new SVGTransform
    while m = reTransform.exec(str)
      m = m.filter (match) -> !!match
      operation = m[1]
      args = m[2...].map(parseFloat)
      transform[operation](args...)
    
    return transform
    
  translate: (x, y = 0) ->
    @matrix 1, 0, 0, 1, x, y
      
  rotate: (a, cx = 0, cy = 0) ->
    a *= Math.PI / 180
    sin = Math.sin(a)
    cos = Math.cos(a)
    
    if cx or cy
      x1 = cx * cos - cy * sin
      y1 = cx * sin + cy * cos
      cx -= x1
      cy -= y1
    
    @matrix cos, sin, -sin, cos, cx, cy
    
  scale: (x, y = x) ->
    @matrix x, 0, 0, y, 0, 0
    
  skewX: (a) ->
    a *= Math.PI / 180
    @matrix 1, 0, Math.tan(a), 1, 0, 0
    
  skewY: (a) ->
    a *= Math.PI / 180
    @matrix 1, Math.tan(a), 0, 1, 0, 0
    
  matrix: (m11, m12, m21, m22, dx, dy) ->
    m = @transform
    [m0, m1, m2, m3, m4, m5] = m
    m[0] = m0 * m11 + m2 * m12
    m[1] = m1 * m11 + m3 * m12
    m[2] = m0 * m21 + m2 * m22
    m[3] = m1 * m21 + m3 * m22
    m[4] = m0 * dx + m2 * dy + m4
    m[5] = m1 * dx + m3 * dy + m5
          
module.exports = SVGTransform
