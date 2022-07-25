(function ($) {
    function formatClick(x) {

        return x ? $.UI.Format(x, true) : '';

    }


    var emptyImg = 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    $.UI.Cells.Slider = (function () {

        var time = 0;
        var slider = function (data, fmt, style) {
            time++;
            var cn = 'slider' + time;
            var slids = data.data || [];
            var l = slids.length;
            if (l > 5) {
                l = 5;
            }
            if (l > 1) {
                requestAnimationFrame(function () {
                    $('#' + cn + '1').parent('#sliders').swipe().on('swipe', function (e, v) {
                        var next = -1;
                        var m = $(this).find('input').each(function (i, o, vs) {
                            if (this.checked) {
                                next = i;
                                next = i + (v == 'left' ? 1 : -1);
                                if (next == vs.length || next < 0) {
                                    next = i;
                                } else {

                                    this.checked = false;
                                }
                            }
                        }).eq(next)[0].checked = true;
                        return false;
                    });
                });
            }
            var htmls = ['<div  id="sliders">'];
            for (var i = 0; i < l; i++) {
                htmls.push('<input ', i == 0 ? 'checked ' : '', ' class="slider-', i + 1, '" type="radio" name="', cn, '" id="', cn, i + 1, '"/>');
            }
            htmls.push('<div class="sliders"><div id="overflow"><div class="inner">');

            for (var i = 0; i < l; i++) {
                htmls.push('<article>',
                    '<div style="background-image:url(', slids[i].src, ');background-size:cover;">',
                    '<a style="overflow:hidden;display:block;" ', formatClick(slids[i].click), '><img src="', emptyImg, '" ></a>',
                    '</div>',
                    '</article>');
            }
            htmls.push('</div></div></div>');
            for (var i = 0; i < l; i++)
                htmls.push('<label class="controls ctr', i + 1, '" for="', cn, i + 1, '"></label>');

            htmls.push('<div id="active" class="active">');
            if (l > 1) {
                for (var i = 0; i < l; i++)
                    htmls.push('<label for="', cn, i + 1, '"></label>')
            }
            htmls.push('</div>');
            htmls.push('</div>');
            return htmls.join('');
        }

        $.UI.Cells.SliderSquare = function (d, f, s, n) {
            var html = ['<div class="wdk-slider-square"  style="', padding(s.padding), '">',
                slider.call($.UI.Cells, d, f, s, n), '</div>'
            ];
            return html.join('');
        }
        return function (d, f, s, n) {

            var html = ['<div class="wdk-slider" style="', padding(s.padding), '">',
                slider.call($.UI.Cells, d, f, s, n), '</div>'
            ];
            return html.join('');
        };
    })();
    $.UI.Cells.NineImage = function (data, fmt, style) {
        var images = data.images || [];
        var l = images.length;
        var l2 = l;
        var cols = 3;
        var click = data.click;

        if (click) {
            if (l == 3) {
                cols = 2;
            }
            l2++;
        } else if (l == 4) {
            cols = 2;
        }
        var htmls = ['<div class="wdk-nine-image">'];
        for (var i = 0; i < cols; i++) {
            htmls.push('<div class="wdk-nine-row">')
            for (var c = 0; c < cols; c++) {

                var index = i * cols;
                if (index + c < l) {
                    var v = images[index + c];
                    htmls.push('<a style="background-image:url(', v.src, ')"', formatClick(v.click), '><img src="', emptyImg, '"/></a>')
                } else {
                    if (click) {
                        htmls.push('<a class="wdk-nine-click"', formatClick(click), '><img src="', emptyImg, '"/></a>')
                        click = false;
                    } else {
                        htmls.push('<a class="wdk-nine-empty"><img src="', emptyImg, '"/></a>')

                    }
                }
            }
            htmls.push('</div>')

            if ((i + 1) * cols >= l2) {
                break;
            }
        }
        htmls.push('</div>')



        return htmls.join('');
    }
    $.UI.Cells.TitleMore = function (data, fmt, style) {
        var padd = style.padding;
        delete style.padding;
        var htmls = ['<a  class="weui_cell wdk-title-more" ', formatClick(data.click), ' ><div style="', padding(padd), '"  class="weui_cell_bd weui_cell_primary"><p>',
            $.format(fmt.title || '{title}', data, style), '</p></div>'
        ]
        if (data.click)
            htmls.push('<div class="weui_cell_ft">',
                $.format(fmt.more || '{more}', data, style),
                '</div>')

        htmls.push('</a>')
        return htmls.join('');
    };
    $.UI.Cells.CMSImage = function (value, fmt, style) {

        var padd = style.padding;
        delete style.padding;
        var maxWidth = style["max-width"];

        return ['<a style="', padding(padd), '"', formatClick(value.click), '  class="wdk-cms-image"><img style="', maxWidth ? ('max-width:' + maxWidth + "px") : '', '" original-src="', value.original || value.src, '"  src="', value.src, '" alt=""/></a>'].join('');
    }
    $.UI.Cells.CMSText = function (value, fmt, style) {

        var htmls = ['<div ', value.Key ? ('data-key=' + value.Key) : '', ' class="wdk-cms-text '];
        htmls.push('" style="');
        var click = $.style(style || {}, htmls, true);
        htmls.push('"', formatClick(click), '>')
        var sk = {}
        for (var k in style) {
            var v = style[k];
            if (k != 'click' && (typeof v == 'object')) {
                sk[k] = v;
            }
        }
        if (value.tagName) {
            htmls.push('<', value.tagName, value.type ? (' data-type="' + value.type + '"') : '', '>');
        }
        htmls.push($.format(fmt.text || '{text}', value, sk))

        if (value.tagName) {
            htmls.push('</', value.tagName, '>');
        }
        htmls.push('</div>')
        return htmls.join('');

    }
    $.UI.Cells.CMSCode = function (value, fmt, style) {
        value.tagName = 'pre';
        return $.UI.Cells.CMSText(value, fmt, style);
    }
    $.UI.Cells.CMSRel = function (value, fmt, style) {
        value.tagName = 'blockquote';
        return $.UI.Cells.CMSText(value, fmt, style);
    }
    $.UI.Cells.CMSThree = function (value, fmt, style) {
        var htmls = ['<a ', $.UI.On("CMS.Link", value) || formatClick(value.click), ' class="wdk-cms-three"><div class="wdk-cms-three-title"> '];

        htmls.push(
            $.format(fmt.title || '{title}', value, style), '</div>',
            '<div class="wdk-cms-three-image">');
        for (var i = 0; i < 3; i++) {
            htmls.push('<div><img src="', emptyImg, '"/><em style="background-image:url(', value.images[i], ')"></em></div>');
        }
        htmls.push('</div>', '<div class="wdk-cms-three-bottom"><div class="wdk-cms-three-left">'

            , $.format(fmt.left || '{left}', value, style), '</div>', '<div class="wdk-cms-three-right">', $.format(fmt.right || '{right}', value, style), '</div>', '</div>', '</a>');
        return htmls.join('');
    }
    $.UI.Cells.CMSOne = function (value, fmt, style) {
        var htmls = ['<a class="wdk-cms-one" ', $.UI.On("CMS.Link", value) || formatClick(value.click), '>']
        htmls.push('<div class="wdk-cms-one-image"><img src="', emptyImg, '"/><em style="background-image:url(', value.src, ')"></em></div>', ' <div class="wdk-cms-one-area"> ',
            ' <div class="wdk-cms-one-title">',
            $.format(fmt.title || '{title}', value, style), '</div>', ' <div class="wdk-cms-one-desc"> ',
            $.format(fmt.desc || '{desc}', value, style), '</div>',
            '<div class="wdk-cms-one-bottom"><div class="wdk-cms-one-left">', $.format(fmt.left || '{left}', value, style), '</div>', '<div class="wdk-cms-one-right">', $.format(fmt.right || '{right}', value, style), '</div>', '</div>', '</div>', '</a>');
        return htmls.join('');
    };
    (function () {
        function image(src, htmls) {

            htmls.push(
                '<div class="wdk-cms-max-image">', '<img src=" ', emptyImg, '"/>'

                , '<em style="background-image:url(', src, ');"></em>', '</div>');
        }

        function title(value, fmt, style, htmls) {
            htmls.push(
                '<div class="wdk-itdb-title">', $.format(fmt.title || '{title}', value, style), '</div>')

        }

        function desc(value, fmt, style, htmls) {
            htmls.push(
                '<div class="wdk-itdb-desc">', $.format(fmt.desc || '{desc}', value, style), '</div>'
            )
        }

        function bottom(value, fmt, style, htmls) {
            htmls.push(
                '<div class="wdk-itdb-bottom"><div class="wdk-cms-max-left">'

                , $.format(fmt.left || '{left}', value, style), '</div>'


                , '<div class="wdk-cms-max-right">', $.format(fmt.right || '{right}', value, style), '</div>', '</div>'
            )
        }
        $.UI.Cells.ItemsTitleDesc = function (value, fmt, style) {

            var padd = style.padding;
            delete style.padding;
            var total = parseInt(value.total || '1');
            var show = parseInt(value.show || '0');
            var htmls = ['<div', ' style="', padding(padd), '"'

                , ' class="wdk-itdb-items" max="', total >= 3 ? '3' : '2', '">'
            ];
            var items = value.items || [];
            for (var i = 0; i < items.length; i++) {
                var val = items[i];
                var v = val.value;
                var f = val.format;
                var s = val.style;
                htmls.push('<div class="wdk-itdb-item" ', formatClick(v.click), '>')
                image(v.src, htmls);
                (show & 1) ? 0 : title(v, f, s, htmls);
                (show & 2) ? 0 : desc(v, f, s, htmls);
                (show & 12) ? 0 : bottom(v, f, s, htmls);
                htmls.push('</div>');

            }
            htmls.push('</div>');

            return htmls.join('');
        }
        $.UI.Cells.ImageTitleDescBottom = function (value, fmt, style) {
            var padd = style.padding;
            delete style.padding;
            var show = parseInt(value.show || '0');
            var htmls = ['<div ', formatClick(value.click), ' class="wdk-cms-max wdk-itdb" style="', padding(padd), '"> '];
            image(value.src, htmls);
            padd == '0 0 0 0' ? htmls.push('<div ', ' style="', padding('0 5'), '"> ') : 0;
            (show & 1) ? 0 : title(value, fmt, style, htmls);
            (show & 2) ? 0 : desc(value, fmt, style, htmls);
            (show & 12) ? 0 : bottom(value, fmt, style, htmls);
            padd == '0 0 0 0' ? htmls.push('</div>') : 0;



            htmls.push('</div>');
            return htmls.join('');
        }

    })();
    $.UI.Cells.CMSMax = function (value, fmt, style) {
        var htmls = ['<a ', $.UI.On("CMS.Link", value) || formatClick(value.click), ' class="wdk-cms-max"><div class="wdk-cms-max-title"> '];

        htmls.push(
            $.format(fmt.title || '{title}', value, style), '</div>');
        if (value.src)
            htmls.push('<div class="wdk-cms-max-image">', '<img src=" ', emptyImg, '"/>', '<em style="background-image:url(', value.src, ')"></em>', '</div>');
        htmls.push(
            ' <div class="wdk-cms-max-desc">',
            $.format(fmt.desc || '{desc}', value, style), '</div>',
            '<div class="wdk-cms-max-bottom"><div class="wdk-cms-max-left">'

            , $.format(fmt.left || '{left}', value, style), '</div>'


            , '<div class="wdk-cms-max-right">', $.format(fmt.right || '{right}', value, style), '</div>', '</div>')
            if (value.tag) {
                htmls.push('<div class="wdk-cell-tag" style="background-color:', value.color, '">', $.format(fmt.tag || '{tag}', value, style), '</div>');
            }
            htmls.push('</a>');
        return htmls.join('');
    }
    $.UI.Cells.CMSLook = function (value, fmt, style) {
        var htmls = ['<div class="wdk-cms-look weui_media_box weui_media_appmsg">',
            '<div class="weui_media_hd">',
            '<img class="weui_media_appmsg_thumb" src="', value[fmt.src || 'src'] || emptyImg, '" alt="">',
            '</div>',
            '<div class="weui_media_bd">',
            '<h4 class="weui_media_title">',
            $.format(fmt.title || '{title}', value, style), '</h4>',
            '<p class="weui_media_desc">',
            $.format(fmt.desc || '{desc}', value, style), '</p>',

            '</div><div class="wdk-cms-look-button">',
            '<a ', formatClick(value.click), ' class="weui_btn weui_btn_mini weui_btn_warn">', value.button || '去看看', '</a>',

            '</div></div>'
        ];

        return htmls.join('');
    }

    $.UI.Cells.IconNameDesc = function (value, fmt, style) {
        var htmls = ['<div class="wdk-cms-attention weui_media_box weui_media_appmsg" >'];
        var items = value.items || [value];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            htmls.push('<div style="flex: 1;display: flex;"', formatClick(item['click']), '>',
                '<div class="weui_media_hd" style="color:', item.color || '', '" data-icon="', item.icon || '', '">',
                '<img class="weui_media_appmsg_thumb" src="', item[fmt.src || 'src'] || emptyImg, '">',
                '</div>',
                '<div class="weui_media_bd">',
                '<h4 class="weui_media_title">',
                $.format(fmt.name || '{name}', item, style), '</h4>',
                '<p class="weui_media_desc">',
                $.format(fmt.desc || '{desc}', item, style), '</p>',
                '</div></div>');

        }
        if (value.button || fmt.button)
            htmls.push(
                '<div class="wdk-cms-look-button">',
                '<a ', formatClick(value['button-click']), ' class="weui_btn weui_btn_mini weui_btn_warn" style="background:', value['button-color'] || '#e67979', '">', $.format(fmt.button || '{button}', value, style), '</a>',

                '</div>');
        htmls.push('</div>');
        return htmls.join('');
    }

    $.UI.Cells.CMSGrid = function (value, fmt, style) {
        var htmls = ['<div class="wdk-cms-grid"><table>'];

        var grid = value.grid;
        for (var i = 0; i < grid.length; i++) {
            htmls.push('<tr>');
            var cells = grid[i];
            for (var r = 0; r < cells.length; r++) {
                var cell = cells[r];
                var sty = cell.style;
                var align = sty['text-align'];
                align = align ? ['text-align:', align].join('') : '';
                htmls.push('<td', ' style="', align, ';flex:', sty.flex, '">',
                    $.format(cell.format || '{desc}', cell.data, sty), '</td>');

            }
            htmls.push('</tr>')
        }
        htmls.push('</table></div>')
        return htmls.join('');
    }
    $.UI.Cells.Comment = function (data, fmt, style) {
        var htmls = ['<div class="wdk-cms-comment">',
            '<div class="wdk-cms-comment-icon">',
            '<a ', formatClick(data['image-click']), ' style="background-image: url(', data.src, ')"></a>&nbsp;</div>',
            '<div class="wdk-cms-comment-info"><ul>',
            '<li class="wdk-cms-comment-header"><div class="wdk-cms-comment-name">', $.format(fmt.name || '{name}', data, style), '</div><div class="wdk-cms-comment-desc">', $.format(fmt.desc || '{desc}', data, style), '</div></li>',
            // '<li class="wdk-cms-comment-time">',
            // $.format(fmt.time || '{time}', data, style),
            '<li>',
            '<div class="wdk-cms-comment-content">', $.format(fmt.content || '{content}', data, style),
            '</div>'
        ];
        var images = data.image || [];

        if (images.length > 0) {
            htmls.push('<dl class="wdk-cms-comment-images">');
            htmls.push($.format('<dt><img original-src="{max}" src="{src}"></dt>', images));
            htmls.push('</dl>');
        }
        htmls.push('</li>');
        if (data.buttons) {
            htmls.push('<li class="wdk-cms-comment-bottom"><div class="wdk-cms-comment-time">', $.format(fmt.time || '{time}', data, style), '</div><div class="wdk-cms-comment-button">',
                $.format('{H}', data.buttons || [], {
                    H: function (x) {
                        var c = x.color;
                        var sty = $.extend({ color: c }, x.style);
                        var hs = ['<a ', formatClick(x.click), 'style="'];

                        $.style(sty || {}, hs);
                        hs.push('">', $.format(x.format || '{text}', x, sty), '</a> ')
                        return hs.join('');
                    }
                }), '</div></li>');
        }
        if (data.Icons) {
            htmls.push('<li class="wdk-cms-comment-icons"><dl>');
            var more = data.Icons.more;//.icons
            var style = data.Icons.style;
            var icons = data.Icons.icons;
            for (var i = 0; i < icons.length; i++) {
                var ic = icons[i];

                var sle = (ic.style || style).icon || {};
                htmls.push('<dt ', ic.badge ? ('data-badge="' + ic.badge + '"') : '', '><a style="display: block; color: ', sle.color || '#fd9d21', ';" ', formatClick(ic.click), '>');
                if (ic.icon) {
                    htmls.push('<span data-icon="', ic.icon, '" ></span>');
                } else {
                    htmls.push('<img src="', ic.src, '"/>');

                }
                htmls.push('</a> </dt>');
            }
            htmls.push('</dt><a ', formatClick(more.click), ' class="wdk-cms-comment-icon-more">', $.format(more.format || '{text}', more, more.style || style), '</a>')
            htmls.push('</li>')

            htmls.push('<div class="wdk-cms-comment-button">',
                $.format('{H}', data.Icons.buttons || [], {
                    H: function (x) {
                        var c = x.color;
                        var sty = $.extend({ color: c }, x.style);
                        var hs = ['<a ', formatClick(x.click), 'style="'];

                        $.style(sty || {}, hs);
                        hs.push('">', $.format(x.format || '{text}', x, sty), '</a> ')
                        return hs.join('');
                    }
                }), '</div></li>');
        }
        if (data.replys && data.replys.length > 0) {
            var rep = data.replys;
            htmls.push('<li class="wdk-cms-comment-reply">');
            for (var index = 0; index < rep.length; index++) {
                var el = rep[index];
                var value = el.value || el;
                var fmt2 = el.format || fmt;
                var style2 = el.style || style

                htmls.push('<div class="wdk-cms-comment-name">', $.format(fmt2.title || '{nick} 在 {time} 回复说:', value, style2), '</div>',
                    '<div class="wdk-cms-comment-desc">', $.format(fmt2.content || '{content}', value, style2),
                    '</div>')
            }

            if (data.replyClick) {
                htmls.push('<a ', formatClick(data.replyClick), ' class="wdk-cms-comment-reply-more">', data.replyClick.text, '</a>');
            }
            htmls.push('</li>')
        }
        htmls.push('</ul>',
            '</div></div>');
        return htmls.join('')
    }

    function padding(str) {
        if (str) {

            return 'padding:' + str.split(' ').join('px ') + 'px';
        }

        return ''
    }
    $.UI.Cells.ImageTitleBottom = function (value, fmt, style) {
        var padd = style.padding;
        delete style.padding;

        var rad = style["image-radius"];
        if (rad) {
            rad = 'style="border-radius:' + rad + 'px"'
        }

        return ['<div style="', padding(padd), '" class="wdk-image-pro" ', formatClick(value.click), '>',
            '<div  class="wdk-image-pro-image">',
            '<img src="', value[fmt.src || 'src'], '" ', rad, 'alt="">',
            '</div>',
            '<div class="wdk-image-pro-area">',
            '<div class="wdk-image-pro-title">',
            $.format(fmt.title || '{title}', value, style), ' </div>',
            '<div class="wdk-image-pro-bottom">',
            '<div class="wdk-image-pro-desc">',
            $.format(fmt.left || '{left}', value, style),
            '</div>',
            '<div class="wdk-image-pro-price">',

            $.format(fmt.right || '{right}', value, style),
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');

    }
    $.UI.Cells.UIRefreshing = function (v, f, s, u) {
        setTimeout(function () {
            u.r.on('refresh');
        }, 8000);

        return '<div class="wdk-refreshing"><div class="refreshing"></div></div>';
    }
    $.UI.Cells.UIImages = function (value, fmt, style) {
        return ['<div class="weui_cell wdk-images">',
            '<div class="weui_cell_bd">',
            $.format('<a {Click} ><img src="{src}" onerror="this.src=\'' + emptyImg + '\'" alt="" /></a>', value.data || [], {
                Click: function (x) {
                    return formatClick(x.click);
                }
            }),
            '</div>',
            '</div>'
        ].join('');
    }
    $.UI.Cells.UIButton = $.UI.Cells.UIFooterButton = function (value, fmt, style) {

        var padd = style.padding || '7';
        delete style.padding;
        var align = style['text-align'] || 'right';
        var radius = style['border-radius'] || '2';
        var min = style['min-width'] || '60';
        var htmls = ['<div style="', padding(padd), '" class="weui_cell  no_access">']
        if (align == 'right') {
            htmls.push(
                '<div class="weui_cell_bd weui_cell_primary">',
                '<p>',
                $.format(fmt.title || '{title}', value, style),
                '</p>',
                '</div>',
                '<div class="weui_cell_ft wdk-button">');
        } else {
            htmls.push('<div class="weui_cell_bd weui_cell_primary wdk-button" style="text-align:', align, '">')
        }
        htmls.push(
            $.format('{H}', value.buttons || [], {
                H: function (x) {
                    var c = x.color;
                    var sty = $.extend({ color: c, 'border-radius': radius, 'border-color': c }, x.style);
                    var hs = ['<a ', formatClick(x.click), 'style="min-width:', min, 'px;'];

                    $.style(sty || {}, hs);
                    hs.push('">', $.format(x.format || '{text}', x, sty), '</a> ')
                    return hs.join('');
                }
            }), '</div>', '</div>');

        return htmls.join('');

    }

    $.UI.Cells.Desc = $.UI.Headers.Desc;
    $.UI.Cells.ProBuy = function (value, fmt, style) {


        var sk = $.extend({}, style);

        return [
            '<div class="weui_cell wdk-buy" ', value.tag ? ('data-tag="' + value.tag + '"') : '', '>',
            '<div class="wdk-buy-comment">',
            '<a ', formatClick(value.click), '>', $.format(fmt.value || '{value}', value, sk) || '0',
            '<div>', $.format(fmt.caption || '{caption}', value, sk), '</div> ',
            '</a>',
            '</div>',
            '<div style="padding: 1em">',
            '<p style="font-size: 12px; color: #999;">',
            $.format(fmt.title || '{title}', value, sk),
            '</p>',
            '<p class="wdk-buy-price">',
            $.format(fmt.price || '{price}', value, sk),
            '</p>',
            '</div>',
            '</div>'
        ].join('')
    }
    $.UI.Cells.Products = function (value, fmt, style) {

        var proHTML = ['<div>'

            , '<div class="wdk-product-img">', '<img style="width:100%" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/>', '<a  {format} {datasrc}></a>', '</div>', ' <div class="wdk-product-name">{name}</div>', '<div class="wdk-product-price">', '¥<strong>{price}</strong>', '</div></div>'
        ].join('');
        var htmls = ['<div class="wdk-product">'];
        var data = value.data || [];

        htmls.push('<ul>');
        for (var i = 0; i < data.length; i++) {
            var cv = data[i] || {}
            if (cv.id) {
                htmls.push('<li>');
            } else {
                htmls.push('<li class="empty">');
            }
            htmls.push($.format(proHTML, cv, {
                format: function (v) {
                    return formatClick(v.click) || formatClick({ key: 'Product', send: v.id });
                },
                datasrc: function (v) {
                    return v.id ? ('style="background-image:url(' + v.src + ')"') : '';
                }
            }));
            htmls.push('</li>');
        }

        htmls.push('</ul></div>');
        return htmls.join('');
    }
    $.UI.Cells.Icons = function (value, fmt, style) {
        var icons = value.icons || [];
        var htmls = ['<div class="wdk-icon">']
        for (var i = 0; i < icons.length; i++) {
            var ic = icons[i];
            if (i % 4 == 0) {
                if (i > 0) {
                    htmls.push('</ul>');
                }
                htmls.push('<ul>');
            }
            var sle = (ic.style || style).icon || {};
            htmls.push('<li ', ic.badge ? ('data-badge="' + ic.badge + '"') : '', '><a style="display: block; color: ', sle.color || '#fd9d21', ';" ', formatClick(ic.click), '>');
            if (ic.icon) {
                htmls.push('<span data-icon="', ic.icon, '" ></span>');
            } else {
                htmls.push('<img src="', ic.src, '"/>');

            }
            htmls.push(' <span class="wdk-icon-desc">', $.format(fmt.text || '{text}', ic, style), '</span></a> </li>');
        }
        var ic = (icons.length % 4);
        if (icons.length > 4 && ic > 0) {
            ic = 4 - ic;
            for (var i = 0; i < ic; i++) {
                htmls.push('<li></li>')
            }
        }
        if (icons.length > 0)
            htmls.push('</ul>');

        htmls.push('<div>');
        return htmls.join('');
    }

    $.UI.Cells.UIItems = function (value, fmt, style) {
        var items = value.items || [];
        var htmls = [];
        htmls.push('<div class="wdk-items"><ul  style="display:flex;" >');
        var width = "25%";
        switch (items.length) {
            case 1:
                width = "25%";
                break;
            case 2:
                width = "50%";
                break
            default:
                if (items.length == 3 && i == 0) {
                    width = "50%";
                } else {
                    width = "100%";
                }
                break
        }
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            htmls.push('<li style="flex: ', (items.length == 3 && i == 0) ? "2" : "1", '">');


            var sye = item.style || style;
            if (items.length > 1)
                htmls.push('<div class="wdk-items-title" style=" background-image: -webkit-linear-gradient(left, ', sye.startColor || '#ff7012', ',', sye.endColor || '#ff7012', ');">'
                    , $.format(fmt.title || '{title}', it, sye), '</div>'
                    , '<div class="wdk-items-desc">', $.format(fmt.desc || '{desc}', it, sye), '</div>');

            htmls.push('<div class="wdk-items-image">', '<a ', formatClick(it.click), ' original-src="', it.src, '"></a>', '<img style="width:', width, '" src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="/>', '</div></li>');
        }
        htmls.push('</ul></div>');
        return htmls.join('');
    }
    $.UI.Cells.UISheet = function (value, fmt, style) {
        var htmls = ['<div class="wdk-uisheet">'];

        var items = value.items || [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            htmls.push('<div class="wdk-uisheet-item">', $.format(fmt.text || '{info}{icon} {text}', item, style), '</div>')
        }
        htmls.push('</div>')
        return htmls.join('');
    }

    $.UI.Cells.UISKU = function (data, fmt, style, me, dom) {


        var htmls = ['<a  class="weui_cell wdk-uisku" ui-event="SKUShow" ><div class="weui_cell_bd weui_cell_primary"><p>',
            data.title || '请选择规格', '</p></div>'
        ]


        htmls.push('</a>');

        return htmls.join('');
    };
    $.UI.Cells.ImageTextDescQuantity = function (value, fmt, style) {

        return ['<div class="weui_media_box weui_media_appmsg">',
            '<a class="weui_media_hd"  ', formatClick(value['image-click']), ' >',
            '<img class="weui_media_appmsg_thumb" src="', value.src, '" />',

            '</a>',
            '<div class="weui_media_bd">',
            '<p class="weui_media_desc">',
            $.format(fmt.title || '{title}', value, style),
            '</p>',
            '<div style="float:right">',
            '<a class="wdk-pro-reduce" ', formatClick(value['decrease-click']), '></a>',
            '<i class="wdk-pro-quantity">', value.Quantity, '</i>',
            '<a class="wdk-pro-add"  ', formatClick(value['increase-click']), '></a>',
            '</div>',
            '<div class="price">', $.format(fmt.desc || '{desc}', value, style), '</div>',
            '</div>',
            '</div>'].join('')
    }
    $.UI.Cells.TabFixed = function (value, fmt, style, p, section) {


        if (!p.TabFixed) {
            var htmls = ['<div class="weui_navbar">',
                $.format('<div class="weui_navbar_item">{text}</div>', value.items), ' </div>'
            ]
            var td = document.createElement('div');
            td.className = 'wdk-tabs-fixed';
            td.innerHTML = htmls.join('');
            p.TabFixed = td;
            p.TabFixed.Items = value.items;
            $(td).click('.weui_navbar_item', function () {
                var m = $(this);
                if (m.is('.weui_bar_item_on') == false) {

                    m.addClass('weui_bar_item_on').siblings().removeClass('weui_bar_item_on');
                    var item = p.TabFixed.Items[parseInt(m.attr('data-index')) || 0];
                    if (item.search)
                        p.query(item.search, item.Key);
                }
            }).find('.weui_navbar_item').each(function (i) {
                $(this).attr('data-index', i + '');
            }).eq(parseInt(value.selectIndex) || 0).addClass('weui_bar_item_on');

        } else if (JSON.stringify(p.TabFixed.Items) != JSON.stringify(value.items)) {

            p.TabFixed.Items = value.items;
            var mh = $(td);
            var index = parseInt(mh.find('.weui_bar_item_on').attr('data-index')) || 0;
            mh.html(h).find('.weui_navbar_item').each(function (i) {
                $(this).attr('data-index', i + '');
            }).eq(index).addClass('weui_bar_item_on')



        }
        section.append(p.TabFixed);
    };


    var searchCount = 0;
    $.UI.Cells.Search = function (data, fmt, style) {
        searchCount++;

        return ['<div class="weui_search_bar">',
            '<form class="weui_search_outer">',
            '<div class="weui_search_inner">',
            '<i class="weui_icon_search"></i>',
            '<input type="search" class="weui_search_input" id="gridSearchHeader', searchCount, '" placeholder="', (data.placeholder || '搜索'), '">',
            '<a class="weui_icon_clear"></a>',
            '</div>',
            '<label for="gridSearchHeader', searchCount, '" class="weui_search_text">',
            '<i class="weui_icon_search"></i>',
            '<span>', (data.placeholder || '搜索'), '</span>',
            '</label>',
            '</form>',
            '<a class="weui_search_cancel">取消</a>',
            '</div>'
        ].join('');
    };

    $.UI.Cells.TextItems = function (value, fmt, style, p, section) {
        var items = value.data;
        var htmls = ['<div class="umc-textitems" '];
        if (items.length == 0) {
            searchCount++;
            var key = 'textitems' + searchCount;
            htmls.push(' id="', key, '">');
            if (value.msg) {
                htmls.push('<span>', value.msg, '</span>')
            }
            if (value.model && value.cmd) {


                requestAnimationFrame(function () {
                    var m = section.find('#' + key);
                    if (value.event) {
                        m.parent('div[ui]').ui(value.event, m)
                    }
                    $.UI.Command(value.model, value.cmd, value.search || {}, function (xhr) {
                        var items = xhr.data;
                        var htmls = [];
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            htmls.push('<a ', formatClick(item['click']), '>', $.format(item.format || '{text}', item, style), '</a>')
                        }
                        if (xhr.msg) {

                            htmls.push('<span>', xhr.msg, '</span>')
                        }
                        m.html(htmls.join(''));
                    })

                })
            }
        } else {
            htmls.push('>');
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                htmls.push('<a ', formatClick(item['click']), '>', $.format(item.format || '{text}', item, style), '</a>')
            }
        }
        htmls.push('</div>');
        return htmls.join('');
    }


    $.UI.Event = function () {
        arguments[0] = 'Event.' + arguments[0].split(',').join(',Event.');
        return $.UI.On.apply($.POS, arguments);
    };
    var CartEvent = false;
    WDK.UI.On('SKU.Init', function (e, dom) {

        var selectItem;

        var _sku = JSON.parse(dom.attr('wdk-sku')) || { data: [], sku: [] };
        dom.siblings('.wdk-sku-mask').click(function () { dom.removeClass('show') });


        dom.find('.wdk-sku-qty').on('click', 'a', function () {
            var m = $(this);

            var val = m.parent().find('input');
            var v = parseInt(val.val()) || 0;
            if (m.is('.wdk-sku-add')) {
                v++;
            } else if (v > 1) {
                v--;
            }
            val.val(v + '')

            dom.on('sku');
        });
        dom.find('.wdk-sku-items').on('tap', 'a', function () {
            var m = $(this);
            if (!m.is('.selected')) {
                if (m.is('.disable') == false) {
                    var skus = _sku.sku || [];
                    m.addClass('selected').siblings('a').removeClass('selected');
                    dom.on('sku', m);
                    var ids = m.attr('sku-index').split(',');
                    dom.on('changeitem', skus[parseInt(ids[0])].data[parseInt(ids[1])]);
                }
            } else {
                m.removeClass('selected');
                selectItem = false;
            }
        });
        dom.find('.wdk-sku-footer').on('click', 'a', function () {
            if (!selectItem) {
                return false;
            }
        });
        dom.on('sku', function () {
            var size = [];
            var text = [];
            var seles = dom.find('.wdk-sku-items a.selected').each(function (i) {
                var m = $(this);
                size.push(m.attr('sku-id'));
                text.push(m.text());

            });
            var data = _sku.data || [];
            if (size.length == _sku.sku.length) {
                var sizeStr = size.sort().join();
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var sk = item.skus.sort();
                    if (sk.join() == sizeStr) {
                        if (item.off) {
                            seles.eq(seles.length - 1).removeClass('selected')
                                .addClass('disable');
                            return;

                        }
                        selectItem = item;
                        break;
                    }
                }
                if (_sku.sku.length == 0) {
                    selectItem = { id: _sku.defaultValue, price: _sku.price };
                }
                if (selectItem) {
                    dom.find('.wdk-sku-price').text('¥' + selectItem.price);

                    $('div[ui].ui').ui("SKUItemChange", selectItem, dom.find('.wdk-sku-text').text());
                }
            } else if (size.length + 1 == _sku.sku.length) {
                var l = dom.find('.wdk-sku-group').each(function (i, s, es) {
                    if (i == es.length - 1) {
                        var t = $(this);
                        if (t.find('a.selected').length == 0) {
                            t.find('a').removeClass('disable').each(function () {
                                var slts = size.slice(0);
                                var m = $(this);
                                slts.push(m.attr('sku-id'));
                                var sizeStr = slts.sort().join();
                                for (var i = 0; i < data.length; i++) {
                                    var item = data[i];
                                    var sk = item.skus.sort();
                                    if (sk.join() == sizeStr) {
                                        if (item.off) {
                                            m.addClass('disable');

                                        }
                                        break;
                                    }
                                }
                            });
                        }

                    }
                });

            } else {
                dom.find('.wdk-sku-items a').removeClass('disable');
            }
            if (text.length > 0 || _sku.sku.length == 0) {
                dom.find('.wdk-sku-text').text('已选 ' + text.join(', ') + ' ' + dom.find('input').val() + '件');
            } else {

                dom.find('.wdk-sku-text').text((data.length == 0 && _sku.sku.length > 0) ? "SKU未配置,请联系运维人员" : '请选择规格');
            }
        });

        dom.on('sku');
        $.UI.On('SKUSheet', function (e, data) {
            selectItem = false;
            _sku = data.sku;
            dom.attr('wdk-sku', JSON.stringify(_sku));
            dom.find('.wdk-sku-image').css('background-image', 'url(' + data.src + ')');
            dom.find('.wdk-sku-price').html($.format('¥{price}', _sku, {}));
            dom.find('.wdk-sku-qty input').val('1');
            var values = _sku.data || [];
            for (var i = 0; i < values.length; i++) {
                var it = values[i];
                if (!it.off) {
                    selectItem = it;
                    break;
                }
            }
            var skus = _sku.sku || [];
            var size = '';
            if (selectItem) {

                size = (selectItem.skus || ['']).join(',');
            }
            var htmls = [];
            for (var i = 0; i < skus.length; i++) {

                var sku = skus[i];
                htmls.push('<div class="wdk-sku-item"><span>', sku.text, '</span>');
                htmls.push('<div class="wdk-sku-group">');
                var sdata = sku.data || [];
                for (var s = 0; s < sdata.length; s++) {
                    var sd = sdata[s];
                    htmls.push('<a sku-id="', sd.id, '" ', size.indexOf(sd.id) > -1 ? ('class="selected"') : '', ' sku-index="', i, ',', s, '">');
                    htmls.push(sd.text);
                    htmls.push('</a>');
                }
                htmls.push('</div></div>')
            }
            dom.find('.wdk-sku-items').html(htmls.join(''));
            dom.on('sku');
            $.UI.Start();

        }).Event('SKUShow', function () {
            CartEvent = false;
            dom.addClass('show');
        }).Event('SKUBuy', function () {
            dom.on('SKUBuy');

        }).Event('SKUOrder', function () {
            dom.on('SKUBuy', true);
        });
        dom.on('SKUBuy', function (e, v) {
            CartEvent = v;
            if (!selectItem) {
                dom.addClass('show');
            } else {
                var num = dom.find('.wdk-sku-qty input').val();
                dom.on('buy', selectItem, num);
                $.UI.Command("Product", "Quantity", { "Quantity": "+" + num, "product_id": selectItem.id });

                dom.removeClass('show');
            }


        });
    });
    $(function () { $.UI.On('SKU.Init', $('.wdk-sku')) });
    var _tt = false;
    $.UI.Start = function () {
        _tt ? $('div[ui].ui').ui('Change', _tt) : $.UI.Command({ _start: true });
    };

    $.UI.On('Change', function (e, t) {
        _tt = t;
        if (CartEvent) {
            WDK.UI.Command('Schedule', 'Order');
        }
    });

    var footerKey = 0;
    var FFFN = {
        cart: function () {
            return '<a ui-event="Cart" class="wdk-cart"><i class="icon-cart"></i><span class="wdk-cart-quantity"></span></a>';
        },
        icon: function (icon, dom) {
            var html = ['<a '];
            if (icon.key) {
                var k = 'ficon' + (footerKey++);
                dom.ui(icon.key, function (e, va) {
                    var v = va.value || va;
                    var m = WDK('#' + k);
                    m.find('i').html($.format('{icon}', v, va.style || {}));
                    m.find('em').html($.format('{text}', v, va.style || {}));
                });
                html.push(' id="', k, '"');
            }
            html.push(' class="wdk-footer-icon" ', formatClick(icon.click));

            html.push('><i>', icon.icon, '</i>', '<em>', icon.text, '</em></a>');
            return html.join('');
        },
        text: function (value, dom) {
            var fhtml = [];
            fhtml.push('<div  class="wdk-footer-text" style="flex:', value.flex || 1, ';')
            $.style(value.style || {}, fhtml, true);
            fhtml.push('"');
            if (value.key) {
                var k = 'ftxt' + (footerKey++)
                dom.ui(value.key, function (e, va) {
                    var v = va.value || va;
                    var m = WDK('#' + k);
                    m.html($.format(va.foramt || value.format || '{text}', v, va.format || value.style || {}));
                });
                fhtml.push(' id="', k, '"');
            }
            fhtml.push('>', $.format(value.format || '{text}', value, value.style || {}), '</div>');
            return fhtml.join('');
        },
        button: function (icon, dom) {
            var style = icon.style || {};
            var fhtml = [];
            fhtml.push('<a  class="wdk-footer-button', (style['background-color']) ? ' bgcolor' : '', '" ', formatClick(icon.click), ' style="flex:', icon.flex || 1, ';');
            $.style(icon.style || {}, fhtml, true)
            fhtml.push('"');
            if (icon.key) {
                var k = 'fbtn' + (footerKey++);
                dom.ui(icon.key, function (k, v) {
                    var m = WDK('#' + k);
                    m.html($.format(v.format || icon.format || '{text}', v, v.style || {}));
                });
                fhtml.push(' id="', k, '"');
            }
            fhtml.push('>', $.format(icon.format || '{text}', icon, icon.style || {}), '</a>');
            return fhtml.join('');
        }
    }

    var cells = $.UI.Cells;
    var empty = cells.Cell;

    function headerTitle(title, hem) {
        var htmls = ['<a class="back"></a>'];
        var menu = 0;
        if (title.left) {
            menu = 1;
            htmls = ['<a class="left" ', formatClick(title.left.click), '>', $.format('{icon}{text}', title.left, { "icon": { "font-family": "wdk", "font-size": "20" } }), '</a>'];

        }
        if (title.right) {
            menu |= 2;
        }
        var data = title.value || { text: title.text || hem.find('h1').text() };


        switch (title.type) {
            case 'Tab':
                htmls.push('<div class="wdk-tab-bar"></div>')
                break;
            case 'Banner':
                htmls.push('<div class="wdk-title-banner', menu ? (' menu' + menu) : '', '" data-icon="', title.icon, '"><div>')
                for (var i = 0; i < title.items.length; i++) {
                    var it = title.items[i];
                    htmls.push($.format(it.text || '{text}', it, it.style))
                }

                htmls.push('</div></div>')
                break;
            default:
                htmls.push("<h1>")
                if (title.src) {
                    htmls.push('<img src="', title.src, '"/>');
                }
                htmls.push($.format(title.format || '{text}', data, title.style || {}), '</h1>');

                break;
        }
        if (title.right) {
            htmls.push('<a class="right" ', formatClick(title.right.click), '>', $.format('{icon}{text}', title.right, { "icon": { "font-family": "wdk", "font-size": "20" } }), '</a>');
        }
        hem.html(htmls.join(''));
        var style = title.style || {};
        var bgcolor = style['background-color'];
        if (style.color) {
            hem.children().css('color', style.color);
        }
        if (bgcolor) {

            hem.css('background-color', bgcolor);
        }
        if (title.float == true) {
            hem.addClass('umc-float');
            hem.attr('background-color', bgcolor || '#fff');

            hem.css('background-color', '#ffffff00');
        }

    }
    var PagerIndex = 0;

    function Pager(v, dom) {
        if (dom) {
            dom.html('<header class="wdk-header header"></header><section></section><nav class="wdk-top-icon"></nav><footer class="wdk-footer"></footer><div></div>')

            this.init(dom);
            if (v.DataSource) {
                this.dataSource(v);
            } else {
                this.model = v.model;
                this.cmd = v.cmd;
                this.search = v.search || {};
                this.query();
            }
        } else {

            this.init(v);
        }
    }
    Pager.Title = headerTitle;

    Pager.prototype = {
        cache: function (row) {
            if (!this.cacheIndex) {
                this.cacheIndex = 0;
            }

            var k = 'c' + (this.cacheIndex++);
            if (!this.UIData) {
                this.UIData = {};
            }
            this.UIData[k] = row;
            return k;
        },
        init: function (dom) {

            var t = this;
            t.r = dom;
            t.r.attr('page-name', 'p' + PagerIndex);
            PagerIndex++;
            t.r.on("scroll", function () {

                if (t.h.is('.umc-float')) {
                    var bg = t.h.attr('background-color') || '#fff';
                    if (this.scrollTop > 255) {
                        t.h.css('background-color', bg);
                        t.h.children('div,h1').css('opacity', 1);
                    } else {
                        t.h.children('div,h1').css('opacity', (this.scrollTop / 255) + '');
                        switch (bg.length) {
                            case 4:
                                t.h.css('background-color', bg + (this.scrollTop >> 4).toString(16));
                                break;
                            case 7:
                                t.h.css('background-color', bg + (this.scrollTop).toString(16));
                                break;
                        }
                    }
                }
                t.r.cls('wdk-top', this.scrollTop > 800);
            });
            t.f = dom.children('footer');
            t.b = dom.children('section');
            t.n = dom.children('nav.wdk-top-icon').click(function () {
                var top = t.r[0].scrollTop || parseInt(t.r.attr('top')) || 0;
                t.b.css('transform', 'translateY(' + top + 'px)');
            });
            t.r.ui('SKUItemChange', function (e, v, text) {
                t.b.find('.wdk-uisku p').text(text);
                var m = t.b.find('.wdk-buy-price');
                if (m.length) {
                    var row = m.parent('*[row-index]');
                    var UIData = t.UIData || {};
                    var json = UIData[row.attr('data-json')] || {};
                    json.value.price = v.price;
                    t.b.find('.wdk-buy-price').html($.format(json.format.price || '{price}', json.value, json.style || {}));
                }

            }).on('event', function (e, v) {
                switch (v) {
                    case 'Cart':
                    case 'Order':
                        WDK.UI.Command('Schedule', v);
                        break;
                    case 'SKUShow':
                    case 'SKUOrder':
                    case 'SKUBuy':
                        $.UI.Event(v);
                        break;
                }
            }).click("*[click-data]", function (e) {
                var m = $(this);
                if ($(e.target).is('a[href]')) {
                    return true;
                } else {
                    var row = m.is('[row-index]') ? m : m.parent('*[row-index]');
                    var click = JSON.parse(m.attr('click-data')) || {};
                    switch (click.key) {
                        case 'Click':
                            click = click.send;
                            var send = click.send || {};
                            send.UI = t.r.attr('page-name');
                            send.row = row.attr('row-index') || -1
                            send.section = row.parent().attr('section-index') || -1;
                            click.send = send;
                            break;
                        case 'Query':
                            if (click.send.key && click.send.send) {
                                t.query(click.send.send, click.send.key);

                            } else {
                                t.query(click.send);
                            }
                            return;
                    }
                    click.key ? m.parent('div[ui]').ui('Key.' + click.key, click.send) : $.Click(click);


                }
                return false;
            });
            t.b.on('transitionend,webkitTransitionEnd', function (e) {
                if (e.target == this) {
                    t.r.removeClass('wdk-top');
                    t.b.css('transform', 'translateY(0px)');
                    t.r[0].scrollTop = parseInt(t.r.attr('top')) || 0;
                }
            }).click("em.wdk-row-del", function () {

                var m = WDK(this);
                var p = m.parent();
                if (p.parent().children().length == 1) {
                    setTimeout(function () {

                        t.r.on('refresh');
                    }, 500)
                }
                p.remove();
                $.Click(JSON.parse(m.attr('click-data')));
                return false;
            }).click(".wdk-paging", function () {

                var me = $(this);
                t.start = parseInt(me.attr('start')) || 0;
                t.limit = parseInt(me.attr('limit')) || 30;
                t.nextKey = me.attr('next');
                t.next();

            }).click('img[original-src]', function () {
                $.UI.On("Image.Preview", $(this));
            });
            t.h = dom.children('header').click('div.wdk-tab-item', function () {
                var me = $(this);
                var index = me.attr('data-index');
                t.h.find('.wdk-tab-bar').attr('wdk-tab-select', index);
                if (index == "0") {
                    t.b[0].scrollIntoView();
                    t.h.find('.wdk-tab-bar').attr('wdk-tab-select', index);
                } else {
                    t.b.find('div[section-index]').eq(parseInt(me.attr('wdk-index')))[0].scrollIntoView();
                }
                me.addClass('active').siblings('.wdk-tab-item').removeClass('active');

            }).on('tabs', function (e, d) {
                var tab = d || [];
                var htls = [];
                for (var i = 0; i < tab.length; i++) {
                    htls.push('<div class="wdk-tab-item" data-index="', i, '" wdk-index="', tab[i].index, '">', tab[i].text, '</div>');
                }
                t.h.find('.wdk-tab-bar').html(htls.join('')).attr('wdk-tab', tab.length);

            }).on('click', 'a.back', function () {
                t.r.is('.wdk-dialog') ?
                    t.r.addClass('right').removeClass('ui') :
                    history.back();
                t.r.on('back');
            })
            dom.defer().on('tab', 'div.weui_cells', function () {
                var m = $(this);
                m.attr('data-src', 'tab');
                t.h.find('.wdk-tab-item').removeClass('active').eq(parseInt(m.attr('tab-index')) || 0).addClass('active');
                t.h.find('.wdk-tab-bar').attr('wdk-tab-select', m.attr('tab-index'));
            });
            dom.on('refresh', function () {
                t.start = 0;
                t.next();
            }).ui('Change', function (e, data) {
                var qty = $('.wdk-cart-quantity', this);
                var Quantity = parseInt(data.Quantity) || 0;
                qty.parent('footer').cls('show', Quantity > 0);
                if (Quantity > 0) {
                    qty.text(Quantity + '').show()
                } else {
                    qty.hide()
                }
                return false;
            }).ui("UI.Edit", function (e, xhr) {
                var method = xhr.method;
                var section = $('section .weui_cells', this).eq(parseInt(xhr.section) || 0)
                var emIndex = section.find('*[row-index]').eq(parseInt(xhr.row));
                var row = xhr.value;
                var UIData = t.UIData || {};
                var json = UIData[emIndex.attr('data-json')] || {};
                switch (method) {
                    case 'VALUE':
                        json.value = WDK.extend(json.value, row);
                        row = json;
                        method = 'PUT';
                        break;
                    case 'PUT':
                        if (row._CellName == json._CellName) {
                            for (var k in row) {
                                if (typeof row[k] == 'object')
                                    $.extend(json[k], row[k]);
                            }
                            row = json;
                        }
                        break
                }
                if (method == "DEL") {
                    emIndex.remove();
                } else {

                    delete UIData[emIndex.attr('data-json')];
                    var fn = cells[row._CellName] || empty;
                    var html = fn(row.value, row.format || {}, row.style || {});
                    var doc = document.createElement("div");
                    doc.innerHTML = html;
                    var newE = doc.lastElementChild;
                    $(newE).attr('data-json', t.cache(row));
                    switch (method) {
                        case "PUT":
                            section[0].replaceChild(newE, emIndex[0]);
                            break;
                        case 'INSERT':
                            emIndex.before(newE);
                            break;
                        case 'APPEND':
                            emIndex.length ? emIndex.after(newE) : section.append(newE);
                            break;
                    }
                    if (row.del) {
                        $(newE).attr('wdk-swipe', 'off').append(WDK(document.createElement('em')).attr('wdk-swipe-area', 'y').addClass('wdk-row-del').text(row.del.text || '删除').attr('click-data', JSON.stringify(row.del.click))).swipe();
                    }
                }
                if (section.children().each(function (i) {
                    $(this).attr('row-index', i + '');
                }).length == 0) {
                    requestAnimationFrame(function () {
                        t.start = 0;
                        t.next();
                    });
                }

                return false;
            });


        },
        query: function (v, key) {
            var me = this;
            var ps = me.search || {};
            if (typeof (v) == 'string') {
                ps.Keyword = v || '';
            } else {
                ps = $.extend(ps, v);
            }
            me.start = 0;
            me.search = ps;
            me.nextKey = key || '';
            me.isRefersh = true;
            me.next();

        },
        next: function () {

            var start = this.start || 0;
            var limit = this.limit || 30;
            var me = this;
            var p = { start: start, limit: limit };
            if (me.nextKey) {
                p.NextKey = me.nextKey;
            }
            if (me.model && me.cmd) {

                $.UI.Command(me.model, me.cmd, $.extend(p, me.search), function (xhr) {
                    if (!me.nextKey && start == 0) {
                        me.b.html('');
                    }
                    me.dataSource(xhr);
                });
            }

        },
        dataSource: function (xhr) {
            var me = this;
            if (me.isRefersh && me.nextKey) {
                var b = false;
                me.b.children().each(function () {
                    if (b) {
                        $(this).remove();
                    } else {
                        b = this.id == me.nextKey;
                        if (b) {
                            $(this).children().remove();
                        }
                    }
                })
            }
            delete me.isRefersh;// = false;

            if (xhr.Header) {
                var he = xhr.Header;
                if (he.type) {
                    var hd = me.hem || {};//domHe
                    var header = hd[he.type];
                    if (!header) {
                        header = me.b.append([
                            '<div class="wdk-section-header">',
                            ($.UI.Headers[he.type] || cells[he.type] || empty)(he.data, he.format || {}, he.style || {}),
                            '</div>'
                        ].join('')).find('.wdk-section-header')

                        var search_bar = header.find('.weui_search_bar');
                        search_bar.on('click', '.weui_icon_clear', function () {
                            search_bar.find('input').val('');
                        }).on('click', '.weui_search_cancel', function () {
                            search_bar.removeClass('weui_search_focusing');
                        }).find('form').on('submit', function () {
                            me.query($(this).find('input').val());
                            return false;
                        }).find('.weui_search_input').on('focus', function () {
                            search_bar.addClass('weui_search_focusing');
                        });
                        hd[he.type] = header[0];
                        me.hem = hd;
                    } else {
                        me.b.append(header);
                    }
                }
            }
            if (xhr.Title) {
                headerTitle(xhr.Title, me.h)
            }
            me.b.find('.wdk-paging').remove();
            var DataSource = xhr.DataSource || [];
            var tab = [];

            for (var i = 0, l = DataSource.length; i < l; i++) {
                var ds = DataSource[i];

                var section = document.createElement("div");
                section.className = "weui_cells weui_cells_access";
                section = WDK(section);
                if (i == 0) {
                    var lastStn = me.b.children('.weui_cells').last();
                    if (lastStn.length > 0 && lastStn.attr('id') == ds.key) {
                        section = lastStn;
                        if (xhr.start == 0) {
                            section.html('');
                        }
                    }
                }

                if (ds.header) {
                    if (ds.header.text) {
                        var header = document.createElement('div');

                        header.className = "weui_cell";

                        header.innerHTML = $.format('<div class="weui_cell_bd weui_cell_primary"><p>{text}</p></div>', ds.header, { prefix: { font: 'wdk', 'font-size': 12 } })
                        section.append(header);
                    }
                    if (ds.header.title) {
                        tab.push({ 'text': ds.header.title, index: i });
                        section.attr('data-src', 'tab');
                        section.attr('tab-index', tab.length - 1);
                    }
                }
                if (ds.separatorLine === false) {
                    section.addClass('umc-not-separatorline');
                }
                section.attr('id', ds.key);
                me.nextKey = ds.key;
                var data = ds.data;
                for (var c = 0, cl = data.length; c < cl; c++) {
                    var row = data[c];
                    var fn = cells[row._CellName] || empty;
                    var style = row.style || {};
                    var html = fn(row.value, row.format || {}, style, me, section);

                    if (html) {
                        section.append(html);
                        var last = WDK(section[0].lastElementChild);
                        if (row.del) {
                            last.attr('wdk-swipe', 'off')
                            last.append(WDK(document.createElement('em')).attr('wdk-swipe-area', 'y').addClass('wdk-row-del').text(row.del.text || '删除').attr('click-data', JSON.stringify(row.del.click))).swipe();
                        }
                        last.attr('row-index', c + '').attr("data-json", me.cache(row));


                        switch (style.border) {
                            case 'all':
                                last.addClass('umc-cell-separatorline')
                                last.addClass('umc-bottom-separatorline')
                                break;
                            case 'top':
                                last.addClass('umc-cell-separatorline')
                                break;
                            case 'bottom':
                                last.addClass('umc-bottom-separatorline')
                                break;
                            case 'none':
                                last.addClass('umc-cell-not-separatorline')
                                break;
                        }
                    }
                }
                me.b.append(section);

                section.children().each(function (i) {
                    $(this).attr('row-index', i + '');
                });
                me.r.on('section', section);
            }
            me.b.children('.weui_cells').each(function (i) {
                $(this).attr('section-index', i + '');
            });

            me.start = (me.start || 0) + (me.limit || 30);
            var total = parseInt(xhr.total) || 0;
            if (xhr.next || (me.start < total)) {
                me.start = ('start' in xhr) ? xhr.start : me.start;
                var paging = document.createElement("a");
                paging.className = "wdk-paging";
                me.b.append(paging);
                $(paging).attr({
                    start: me.start,
                    limit: me.limit || 30,
                    total: total,
                    'next': me.nextKey,
                    'data-src': 'click'
                });
            }
            if (tab.length > 0) {
                me.h.on('tabs', tab);
            }
            var footer = xhr.FootBar;
            if (footer) {
                var fhtml = [];
                var inits = [];
                var icons = footer.icons || [];
                for (var i = 0; i < icons.length; i++) {
                    var icon = icons[i];
                    switch (typeof icon) {
                        case 'string':
                            requestAnimationFrame(function () {
                                $.UI.Start();
                            });
                            fhtml.push(FFFN.cart());
                            break;
                        case 'object':
                            fhtml.push(FFFN.icon(icon, me.r));
                            if (icon.init)
                                inits.push(icon.init);

                            break;
                    }
                }
                var buttons = footer.buttons || [];
                for (var i = 0; i < buttons.length; i++) {
                    var icon = buttons[i];
                    if (icon.init)
                        inits.push(icon.init);
                    if ((typeof icon) == 'object')
                        fhtml.push(icon.click ? FFFN.button(icon, me.r) : FFFN.text(icon, me.r));

                }
                me.f.html(fhtml.join(''));
                requestAnimationFrame(function () {
                    for (var i = 0; i < inits.length; i++) {
                        var click = inits[i];
                        switch (click.key) {
                            case 'Click':
                                click = click.send;
                                var send = click.send || {};
                                send.UI = t.r.attr('page-name');
                                send.row = -1
                                send.section = -1;
                                click.send = send;
                                break;
                        }

                        $.Click(click);
                    }
                });
                me.f.cls('fixed', footer.fixed === true);

            }

            if (xhr.Header && xhr.Header.sku) {
                $.UI.On('SKUSheet', xhr.Header.sku);
                $.UI.Start();
            }
            requestAnimationFrame(function () {
                me.r.on('defer');
            });
        }
    };
    $.UI.Pager = Pager;

    $.UI.On('UI.Event', function (e, v) {
        switch (v.ui || 'none') {
            case 'none':
                $('div[ui].ui').on('UI.' + v.key, v.value || v);
                break;
            default:
                $('div[page-name=' + v.ui + ']').on('UI.' + v.key, v.value || v);
                break;
        }
    });

})(WDK);