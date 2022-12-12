(function ($) {

    var __p = $.UI;
    __p.Cells = {};
    __p.Headers = {};


    UMC.prototype.more = function () {
        return this.click(function (e, v) {
            var m = WDK(this);
            if (m.attr('loading')) return false;
            var start = v ? 0 : parseInt(m.attr('start')) || 0;
            var limit = parseInt(m.attr('limit')) || 30;
            var total = v ? 10 : parseInt(m.attr('total')) || 10;
            var params = this.params || eval('(' + (m.attr('params') || '{}') + ')');
            if (total > start) {
                m.attr('loading', 'loading');
                UMC.UI.Command(m.attr('model'), m.attr('cmd'), UMC.extend(params, { start: start, limit: limit }), function (xhr) {
                    if (parseInt(xhr.total) > start + limit) {
                        m.addClass('next-yes').removeClass('next-no,empty')
                    } else {
                        m.removeClass('next-yes next-no empty').addClass((start + (xhr.data || xhr).length) ? 'next-no' : 'empty').attr('title', xhr.msg).on('last');
                    }
                    m.attr('total', xhr.total || '0').attr('start', (start + limit) + '').attr('loading', null).on('xhr', xhr)
                    if (m.on("format", xhr, start, limit) !== false) {
                        var fem = m.attr('for');
                        (fem ? WDK(fem) : m.siblings('div,ul')).format(xhr.data, start == 0);
                    }

                });
            }
            return false;
        });
    };

    UMC.UI.Format = function (click, p) {
        switch (typeof click) {
            case 'string':
                return 'ui-event="' + click + '"';
                break;
            case 'object':
                if (!p) {
                    var c = UMC.UI.Click(click);
                    if (c) {
                        return 'href="' + c + '"';
                    }
                }
                return 'click-data="' + UMC.encode(JSON.stringify(click)) + '" '
        }
        return ''
    }
    function hashUrl(x, p) { return $.UI.Format(x, p) };

    function tagUrl(click, html) {
        var href = UMC.UI.Format(click, false);
        if (href.indexOf('href') == -1) {
            html.push('div', ' ', href);
            return 'div'
        } else {
            html.push('a', ' target="_blank" ', href);
            return 'a'

        }
    }
    __p.Headers.Profile = function (data, fmt, style) {
        var account = data.account;
        var htmls = ['<div class="profile" style="background-image: -webkit-gradient(linear, 0 0, 0 100%, from(', data.startColor || '#fe314e', '), to(', data.endColor || '#fe6263', '));">',
            '<div class="figure" style="margin-top: 0px;top: 1em;">',
            '<div class="head" style="background-image: url(', data[fmt.src || 'src'], ');">',
            '</div>',
            '<a class="name" ', hashUrl(data.click), ' style="color: #fff">',
            '<div style="padding-left: 0.5em">',
            $.format(fmt.name || '{name}', data, style),
            '</div>',
            '<div style="padding-left: 0.5em; font-size: 80%;">',
            $.format(fmt.number || 'NO:{3:number}', data, style),
            '</div>',
            '</a>',
            '</div>']
        if (account)
            htmls.push(
                '<a class="account" ', hashUrl(account.click), ' data-tag="',
                $.format(fmt.tag || '{tag}', account, style),
                '"><em >',
                $.format(fmt.tip || '{tip}', account, style),
                '</em><span>',
                $.format(fmt.amount || '¥{1:amount}', account, style),
                '</span></a>'
            );
        var keys = data.Keys || [];
        if (keys.length > 0) {
            htmls.push('<dl style="overflow: hidden;margin-top: 90px;">');
            for (var i = 0; i < keys.length; i++) {
                var kv = keys[i];
                htmls.push('<dd>', kv.text, '<br><em>¥', kv.value, '</em></dd>');

            }
            htmls.push('</dl>');
        }
        htmls.push('</div>');
        return htmls.join('');
    }

    __p.Cells.UI =
        __p.Cells.Cell = function (data, fmt, style) {
            var click = data.click;
            var htmls = ['<'];
            var tag = tagUrl(click, htmls);
            htmls.push('  class="weui_cell">');
            if (data.src) {
                htmls.push('<div class="weui_cell_hd">', '<img src="', data.src, '"');
                var wdth = style['image-width'];
                if (wdth) {
                    htmls.push(' style="width:', wdth, 'px;height:', wdth, 'px;border-radius:', style['image-radius'] || 2, 'px"')
                }
                htmls.push('/></div>');
            } else if (data.Icon) {
                htmls.push('<b class="wdk_cell_icon" data-icon="', data.Icon, '" ', data.Color ? ('style="color:' + data.Color + '"') : '', '></b>');

            }

            htmls.push('<div class="weui_cell_bd weui_cell_primary"><p>',
                $.format(fmt.text || '{text}', data, style), '</p></div>',
                '<div class="wdk_cell_value" >',
                $.format(fmt.value || '{value}', data, style));

            if (tag == 'div' && (data.icon || fmt.icon)) {
                htmls.push('<a class="wdk_cell_icon" ', hashUrl((style.icon || {}).click), ' data-icon="', $.format(fmt.icon || '{icon}', data, {}),

                    '"></a>');
            }


            htmls.push('</div></', tag, '>');
            return htmls.join('');
        }
    __p.Cells.TextNameValue = function (data, fmt, style) {
        var click = data.click;
        var htmls = ['<'];
        var tag = tagUrl(click, htmls);
        htmls.push(' class="weui_cell">');
        htmls.push('<div class="weui_cell_bd weui_cell_primary" style="flex:1.5"><p>', $.format(fmt.name || '{name}', data, style), '</p></div>');
        htmls.push('<div class="weui_cell_bd weui_cell_primary"><p>',
            $.format(fmt.text || '{text}', data, style), '</p></div>',
            '<div class="wdk_cell_value">',
            $.format(fmt.value || '{value}', data, style));
        htmls.push('</div></', tag, '>');
        return htmls.join('');
    }


    __p.Cells.ImageTextDesc = function (data, fmt, style) {
        var click = data.click;
        var htmls = ['<'];
        var tag = tagUrl(click, htmls);
        htmls.push(' class="weui_cell wdk-image-text-desc">');
        if (data.src)
            htmls.push(
                '<div class="wdk-image-text-desc-media">',
                '<img src="', data.src, '" alt="">',
                '</div>');

        htmls.push('<div class="wdk-image-text-desc-content">');

        htmls.push(
            '<div class="wdk-image-text-desc-title">',
            $.format(fmt.title || '{title}', data, style),
            '</div>',
            '<div class="wdk-image-text-desc-desc">',
            $.format(fmt.desc || '{desc}', data, style),
            '</div>',
            '</div>',
            '</', tag, '>');
        return htmls.join('');
    }

    __p.Cells.Discount = function (data, fmt, style) {
        if (!style.value) {
            style.value = { 'font-size': "24" };
        }
        var click = data.click;
        var htmls = ['<div class="discount"><div class="item "style="margin: 10px;"', $.UI.Format(click, true), '>',
            '<div class="left coupon-0"  style="background: -webkit-gradient(linear, 0 0, 0 100%, from(', data.startColor || '#fe314e', '), to(', data.endColor || '#fe6263', '));">',
            '<div class="inner">',
            '<h4 class="name" style="font-size:14px">',
            $.format(fmt.title || '{store}{name}', data, style),
            '</h4>',
            '<div class="value">',
            $.format(fmt.value || '{prefix}{value}{unit}', data, style),
            '</div>',
            '<div class="desc" style="font-size:12px">',
            $.format(fmt.desc || '{desc}', data, style),
            '</div>',
            '</div>',
            '<i class="left-dot-line"></i></div>',
            '<div class="right">',
            '<div class="inner">',
            $.format(fmt.time || '<p>使用期限</p><p>{start}</p><p>{end}</p><p>{state}</p>', data, style),
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ];
        return htmls.join('');
    };
    __p.Cells.ImageTextDescTime = function (data, fmt, style) {
        var click = data.click;
        var htmls = ['<'];
        var tag = tagUrl(click, htmls);

        htmls.push(' class="weui_cell" style="overflow: hidden;">',
            '<div  style="float: left; padding: 10px;">',
            '<img src="', data[fmt.src || 'src'], '" style="width: 70px; height: 70px;"></div>',
            '<div class="weui_cell_primary" style=" font-size: 12px; color: #666; line-height: 1.5;">',
            '<div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">',
            $.format(fmt.title || '{title}', data, style),
            '</div>',
            '<div>',
            $.format(fmt.text || '{text}', data, style), '</div>',
            '<div>', $.format(fmt.desc || '{desc}', data, style),
            '</div>',
            '<div>', $.format(fmt.time || '{time}', data, style),
            '</div>',
            '</div>',
            '</', tag, '>'
        )
        return htmls.join('');
    }
    __p.Cells.DuoBao = function (data, fmt, style) {
        var htmls = ['<div class="weui_cell" style="overflow: hidden;" ', hashUrl(data.click, true), '>'];
        if (data.tag) {
            htmls.push('<div class="wdk_cell_tag" style="background-color:', data.color, '">', $.format(fmt.tag || '{tag}', data, style), '</div>');
        }
        htmls.push('<div style="float: left; padding: 10px;">',
            '<img src="', data.product_src, '" style="width: 70px; height: 70px;"></div>',
            '<div class="weui_cell_primary" style=" font-size: 12px; color: #666; line-height: 1.5;">');
        if (data.state == 'going') {
            htmls.push('<div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">',
                $.format(fmt.title || '(第{periods}期){product_name}', data, style),
                '</div>', '<div class="Progress-bar">',
                '<p class="u-progress" title="已完成', data.progress, '%">',
                '<span class="pgbar" style="width: ', data.progress, '%;"><span class="pging"></span></span></p>',
                '<ul class="Pro-bar-li" style="list-style-type: none;">',
                '<li class="P-bar01"><em>', data.sale, '</em>已参与</li><li class="P-bar02"><em>', data.total, '</em>总需人次</li><li class="P-bar03"><em>', data.surplus, '</em>剩余</li></ul></div>');
        } else {

            htmls.push('<div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">',
                $.format(fmt.title || '(第{periods}期){product_name}', data, style),
                '</div>',
                '<div>',
                $.format(fmt.text || '获得者：{name}', data, { name: { 'font-size': 14, color: '#22AAff' } }), '</div>',
                '<div>', $.format(fmt.desc || '价值：￥{1:price}', data, { price: { 'font-size': 14, color: '#db3652' } }),
                '</div>',
                '<div>', $.format(fmt.time || '幸运夺宝码：{lucky}', data, { lucky: { 'font-size': 14, color: '#04be02' } }),
                '</div>');
        }
        htmls.push('</div></div>');
        return htmls.join('');
    }
    __p.Headers.Portrait = function (data, fmt, style) {
        var htmls = [
            '<div class="portrait Header"  style="background: -webkit-gradient(linear, 0 0, 0 100%, from(', data.startColor || '#fe314e', '), to(', data.endColor || '#fe6263', '));">',
            '<div><h1 class="name">',
            $.format(fmt.title || '{title}', data, style),
            '</h1>',
            '</div><p class="value">',
            data.src ? ('<img ' + hashUrl(data.click, true) + ' src="' + data.src + '"/>') : '',
            $.format(fmt.value || '{value}', data, style),

            '</p><p class="desc">', $.format(fmt.desc || '{desc}', data, style), '</p><p class=" time">', $.format(fmt.time || '{time}', data, style), '</p>',
            '</div>'
        ];

        return htmls.join('');
    }


    __p.Headers.Desc = function (data, fmt, style) {

        var htmls = [];
        htmls.push('<div class="wdk-desc" style="white-space: pre-line; line-height:1.5; padding:', (style.padding || '8 15').split(' ').join('px '), 'px;');
        delete style.padding;
        UMC.style(style || {}, htmls);
        htmls.push('" ', UMC.UI.Format(data.click, true), '>', $.format(fmt.desc || '{desc}', data, style), '</div>')
        return htmls.join('');
    }



    function DataSource(param, content) {
        this.init(param, content);
    }

    DataSource.prototype = {
        renderCells: function (code, data, htmls) {
            var cells = __p.Cells;
            var fmt = cells[code.cell || "Cell"] || cells.ImageTextDesc;
            for (var c = 0, l = data.length; c < l; c++) {
                var da = data[c];
                var click = this.check(da, code.submit || code.click);
                if (click) {
                    da.click = click;
                }
                var fn = cells[da._CellName] || fmt;
                htmls.push(fn(da, code.format || {}, this.checkStyle(da, code.style || {}), this.check(da, code.submit || code.click)));
            }
        },
        init: function (param, content) {
            content.on('refresh', function () {
                $(this).find('.wdk-load-more').click(true);
            });
            var me = this;
            var header = this.Header = param.Header || {};
            var headers = ['<div class="header"><a class="back"></a><h1>', param.title || "列表", '</h1> '];

            this.menu = param.menu || [];
            if (this.menu.length > 0) {
                headers.push('<a class="right">', this.menu.length == 1 ? this.menu[0].text : '<span class="icon-menu"></span>', '</a>');
            }
            headers.push('</div><div class=" weui_cell_primary" style="overflow: auto"></div>');
            var cont = content.html(headers.join('')).find('.weui_cell_primary');
            content.click("*[click-data]", function (e) {
                var m = $(this);
                if ($(e.target).is('a[href]')) {
                    return true;
                } else {
                    var click = JSON.parse(m.attr('click-data')) || {};
                    switch (click.key) {
                        case 'Click':
                            click = click.send;
                            var send = click.send || {};
                            click.send = send;
                            break;
                        case 'Query':
                            t.query(click.send);
                            return;
                    }

                    $.Click(click);
                }
                return false;
            }).find('.header a').click(function () {
                var menu = me.menu;
                var b = $(this)
                if (b.is('.back')) {
                    content.addClass('right').removeClass('ui');
                } else if (b.is('.right')) {
                    if (menu.length > 1) {
                        $.UI.Sheet('菜单', menu, function (v) {
                            UMC.UI.Command(v.model, v.cmd, v.send);
                        }, 'text');
                    } else {
                        var v = menu[0];
                        UMC.UI.Command(v.model, v.cmd, v.send);
                    }
                }
            });
            if (header.type) {
                cont.before([
                    (__p.Headers[header.type] || __p.Cells[header.type] || function () { return '' })(header.data, header.format || {}, header.style || {}),

                ].join(''));

                var search_bar = content.find('.weui_search_bar');
                search_bar.on('tap', '.weui_icon_clear', function () {
                    search_bar.find('input').val('');
                }).on('tap', '.weui_search_cancel', function () {
                    search_bar.removeClass('weui_search_focusing');
                }).find('form').on('submit', function () {
                    var search = JSON.parse(me.paging.attr('params') || '{}') || {};
                    search.Keyword = $(this).find('input').val();
                    if (!search.Keyword) {
                        delete search.Keyword;
                    }
                    me.paging.attr('params', JSON.stringify(search)).attr('start', 0).click();
                    return false;
                }).find('.weui_search_input').on('focus', function () {
                    search_bar.addClass('weui_search_focusing');
                });
            }
            var htmls = [];

            var datas = param.DataSource || [];
            var dlen = datas.length;
            var isTab = false;
            if (dlen > 1 && param.model != 'Cells') {
                htmls.push('<div class="weui_tab"><div class="weui_navbar">');
                for (var i = 0; i < dlen; i++) {
                    htmls.push('<div class="weui_navbar_item">', datas[i].text, '</div>');
                }
                isTab = true;
                htmls.push('</div>');
                htmls.push('<div class="weui_tab_bd">');
            }
            var self = this;
            for (var i = 0; i < dlen; i++) {
                var data = datas[i];
                htmls.push('<div><div data-index="', i, '" class="weui_cells weui_cells_access" ', isTab ? ' style="margin-top: 0px;"' : '', '>');
                if (data.model) {
                    htmls.push('</div>');
                    htmls.push('<a  class="wdk-load-more" model="', data.model, '" cmd="', data.cmd, '" data-index="', i, '"');
                    if (data.search) {
                        var ob = data.search;
                        htmls.push(' params="', (typeof ob == 'object') ? JSON.stringify(ob).replace(/"/g, "'") : ob, '"');
                    }
                    htmls.push('></a>')
                } else {
                    self.renderCells(data, data.data || [], htmls);
                    htmls.push('</div>');
                }
                htmls.push('</div>');
            }
            if (isTab) {
                htmls.push('</div></div>');
            }
            var footer = this.Footer = param.Footer || {};
            var fnh = __p.Headers[footer.type] || function () { return '' };
            htmls.push(fnh(footer.data || {}, footer.format || {}, footer.style || {}));

            cont.html(htmls.join(''));

            me.paging = cont.find('a[model]').more().on('format', function (e, xhr, start) {
                var m = $(this);
                var htmls = [];
                self.renderCells(datas[parseInt(m.attr('data-index')) || 0], (xhr instanceof Array) ? xhr : (xhr.data || []), htmls);

                start ? m.siblings('div').append(htmls.join('')) : m.siblings('div').html(htmls.join(''));
                return false;
            }).on('last', function () {
                $(this).text(this.title);
            });

            var ts = $(cont).find('div.weui_navbar_item').on('tap', function () {
                var m = $(this);
                m.addClass('weui_bar_item_on').siblings('.weui_bar_item_on').removeClass('weui_bar_item_on');
                var p = m.parent('.weui_tab').find('.weui_tab_bd>*').hide().eq(parseInt(m.attr('data-id')) || 0).show();
                if (!m.attr('init')) {
                    m.attr('init', 'true');
                    p.find('a').click();

                }
            }).each(function (i) {
                this.setAttribute('data-id', i);
            });
            if (ts.length > 0) {
                ts.eq(0).on('tap');
            } else {
                me.paging.click();
            }

        },
        checkStyle: function (data, style) {
            var st = $.extend({}, style);
            for (var k in style) {
                var cStyle = st[k];
                if (k == 'click')
                    st[k] = this.check(data, cStyle);
                else if (typeof cStyle == 'object')
                    for (var k1 in cStyle)
                        if (k1 == 'click')
                            cStyle[k1] = this.check(data, cStyle[k1]);


            }
            return st;
        },
        check: function (data, smt) {
            if (!smt) {
                return;
            }
            var submit = UMC.extend({}, smt);
            var send = submit.send;
            if (send) {

                switch (typeof send) {
                    case 'object':
                        var ds = {};
                        for (var k in send) {
                            var v = send[k];
                            if (data.hasOwnProperty(send[k])) {
                                ds[k] = data[v];
                            } else {
                                ds[k] = v;
                            }
                        }
                        submit.send = ds;
                        break;
                    default:
                        if (data.hasOwnProperty(submit.send)) {
                            submit.send = data[submit.send];
                        }
                        break;
                }
            }
            return submit;
        }
    };
    $.UI.DataSource = DataSource;
})(WDK);