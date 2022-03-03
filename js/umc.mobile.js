(function ($) {
    $.SPA = '/';
    function main() {
        history.replaceState(null, null, '/Page');
        requestAnimationFrame(() => $(window).on('page', 'main', ''))
    }
    $(window).off('popstate').on('popstate', function (e, v) {
        var pathname = location.pathname.substring(1);

        var paths = pathname.split('/');
        var key = paths.shift();
        var search = {};
        var value = {};
        value.model = paths.shift();
        value.cmd = paths.shift();
        switch (paths.length) {
            case 1:
                search.Id = paths[0];
                break;
            default:
                while (paths.length) {
                    search[paths.shift()] = paths.shift() || '';
                }
                break;
        }
        switch (key) {
            case 'Click':
                if (v) {
                    value.send = paths.length ? search.Id : search;
                    var query = $.query(location.search.substring(1));
                    if (query.code) {
                        $.UI.On("User", function () {
                            (value.model && value.cmd) ? $.Click(value) : main();
                            history.replaceState(null, null, '/Page');
                        }, 1);
                        UMC.UI.Command('Account', 'Component', query.code);
                    } else {
                        (value.model && value.cmd) ? $.Click(value) : main();
                        history.replaceState(null, null, '/Page');
                    }
                } else {
                    main();
                }
                break;
            case "Page":
                if ($.check(value.model)) {
                    history.replaceState(null, null, '/Page');
                    $(window).on('page', pathname.substring(4), '')
                } else if (value.model && value.cmd) {
                    value.search = search;
                    $(document.body).ui('Key.Pager', value);
                } else {
                    main();
                }
                break;
        }
    });
    var searchConfig = {};
    function urlKey(m, c, p) {
        var path = ['Page', m, c];
        for (var k in p) {
            path.push(k, p[k]);
        }
        if (path.length == 5 && path[3] == 'Id') {
            path.splice(3, 1);
        }
        return '/' + path.join('/');
    }
    WDK(function ($) {
        var body = $(document.body).ui('Key.Pager', function (e, v) {
            var key = 'Pager';
            var dom = WDK(document.createElement('div')).attr({
                'ui': key,
                'class': 'wdk-dialog'
            }).on('transitionend,webkitTransitionEnd', function () {
                dom.is('.ui') ? 0 : dom.on('pop');
            }).appendTo(document.body).on('pop', function () {
                dom.on('close').remove();
            });

            var r = v.RefreshEvent;
            var c = v.CloseEvent;
            r ? dom.ui(r, function () {
                dom.on('refresh');
            }) : 0;
            c ? dom.ui(c, function () {
                dom.addClass('right').removeClass('ui');
            }) : 0;


            if (UMC.UI.On("UI.Show", dom, key, v) !== false) {
                new UMC.UI.Pager(v, dom);
                dom.addClass('ui');
            }
        }).ui('Key.Search', function (e, v) {
            searchConfig = v || {};
            $(window).on('page', 'search')

        }).ui('Key.Category', function (e, v) {
            $(this).ui('Key.Pager', {
                model: 'Data',
                cmd: 'Search',
                search: {
                    Category: v.Id || v
                }
            });
        }).ui('Key.Product', function (e, v) {
            $(this).ui('Key.Pager', {
                model: 'Product',
                cmd: 'UI',
                search: {
                    Id: v.Id || v
                }
            });

        }).ui('Key.Subject', function (e, v) {
            $(this).ui('Key.Pager', {
                model: 'Subject',
                cmd: 'UIData',
                search: {
                    Id: v.Id || v
                }
            });
        });

        $.UI.On('UI.Show', function (e, dom, key, v) {
            switch (key) {
                case 'Pager':
                    var path = urlKey(v.model, v.cmd, v.search || {});
                    dom.attr('hash', path);
                    var ui = body.children('div[ui].ui').last();

                    var lastPath = ui.attr('hash');
                    if (lastPath == path) {
                        history.replaceState(null, null, path);
                        dom.remove();
                        return false;
                    } else {
                        dom.on('pop', function () {
                            var last = body.children('div[ui].ui').last();
                            if (last.is('.wdk-dialog')) {
                                history.replaceState(null, null, last.attr('hash'));
                            } else {
                                var uiKey = last.attr('ui') || 'main';
                                switch (uiKey) {
                                    case 'main':
                                        history.replaceState(null, null, '/Page');
                                        break;
                                    default:
                                        history.replaceState(null, null, $.SPA + uiKey);
                                        break;
                                }
                                $(window).on('popstate')
                            }
                        });

                        history.replaceState(null, null, path);
                    }
                    break;
                default:
                    dom.click("*[click-data]", function () {
                        var m = $(this);
                        if ($(e.target).is('a[href]')) {
                            return true;
                        } else {
                            $.Click(JSON.parse(m.attr('click-data')) || {});
                        }
                    }).on('pop', function () {
                        body.children('div[ui].ui').length ? 0 : main();
                    });
                    break;
            }
        }).On('UI.Push', function (e, xhr) {
            body.children('div[ui].ui').each(function () {
                var m = $(this);
                m.is('wdk-dialog') ? 0 : (m.on('backstage') === false ? m.cls('ui', 0) : m.cls('ui', 0).remove());
            });
            xhr.root.cls('ui', 1).parent()[0] != body[0] ? xhr.root.appendTo(body).on('active') : xhr.root.on('active')
        }).Off('Prompt')
            .On("Prompt", function (e, p) {

                var msg = WDK('#wdk-msg');
                if (msg.length == 0) {
                    var m = document.createElement("div");
                    m.id = 'wdk-msg';
                    document.body.appendChild(m);
                    msg = new WDK([m]);
                }
                msg.addClass('animate').html(p.Text);
                setTimeout(function () {
                    msg.removeClass('animate');
                }, 5000);
            });

        requestAnimationFrame(() => $(window).on('popstate', 1));
    });
    UMC.page('search', function (root) {
        root.find('header').find('.back').click(function () {
            if (root.find('.searchCon').css('display') == 'none') {
                root.find('.searchCon').show();
                root.find('.searchResult').hide();
            } else {
                root.cls('ui', 0).remove();
                $(window).on('popstate')
            }
        });
        var pager = new UMC.UI.Pager(root.find('.searchCon'));
        pager.model = 'UI'
        pager.cmd = "Search"
        pager.search = {};
        pager.query();

        var pager2 = new UMC.UI.Pager(root.find('.searchResult'));
        var history = false;

        root.ui('Key.SearchFor', function (e, d) {
            root.find('header form').val({ Keyword: d }).on('submit');
            return false;
        }).ui('SearchFor', function (e, v) {
            history = v;
        }).on('active', function () {
            root.find('header input').attr('placeholder', searchConfig.text || '搜索内容');
        });
        root.find('header form').submit(function () {
            root.find('.searchCon').hide();
            var v = root.find('header input');
            var val = v.val() || v.attr('placeholder');

            switch (val) {
                case '搜索':
                    break;
                default:
                    root.find('.searchResult').show();

                    pager2.model = 'Data'
                    pager2.cmd = 'Search'
                    switch (typeof searchConfig) {
                        case 'string':
                            switch (searchConfig) {
                                case 'Subject':
                                    pager2.model = 'Subject'
                                    pager2.cmd = 'UI'
                                    break;
                            }
                            break;
                        case 'object':

                            pager2.model = searchConfig.model || 'Data';
                            pager2.cmd = searchConfig.cmd || 'Search';
                            break;
                    }
                    pager2.search = { Keyword: val };
                    pager2.query();
                    if (history) {
                        $.UI.Command('UI', 'Search', val, function (xhr) {
                            var items = xhr.data;
                            var htmls = [];
                            for (var i = 0; i < items.length; i++) {
                                var item = items[i];
                                htmls.push('<a ', $.UI.Format(item['click'], true), '>', $.format(item.format || '{text}', item, {}), '</a>')
                            }
                            if (xhr.msg) {

                                htmls.push('<span>', xhr.msg, '</span>')
                            }
                            history.html(htmls.join(''));
                        });
                    }
                    break;
            }
            return false;
        })


    }).page('main', function (root) {
        root.on('backstage', () => false);
        function Tabs(dem, xhr) {
            dem.html($('#tabs').text());
            if (xhr.title) {
                UMC.UI.Pager.Title(xhr.title, $('header', dem).click('*[click-data]', function () {
                    $.Click(JSON.parse($(this).attr('click-data')) || {});
                }));
            }
            $('.wdk_tab_bd', dem).html($.format('<div class="weui_tab_bd_item"> </div>', xhr.sections))
            $('.weui_navbar', dem).html($.format('<div class="weui_navbar_item"> {text}</div>', xhr.sections))
                .on('click', 'div.weui_navbar_item', function () {
                    var me = $(this);
                    me.addClass('weui_bar_item_on').siblings('div').removeClass('weui_bar_item_on');

                    var index = parseInt(me.attr('data-index')) || 0;

                    var body = me.parent().siblings('.wdk_tab_bd').children('div').eq(index);
                    body.show().siblings('div').hide();
                }).find('div').each(function (i) {
                    var section = xhr.sections[i];
                    var me = $(this).attr('data-index', i + '');
                    var body = me.parent().siblings('.wdk_tab_bd').children('div').eq(i);

                    body.html('<section></section>');
                    var pager = new UMC.UI.Pager(body);
                    if (section.section) {
                        pager.dataSource(section.section);
                    } else {
                        pager.model = section.model
                        pager.cmd = section.cmd
                        pager.search = section.search || {};
                        pager.query();
                    }

                }).eq(0).click();
        }

        function TabSocure(xhr, dom) {
            if (xhr.sections) {
                if (xhr.sections.length == 1) {
                    var section = xhr.sections[0];
                    dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')
                    var pager = new UMC.UI.Pager(dom);
                    if (section.section) {
                        pager.dataSource(section.section);
                    } else {
                        pager.model = section.model
                        pager.cmd = section.cmd
                        pager.search = section.search || {};
                        pager.query();
                    }

                } else {
                    Tabs(dom, xhr);
                }
            } else {
                dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')
                var pager = new UMC.UI.Pager(dom);
                pager.dataSource(xhr);
            }
        }

        function body_item_init(dom, data) {
            if (!dom.attr('data-init')) {
                dom.attr('data-init', "Y");
                switch (data.key) {
                    case 'Home':
                        UMC.UI.Command('UI', 'Home', xhr => TabSocure(xhr, dom));
                        break;
                    case 'Tabs':
                        UMC.UI.Command(data.model, data.cmd, xhr => TabSocure(xhr, dom));
                        break;
                    case 'Category':
                        categoryInit(dom);
                        break;

                    case "Subject":
                        dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')

                        var pager = new UMC.UI.Pager(dom);
                        pager.model = "Subject";
                        pager.cmd = 'UI';
                        pager.query();
                        break;
                    case "Order":
                        dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')

                        var pager = new UMC.UI.Pager(dom);
                        pager.model = "Member";
                        pager.cmd = 'UI';
                        pager.query();
                        break;
                    case 'Pager':
                        dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')

                        var pager = new UMC.UI.Pager(dom);
                        pager.model = data.model;
                        pager.cmd = data.cmd;
                        pager.search = data.search || {};
                        if (pager.model && data.cmd)
                            pager.query();
                        break;
                    default:
                        break;
                }
            }
        }

        function categoryInit(dom) {
            dom.html($('#Category').text());
            var nav = $('#nav', dom).on('click', 'a.weui_cell', function () {
                var m = $(this);
                if (m.is('.active') == false) {
                    m.addClass('active').siblings('.weui_cell').removeClass('active');

                    var t = $('#nav-items', dom).children('div').hide().eq(parseInt(m.attr('data-id'))).show();

                    t[0].scrollTop = 0;
                }
                return false;
            });

            var cem = $('#nav-items', dom).click('a[click-data]', function () {
                $.Click(JSON.parse($(this).attr('click-data')));
            });
            UMC.UI.Command("Product", 'Category', function (xhr) {
                var cateHTML = $('#singleCategory').text();

                var htmls = [];
                for (var cb = 0; cb < xhr.length; cb++) {

                    htmls.push('<div style="display:none">')
                    var data = xhr[cb].data,
                        l = data.length;
                    if (l > 0) {
                        if (data[0].src) {
                            htmls.push('<ul>')
                            htmls.push($.format(cateHTML, data, {
                                Click: function (c) {
                                    return UMC.UI.Format(c.click);
                                }
                            }));
                            htmls.push('</ul>')
                        } else {
                            for (var i = 0; i < l; i++) {
                                var c = data[i];
                                htmls.push('<div class="weui_cells weui_cells_access"><a class="weui_cell "><div class="weui_cell_bd weui_cell_primary">', '<p>', c.name, '</p></div></a>');

                                htmls.push('<ul>')
                                htmls.push($.format(cateHTML, c.data, {
                                    Click: function (c) {
                                        return UMC.UI.Format(c.click);
                                    }
                                }));
                                htmls.push('</ul></div>')
                            }
                        }
                    }
                    htmls.push('</div>')
                }
                cem.html(htmls.join(''));
                nav.find('.weui_cells').html($.format('<a class="weui_cell"><div class="weui_cell_bd weui_cell_primary"><p>{name}</p></div>', xhr)).find('.weui_cell').each(function (i) {
                    $(this).attr('data-id', i + '');
                }).click(function () {
                    var m = $(this);
                    if (m.is('.active') == false) {
                        m.addClass('active').siblings('.weui_cell').removeClass('active');

                        cem.children('div').hide().eq(parseInt(m.attr('data-id'))).show();

                        cem[0].scrollTop = 0;
                    }
                    return false;
                }).eq(0).click();
            });
        }

        var tabData = [];
        var weui_tab = $('.weui_tab_bd', root)
        var tabbar = $('.weui_tabbar', root)
            .on('click', 'a.weui_tabbar_item', function (e, auto) {
                var me = $(this);
                var index = parseInt(me.attr('data-index')) || 0;
                var k = tabData[index];
                var Isgo = false;
                switch (k.key) {
                    case 'Cart':
                        UMC.UI.Command('Schedule', 'Cart')
                        return false;
                    case 'Click':
                        $.Click(k.click);
                        return false;
                }
                me.addClass('weui_bar_item_on').siblings('a').removeClass('weui_bar_item_on');


                var body = weui_tab.children('div').eq(index);
                body.css('display', 'flex').siblings('div').hide();
                body_item_init(body, tabData[index]);
                return false;
            });

        UMC.UI.Command("UI", 'App', "json", function (xhr) {

            tabData = xhr.footBar;
            tabbar.format(tabData, true)
            weui_tab.format(tabData, true);
            tabbar.find('a').each(function (i) {
                var d = tabData[i];
                var m = $(this).attr('data-index', i + '');
                if (m.attr('data-key') == 'Cart') {
                    m.addClass('wdk-cart-badge');
                }
                if (d.max) {
                    m.addClass('wdk-max-bar')
                }
            }).eq(0).click(true);
        });

        UMC.UI.On('Change', function (e, v) {
            tabbar.find('.wdk-cart-badge').attr('data-badge', parseInt(v.Quantity) || false);
        });

    });



})(WDK);