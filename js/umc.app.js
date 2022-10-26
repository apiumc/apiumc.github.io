
(function ($) {
    function Bridge(win, fn) {
        this.win = win;
        this.call = fn;
    }
    Bridge.prototype.bridge = function (r) {
        var dom = $('#' + this.win);
        if (!dom.length) {
            this.call(r);
        } else {
            var data = r;
            var event = parseInt(r.ClientEvent);
            if (!isNaN(event)) {
                data = {
                    ClientEvent: 0,
                    Headers: {}
                }
                if ((event & 64) > 0) {
                    var dataEvent = [];
                    var ps = [].concat((r.Headers || {})["DataEvent"]);
                    for (var i = 0; i < ps.length; i++) {
                        var p = ps[i];
                        var value = $.extend({}, p);
                        dataEvent.push(value);
                        switch (p.type) {
                            case "OpenUrl":
                            case "Wxpay":
                            case "Click":
                                delete p.type;
                                break;
                            case 'Pager':
                                dataEvent.pop()
                                break;
                        }
                    }
                    if (dataEvent.length > 0) {
                        data.ClientEvent = 64;
                        data.Headers.DataEvent = dataEvent;
                    }
                    r.Scope = this.key || 'self';
                }

                if ((event & 1024) > 0) {
                    data.ClientEvent = data.ClientEvent | 1024;
                    data.Ticket = r.Ticket;
                }

            } else if ($.isfn(this.call)) {
                this.call(r);
                return;
            }
            $.UI.Ready(r);
            dom.find('iframe')[0].contentWindow.postMessage(JSON.stringify({
                type: 'umc',
                data: data,
                key: this.key || ''
            }), "*");


        }

        var index = this.win;
        requestAnimationFrame(function () {
            $('div[ui].wdk-dialog,div.weui_dialog_confirm,div.weui_actionsheet').each(function () {
                var m = $(this);
                if (!m.attr('win-id')) {
                    m.attr('win-id', index)
                }
            })
        })
    }
    UMC.UI.On('XHR.Bridge', function (e, xhr, fn) {
        var form = $('div[ui].wdk-dialog,div.weui_dialog_confirm,div.weui_actionsheet').last().attr('win-id') || 'self';
        xhr.onload = function () {
            new Bridge(form, fn).bridge(JSON.parse(xhr.responseText));
        }
        return false;
    })

    document.title = UMC.UI.Config().title || 'API UMC';
    $.Src = '/UMC.UI/';

    $.UI.On("UI.Show", function (e, v) {
        var doc = WDK(document.createElement("div")).addClass('weui_mask')
            .click(function () {
                WDK('div[ui].wdk-dialog').addClass('right').removeClass('ui');
            })
            .appendTo(document.body);
        v.on('close', function () {
            doc.remove();
        });
    });
    $.UI.EventUI = 'section.app-main';
    $.UI.Off('Prompt')
        .On("Prompt", function (e, p) {
            var msg = $('.el-message').removeClass('el-message-fade-leave-active');
            msg.find('.el-message__content').html(p.Text);
            setTimeout(function () {
                msg.addClass('el-message-fade-leave-active');
            }, 3000);
        });

    $.UI.On('UI.Push', function (e, xhr) {
        $('.navbar #header-search').cls('hide', xhr.search == false);
        var app = $('section.app-main');
        var last = app.children('div.ui').cls('ui', 0);
        if (last.on('backstage') !== false)
            last.remove();
        if (xhr.root.cls('ui', 1).parent()[0] != app[0]) {
            xhr.root.appendTo(app);
        }
        xhr.root.on('active');
        var ocls = app.attr('app-cls') || app.attr('append-cls');
        var cls = xhr.root.attr('app-cls');
        app.attr('app-cls', cls);
        app.parent('#app').cls('hideSidebar', xhr.root.is('div[hidesidebar]'))
            .cls('hideScrollbar', xhr.root.is('div[hidescrollbar]'));

        $(document.body).cls(ocls || '', 0).cls(cls || '', 1);

        $(window).on('title', xhr.title).on("menu", xhr.menu || []);
    }).On('Cashier', function (e, v) {
        $('.sidebar-logo-container a')
            .attr('data-name', v.Alias.substr(0, 1)).find('img').attr('src', v.Src);
        $('.umc-logo-name').text(v.Alias);

    }).On('Close', function () {
        location.href = '/UMC.Reset'
    });

    $(function ($) {


        var app = $('section.app-main');
        function itemClick() {
            var me = $(this);
            var key = me.attr('key');
            if (key) {
                app.children('div[ui].ui').last().on('event', key);
            } else {
                var click = me.attr('click-data');
                if (click) {
                    $.Click(JSON.parse(click));
                }
            }
        }
        var menu = $('.navbar #menu').click('a', itemClick);
        var title = $('#breadcrumb-container').click('a', itemClick);
        var search = $('#header-search');
        search.siblings('ul').click('li a', itemClick);
        $(window).on('title', function (e, vs) {
            title.children().remove();
            if (Array.isArray(vs)) {
                for (var i = 0; i < vs.length; i++) {
                    var v = vs[i];
                    if (typeof v == 'object') {
                        var a = $(document.createElement('a')).text(v.text).attr('key', v.key || false);
                        v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                        v.icon ? a.attr('data-icon', v.icon) : 0
                        a.appendTo(title);
                    } else {
                        $(document.createElement('a')).text(v + '').appendTo(title);
                    }
                }

            } else {
                $(document.createElement('span')).text(vs || '').appendTo(title);
            }
        }).on('menu', function (e, vs) {
            menu.children().remove();
            if (Array.isArray(vs)) {
                for (var i = 0; i < vs.length; i++) {
                    var v = vs[i];
                    if (typeof v == 'object') {
                        var a = $(document.createElement('a')).text(v.text || '').attr('key', v.key || false);
                        v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                        v.icon ? a.attr('data-icon', v.icon) : 0
                        a.appendTo(menu);
                    }
                }
            }
        }).on('select', function (e, vs) {
            var m = search;
            var menu = m.siblings('*[role=menu]');
            if (m.is('.is-active') == false) {

                var rect = search[0].getBoundingClientRect();
                m.cls('is-active', 1);
                var mask = $(document.createElement('div')).addClass('weui_mask')
                    .click(function () {
                        $(this).remove();
                        m.cls('is-active', 0);
                        menu.css('transform', 'translateX(-1000px)');
                    }).css({
                        opacity: '0',
                        'z-index': '0'
                    }).appendTo(document.body);

                menu.css('transform', ['translate(', (rect.left), 'px,', (rect.top + rect.height + 5), 'px)'].join(''))
                    .click(function () {
                        mask.click();
                    }, 1);
            }

            menu.children().remove();

            if (vs.length == 0) {
                $(document.createElement('li')).addClass('umc-search-empty').appendTo(menu)
            } else {
                for (var i = 0; i < vs.length; i++) {
                    var v = vs[i];
                    if (typeof v == 'object') {
                        var a = $(document.createElement('a')).text(v.text || '').attr('key', v.key || false);
                        v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                        v.icon ? a.attr('data-icon', v.icon) : 0
                        $(document.createElement('li')).append(a).appendTo(menu);
                    }
                }
            }


        }).on('message', function (e) {
            var win = e.source;
            var dom = false;
            $('.el-link iframe').each(function () {
                if (this.contentWindow == win) {
                    dom = $(this).parent('.el-link');
                    return false;
                }
            });
            if (dom === false) {
                return;
            }

            var data = JSON.parse(e.data);

            switch (data.type) {
                case 'close':
                    dom.find('a.umc-window-btn-close').click();
                    break;
                case 'open':
                    var value = data.value;
                    value.id = new Date().getTime() / 1000;
                    value.url = value.src;
                    delete value.src;
                    UMC.NAV[value.id] = value;
                    $.nav('Link/' + value.id);
                    break;
                case 'search':
                case 'title':
                case 'menu':
                    dom.on(data.type, data.value);
                    break;
                case "event":
                    dom.ui(data.value, function (e, v, r) {
                        if (r.Scope == 'self') {
                            $(this).find('iframe')[0].contentWindow.postMessage(JSON.stringify({
                                type: 'event',
                                data: v
                            }), "*");
                        }
                    });
                    break;
                case 'msg':
                    $.UI.Msg(data.value);
                    break;
                case 'umc':
                    var bridge = new Bridge(dom.attr('id'));
                    bridge.key = data.key;
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        bridge.bridge(JSON.parse(xhr.responseText));
                    };
                    xhr.open('POST', UMC.UI.Config().posurl, true);
                    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhr.send(data.value.replace(/(^\&*)/g, ""));
                    break;
                default:
                    break;
            }
        }).on('fullscreenchange,webkitfullscreenchange,mozfullscreenchange', function () {
            $(document.body).cls('umc-fullscreen', document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen);
        });


        $('#hamburger-container').click(function () {
            $(document.body).children('#app').cls('hideSidebar');
        });

        $('#menubar').click('a', function (e) {
            var m = $(this);
            $('#menubar li.is-active').cls('is-active', false);
            m.parent('li').cls('is-active', true);
        }).click('.el-submenu__title', function () {
            var m = $(this).parent();
            m.cls('is-opened', !m.is('.is-opened'));

        });
        search.find('form').submit(function () {
            var input = $(this).find('input');
            var value = input.val();
            var root = $('section.app-main>div[ui].ui');
            root.on('search', value, input) !== false ?
                root.find('.pagination-container')
                    .on('search', value) : 0;
            return false;
        }).find('input').on('input', function () {
            var input = $(this);
            var value = input.val();
            if (!value) {
                search.siblings('*[role=menu]').click();
            } else {
                var root = $('section.app-main>div[ui].ui');
                root.on('searchValue', value, input);
            }

        })




        $.UI.Command("Account", "Check", "Info", function (xhr) {
            $.UI.Device = xhr.Device;
            if (xhr.IsCashier) {
                $.UI.On('Cashier', xhr);
            } else {
                $.UI.On('Close');//, location.href = '/UMC.Reset'
            }
        });

    });



    UMC.SPA = '/UMC/';
    UMC.NAV = {};
    $.tpl('Link', 'link/link', function (root) {
        root.on('hash', function (e, v) {
            var m = UMC.NAV[parseInt(v.key)];
            if (m) {
                root.find('iframe').attr('src', m.href).attr('id', v.key);
                root.on('title', m.text);
            }
        });
        root.on('backstage', function () {
            return false;
        })
    });
    $(function () {
        UMC(document.body).on('UI.Key.Url', function (e, v) {
            location.href = v;
        })



        $.page('debug', 'API UMC', false);


        WDK.UI.On('Cashier', function () {
            $.UI.Command('Account', 'Menu', UMC.UI.Config().site || '0', function (xhr) {
                var navs = [];
                var pM = xhr.menu;
                for (var i = 0; i < pM.length; i++) {
                    var it = pM[i];
                    var nav = it;
                    var menu = nav.menu || [];
                    if (menu.length > 0) {
                        var cnavs = [];
                        for (var m = 0; m < menu.length; m++) {
                            var c = menu[m];
                            if (!c.menu) {
                                switch (c.url.charAt(0)) {
                                    case '#':
                                        var k = c.url.substring(1);
                                        c.spa = 'ui-spa';
                                        c.url = $.SPA + k;
                                        var key = k.substring(0, k.indexOf('/'));
                                        $.page(key ? key : k);

                                        break;
                                    default:
                                        if (c.target) {
                                            c.target = 'target="' + c.target + '"'
                                        } else {
                                            c.href = it.url;
                                            c.spa = 'ui-spa';
                                            c.url = $.SPA + 'Link/' + c.id;
                                            UMC.NAV[it.id] = it;
                                        }
                                        break;
                                }
                                cnavs.push(c);
                            }
                        }
                        if (cnavs.length > 0) {
                            nav.menu = cnavs;
                            navs.push(nav);
                        }
                    } else {
                        navs.push(nav);
                        switch (it.url.charAt(0)) {
                            case '#':
                                var k = it.url.substring(1);
                                var key = k.substring(0, k.indexOf('/'));
                                $.page(key ? key : k);

                                it.spa = 'ui-spa';
                                it.url = $.SPA + k;
                                break;
                            default:
                                if (it.target) {
                                    it.target = 'target="' + it.target + '"'
                                } else {
                                    it.href = it.url;
                                    it.spa = 'ui-spa';
                                    it.url = $.SPA + 'Link/' + it.id;
                                    UMC.NAV[it.id] = it;
                                }
                                break;
                        }

                    }
                };

                var htmls = [];
                for (var i = 0; i < navs.length; i++) {
                    var it = navs[i];
                    var menu = it.menu || [];
                    if (menu.length) {
                        htmls.push('<li  class="el-submenu">', '<div class="el-submenu__title" data-icon="', it.icon || '\uf02d', '" >', it.text, '<i class="el-submenu__icon-arrow"></i></div>', '<ul class="el-menu">')

                        htmls.push($.format('<li class="el-menu-item"><a {spa}  {target} href="{url}">{text}</a></li>', menu), '</ul></li>');
                    } else {
                        htmls.push('<li class="el-menu-item" data-icon="', it.icon || '\uf02d', '"><a ', it.spa, ' ', it.target, ' href="', it.url, '">', it.text, '</a></li>');
                    }
                }
                var home = xhr.home || 'debug';

                UMC.shift('main', home);
                var pathname = location.pathname;
                if (pathname.length <= $.SPA.length) {
                    pathname = $.SPA + home;
                }

                $(window).on('popstate');
                $('#menubar').append(htmls.join('')).find('a[ui-spa]').each(function () {
                    var m = $(this);
                    if (m.attr('href') == pathname) {
                        var elmenu = m.parent().addClass('is-active').parent('ul').parent();
                        elmenu.cls('is-opened', elmenu.is('.el-submenu'));

                        return false;
                    }
                });

            });
        });
    });

})(UMC);