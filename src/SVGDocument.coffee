dom = require 'jsdom'
fs = require 'fs'
Path = require 'path'
SVGElement = require './SVGElement'
SVGNode = require './SVGNode'

class SVGDocument extends SVGNode
  @load: (path, fn) ->
    fs.readFile path, 'utf8', (err, contents) ->
      fn? err if err
      fn? null, new SVGDocument(contents, path)
      
  @loadSync: (path) ->
    contents = fs.readFileSync(path, 'utf8')
    return new SVGDocument(contents, path)
    
  constructor: (contents, path) ->
    # make sure we have an xml doctype, or jsdom goes nuts
    unless /<\?xml .*?\?>/.test(contents)
      contents = '<?xml version="1.0"?>\n' + contents
      
    if path
      @path = Path.normalize(path)
      
    document = dom.jsdom contents
    node = document.getElementsByTagName('svg')[0]
    # document.documentElement = node
    document._documentElement = node
    
    @defs = {}
    super this, null, node    
    @parse()
    
  parse: ->
    super
    @x = 0
    @y = 0
    
  getElementById: (id) ->
    # check defs first for performance
    return @defs[id] if @defs[id]
    
    # loop through all child nodes looking for the node
    super
      
module.exports = SVGDocument

# include supported elements
require './SVGPath'
require './SVGPolygon'
require './SVGPolyline'
require './SVGCircle'
require './SVGEllipse'
require './SVGLine'
require './SVGRect'
require './SVGDefs'
require './SVGUse'
require './SVGGradient'
require './SVGClipPath'
require './SVGImage'
require './SVGText'