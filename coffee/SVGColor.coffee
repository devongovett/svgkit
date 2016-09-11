class SVGColor    
    @converters:
        rgb:
            regex: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/
            process: (a, b, c) ->
                return [+a, +b, +c]
            
        rgb_percent:
            regex: /^rgb\(\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*\)$/
            process: (a, b, c) ->
                return [(+a) / 100 * 255, (+b) / 100 * 255, (+c) / 100 * 255]
    
    @parse: (str) ->
        return str if typeof str isnt 'string'
        
        str = str.trim()
        return str if str is 'none'
        
        for name, converter of @converters
            args = converter.regex.exec(str)
            if args
                return converter.process.apply(null, args.slice(1))
                
        return str

module.exports = SVGColor