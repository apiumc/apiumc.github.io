
(function ($) {
    $.UI.Ver = 'Sub'

    $.UI.EventUI = 'section.app-main';

    function subNav(t, root) {
        var keys = [];
        var emKeys = t.b.find('div[data-key]').each(function () {
            var m = $(this);
            keys.push({ index: m.attr('data-key'), text: m.text() });
        });
        if (keys.length == 0) {
            var ps = [];
            t.b.find('div[style].wdk-cms-text').each(function () {
                var fs = parseInt(this.style['font-size'] || 0) || 0;
                if (fs > 18) {
                    if (fs > 26) {
                        fs = 26;
                    }
                    ps.push(this);
                    keys.push({ index: parseInt((26 - fs) / 2) + 1, text: $(this).text() });
                }
            });
            emKeys = new $(ps);
        }
        var navs = root.find('#nav').format(keys, {
            value: x => {
                return (parseInt(x.index) || 0) * 10 + 'px'
            }
        }, true).find('.wdk-subject-nav-item')
            .click(function () {
                var ofset = emKeys.eq(parseInt($(this).attr('data-index'))).offset();
                var top = ofset.top - con.top;
                var stop = t.r[0].scrollTop + top + 20;
                var sctop = t.r[0].scrollTop;
                var num = (stop - sctop) / 30;
                function run() {
                    sctop = sctop + num;
                    if (num > 0) {
                        if (sctop >= stop) {
                            sctop = stop
                        } else {
                            requestAnimationFrame(run);
                        }
                    } else {

                        if (sctop <= stop) {
                            sctop = stop
                        } else {
                            requestAnimationFrame(run);
                        }
                    }

                    t.r[0].scrollTop = sctop;
                }
                run();

            }).each(function (i) {
                $(this).attr('data-index', i + '');
            });
        if (keys.length > 0) {
            var con = t.r.offset();
            t.r.on('scroll', function () {
                var index = -1;
                emKeys.each(function (i) {
                    var me = $(this)
                    var m = me.offset();
                    if (m.top - con.top < 0) {
                        index = i;
                    }
                });
                navs.cls('is-active', 0)
                if (index > -1) {
                    navs.eq(index).cls('is-active', 1);
                }
            });
        }
    }

    var navBar = {}
    $.tpl('sub', 'subject/subject', function (root) {
        var view = root.find('#view');
        var t = new WDK.UI.Pager(view);
        t.model = "Subject";
        t.cmd = 'UIMin'
        root.on('hash', function (e, v) {
            if (v.key) {
                t.search = { Id: v.key };
                WDK.UI.Command(t.model, t.cmd, WDK.extend({
                    limit: 30
                }, t.search), function (xhr) {
                    root.attr('data-id', t.search.Id);
                    t.b.html('');
                    t.dataSource(xhr);
                    $.UI.On('Subject.Show', t.search);

                    subNav(t, root);
                    requestAnimationFrame(function () {
                        $.UI.On('Subject.Comments.View', root);
                    })
                });

            }
        }).on('active', function () {
            if (root.attr('data-id'))
                $.UI.On('Subject.Show', { Id: root.attr('data-id') });
        });

    }).tpl('item', 'subject/item', function (root) {
        root.find('.umc-toc-nav').click('.umc-toc-nav-title', function () {
            var m = $(this).parent();
            m.cls('is-closed', !m.is('.is-closed'));

        })

        root.on('hash', function (e, v) {
            if (v.key) {
                WDK.UI.Command('Subject', 'Item', v.key, function (xhr) {
                    $('.umc-toc-caption', root).text(xhr.caption);
                    root.find('.umc-toc-users').format(xhr.users, true);
                    var htmls = [];
                    var keys = [];

                    var clength = navBar.code.length + 1;
                    for (var i = 0; i < xhr.data.length; i++) {
                        var it = xhr.data[i];
                        keys.push(it.text);
                        htmls.push('<li>', '<div class="umc-toc-nav-title"><i class="umc-toc-nav-arrow"></i>', it.text, '</div>', '<ul class="umc-toc-nav-items">')
                        htmls.push($.format('<li class="umc-toc-nav-item"><span class="umc-toc-nav-left"><a ui-spa href="{Path}">{text}<small>{state}</small></a></span><span class="umc-toc-nav-right"> <a data-id="{id}" >{code}</a><em></em></span></li>', it.subs || [], {
                            Path: function (x) {
                                keys.push(x.text);
                                return $.SPA + x.path.substring(clength);
                            }
                        }), '</ul></li>');

                    };
                    root.find('.umc-toc-nav>ul').html(htmls.join(''));
                    root.find('.umc-toc-users-sum span').text(xhr.users.length);

                });

            }
        })
    })


    UMC(function ($) {
        var app = $('section.app-main');

        $.UI.On('UI.Push', function (e, xhr) {
            app.children('div.ui').cls('ui', 0).remove().on('backstage');
            app.append(xhr.root.cls('ui', 1));
            xhr.root.on('active');
            var ocls = app.attr('app-cls') || app.attr('append-cls');

            var cls = xhr.root.attr('app-cls');
            app.attr('app-cls', cls);
            app.parent('#app').cls('hideSidebar', xhr.root.is('div[hidesidebar]'))
                .cls('hideScrollbar', xhr.root.is('div[hidescrollbar]'));

            $(document.body).cls(ocls || '', 0).cls(cls || '', 1);

        });

        var menubar = $('#menubar');
        menubar.parent().click('a', function () {
            var m = $(this);
            $('li.is-active', menubar.parent()).cls('is-active', false);
            $('.el-submenu__title', menubar.parent()).cls('is-active', false);
            m.parent('li').cls('is-active', true).parent().siblings('.el-submenu__title').cls('is-active', true).parent()
                .cls('is-opened', 1);
            if (m.is('a[data-id]')) {
                var href = m.attr('href');
                var skey = href;
                var key = location.pathname + location.search;
                if (key != skey) {
                    history.pushState(null, null, skey);
                }
                $(window).on('page', 'sub/' + m.attr('data-id'), '');
                return false;
            }


        }).click('.el-submenu__title', function () {
            var m = $(this).parent();
            m.cls('is-opened', !m.is('.is-opened'));
            return false;
        });
        $.UI.On('Subject.Comments.View', function (e, em) {
            var id = em.attr('data-id');
            var before = false;
            var next = false;
            var IsOk = false

            menubar.find('.el-menu-item a').each(function () {
                var me = $(this);
                if (IsOk) {
                    next = me
                    return false;
                }
                else if (me.attr('data-id') == id) {
                    IsOk = true;
                } else {
                    before = me;
                }

            });
            var subNav = $({ tag: 'div', cls: 'umc-subject-footer' });
            var left = $({ tag: 'a', cls: 'umc-subject-left' }).appendTo(subNav);
            var right = $({ tag: 'a', cls: 'umc-subject-right' }).appendTo(subNav);

            left.attr('href', before ? before.attr('href') : 0).attr('ui-spa', before ? '1' : '')
                .text(before ? before.text() : '无');
            right.attr('href', next ? next.attr('href') : 0).attr('ui-spa', next ? '1' : '')
                .text(next ? next.text() : '无');
            em.find('.umc-subject-footer').remove();
            em.find('section>.weui_cells').eq(0).after(subNav);

        }).On('Portfolio.List', function (e, xhr) {
            if (xhr.code) {
                navBar.code = xhr.code;
                $.UI.ProjectId = xhr.id;
            }
            var clength = navBar.code.length + 1;
            var htmls = [];
            for (var i = 0; i < xhr.subs.length; i++) {
                var it = xhr.subs[i];
                htmls.push('<div class="menu-wrapper">');
                htmls.push('<li class="el-submenu">', '<div class="el-submenu__title" data-id="', it.id, '">', it.text, '<i class="el-submenu__icon-arrow"></i><em></em></div>', '<ul class="el-menu">')
                var subs = it.subs || [];
                if (!subs.length) {
                    subs.push({ create: true });
                }
                htmls.push($.format('<li class="el-menu-item"><a data-id="{id}" ui-spa {url} >{text}</a></li>', it.subs || [], {
                    url: function (x) {
                        return 'href="' + $.SPA + x.path.substring(clength) + '"'

                    }
                }), '</ul></li>');
                htmls.push('</div>');

            };
            menubar.attr('nav', $.SPA + xhr.nav).html(htmls.join(''));
            menubar.find('li').eq(0).addClass('is-opened');

            if (xhr.menu) {
                navBar.menu = xhr.menu;
                var ts = [];
                for (var i = 0; i < xhr.menu.length; i++) {
                    if (!xhr.menu[i].hide) {
                        ts.push({
                            click: {
                                'key': 'Nav',
                                'send': xhr.menu[i].path
                            },
                            text: xhr.menu[i].text
                        });
                    }
                }
                window.top.postMessage(JSON.stringify({
                    type: 'nav',
                    value: ts
                }), "*");
            }

            history.replaceState(null, null, $.SPA + xhr.nav.substring(clength));
            if (xhr.spa) {
                $(window).on('page', 'sub/' + xhr.spa.id, '');
            } else {
                var selectIndex = navBar.selectIndex || 0;
                for (var i = 0; i < navBar.menu.length; i++) {

                    if (navBar.menu[i].path == xhr.nav) {
                        selectIndex = i;

                        window.top.postMessage(JSON.stringify({
                            type: 'page',
                            value: { title: navBar.menu[i].text, search: true }
                        }), "*");
                        break;
                    }
                }
                $(window).on('page', 'item/' + navBar.menu[selectIndex].id, '');
            }


        }).On('Subject.Show', function (e, xhr) {
            $('.el-menu-item a', menubar).each(function () {
                var a = $(this);
                if (a.attr('data-id') == xhr.Id) {
                    if (!a.parent().is('.is-active'))
                        a.click();
                    return false;
                }
            });
            $('.el-submenu__title', menubar).each(function () {
                var a = $(this);
                if (a.attr('data-id') == xhr.Id) {
                    var wrapper = a.parent('.menu-wrapper');
                    wrapper.remove();
                    return false;
                }
            })
        });
        $(document.body).on('UI.Key.Nav', function (e, v) {
            $.UI.Command("Subject", 'PortfolioSub', { Key: v }, function (xhr) {
                $.UI.On('Portfolio.List', xhr)
            });
        })

        $(window).off('popstate').on('popstate', function (e, v) {
            var pathKey = location.pathname;
            var IsOk = false;
            menubar.parent().find('a[href]').each(function () {
                var m = $(this);
                if (m.attr('href') == pathKey) {
                    m.click();
                    IsOk = true;
                    return false;
                }
            });
            if (IsOk == false) {
                var key = pathKey.substring($.SPA.length);
                var cl = navBar.code.length + 1;
                for (var i = 0; i < navBar.menu.length; i++) {
                    var m = navBar.menu[i];
                    if (m.path.substring(cl) == key) {
                        $.UI.Command("Subject", 'PortfolioSub', { Key: m.path }, function (xhr) {
                            $.UI.On('Portfolio.List', xhr)
                        });
                        return true;
                    }
                }
            }
            return IsOk;

        }).on('message', function (e) {
            var data = {};
            try {
                data = JSON.parse(e.data);
            } catch (c) {
                return;
            }
            switch (data.type) {
                case 'searchValue':
                    $.UI.Command('Subject', 'Keyword', { Project: $.UI.ProjectId, Keyword: data.data }, function (xhr) {
                        var ts = [];
                        for (var i = 0; i < xhr.length; i++) {
                            var v = xhr[i];
                            ts.push({
                                text: v.text,
                                click: {
                                    'key': 'Nav',
                                    'send': v.path
                                },
                            })
                        }
                        window.top.postMessage(JSON.stringify({
                            type: 'search',
                            value: ts
                        }), "*");
                    });
                    break;
                case 'search':
                    break;
                case 'event':
                    break;
                case 'click':
                    $.Click(data.data);
                    break;
            }
        });

    });


})(UMC);