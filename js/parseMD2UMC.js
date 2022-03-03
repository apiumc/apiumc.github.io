
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
    // String.prototype.trim
    function Trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    void Header(text,values,item)
    {
        var i = 0;
        while (i < text.length && text.charAt(i) == '#') {
            i++;
            if (i == 6) {
                break;
            }
        }
        var size = 26 - (i - 1) * 2;
        item.style['font-weight'] = 'bold';
        item.style['font-size'] = size;
        item.data['text'] = text.substring(i);
        item.data['Key'] = i;///text.substring(i);
        item.format.push("{text}");

        newItem(values, item);
    }


    function Check( text)
    {
        var index = 0;
        while (index < text.length) {
            if (index + 1 >= text.length) {
                Append();
                return;
            }
            switch (text.charAt(index)) {
                case '#':
                    {
                        var end = text.indexOf('\n', index);
                        if (end > index) {
                            Header(text.substring(index, end - index));

                            index = end + 1;
                        }
                        else {
                            Header(text.substring(index));
                            index = text.Length;
                        }
                        continue;
                    }
                case '`':
                    {
                        if (text.substring(index, 3) == "```") {

                            var end = text.indexOf("\n```", index + 1);
                            if (end > index) {
                                var content = text.substring(index, end - index);
                                var hindex = content.indexOf('\n');
                                var htype = content.substring(3, hindex - 3).Trim();
                                content = content.substring(hindex + 1);

                                var cell = UICell.Create("CMSCode", new WebMeta().Put("code", content).Put("type", htype));

                                cell.Format.Put("text", "{code}");


                                cells.Add(cell);
                                index = text.indexOf('\n', end + 1) + 1;

                                continue;
                            }
                        }
                    }
                    break;
                case '>':
                    {
                        if (cells.Count > 0) {
                            var cell = cells[cells.Count - 1];
                            if (cell.Type == "CMSRel") {
                                var d = cell.Data as WebMeta;

                                cells.RemoveAt(cells.Count - 1);
                                this.data = d;
                                this.dataText.Append("\r\n");
                                this.style = cell.Style;
                                this.data.Put("type", "CMSRel");
                                index = CheckRow(text, index + 1);
                                continue;

                            }
                        }
                        this.data.Put("type", "CMSRel");
                        index = CheckRow(text, index + 1);
                        continue;
                    }
                case '|':
                    {

                        var end = text.indexOf('\n', index);
                        if (end > index) {
                            var grids = [];
                            var conent = text.substring(index, end - index).trim().replace(/\s+/g, "");
                            if (conent[conent.Length - 1] == '|') {
                                var end2 = text.indexOf('\n', end + 1);//.Trim();
                                var conent2 = text.substring(end + 1, end2 - end - 1).Trim();
                                grids.append(conent);
                                conent2 = conent2.Replace(" ", "");
 
                                if (conent2.match( /^[\\|:-]+$/)) {
                                    grids.append(conent2);
                                    if (conent2.Split('|').length == conent.split('|').length) {
                                        var isGO = true;
                                        while (isGO) {
                                            isGO = false;
                                            var end3 = text.indexOf('\n', end2 + 1);//.Trim();

                                            var conent3 = end3 > 0 ? text.substring(end2 + 1, end3 - end2 - 1).Trim() : text.substring(end2 + 1).Trim();
                                            if (conent3.startsWith("|") && conent3.endsWith("|")) {
                                                isGO = true;
                                                grids.append(conent3);
                                                end2 = end3;
                                            }
                                        }
                                        this.Grid(grids);
                                        //Check(text, end2 + 1);
                                        index = end2 + 1;
                                        continue;

                                    }
                                }

                            }
                        }
                    }
                    break;
                case '[':
                    {
                        var end = text.indexOf("]", index + 1);
                        if (end > index && end + 1 < text.Length) {
                            if (text[end + 1] == ':') {
                                var content = text.substring(index, end - index).Trim('[', ']');
                                if (content.indexOf('\n') == -1) {
                                    var end2 = text.indexOf("\n", end + 1);
                                    if (end2 == -1) {
                                        var url = text.substring(end + 2).Trim().Trim(' ', '(', ')').Split(' ')[0];
                                        webRel.Put(content, url);
                                    }
                                    else {

                                        var url = text.substring(end + 2, end2 - end - 2).Trim().Trim(' ', '(', ')').Split(' ')[0];
                                        webRel.Put(content, url);
                                        //Check(text, end2 + 1);

                                        index = end2 + 1;
                                    }
                                    continue;

                                }


                            }
                        }
                    }
                    break;
                case ' ':
                    while (text.Length > index && text[index] == ' ') {
                        index++;
                    }
                    break;

            }

            index = this.CheckRow(text, index);
        }
        //return index;
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