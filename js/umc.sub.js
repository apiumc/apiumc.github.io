
(function ($) {
    $.UI.Ver = 'Sub'
    $.UI.EventUI = 'section.app-main';
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

    $.UI.Off('Prompt')
        .On("Prompt", function (e, p) {
            var msg = $('.el-message').removeClass('el-message-fade-leave-active');
            msg.find('.el-message__content').html(p.Text);
            setTimeout(function () {
                msg.addClass('el-message-fade-leave-active');
            }, 3000);
        }).On("UI.Publish", function (e, title, key, desc, t) {

            var ag = t || {};
            var body = $(document.body.cloneNode(true));
            body.find('div[ui]').attr('ui', false).addClass('hide');
            body.find('#app').cls('hideSidebar', true)

            var pathname = location.pathname.substring(1);
            ag.Key = pathname || 'sub.html';
            var json = JSON.stringify({ title: title, key: key, desc: desc, html: body.html() });
            UMC.uploader(new File([json], 'a.json', { type: 'text/json' }),
                function () {
                    $.UI.API('Subject', 'Publish', ag);
                }, pathname, true);
        })

    $(function ($) {
        $.page('subject');
        $.page('download');

        var navbar = $('.navbar');
        (function () {
            var app = $('section.app-main');

            navbar.find('.umc-sidebar-menu').click(function () {
                navbar.cls('show-menu');
            });
            navbar.find('.umc-sidebar-back').click(function () {
                history.back();
            });

            $.UI.On("CMS.Link", function (e, v) {
                if (v.spa) {
                    var href = $.SPA + v.spa.path;
                    return [' ui-spa', ' href="', href, '" data-id="', v.spa.id, '"'].join('');
                } else if (v['sub-id']) {
                    return [' ui-spa', ' href="', $.SPA, 'Editer/', v['sub-id'], '"'].join('');
                }

            }).On('Login', function () {
                $(window).on('page', 'subject/login', '');
            }).On('Subject.Editer.Path', function (e, p) {
                if (!p) {
                    var appendCls = app.children('div.ui').attr('append-cls')
                    app.parent('#app').cls('hideSidebar', 1);
                    if (appendCls) {
                        $(document.body).cls(appendCls, 1);
                    }

                }
            }).On('UI.Push', function (e, xhr) {
                navbar.cls('show-menu', 0);

                app.children('div.ui').cls('ui', 0).remove().on('backstage');
                app.append(xhr.root.cls('ui', 1));
                xhr.root.on('active');
                var ocls = app.attr('app-cls') || app.attr('append-cls');

                var cls = xhr.root.attr('app-cls');
                app.attr('app-cls', cls);
                app.parent('#app').cls('hideSidebar', xhr.root.is('div[hidesidebar]'))
                    .cls('hideScrollbar', xhr.root.is('div[hidescrollbar]'));

                $(document.body).cls(ocls || '', 0).cls(cls || '', 1);

                $(window).on('title', xhr.title).on("menu", xhr.menu || []);
            });
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
            var menu = $('#menu', navbar).click('a', itemClick);
            var title = $('#breadcrumb-container').click('a', itemClick);

            function setValue(dom, vs, istext) {
                dom.children().remove();
                if (Array.isArray(vs)) {
                    for (var i = 0; i < vs.length; i++) {
                        var v = vs[i];
                        if (typeof v == 'object') {
                            var a = $(document.createElement('a')).text(v.text).attr('key', v.key || false);
                            v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                            v.icon ? a.attr('data-icon', v.icon) : 0
                            a.appendTo(dom);
                        } else if (istext) {
                            $(document.createElement('a')).text(v + '').appendTo(dom);
                        }
                    }

                } else if (istext) {
                    $(document.createElement('span')).text(vs).appendTo(dom);
                }
            }
            $(window).on('title', function (e, vs) {
                setValue(title, vs, e.type == 'title');
            }).on('menu', function (e, vs) {
                setValue(menu, vs, false);
            });
        })();
        var menubar = $('#menubar').click('a[sub-id]', function (e) {
            UMC.UI.Command('Subject', 'News', $(this).attr('sub-id'))
            return false;

        }).click('.el-submenu__title em', function () {
            var me = $(this).parent();
            if (me.is('.editer')) {
                $.UI.Command('Subject', 'PortfolioDel', me.attr('data-id'));
            } else {
                me.cls('editer', 1);
                $(document.createElement('input')).val(me.text()).appendTo(me).focus()
                    .blur(function () {
                        $(this).remove();
                        setTimeout(function () {
                            me.cls('editer', 0);
                        }, 500);
                    }).on('keydown', function (e) {
                        switch (e.key) {
                            case 'Enter':
                                this.blur();
                                break;
                        }

                    }).change(function () {
                        $.UI.API('Subject', 'Portfolio', {
                            KEY_DIALOG_ID: 'Caption', Key: 'EDITER', 'Caption': this.value,
                            Id: me.attr('data-id')
                        });
                        me.html(this.value + '<i class="el-submenu__icon-arrow"></i><em></em>');

                    })
            }
            return false;

        });
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
                $(window).on('page', 'subject/' + m.attr('data-id'), '');
                return false;
            }


        }).click('.el-submenu__title', function () {
            var m = $(this).parent();
            m.cls('is-opened', !m.is('.is-opened'));
            return false;
        });
        $.UI.On('Page.Menu', function (e, Menu) {
            var htmls = [];
            for (var i = 0; i < Menu.length; i++) {
                var it = Menu[i];
                var menu = it.menu || [];
                htmls.push('<div class="menu-wrapper">');
                if (menu.length) {
                    htmls.push('<li  class="el-submenu">', '<div class="el-submenu__title" data-icon="', it.icon || '\uf02d', '" >', it.title, '<i class="el-submenu__icon-arrow"></i></div>', '<ul class="el-menu">')

                    htmls.push($.format('<li class="el-menu-item"><a ui-spa href="/{Url}">{title}</a></li>', menu, {
                        Url: function (v) {
                            return [$.UI.SPAPfx, v.url.substring(1)].join('')
                        }
                    }), '</ul></li>');
                } else {
                    htmls.push('<li class="el-menu-item" data-icon="', it.icon || '\uf02d', '"><a ui-spa href="', $.UI.SPAPfx, it.url.substring(1), '">', it.title, '</a></li>');
                }
                htmls.push('</div>');
            }

            menubar.siblings('div').html(htmls.join(''));
        }).On('Subject.Path', function (e, v) {
            var skey = $.SPA + v.Path;
            var key = location.pathname + location.search;
            if (key != skey) {
                history.pushState(null, null, skey);
                requestAnimationFrame(function () { $(window).on('popstate') });
            }
        }).On('Subject.Comments.View', function (e, em) {
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
            var subNav = $(document.createElement('div')).cls('umc-subject-footer', 1);
            var left = $(document.createElement("a")).cls('umc-subject-left').appendTo(subNav);
            var right = $(document.createElement("a")).cls('umc-subject-right').appendTo(subNav);

            left.attr('href', before ? before.attr('href') : 0).attr('ui-spa', before ? '1' : '')
                .text(before ? before.text() : '无');
            right.attr('href', next ? next.attr('href') : 0).attr('ui-spa', next ? '1' : '')
                .text(next ? next.text() : '无');
            em.find('.umc-subject-footer').remove();
            em.find('#Subject').after(subNav);

        }).On('Portfolio.List', function (e, xhr) {
            var htmls = [];
            xhr.subs.forEach(function (it) {
                htmls.push('<div class="menu-wrapper">');
                htmls.push('<li  class="el-submenu">', '<div class="el-submenu__title"  data-id="', it.id, '">', it.text, '<i class="el-submenu__icon-arrow"></i><em></em></div>', '<ul class="el-menu">')
                var subs = it.subs || [];
                if (!subs.length) {
                    subs.push({ create: true });
                }
                htmls.push($.format('<li class="el-menu-item"><a data-id="{id}" ui-spa {url} >{text}</a></li>', it.subs || [], {
                    url: function (x) {
                        if (x.create) {
                            return 'sub-id="' + it.id + '"'
                        } else {
                            return 'href="' + $.SPA + x.path + '"'
                        }
                    }
                }), '</ul></li>');
                htmls.push('</div>');

            });
            menubar.attr('nav', $.SPA + xhr.nav).html(htmls.join('')).find('ul').each(function () {
                $.UI.On('Subject.Sequence', this);
            });
            menubar.find('li').eq(0).addClass('is-opened');
            if (xhr.spa) {

                $(window).on('page', 'subject/' + xhr.spa.id, '');
            }


        }).On('Subject.Sequence', function (x, el) {
            if ($(document.body).is('.EditerItem,.EditerDoc,.EditerAll'))
                Sortable.create(el, {
                    animation: 150,
                    group: 'shared',
                    onEnd: function (evt) {
                        var ids = [];
                        var fm = $(evt.to);
                        fm.find('a').each(function () {
                            var id = $(this).attr('data-id');
                            id ? ids.push(id) : 0;
                        })
                        $.UI.API("Subject", "Sequence", { Id: ids.join(','), Portfolio: fm.siblings('.el-submenu__title').attr('data-id') });
                    }
                });

        });

        var menuSort = Sortable.create(document.getElementById('menubar'), {
            animation: 150, //动画参数
            draggable: 'div.menu-wrapper', //group: 'shared',
            onEnd: function (evt) {
                if ($(document.body).is('.EditerItem,.EditerDoc,.EditerAll')) {
                    var ids = [];
                    $(evt.from).find('.el-submenu__title').each(function () {
                        ids.push($(this).attr('data-id'));
                    })
                    $.UI.API("Subject", "PortfolioSeq", ids.join(','));
                }
            }
        });

        menuSort.option('disabled', true);
        var team = $('#team');
        var nav = $('#nav').click('a', function () {
            var m = $(this);
            if (!m.parent().is('.is-active')) {
                $.UI.Command("Subject", 'PortfolioSub', m.attr('data-id'), function (xhr) {
                    $.UI.On('Portfolio.List', xhr)
                });
                m.parent().addClass('is-active').siblings().removeClass('is-active');
            }
            var skey = m.attr('href');
            var key = location.pathname + location.search;
            if (key != skey) {
                history.pushState(null, null, skey);
            }
            requestAnimationFrame(function () { $(window).on('page', 'subject/toc/' + m.attr('data-id'), '') });
            return false;
        });

        var navSort = Sortable.create(nav[0], {
            animation: 150, //动画参数
            draggable: '>li',
            onEnd: function (evt) {
                if ($(document.body).is('.EditerItem,.EditerDoc,.EditerAll')) {
                    var ids = [];
                    $(evt.from).find('a').each(function () {
                        ids.push($(this).attr('data-id'));
                    });
                    $.UI.API("Subject", "ProjectItemSeq", ids.join(','));
                }
            }
        });
        navSort.option('disabled', true);
        $(window).off('popstate').on('popstate', function (e, v) {
            var pathKey = location.pathname;
            var pKey = pathKey.substring($.SPA.length) || 'index';
            switch (pKey ) {
                case 'index':
                case 'explore':
                case 'login':
                    $(window).on('page', 'subject/' + pKey, '');
                    return;
                case 'download':
                    $(window).on('page', 'download', '');
                    return;
                case 'dashboard':
                    v ? $(window).on('page', 'subject/self', '') : $.UI.On('Subject.Menu', { code: pKey, type: $.UI.ProjectId ? "self" : 'project' })
                    return;
            }

            if ($.UI.SPAPfx) {
                if ($.UI.SPAPfx.toUpperCase().indexOf(pathKey.toUpperCase()) == 0) {
                    $(window).on('page', 'subject/dynamic', '');
                    return;
                } else if (pathKey.indexOf($.UI.SPAPfx) == 0) {
                    var key = pathKey.substring($.UI.SPAPfx.length);
                    if ($.check(key)) {
                        $(window).on('page', key, location.search.substring(1));
                        return;
                    }
                } else {
                    v ? 0 : $.UI.On('Subject.Menu', { code: pathKey.indexOf($.SPA) == 0 ? pathKey.substring($.SPA.length) : '' });
                    return;
                }
            } else {
                v ? 0 : $.UI.On('Subject.Menu', { code: pathKey.indexOf($.SPA) == 0 ? pathKey.substring($.SPA.length) : '' });

                return;
            }
            var IsOk = false;
            var click = function () {
                var m = $(this);
                if (m.attr('href') == pathKey) {
                    m.click();
                    IsOk = true;
                    return false;
                }
            };
            menubar.parent().find('a[href]').each(click);
            nav.find('a[href]').each(click);

            if (IsOk == false) {
                nav.find('a[href]').each(function () {
                    var m = $(this);
                    if (pathKey.indexOf(m.attr('href')) == 0) {
                        if (!m.parent().is('.is-active')) {
                            $.UI.Command("Subject", 'PortfolioSub', { Key: pathKey.substring($.SPA.length) }, function (xhr) {
                                $.UI.On('Portfolio.List', xhr)
                            });
                            m.parent().addClass('is-active').siblings().removeClass('is-active');
                            IsOk = true;
                            return false;
                        }

                    }
                });
            }
            if (!IsOk) {
                var ps = pathKey.substring($.SPA.length).split('/');
                ps.shift();
                if ($(window).on('page', ps.join('/'), location.search.substring(1)) === false) {
                    if ($.UI.SPAPfx && pathKey.indexOf($.UI.SPAPfx) == 0) {
                        $(window).on('page', 'subject/dynamic', '');
                    }
                }
            }
            return IsOk;

        });
        var active = false
        $.UI.On('Sub.Title.Change', function (e, v) {
            if (active && active.attr('data-id') == v.Id) {
                active.text(v.Title || '请输入标题');
            } else {
                active = false;
                $('.el-menu-item  a', menubar).each(function () {
                    var m = $(this);
                    if (m.attr('data-id') == v.Id) {
                        active = m;
                        return false;
                    }
                })
                active ? active.text(v.Title || '请输入标题') : 0;
            }
        }).On('Subject.Change', function (x, v) {
            $('.el-menu-item  a', menubar).each(function () {
                var m = $(this);
                if (m.attr('data-id') == v.id) {

                    m.attr('href', $.SPA + v.path);
                    return false;
                }
            })
        }).On('Subject.ProjectItem.Del', function (x, xhr) {
            var selectIndex = -1;
            var m = nav.find('a').each(function (i) {
                var a = $(this);
                if (a.attr('data-id') == xhr.id) {
                    selectIndex = i;
                    a.parent().remove();
                    return false;
                }
            });
            m.eq(selectIndex + (m.length - 1 == selectIndex ? -1 : 1)).click();
        }).On('Subject.Del', function (x, xhr) {
            var selectIndex = -1;
            var m = $('.el-menu-item  a', menubar).each(function (i) {
                var a = $(this);
                if (a.attr('data-id') == xhr.Id) {
                    var ap = a.parent().parent();
                    selectIndex = i;
                    a.parent().remove();
                    if (!ap.find('a').length) {
                        ap.append('<li class="el-menu-item"><a sub-id="' + ap.siblings('.el-submenu__title').attr('data-id') + '"></a></li>');
                    }
                    return false;
                }
            });
            if (selectIndex == -1) {
                history.go(-1);
            } else {
                m.eq(selectIndex + (m.length - 1 == selectIndex ? -1 : 1)).click();
            }
        }).On('Subject.Portfolio.New', function (e, xhr) {
            var pid = xhr.Id;
            $('.el-submenu__title', menubar).each(function () {
                var me = $(this);
                if (me.attr('data-id') == pid) {
                    var ul = me.siblings('ul');
                    ul.find('a[sub-id]').parent().remove();
                    ul.append(['<li class="el-menu-item"><a data-id="', xhr.Sub, '" href="', $.SPA, xhr.Path, '">', xhr.Title, '</a></li>'].join(''))
                        .find('a').last().click();
                    requestAnimationFrame(function () {
                        $(window).on('page', 'subject/markdown', 'id=' + xhr.Sub);
                    });

                    return false;
                }

            });
        }).On('Subject.Portfolio.Import', function (e, xhr) {
            var pid = xhr.Id;
            $('.el-submenu__title', menubar).each(function () {
                var me = $(this);
                if (me.attr('data-id') == pid) {
                    var ul = me.siblings('ul');
                    ul.find('a[sub-id]').parent().remove();
                    ul.append(['<li class="el-menu-item"><a data-id="', xhr.Sub, '" href="', $.SPA, xhr.Path, '">', xhr.Title, '</a></li>'].join(''))
                    return false;
                }

            });
        }).On('Subject.Portfolio.Change', function (e, xhr) {
            var pid = xhr.Id;
            var subid = xhr.Sub;
            $('.el-submenu__title', menubar).each(function () {
                var me = $(this)
                if (me.attr('data-id') == pid) {
                    var IsOk = false;
                    if (subid)
                        $('.el-menu-item a', menubar).each(function () {
                            var a = $(this);
                            if (a.attr('data-id') == subid) {
                                IsOk = true;
                                var ap = a.parent().parent();
                                me.siblings('ul').append(a.parent());
                                a.click();
                                if (!ap.find('a').length) {
                                    ap.append('<li class="el-menu-item"><a sub-id="' + ap.siblings('.el-submenu__title').attr('data-id') + '"></a></li>');
                                }
                                return false;
                            }
                        });
                    if (IsOk == false && xhr.Item) {
                        me.siblings('ul').append($.format('<li class="el-menu-item"><a data-id="{id}" ui-spa href="{Path}" >{text}</a></li>', [xhr.Item], {
                            Path: function (x) {
                                return $.SPA + x.path;
                            }
                        }));

                    }
                    return false;
                }
            })
        }).On('Subject.ProjectItem', function (e, xhr) {
            var b = false;
            nav.find('a').each(function () {
                var m = $(this);
                if ($(this).attr('data-id') == xhr.id) {
                    m.text(xhr.text);
                    b = true;
                    return false;
                }
            });
            if (b == false) {
                $(document.createElement("li"))
                    .html($.format('<a ui-spa  href="{Path}" data-id="{id}">{text}</a>', [xhr], {
                        Path: function (x) {
                            return $.SPA + x.path;
                        }
                    }))
                    .appendTo(nav).find('a').click();
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
        }).On('Subject.Menu', function (e, v) {
            $.UI.Command("Subject", 'Menu', v || '', function (xhr) {
                if (xhr.type) {
                    if (xhr.type == 'index') {
                        history.replaceState(null, null, '/')
                    }
                    $(window).on('page', 'subject/' + xhr.type, '');
                    return;
                }
                team.text(xhr.text);

                document.body.className = xhr.Auth;
                $.UI.ProjectId = xhr.id;
                $.UI.SPAPfx = $.SPA + xhr.code + '/';

                team.attr('href', $.SPA + xhr.code);
                nav.html($.format('<li {Hide}><a ui-spa href="{Path}" data-id="{id}">{text}</a></li>', xhr.menu, {
                    Path: function (x) {
                        return $.SPA + x.path;
                    }, Hide: function (c) {
                        return c.hide ? 'class="hide"' : ""
                    }
                })).find('li').eq(xhr.selectIndex || 0).addClass('is-active');
                $.UI.On('Portfolio.List', xhr);

                var disabled = navbar.css('transition').indexOf('max-height') > -1;
                switch (xhr.Auth) {
                    case 'EditerItem':
                    case 'EditerAll':
                        navSort.option('disabled', disabled);
                        menuSort.option('disabled', disabled);
                        $.page('subject/team', '项目成员', '\uf0c0').page('subject/recycle', '回收站', '\ue940').menu();
                        break;
                    case 'EditerDoc':
                        menuSort.option('disabled', disabled);
                        navSort.option('disabled', true);
                        $.page('subject/team', '项目成员', '\uf0c0').page('subject/recycle', '回收站', '\ue940').menu();
                        break;
                    default:
                        $.page('subject/team', '项目成员', '\uf0c0').menu();
                        menuSort.option('disabled', true);
                        navSort.option('disabled', true);
                        break;
                }
                if (xhr.follow) {
                    $.UI.Command('Subject', 'Team', { Id: 'follow', Project: $.UI.ProjectId })
                }
                if ($(window).on('popstate', 'Menu') === false) {
                    if (xhr.spa) {
                        $(window).on('page', 'subject/' + xhr.spa.id, '');
                    } else {
                        history.replaceState(null, null, $.SPA + xhr.code);
                        $(window).on('page', 'subject/dynamic', '');
                    }
                }

            });


        }).On('Subject.DingTalk', function (e, xhr) {
            $.script('https://g.alicdn.com/dingding/dingtalk-jsapi/2.10.3/dingtalk.open.js')
                .wait(function () {
                    dd.config(xhr.Sign);

                    dd.ready(function () {
                        switch (xhr.method) {
                            case 'pickConversation':
                                dd.biz.chat.pickConversation({
                                    corpId: xhr.Sign.corpId,
                                    isConfirm: false,
                                    onSuccess: function (v) {
                                        var ms = xhr.Params;
                                        ms[xhr.Key] = v.cid
                                        ms[xhr.Key + "-Text"] = v.title
                                        $.UI.Command(ms);
                                    },
                                    onFail: function (e) { }
                                })
                                break;
                        }

                    });
                });
        }).On('Subject.Portfolio.Del', function (e, xhr) {
            $('.el-submenu__title', menubar).each(function () {
                var a = $(this);
                if (a.attr('data-id') == xhr.Id) {
                    var wrapper = a.parent('.menu-wrapper');
                    wrapper.remove();
                    return false;
                }
            })

        });

        $.UI.On('Subject.Menu', location.pathname.indexOf($.SPA) == 0 ? { code: location.pathname.substring($.SPA.length) } : '');

        $('.el-dropdown').menu().siblings('*[role]').click('a', function () {
            var me = $(this);
            switch (me.attr('data-key')) {
                case 'AddItem':
                    $.UI.Command('Subject', 'ProjectItem', { Key: 'EDITER', "Project": $.UI.ProjectId, "Id": "News" })
                    break;
                case "EditItem":
                    $.UI.Command('Subject', 'ProjectItem', { Key: 'EDITER', "Project": $.UI.ProjectId, "Id": nav.find('li.is-active a').attr('data-id') })
                    break;
                case 'AddProject':
                    $.UI.Command('Subject', 'Project', { Key: 'EDITER', "Id": "News" })
                    break;
                case 'Setting':
                    $.UI.Command('Subject', 'Project', { Key: 'EDITER', "Id": $.UI.ProjectId });
                    break;
                case 'Project':
                    $.UI.On('Subject.Menu', me.attr('data-code'))
                    break;
            }
        }).find('input').change(function () {
            let items = this.files;
            var sid = $('.el-submenu__title.is-active', menubar).attr('data-id');
            if (sid) {
                for (let i = 0; i < items.length; i++) {
                    scanFiles(items[i], sid);
                }
            } else {
                $.UI.Msg('请选择文集');

            }


        });

        $('.wdk-footer-icon').click(function () {
            switch (this.id) {
                case 'News':
                    UMC.UI.Command('Subject', 'News', $('.el-submenu__title.is-active', menubar).attr('data-id') || $('.el-submenu__title', menubar).eq(0).addClass('is-active').attr('data-id'))
                    break;
                case "Markdown":
                    UMC.UI.Command('Subject', 'News', {
                        Id: $('.el-submenu__title.is-active', menubar).attr('data-id') || $('.el-submenu__title', menubar).eq(0).addClass('is-active').attr('data-id'),
                        Type: 'markdown'

                    });
                    break;
                case "Rich":
                    UMC.UI.Command('Subject', 'News', {
                        Id: $('.el-submenu__title.is-active', menubar).attr('data-id') || $('.el-submenu__title', menubar).eq(0).addClass('is-active').attr('data-id'),
                        Type: 'text/html'
                    })
                    break;
                case 'Portfolio':
                    var pId = nav.find('li.is-active a').attr('data-id');

                    pId ? menubar.append($('#menu-wrapper').text()).find('input')
                        .focus().blur(function () {
                            var m = $(this);
                            if (this.value) {
                                $.UI.API('Subject', 'Portfolio', {
                                    KEY_DIALOG_ID: 'Caption', Key: 'EDITER', 'Caption': this.value,
                                    ItemId: pId,
                                    Id: 'News'
                                }, function (xhr) {
                                    var pid = xhr.Headers.DataEvent.Id;
                                    $.UI.On('Subject.Sequence', m.parent().html(m.val() + '<i class="el-submenu__icon-arrow"></i>')
                                        .attr('data-id', pid)
                                        .siblings('ul')
                                        .append('<li class="el-menu-item"><a sub-id="' + pid + '"  ></a></li>')[0]);
                                    m.remove();
                                });
                            } else {
                                m.parent('.menu-wrapper').remove();
                            }
                        }).on('keydown', function (e) {
                            switch (e.key) {
                                case 'Enter':
                                    this.blur();
                                    break;
                            }
                        }) : 0;
                    break;


            }

        });

        function scanFiles(item, sid) {
            var name = item.name;
            if (name.substring(name.lastIndexOf('.') + 1).toUpperCase() == 'MD') {
                $.uploader(item, function (xhr) {
                    $.UI.Command('Subject', "Upload", { Id: sid, Key: xhr.key });
                });
            };
        }
        var search = $('#header-search');
        search.find('form').submit(function () {
            var input = $(this).find('input');
            var value = input.val();
            var root = $('section.app-main>div[ui].ui');
            if (root.iso('search') == false) {
                var paging = root.find('.pagination-container');
                if (paging.iso('search')) {
                    paging.on('search', value);
                } else {
                    input.on('input')
                }
            } else {
                root.on('search', value, input) === false ? input.on('input') : 0;
            }
            return false;
        }).find('input').on('input', function () {
            var input = $(this);
            var value = input.val();
            if (value) {
                var root = $('section.app-main>div[ui].ui');

                if (root.iso('searchValue')) {
                    root.on('searchValue', value, input);
                } else if (UMC.UI.ProjectId) {
                    UMC.UI.API('Subject', 'Keyword', { Keyword: value, Project: UMC.UI.ProjectId }, function (xhr) {
                        showMenu(xhr);
                    });
                }
            }

        })
        search.siblings('*[role=menu]').click('a', function () {
            $(window).on('page', 'subject/' + $(this).attr('data-id'), '');
        });
        function showMenu(v, f) {
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
            if (v.length == 0) {
                menu.html('<li class="umc-search-empty"></li>');
            } else {
                menu.html($.format(f || '<li ><a ui-spa data-id="{id}" href="{Path}">{text}</a></li>', v, {
                    Path: function (x) {
                        return $.SPA + x.path;
                    }
                }));
            }
        };

        var uBox = $('.box-card-user').parent().click('a[ui-page]', function () {
            $(window).on("page", $(this).attr('ui-page'), '');
            return false;
        });
        function checkInfo() {
            $.UI.API("Account", "Check", "Info", function (xhr) {
                $.UI.Device = xhr.Device;
                if (xhr.Src) {
                    uBox.html(['<a model="Account" cmd="Self" send="User" class="box-card-user"><img src="', xhr.Src, '" class="pan-thumb"></a>'].join(''));
                } else {
                    uBox.html('<a ui-page="subject/login" class="el-button--small el-button">登录</a> <a model="Account" cmd="Register" class="el-button--small el-button el-button--primary">快速注册</a> ')
                }
            });
        } checkInfo();
        UMC.UI.On('User', function () {
            checkInfo();
            delete $.UI.SPAPfx;
            requestAnimationFrame(function () { $(window).on('popstate') });
        }).On('Close', function () {
            location.reload(false);
        });

        $(document.body).ui('Key.Pager', function (e, v) {
            var key = 'Pager';
            var dom = WDK(document.createElement('div')).attr({ 'ui': key, 'class': 'wdk-dialog' }) //.css({ 'background-color': '#FAFCFF'})
                .on('transitionend,webkitTransitionEnd', function () {
                    dom.is('.ui') ? 0 : dom.on('pop');
                }).appendTo(document.body)
                .on('pop', function () {
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
        }).ui('Key.Subject', function (e, v) {
            $.UI.Command("Subject", "Search", { Id: v, Type: 'Path' });
        });
    });


})(WDK);