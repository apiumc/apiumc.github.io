
(function () {
    function matches(e, selector) {
        var matchesSelector = e.webkitMatchesSelector || e.mozMatchesSelector ||
            e.oMatchesSelector || e.matchesSelector
        return matchesSelector ? matchesSelector.call(e, selector) : false;
    }
    function appendLine(value) {
        if (value.length > 0) {
            var v = value[value.length - 1];
            if (v.charAt(v.length - 1) != '\n') {
                value.push('\n')
            }
        }
    }
    function isLine(value) {
        if (value.length > 0) {
            var v = value[value.length - 1];
            if (v.charAt(v.length - 1) != '\n') {
                return false;
            }
        }
        return true;
    }
    function Trim(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    function markdown(nodes, values, src, ncls) {
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];

            switch (n.nodeType) {
                case 3:
                    var text = Trim(n.textContent);
                    text ? values.push(text) : 0;
                    break;
                case 1:
                    if ((getComputedStyle(n, false).display == 'none') || (ncls && matches(n, ncls))) {
                        continue;
                    }
                    switch (n.tagName.toLowerCase()) {
                        case 'img':
                            var imgSrc = src ? n.getAttribute(src) : n.src;
                            if (imgSrc) {
                                if (imgSrc.substr(0, 2) == '//') {
                                    imgSrc = 'https:' + imgSrc;
                                }
                                values.push('![', n.alt || '图片', '](', imgSrc, ')');
                            }
                            break;
                        case 'br':
                            values.push('\n');
                            break;
                        case 'div':
                        case 'li':
                        case 'p':
                            appendLine(values);
                            markdown(n.childNodes, values, src, ncls);
                            break;
                        case 'h1':
                            values.push('\n# ', n.textContent, '\n');
                            break;
                        case 'h2':
                            values.push('\n## ', n.textContent, '\n');
                            break;
                        case 'h3':
                            values.push('\n### ', n.textContent, '\n');
                            break;
                        case 'h4':
                            values.push('\n#### ', n.textContent, '\n');
                            break;
                        case 'h5':
                            values.push('\n##### ', n.textContent, '\n');
                            break;
                        case 'h6':
                            values.push('\n###### ', n.textContent, '\n');
                            break;
                        case 'table':
                            var rows = n.rows;
                            if (rows.length > 0) {

                                values.push('\n');
                                var cs = ['|'];
                                var cells = rows[0].cells;
                                for (var c = 0; c < cells.length; c++) {
                                    values.push(Trim(cells[c].textContent), '|');
                                    cs.push('--|');
                                }
                                values.push('\n', cs.join(''), '\n');

                                for (var i = 1; i < rows.length; i++) {
                                    values.push('\n|');
                                    var cells = rows[i].cells;
                                    for (var c = 0; c < cells.length; c++) {
                                        values.push(Trim(cells[c].textContent), '|');
                                    }
                                }
                                appendLine(values);
                            }
                            break;
                        case 'script':
                            break;
                        case 'blockquote':
                            appendLine(values);
                            values.push('>', Trim(n.textContent));

                            break;
                        case 'pre':
                            appendLine(values);
                            values.push('```\n', n.innerText);
                            appendLine(values);
                            values.push('```\n');
                            break;

                        case 'a':
                            values.push('[', Trim(n.textContent), '](', n.href, ')');
                            break;
                        case 'font':
                        case 'code':
                            values.push('`', Trim(n.textContent), '`');
                            break;
                        case 'b':
                            values.push('**', Trim(n.textContent), '**');
                            break;
                        case 'strong':
                            if (n.parentNode.childNodes == 1 && isLine(values)) {
                                values.push('\n#### ', Trim(n.textContent), '\n');

                            } else {
                                values.push('**', Trim(n.textContent), '**');
                            }
                            break;
                        default:
                            markdown(n.childNodes, values, src, ncls);

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
            markdown(root.childNodes, texts, ls.src, ls.nslt);
        }
        return JSON.stringify({
            markdown: texts.join(''),
            title: str
        });

    }


})();