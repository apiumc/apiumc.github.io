($ => {
    WDK.page('builder', '生成移动应用', false, function (root) {
        // root.on('menu', [{ text: '主页设计', click: { model: 'Design', cmd: 'Page' } }, { text: '增加Bar', click: { model: 'UI', cmd: 'App', send: "News" } }])
        root.find('.weui_uploader_input').change(function () {
            if (this.files.length > 0) {
                var me = $(this);
                var key = me.parent().attr('data-key');
                let file = this.files[0];
                let fileReader = new FileReader();
                fileReader.readAsDataURL(file); //根据图片路径读取图片
                fileReader.onload = function (e) {
                    let base64 = this.result;
                    let img = new Image();
                    img.src = base64;
                    img.onload = function () {
                        switch (key) {
                            case 'IconSrc':
                                if (img.naturalWidth == 512 && img.naturalHeight == 512) {
                                    WDK.uploader(file, src => {
                                        WDK.UI.Command("UI", 'App', { Key: key, Value: src.src });
                                    });

                                    me.parent().css('background-image', ['url(', base64, ')'].join(''));
                                } else {
                                    $.UI.Msg('图标大小512*512')
                                }
                                break;
                            case 'BgSrc':
                                if (img.naturalWidth == 1080 && img.naturalHeight == 1920) {

                                    WDK.uploader(file, src => {
                                        WDK.UI.Command("UI", 'App', { Key: key, Value: src.src });
                                    });
                                    me.parent().css('background-image', ['url(', base64, ')'].join(''));
                                } else {
                                    $.UI.Msg('背景大小1080*1920')
                                }
                                break;
                        }
                    }
                }
            }

        });
        root.on('event', function (e, key) {
            switch (key) {
                case 'Builder':
                    WDK.UI.Command("UI", 'App', "Builder", function (cfg) {
                        var DataKey = cfg.DataKey;
                        WDK.api('Platform', 'Builder', { Id: DataKey.host + '/' + DataKey.root });
                    });

                    break;
            }
        })
        $.link('css/umc.builder.css')
            .wait();

        function Tabs(dem, xhr) {
            dem.html($('#tabs', root).text());
            if (xhr.title) {
                WDK.UI.Pager.Title(xhr.title, $('header', dem));
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
                    var pager = new WDK.UI.Pager(body);
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
                    var pager = new WDK.UI.Pager(dom);
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
                var pager = new WDK.UI.Pager(dom);
                pager.dataSource(xhr);
            }
        }

        function body_item_init(dom, data) {
            if (!dom.attr('data-init')) {
                dom.attr('data-init', "Y");
                switch (data.key) {
                    case 'Home':
                        WDK.UI.Command('UI', 'Home', xhr => TabSocure(xhr, dom));
                        break;
                    case 'Tabs':
                        WDK.UI.Command(data.model, data.cmd, xhr => TabSocure(xhr, dom));
                        break;
                    case 'Category':
                        categoryInit(dom);
                        break;

                    case "Subject":
                        dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')

                        var pager = new WDK.UI.Pager(dom);
                        pager.model = "Subject";
                        pager.cmd = 'UI';
                        pager.query();
                        break;
                    case "Order":
                        dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')

                        var pager = new WDK.UI.Pager(dom);
                        pager.model = "Member";
                        pager.cmd = 'UI';
                        pager.query();
                        break;
                    case 'Pager':
                        dom.html('<header class="wdk-header header"></header><section style="flex: 1; overflow: auto"></section>')

                        var pager = new WDK.UI.Pager(dom);
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
            dom.html($('#Category', root).text());
            $('#nav', dom).on('click', 'a.weui_cell', function () {
                var m = $(this);
                if (m.is('.active') == false) {
                    m.addClass('active').siblings('.weui_cell').removeClass('active');

                    var t = $('#nav-items', dom).children('div').hide().eq(parseInt(m.attr('data-id'))).show();

                    t[0].scrollTop = 0;
                }
                return false;
            });
            WDK.UI.Command("Product", 'Category', function (xhr) {
                var cateHTML = $('#singleCategory', root).text();
                var nav = $('#nav', dom);
                var cem = $('#nav-items', dom);

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
                                    return WDK.UI.Format(c.click);
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
                                        return WDK.UI.Format(c.click);
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
                    case 'Click':
                        Isgo = auto ? false : true;
                        break;
                }
                if (me.is('.weui_bar_item_on') || Isgo) {
                    WDK.UI.Sheet('编辑', [{
                        Text: '设置', Value: 'Setting'
                    }, {
                        Text: '移除', Value: 'Del'
                    }],
                        v => WDK.UI.Command("UI", 'App', { Key: v.Value, Index: index }))

                } else {
                    me.addClass('weui_bar_item_on').siblings('a').removeClass('weui_bar_item_on');
                    // siblings

                    var body = weui_tab.children('div').eq(index);
                    body.css('display', 'flex').siblings('div').hide();
                    body_item_init(body, tabData[index]);
                    // } else {
                }
                return false;
            });
        root.ui("AppConfig", function (e, xhr) {
            // if (xhr.Config.BgSrc) {
            root.find('.uploadifile li[data-key]').each(function () {
                var me = $(this)
                var vsrc = xhr.Config[me.attr('data-key')];
                if (vsrc)
                    me.css('background-image', ['url(', vsrc, ')'].join(''));

            });
            root.find("#AppName").text(xhr.Config.AppName || '未设置')
            // }
            tabData = xhr.Config.footBar;
            tabbar.format(tabData, true)
            weui_tab.format(tabData, true);
            tabbar.find('a').each(function (i) {
                var d = tabData[i];
                var m = $(this).attr('data-index', i + '');
                if (m.attr('data-key') == 'Cart') {
                    m.attr('href', '/Retail.order')
                    m.addClass('wdk-cart-badge');

                }
                if (d.max) {
                    m.addClass('wdk-max-bar')
                }
            }).eq(0).click(true);
        });
        WDK.UI.Command("UI", 'App', "json", function (xhr) {

            root.ui('AppConfig', { Config: xhr });
        });

        WDK.UI.On('Change', function (e, v) {
            tabbar.find('.wdk-cart-badge').attr('data-badge', parseInt(v.Quantity) || false);
        });
    })
})(WDK)