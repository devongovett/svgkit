class SVGLength
  @parse: (length = '') ->
    if v = ('' + length).trim().match /^(-?[0-9\.]+)(px|pt|pc|mm|cm|in|em|ex|%)?$/i
      return new SVGLength(parseFloat(v[1]), v[2])
      
    return null
    
  constructor: (@value, @units) ->
    
  toPixels: (doc, prop, units) ->
    switch @units
      when 'pt' then @value * 1.25
      when 'pc' then @value * 15
      when 'mm' then @value * 3.543307
      when 'cm' then @value * 35.43307
      when 'in' then @value * 90
      when 'em', 'ex'
        console.log 'WARNING: em and ex units are not supported'
        return @value
      when '%'
        if units is 'objectBoundingBox'
          return @value / 100
          
        else if prop in ['offset', 'opacity', 'stopOpacity']
          return @value / 100
          
        else if /x|width/.test(prop)
          return @value * doc.width / 100
          
        else if /y|height/.test(prop)
          return @value * doc.height / 100
                    
        return (@value / 100) * Math.sqrt(doc.width ** 2 + doc.height ** 2) / Math.sqrt(2)
      else
        @value
    
  valueOf: ->
    @toPixels()
  
  isPercentage: ->
    @units is '%'
    
module.exports = SVGLength