class SVGColor {    
    static converters = {
        rgb: {
            regex: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/,
            process(a, b, c) {
                return [+a, +b, +c];
            }
        },
            
        rgb_percent: {
            regex: /^rgb\(\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*\)$/,
            process(a, b, c) {
                return [((+a) / 100) * 255, ((+b) / 100) * 255, ((+c) / 100) * 255];
            }
        }
    };
    
    static parse(str) {
        if (typeof str !== 'string') { return str; }
        
        str = str.trim();
        if (str === 'none') { return str; }
        
        for (let name in this.converters) {
            let converter = this.converters[name];
            let args = converter.regex.exec(str);
            if (args) {
                return converter.process.apply(null, args.slice(1));
            }
        }
                
        return str;
    }
}

export default SVGColor;