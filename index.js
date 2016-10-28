var htmlparser = require("htmlparser2");
var domutils = require("domutils")
var ElementType = require("domelementtype")

var elementTypes = ['u', 'em', 'i', 'b']
var randomElementType = elementTypes[Math.floor(Math.random()*elementTypes.length)];
var attributes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
var randomAttribute = attributes[Math.floor(Math.random()*attributes.length)];
var length = 3;

var generateRandomChar = function generateRandomChar() {
	return Math.random().toString(36)[2];
}

var scrambleTag = function scrambleTag() {
	var filler = generateRandomChar();
	for (var i = 1; i < length; i++) {
		if(Math.random() > 0.5)
			filler = filler + generateRandomChar();
	}
	return '<' + randomElementType +' ' + randomAttribute + '="">'+ filler +'</' + randomElementType + '>'
}
var scrambleTextHelper = function scrambleTextHelper(text) {
	return text.split('').map(function(t) { return t + scrambleTag() }).join('')
}
var generateStyle = function generateStyle() {
	return randomElementType + '[' + randomAttribute + ']' + ' { display:inline-block; width:1px; height:1px; overflow:hidden; margin-left:-1px}';
}
var injectStyle = function injectStyle(htmlText) {
	return htmlText.replace('</head>', '<style>' + generateStyle() + '</style></head>')
}
var randomizeElementAttribute = function randomizeElementAttribute() {	
	randomElementType = elementTypes[Math.floor(Math.random()*elementTypes.length)];
	randomAttribute = attributes[Math.floor(Math.random()*attributes.length)];
}

var scrambleText = function scrambleText(options) {
	options = options || {};
	length = options.length || length

	var type = options.type;	
	switch(type) {
		case 'stupid':
		default:
			return function stupid (req, res, next) {
				randomizeElementAttribute()
				var _send = res.send;

				res.send = function send(body) {
					body = body.replace(/<body[\s\S]*?(<\/body>|<footer|<script|<style)/, function(bodyMatch) {
						return bodyMatch.replace(/>[^<]+</gi, function(match) {
							var textSlide = match.slice(1, match.length - 1)
							var ret = '';
							for (var i = 0; i < textSlide.length; i++) {
								ret = ret + textSlide[i] + scrambleTag()
							}
							return '>' + ret +'<'
						})
					})
					body = injectStyle(body);
					return _send.call(this, body);
				}
				next();
			};
		case 'smart':
			return function smart(req, res, next) {
				randomizeElementAttribute()
				var _send = res.send;
				var dom;

				var handler = new htmlparser.DomHandler(function(err, parsedDom) { dom = parsedDom });
				var parser = new htmlparser.Parser(handler);

				res.send = function send(body) {
					parser.write(body);
					parser.end();

					domutils
						.getElementsByTagType(ElementType.Text, dom, true, 9999)
						.map(function(textElement) {							
							if(textElement.parent.type !== ElementType.Script
								&& textElement.parent.type !== ElementType.Style
								&& textElement.parent.name !== 'title'
								&& textElement.parent.name !== 'meta'
								&& textElement.parent.name !== 'link'
								&& textElement.data
							)
							{
								textElement.data = scrambleTextHelper(textElement.data);
							}
						})

					var modifiedDomString = domutils.getOuterHTML(dom);
					var finalizedDomString = injectStyle(modifiedDomString)

					return _send.call(this, finalizedDomString);
				}

				next();
			}
		case 'injectStyle':
			return function style(req, res, next) {				
				var _send = res.send;
				res.send = function send(body) {					
					return _send.call(this, injectStyle(body));
				}
				next();
			}
		case 'style':
			return generateStyle;
		case 'jade':
		case 'pug':
			return function(text) {
				if(text === 'cssStyle' || text.startsWith('cssStyle'))
					return generateStyle();
				else
					return scrambleTextHelper(text);
			}
	}
}

module.exports = scrambleText;