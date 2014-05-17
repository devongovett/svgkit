SVGElement = require './SVGElement'
SVGPoint = require './SVGPoint'

class SVGPath extends SVGElement
  SVGElement.parsers['path'] = SVGPath
  
  parameters =
    A: 7
    a: 7
    C: 6
    c: 6
    H: 1
    h: 1
    L: 2
    l: 2
    M: 2
    m: 2
    Q: 4
    q: 4
    S: 4
    s: 4
    T: 2
    t: 2
    V: 1
    v: 1
    Z: 0
    z: 0
  
  parse: ->
    super
    @d = @node.getAttribute 'd'
    
    @d = @d.replace(/[\r\n]/g, '')
        
    # parse the data
    path = @d
    ret = []
    args = []
    curArg = ""
    foundDecimal = no
    params = 0

    for c in path
      # new command
      if parameters[c]?
        params = parameters[c]
        if cmd # save existing command
          args[args.length] = +curArg if curArg.length > 0
          ret[ret.length] = {cmd,args}

          args = []
          curArg = ""
          foundDecimal = no

        cmd = c

      # command separator
      else if c in [" ", "\t", ","] or (c is "-" and curArg.length > 0 and curArg[curArg.length - 1] isnt 'e') or (c is "." and foundDecimal)
        continue if curArg.length is 0
          
        if args.length is params # handle reused commands
          ret[ret.length] = {cmd, args}
          args = [+curArg]

          # handle assumed commands
          cmd = "L" if cmd is "M"
          cmd = "l" if cmd is "m"

        else
          args[args.length] = +curArg

        foundDecimal = (c is ".")

        # fix for negative numbers or repeated decimals with no delimeter between commands
        curArg = if c in ['-', '.'] then c else ''

      # argument
      else if c in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', '+', 'e', 'E']
        curArg += c
        foundDecimal = true if c is '.'
        
      else
        console.log JSON.stringify c
        # bad character, stop parsing
        break

    # add the last command
    if curArg.length > 0
      if args.length is params # handle reused commands
        ret[ret.length] = {cmd, args}
        args = [+curArg]
    
        # handle assumed commands
        cmd = "L" if cmd is "M"
        cmd = "l" if cmd is "m"
      else
        args[args.length] = +curArg
        
    args[args.length] = +curArg if curArg.length > 0
    ret[ret.length] = {cmd,args}
    @commands = ret
    
  getMarkers: ->
    @render null
    
  _addMarker: (p, from, prior) ->
    if prior? and @_angles.length > 0
      @_angles[@_angles.length - 1] ?=  @_points[@_points.length - 1].angleTo(prior)
      
    @_points.push p
    @_angles.push from?.angleTo(p)
    
  render: (ctx) ->
    # current point, control point, and subpath starting point
    @cx = @cy = @px = @py = @sx = @sy = 0
    @ctx = ctx
    @_points = []
    @_angles = []
    
    for c in @commands
      runners[c.cmd]?.call(this, c.args)
      
    return
    
  runners = 
    M: (a) ->
      @cx = a[0]
      @cy = a[1]
      @px = @py = null
      @sx = @cx
      @sy = @cy
      @_addMarker new SVGPoint(@cx, @cy)
      @ctx?.moveTo(@cx, @cy)

    m: (a) ->
      @cx += a[0]
      @cy += a[1]
      @px = @py = null
      @sx = @cx
      @sy = @cy
      @_addMarker new SVGPoint(@cx, @cy)
      @ctx?.moveTo(@cx, @cy)

    C: (a) ->
      @cx = a[4]
      @cy = a[5]
      @px = a[2]
      @py = a[3]
      @_addMarker new SVGPoint(@cx, @cy), new SVGPoint(@px, @py), new SVGPoint(a[0], a[1])
      @ctx?.bezierCurveTo a...

    c: (a) ->
      @ctx?.bezierCurveTo(a[0] + @cx, a[1] + @cy, a[2] + @cx, a[3] + @cy, a[4] + @cx, a[5] + @cy)
      @px = @cx + a[2]
      @py = @cy + a[3]
      @cx += a[4]
      @cy += a[5]
      @_addMarker new SVGPoint(@cx, @cy), new SVGPoint(@px, @py), new SVGPoint(a[0], a[1])

    S: (a) ->
      if @px is null
        @px = @cx
        @py = @cy

      @ctx?.bezierCurveTo(@cx-(@px-@cx), @cy-(@py-@cy), a[0], a[1], a[2], a[3])
      @px = a[0]
      @py = a[1]
      @cx = a[2]
      @cy = a[3]
      
      @_addMarker new SVGPoint(@cx, @cy), new SVGPoint(@px, @py), new SVGPoint(a[0], a[1])

    s: (a) ->
      if @px is null
        @px = @cx
        @py = @cy
      
      @ctx?.bezierCurveTo(@cx-(@px-@cx), @cy-(@py-@cy), @cx + a[0], @cy + a[1], @cx + a[2], @cy + a[3])
      @px = @cx + a[0]
      @py = @cy + a[1]
      @cx += a[2]
      @cy += a[3]

    Q: (a) ->
      @px = a[0]
      @py = a[1]
      @cx = a[2]
      @cy = a[3]
      @ctx?.quadraticCurveTo(a[0], a[1], @cx, @cy)

    q: (a) ->
      @ctx?.quadraticCurveTo(a[0] + @cx, a[1] + @cy, a[2] + @cx, a[3] + @cy)
      @px = @cx + a[0]
      @py = @cy + a[1]
      @cx += a[2]
      @cy += a[3]

    T: (a) ->
      if @px is null
        @px = @cx
        @py = @cy
      else 
        @px = @cx-(@px-@cx)
        @py = @cy-(@py-@cy)

      @ctx?.quadraticCurveTo(@px, @py, a[0], a[1])
      @px = @cx-(@px-@cx)
      @py = @cy-(@py-@cy)
      @cx = a[0]
      @cy = a[1]

    t: (a) ->
      if @px is null
        @px = @cx
        @py = @cy
      else
        @px = @cx-(@px-@cx)
        @py = @cy-(@py-@cy)

      @ctx?.quadraticCurveTo(@px, @py, @cx + a[0], @cy + a[1])
      @cx += a[0]
      @cy += a[1]

    A: (a) ->
      solveArc(@ctx, @cx, @cy, a) if @ctx
      @cx = a[5]
      @cy = a[6]

    a: (a) ->
      a[5] += @cx
      a[6] += @cy
      solveArc(@ctx, @cx, @cy, a) if @ctx
      @cx = a[5]
      @cy = a[6]

    L: (a) ->
      @cx = a[0]
      @cy = a[1]
      @px = @py = null
      @ctx?.lineTo(@cx, @cy)

    l: (a) ->
      @cx += a[0]
      @cy += a[1]
      @px = @py = null
      @ctx?.lineTo(@cx, @cy)

    H: (a) ->
      @cx = a[0]
      @px = @py = null
      @ctx?.lineTo(@cx, @cy)

    h: (a) ->
      @cx += a[0]
      @px = @py = null
      @ctx?.lineTo(@cx, @cy)

    V: (a) ->
      @cy = a[0]
      @px = @py = null
      @ctx?.lineTo(@cx, @cy)

    v: (a) ->
      @cy += a[0]
      @px = @py = null
      @ctx?.lineTo(@cx, @cy)

    Z: ->
      @ctx?.closePath()
      @cx = @sx
      @cy = @sy

    z: ->
      @ctx?.closePath()
      @cx = @sx
      @cy = @sy

  solveArc = (ctx, x, y, coords) ->
    [rx,ry,rot,large,sweep,ex,ey] = coords
    segs = arcToSegments(ex, ey, rx, ry, large, sweep, rot, x, y)

    for seg in segs
      bez = segmentToBezier seg...
      ctx.bezierCurveTo bez...

  # from Inkscape svgtopdf, thanks!
  arcToSegments = (x, y, rx, ry, large, sweep, rotateX, ox, oy) ->
    th = rotateX * (Math.PI / 180)
    sin_th = Math.sin(th)
    cos_th = Math.cos(th)
    rx = Math.abs(rx)
    ry = Math.abs(ry)
    px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5
    py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5
    pl = (px*px) / (rx*rx) + (py*py) / (ry*ry)
    if pl > 1
      pl = Math.sqrt(pl)
      rx *= pl
      ry *= pl

    a00 = cos_th / rx
    a01 = sin_th / rx
    a10 = (-sin_th) / ry
    a11 = (cos_th) / ry
    x0 = a00 * ox + a01 * oy
    y0 = a10 * ox + a11 * oy
    x1 = a00 * x + a01 * y
    y1 = a10 * x + a11 * y

    d = (x1-x0) * (x1-x0) + (y1-y0) * (y1-y0)
    sfactor_sq = 1 / d - 0.25
    sfactor_sq = 0 if sfactor_sq < 0
    sfactor = Math.sqrt(sfactor_sq)
    sfactor = -sfactor if sweep is 1 and large is 1

    xc = 0.5 * (x0 + x1) - sfactor * (y1-y0)
    yc = 0.5 * (y0 + y1) + sfactor * (x1-x0)

    th0 = Math.atan2(y0-yc, x0-xc)
    th1 = Math.atan2(y1-yc, x1-xc)

    th_arc = th1-th0
    if th_arc < 0 and sweep is 1
      th_arc += 2 * Math.PI
    else if th_arc > 0 and sweep is 0
      th_arc -= 2 * Math.PI

    segments = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)))
    result = []

    for i in [0...segments]
      th2 = th0 + i * th_arc / segments
      th3 = th0 + (i+1) * th_arc / segments
      result[i] = [xc, yc, th2, th3, rx, ry, sin_th, cos_th]

    return result

  segmentToBezier = (cx, cy, th0, th1, rx, ry, sin_th, cos_th) ->
    a00 = cos_th * rx
    a01 = -sin_th * ry
    a10 = sin_th * rx
    a11 = cos_th * ry

    th_half = 0.5 * (th1 - th0)
    t = (8 / 3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5) / Math.sin(th_half)
    x1 = cx + Math.cos(th0) - t * Math.sin(th0)
    y1 = cy + Math.sin(th0) + t * Math.cos(th0)
    x3 = cx + Math.cos(th1)
    y3 = cy + Math.sin(th1)
    x2 = x3 + t * Math.sin(th1)
    y2 = y3 - t * Math.cos(th1)

    return [
      a00 * x1 + a01 * y1,   a10 * x1 + a11 * y1,
      a00 * x2 + a01 * y2,   a10 * x2 + a11 * y2,
      a00 * x3 + a01 * y3,   a10 * x3 + a11 * y3
    ]