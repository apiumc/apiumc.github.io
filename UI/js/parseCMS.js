
(function () {
    function matches(e, selector) {
        var matchesSelector = e.webkitMatchesSelector || e.mozMatchesSelector ||
            e.oMatchesSelector || e.matchesSelector
        return matchesSelector ? matchesSelector.call(e, selector) : false;
    }

    function colorRGB2Hex(color) {
        if (color.charAt(0) == '#') return color;
        var rgb = color.split(',');
        var r = parseInt(rgb[0].split('(')[1]);
        var g = parseInt(rgb[1]);
        var b = parseInt(rgb[2].split(')')[0]);

        var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }
    function getStyle(n) {
        var fs = n.style['font-size'] || n.size;
        var cl = n.style['color'] || n.color;
        var align = n.style['text-align'];
        var weight = n.style['font-weight'];

        if (fs || cl || align) {
            var sl = {};
            if (fs) {
                sl['font-size'] = Math.round(parseFloat(getComputedStyle(n, false).fontSize));
            }
            if (cl) {
                sl['color'] = colorRGB2Hex(getComputedStyle(n, false).color);
            }
            if (align) {
                sl['text-align'] = align;
            }
            if (weight == 'bold') {
                sl['font-weight'] = 'bold'
            }
            return sl;
        };

    }



    function newItem(values, item) {
        if (item.format.length > 0) {
            values.push({
                _CellName: 'CMSText',
                format: {
                    text: item.format.join('')
                },
                style: item.style,
                value: item.data
            });
            item.format = [];
            item.data = {};
            item.style = {};
        }
    }
    function Trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }


    function doNode(nodes, values, item, src, ncls, isText) {
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];

            switch (n.nodeType) {
                case 3:
                    if (Trim(n.textContent)) {
                        var key = 'p' + item.format.length;
                        item.format.push('{', key, '}');
                        item.data[key] = n.textContent;
                    }
                    break;
                case 1:
                    if ((getComputedStyle(n, false).display == 'none') || (ncls && matches(n, ncls))) {
                        continue;
                    }
                    switch (n.tagName.toLowerCase()) {
                        case 'img':
                            newItem(values, item);

                            var imgSrc = src ? n.getAttribute(src) : n.src;
                            if (imgSrc) {
                                if (imgSrc.substr(0, 2) == '//') {
                                    imgSrc = 'https:' + imgSrc;
                                }
                                values.push({
                                    _CellName: 'CMSImage',
                                    value: {
                                        src: imgSrc
                                    }
                                });
                            }

                            break;
                        case 'br':
                            var key = 'p' + item.format.length;
                            item.format.push('{', key, '}');
                            item.data[key] = '\n';
                            break;
                        case 'table':
                        case 'script':
                            break;
                        case 'blockquote':
                            if (!isText) {
                                newItem(values, item);
                                doNode(n.childNodes, values, item, src, ncls, true);
                                newItem(values, item, 'CMSRel');
                                break;
                            }
                            break;
                        case 'pre':
                            if (!isText) {
                                newItem(values, item);
                                item.format = ['{code}']
                                item.data = { 'code': n.innerText || n.textContent };
                                newItem(values, item, 'CMSCode');
                                break;
                            }
                            break;
                        case 'b':
                        case 'span':
                        case 'font':
                        case 'a':
                        case 'code':
                        case 'strong':
                            if (n.childNodes.length == 1 && n.childNodes[0].nodeType == 3) {
                                var text = n.textContent;
                                if (Trim(text)) {
                                    var key = 'p' + item.format.length;
                                    item.format.push('{', key, '}');
                                    item.data[key] = text;
                                    var sl = getStyle(n);
                                    var href = n.href;
                                    if (href && href.indexOf('http') == 0) {
                                        if (!sl)
                                            sl = {};
                                        sl.click = {
                                            key: 'Url',
                                            send: href
                                        };
                                    }
                                    if (sl) {
                                        item.style[key] = sl;
                                    }
                                }
                            } else {
                                doNode(n.childNodes, values, item, src, ncls, isText);
                            }
                            break

                        default:
                            if (isText) {
                                var key = 'p' + item.format.length;
                                item.format.push('{', key, '}');
                                item.data[key] = n.textContent;
                            } else {
                                newItem(values, item);
                                item.style = getStyle(n) || {};
                                doNode(n.childNodes, values, item, src, ncls, isText);
                            }


                            break;
                    }
                    break;
            }
        }
    }
    window.parseCMS = function (ls) {
        var root = document.querySelector(ls.content);
        var str = ls.title ? (document.querySelector(ls.title) || {}).textContent : document.title;
        var texts = [];
        if (root) {
            var item = {};
            item.format = [];
            item.data = {};
            item.style = {};
            doNode(root.childNodes, texts, item, ls.src, ls.nslt);
            newItem(texts, item);
        }
        return JSON.stringify({
            content: texts,
            title: str
        });

    }


})();