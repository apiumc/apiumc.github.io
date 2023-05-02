
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
        }).On("UI.Publish", function (e, title, keyword, desc, a) {
            var body = $(document.body.cloneNode(true));
            body.find('div[ui]').each(function () {
                var m = $(this);
                m.is('.ui') ? m.removeClass('ui') : m.remove();
            });
            var key = location.pathname.substring(1) || 'index.html';
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                $.UI.API('Subject', "Publish", $.extend({ Key: key }, a))
            }
            xhr.open('PUT', 'https://wdk.oss-accelerate.aliyuncs.com/Sub/' + key, true);
            xhr.send(JSON.stringify({ title: title, keyword: keyword, desc: desc, html: body.html() }));

        })

    $(function () {
        $.page('subject');
        $.page('page');
        var comment, preview, login;
        function XHR(src, fn) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () { fn(xhr) };
            xhr.open('GET', ($.Src || '') + src, true);
            xhr.send('');
        }
        XHR('subject/comment.html', function (xhr) {
            comment = $(document.createElement("div")).html(xhr.responseText).children("div").remove().on('uploader', function (e, file) {
                var media_id = Math.random();
                var fname = file.name.substr(file.name.lastIndexOf('.')).toLocaleLowerCase();
                switch (fname) {
                    case '.jpg':
                    case '.png':
                    case '.gif':
                    case '.webp':
                    case '.jpeg':
                        break;
                    default:
                        $.UI.Msg("文件格式不支持")
                        return;
                }
                $.UI.Config().res
                var path = ($.UI.Config().possrc || 'https://wdk.oss-accelerate.aliyuncs.com/') + 'TEMP/Static/' + media_id + fname;

                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    var a = $(document.createElement('a'));
                    a.html(['<img src="', path, '!50"/><i></i>'].join('')).attr('data-src', path);
                    comment.find('.umc-subject-comment-toolbar-images').append(a);

                };
                xhr.open('PUT', path, true);
                xhr.send(file);
            });
            comment.find('input').change(function () {
                var v = this.files;
                if (v.length > 0) {
                    var me = this;
                    var file = v[0];

                    comment.on('uploader', file);
                    me.value = '';

                }
            });
            comment.find('.umc-subject-comment-toolbar-images').click('a>i', function () {
                $(this).parent().remove();
            });
            comment.find('textarea').on('paste', function (e) {
                var cb = e.clipboardData;
                if (!(cb && cb.items)) {
                    return;
                }
                var items = cb.items;
                for (var i = 0; i < items.length; i++) {
                    cbd = items[i];
                    switch (cbd.kind) {
                        case 'file':
                            var blob = cbd.getAsFile();
                            if (blob && blob.size > 0) {
                                comment.on('uploader', blob);
                            }
                            return false;

                    }
                }
            });
            var textarea = comment.find('textarea').on('keydown', function (e) {

                if (e.keyCode == 13 && (e.metaKey || e.ctrlKey)) {
                    comment.on('submit');
                    return false;
                }
            });
            comment.on('submit', function () {
                var d = { Content: textarea.val() };
                if (d.Content.length >= 4) {
                    var ls = [];
                    comment.find('.umc-subject-comment-toolbar-images a').each(function () {
                        ls.push(this.getAttribute('data-src'));
                    });
                    if (ls.length > 0) {
                        d.image = ls.join(',');
                        comment.find('.umc-subject-comment-toolbar-images').html('');
                    }
                    UMC.UI.Command(submit.model, submit.cmd, $.extend(d, submit.send));
                    comment.remove();
                    textarea.val('');
                } else {
                    $.UI.Msg('内容不能少于4个字符')
                }
            })

            comment.find('.umc-subject-comment-toolbar-right a').click(function () {
                switch (this.getAttribute('data-type')) {
                    case 'submit':
                        comment.on('submit');
                        break;
                    default:
                        comment.remove();
                        break;
                }

            });
            var submit = {};
            $.UI.On("Comment", function (e, v) {
                comment.attr('data-type', 'Comment');
                submit = v.submit;
                $('div[page-name=' + submit.send.UI + '] .umc-subject-footer').before(comment);
                textarea.attr('placeholder', submit.text).val(submit.value || '');
                textarea.focus();
            });

            $.UI.On("Reply", function (e, v) {
                submit = v.submit;
                comment.attr('data-type', 'Reply');
                $('div[page-name=' + submit.send.UI + '] div[section-index="' + submit.send.section + '"] div[row-index="' + submit.send.row + '"] .wdk-cms-comment-info').append(comment);
                textarea.attr('placeholder', submit.text).val(submit.value || '');
                comment.find('.umc-subject-comment-toolbar-images').html('');
                textarea.focus();
            });

        });

        XHR('subject/preview.html', function (xhr) {
            preview = $(document.createElement("div")).html(xhr.responseText).children("div").remove();
            preview.find('img').on('load', function () {

                var rect = this.getBoundingClientRect();
                var winWidth = (window.innerWidth || document.body.clientWidth) - rect.width;
                var winHeight = (window.innerHeight || document.body.clientHeight) - rect.height;
                $(this).css('transform', ['translate(', (winWidth / 2), 'px,', (winHeight / 2), 'px)'].join(''))

            });
            preview.find('.weui_mask,img').click(function () {
                preview.remove();
            });
            preview.find('.umc-preview-left').click(function () {
                var index = parseInt($(this).attr('data-index'));
                if (!isNaN(index)) {
                    $.UI.On("Image.Preview", $('.weui_cells img[original-src]').eq(index - 1));
                }
            });

            preview.find('.umc-preview-right').click(function () {
                var index = parseInt($(this).attr('data-index'));
                if (!isNaN(index)) {
                    $.UI.On("Image.Preview", $('.weui_cells img[original-src]').eq(index + 1));
                }

            });
            $.UI.On("Image.Preview", function (e, v) {
                var rect = v[0].getBoundingClientRect();
                preview.find('img').attr('src', v.attr('original-src')).css('transform', ['translate(', (rect.left), 'px,', (rect.top), 'px)'].join(''))
                preview.appendTo(document.body);
                var index = -1;
                var len = $('.weui_cells img[original-src]').each(function (i) {
                    if (this == v[0]) {
                        index = i;
                        return false;
                    }
                }).length;
                preview.find('.umc-preview-left').attr('data-index', index == 0 ? 'start' : index);
                preview.find('.umc-preview-right').attr('data-index', (index == (len - 1)) ? 'end' : index.toString());
                preview.find('.umc-preview-original').attr('href', v.attr('original-src'))
            });

        });

        XHR('subject/login.html', function (xhr) {
            login = $(document.createElement("div")).html(xhr.responseText).children("div").remove();

            login.find('.close').click(function () {
                login.remove().find('.qrcode_view').removeClass('show')
                $.UI.On('Mqtt.Disconnect');
            });
            login.find(".qrcode_view .context").click('a', function () {
                $.UI.On('Mqtt.Connect');
            });
            $.script('/js/qrcode.min.js').wait(function () {
                var qrcode = new QRCode(login.find("#qrcode").html('')[0]);
                qrcode.makeImage = function () {
                    $('#qrcode img').attr({ 'src': 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', style: false });//.attr('style':)
                };
                login.on('qrcode', function (e, qr) {
                    qrcode.clear();
                    qrcode.makeCode(qr.url, {
                        width: 200,
                        height: 200
                    });
                    document.body.style.setProperty('--qricon', 'url(' + qr.icon + ')')
                    login.find('*[data-key]').text(qr.title || '登录');
                });

            });
            $.UI.API('Account', 'Check', 'Mqtt', function (scan) {
                $.script('/js/mqttws31.min.js').wait(function () {
                    var client = new Paho.MQTT.Client(scan.broker, 443, scan.client);
                    client.onMessageArrived = function (message) {
                        var uss = JSON.parse(message.payloadString)[0];
                        switch (uss.msg) {
                            case 'OK':
                                UMC.UI.API("Account", "Check", "Session");
                                client.disconnect();
                                login.remove().find('.qrcode_view').removeClass('show')
                                clearTimeout(timeId);
                                break;
                            case 'Follow':
                                $.UI.IsFollow = true;
                                $('.umc-subject-view .umc-sub-follower').remove();
                                client.disconnect();
                                login.remove().find('.qrcode_view').removeClass('show')
                                clearTimeout(timeId);
                                break;
                            default:
                                login.find(".qrcode_view .context").html([uss.src ? ('<img src="' + uss.src + '"/>') : '', '<b>', uss.msg || uss, '</b>'].join(''));

                                break;
                        }
                    };
                    var timeId = 0;
                    $.UI.On('Mqtt.Disconnect', function () {
                        clearTimeout(timeId);
                        login.find(".qrcode_view .context").html("<a>刷新二维码</a>");
                        client.disconnect();
                    }).On('Mqtt.Connect', function (e, qr) {
                        login.find(".qrcode_view .context").children().remove();
                        if (qr) {
                            login.on('qrcode', qr)
                        }
                        UMC.UI.API("Account", "Check", "Session");
                        clearTimeout(timeId);
                        client.connect({
                            useSSL: true,
                            userName: scan.user,
                            password: scan.pass,
                            onSuccess: function () {
                                timeId = setTimeout(function () {
                                    $.UI.On('Mqtt.Disconnect');
                                    $.UI.API("Account", "Check", "Session");
                                }, 1000 * 120);
                            },
                            mqttVersion: 4,
                            onFailure: function (e) {
                                login.find(".qrcode_view .context").html("<b>MQTT Error</b>");
                                console.log(e);
                            }
                        });
                    });

                });
            });
        });
        var navbar = $('.navbar');
        (function () {
            var app = $('section.app-main');
            navbar.find('.umc-sidebar-menu').click(function () {
                navbar.cls('show-menu');
            });
            navbar.find('.umc-sidebar-back').click(function () {
                history.length == 1 ? $.nav($.UI.SPAPfx ? $.UI.SPAPfx : '/') : history.back();
            });

            $.UI.On("CMS.Link", function (e, v) {
                if (v.spa) {
                    var href = $.SPA + v.spa.path;
                    return [' ui-spa', ' href="', href, '" data-id="', v.spa.id, '"'].join('');
                } else if (v['sub-id']) {
                    return [' ui-spa', ' href="', $.SPA, 'Editer/', v['sub-id'], '"'].join('');
                }

            }).On('Login', function (e, v) {
                var cfg = v || { code: 'UMC' };
                login.appendTo(document.body);
                requestAnimationFrame(function () {
                    login.find('.qrcode_view').addClass('show');
                })
                $.UI.API('Subject', 'Scan', cfg.code || '', function (scan) {
                    $.UI.On('Mqtt.Connect', scan);
                });
            }).On('Subject.Editer.Path', function (e, p) {
                if (!p) {
                    var appendCls = app.children('div.ui').attr('append-cls')
                    app.parent('#app').cls('hideSidebar', 1);
                    if (appendCls) {
                        $(document.body).cls(appendCls, 1);
                    }

                }
            }).On('UI.Error', function () {
                var dm = app.children('div[ui]');
                if (!dm.is('.ui') && dm.is('div[ui-key]')) {
                    requestAnimationFrame(function () {
                        $(window).on('page', dm.attr('ui'), '');
                    });
                    return true;
                }
            }).On('UI.Push', function (e, xhr) {
                var dom = app.children('div.ui');//.cls('ui', 0);
                if (dom[0] != xhr.root[0]) {
                    navbar.cls('show-menu', 0);
                    dom.prop('top', app[0].scrollTop || '0');
                    dom.cls('ui', 0).remove().on('backstage');
                    app.append(xhr.root.cls('ui', 1));
                    xhr.root.on('active');
                    var ocls = app.attr('app-cls') || app.attr('append-cls');

                    var cls = xhr.root.attr('app-cls');
                    app.attr('app-cls', cls);
                    app.parent('#app').cls('hideSidebar', xhr.root.is('div[hidesidebar]'))
                        .cls('hideScrollbar', xhr.root.is('div[hidescrollbar]'));

                    $(document.body).cls(ocls || '', 0).cls(cls || '', 1);

                    $(window).on('title', xhr.title).on("menu", xhr.menu || []);
                    app[0].scrollTop = parseInt(xhr.root.prop('top')) || 0;
                }
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
                            var a = $(document.createElement('a'));
                            v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                            v.key ? a.attr('key', v.key) : 0;
                            v.icon ? a.attr('data-icon', v.icon) : 0;
                            v.text ? a.text(v.text) : 0
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
            var id = em.attr('ui-key');
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
            $.each(xhr.subs, function (i, it) {
                htmls.push('<li  class="el-submenu">', '<div class="el-submenu__title"  data-id="', it.id, '">', it.text, '<i class="el-submenu__icon-arrow"></i><em></em></div>', '<ul class="el-menu">')
                var subs = it.subs || [];
                if (!subs.length) {
                    subs.push({ create: true });
                }
                htmls.push($.format('<li class="el-menu-item"><a class="{cls}" data-id="{id}" ui-spa {url} >{text}</a></li>', it.subs || [], {
                    url: function (x) {
                        if (x.create) {
                            return 'sub-id="' + it.id + '"'
                        } else {
                            return 'href="' + $.SPA + x.path + '"'
                        }
                    }
                }), '</ul></li>');

            });
            menubar.html(htmls.join('')).find('ul').each(function () {
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
                        if (evt.oldIndex != evt.newIndex) {
                            var ids = [];
                            var fm = $(evt.to);
                            fm.find('a').each(function () {
                                var id = $(this).attr('data-id');
                                id ? ids.push(id) : 0;
                            })
                            $.UI.API("Subject", "Sequence", { Id: ids.join(','), Portfolio: fm.siblings('.el-submenu__title').attr('data-id') });

                        }
                    }
                });

        });

        var nav = $('#nav', navbar).click('a', function () {
            var m = $(this);
            if (!m.parent().is('.is-active')) {

                $.UI.On('Progress.Bar');
                $.UI.API("Subject", 'PortfolioSub', m.attr('data-id'), function (xhr) {

                    $.UI.On('Progress.Bar', true);
                    $.UI.On('Portfolio.List', xhr)
                });
                m.parent().addClass('is-active').siblings().removeClass('is-active');
            }
            var skey = m.attr('href');
            var key = location.pathname + location.search;
            if (key != skey) {
                history.pushState(null, null, skey);
            }
            requestAnimationFrame(function () { $(window).on('page', 'subject/item/' + m.attr('data-id'), '') });
            return false;
        })

        var menuSort = Sortable.create(document.getElementById('menubar'), {
            animation: 150,
            draggable: '>li',
            onStart: function (evt) {
                if ($(document.body).is('.EditerItem,.EditerAll')) {
                    nav.addClass('drag-submenu');
                }
            },
            onEnd: function (evt) {
                nav.removeClass('drag-submenu');
                if ($(document.body).is('.EditerItem,.EditerDoc,.EditerAll')) {
                    var em = $(evt.originalEvent.path[0]);
                    if (em.is('.menu-site li a')) {
                        $.UI.API("Subject", "ProjectItemSeq", { Id: em.attr('data-id'), Portfolio: $(evt.item).find('.el-submenu__title').attr('data-id') });
                    } else if (evt.oldIndex != evt.newIndex) {
                        var ids = [];
                        $(evt.from).find('.el-submenu__title').each(function () {
                            ids.push($(this).attr('data-id'));
                        })
                        $.UI.API("Subject", "PortfolioSeq", ids.join(','));

                    }
                }
            }
        });

        menuSort.option('disabled', true);
        var team = $('#team', navbar);

        var navSort = Sortable.create(nav[0], {
            animation: 150, //动画参数
            draggable: '>li',
            onEnd: function (evt) {
                if (evt.oldIndex != evt.newIndex) {
                    if ($(document.body).is('.EditerItem,.EditerDoc,.EditerAll')) {
                        var ids = [];
                        $(evt.from).find('a').each(function () {
                            ids.push($(this).attr('data-id'));
                        });
                        $.UI.API("Subject", "ProjectItemSeq", ids.join(','));
                    }
                }
            }
        });
        navSort.option('disabled', true);
        $(window).off('popstate').on('popstate', function (e, v) {
            var pathKey = location.pathname.replace(/\/$/, '');
            var pKey = pathKey.substring($.SPA.length) || 'index';
            switch (pKey) {
                case 'index.html':
                case 'index':
                    $(window).on('page', 'page/index', location.hash || '');
                    return
                case 'dashboard':
                    (v || $.UI.IsAuthenticated) ? $(window).on('page', 'subject/dashboard', '') : $.UI.On('Subject.Menu', { code: pKey, type: $.UI.ProjectId ? "self" : 'project' })
                    return;
                default:
                    var root = pKey.split('/')[0];
                    switch (root) {
                        case 'UMC':
                            $.UI.On('Subject.Menu', { code: pKey + location.search })
                            return;
                        default:
                            if (/[A-Z]+/.test(root)) {
                                $(window).on('page', 'page/' + pKey, location.hash || '');
                                return;
                            }
                            break;
                    }
            }

            if ($.UI.SPAPfx) {
                if ($.UI.SPAPfx.toUpperCase().indexOf(pathKey.toUpperCase()) == 0) {
                    $(window).on('page', 'subject/project/' + $.UI.ProjectId, '');
                } else if (pathKey.indexOf($.UI.SPAPfx) == 0) {
                    var key = pathKey.substring($.UI.SPAPfx.length);
                    if ($.check(key)) {
                        $(window).on('page', key, location.search.substring(1));
                    } else {
                        var ps = pathKey.substring($.SPA.length).split('/');
                        switch (ps.length) {
                            case 3:
                                if (!$('#menubar a[href="' + pathKey + '"]').click().length) {
                                    var m = $(['#nav a[href="', $.SPA, ps[0], '/', ps[1], '"]'].join(''), navbar);
                                    if (m.length && !v) {
                                        if (!m.parent().is('.is-active')) {
                                            $.UI.API("Subject", 'PortfolioSub', pathKey.substring($.SPA.length), function (xhr) {
                                                $.UI.On('Portfolio.List', xhr)
                                            });
                                            m.parent().addClass('is-active').siblings().removeClass('is-active');
                                            return true;
                                        }
                                    }
                                    return false;
                                } else {
                                    return true;
                                }
                            case 2:
                                return $('#nav a[href="' + pathKey + '"]', navbar).click().length > 0;
                        }
                    }
                } else {
                    v ? 0 : $.UI.On('Subject.Menu', { code: pathKey.indexOf($.SPA) == 0 ? pathKey.substring($.SPA.length) : '' });
                }
            } else {
                v ? 0 : $.UI.On('Subject.Menu', { code: pathKey.indexOf($.SPA) == 0 ? pathKey.substring($.SPA.length) : '' });
            }

        });
        var active = false;
        var intervalBar = 0;
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
        }).On('Subject.Portfolio.Item', function (e, xhr) {
            var sub = $('.el-menu-item a[data-id="' + xhr.id + '"]', menubar);
            sub.length ? sub.cls('warn', xhr.hide) : 0;
        }).On('Subject.Portfolio.New', function (e, xhr) {

            var submenu = $('div[data-id="' + xhr.Id + '"].el-submenu__title', menubar);
            if (submenu.length) {
                var ul = submenu.siblings('ul');
                ul.find('a[sub-id]').parent().remove();
                ul.append(['<li class="el-menu-item"><a class="warn" data-id="', xhr.Sub, '" href="', $.SPA, xhr.Path, '">', xhr.Title, '</a></li>'].join(''))
                    .find('a').last().click();
                requestAnimationFrame(function () {
                    $(window).on('page', 'subject/markdown', 'id=' + xhr.Sub);
                });

            }
        }).On('Subject.Portfolio.Import', function (e, xhr) {

            var submenu = $('div[data-id="' + xhr.Id + '"].el-submenu__title', menubar);
            if (submenu.length) {
                var ul = submenu.siblings('ul');
                ul.find('a[sub-id]').parent().remove();
                ul.append(['<li class="el-menu-item"><a  class="warn" data-id="', xhr.Sub, '" href="', $.SPA, xhr.Path, '">', xhr.Title, '</a></li>'].join(''))
                return false;
            }

        }).On('Subject.Portfolio.Change', function (e, xhr) {
            var submenu = $('div[data-id="' + xhr.Id + '"].el-submenu__title', menubar);
            if (xhr.Item && submenu.length) {
                submenu.siblings('ul').append($.format('<li class="el-menu-item"><a class="warn" data-id="{id}" ui-spa href="{Path}" >{text}</a></li>', [xhr.Item], {
                    Path: function (x) {
                        return $.SPA + x.path;
                    }
                }));
            }
            if (xhr.Sub) {
                var sub = $('.el-menu-item a[data-id="' + xhr.Sub + '"]', menubar);
                if (sub.length) {
                    if (submenu.length) {
                        var ap = sub.parent().parent();
                        submenu.siblings('ul').append(a.parent());
                        sub.click();
                        if (!ap.find('a').length) {
                            ap.append('<li class="el-menu-item"><a sub-id="' + ap.siblings('.el-submenu__title').attr('data-id') + '"></a></li>');
                        }

                    } else {
                        var ap = sub.parent().parent();
                        sub.parent().remove();
                        if (!ap.find('a').length) {
                            ap.append('<li class="el-menu-item"><a sub-id="' + ap.siblings('.el-submenu__title').attr('data-id') + '"></a></li>');
                        }
                    }
                }
            }
        }).On('Subject.ProjectItem', function (e, xhr) {
            var submenu = $('a[data-id="' + xhr.id + '"]', nav);
            if (submenu.length) {
                submenu.text(xhr.text).parent().cls('warn', xhr.hide);
            } else {
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
                    var wrapper = a.parent('.el-submenu');
                    wrapper.remove();
                    return false;
                }
            })
        }).On('Clipboard', function (e, v) {

            var clipboardData = window.clipboardData || navigator.clipboardData;
            if (clipboardData) {
                clipboardData.setData('Text', v.text);
                $.UI.Msg(v.msg || "内容成功复制");
            } else {
                var input = document.createElement('input');
                document.body.appendChild(input);
                input.value = v.text;
                input.select();

                if (document.execCommand('copy')) {
                    $.UI.Msg(v.msg || "内容成功复制");
                } else {
                    $.UI.Confirm("内容复制失败", '需要您手动复制: <b id="Clipboard"></b>');
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    var range = new Range();
                    range.selectNodeContents($('.weui_dialog_bd #Clipboard').text(v.text)[0]);
                    selection.addRange(range);
                }
                document.body.removeChild(input);

            }

        }).On('Subject.Menu', function (e, v) {
            $.UI.On('Progress.Bar');
            $.UI.API("Subject", 'Nav', v || '', function (xhr) {
                $.UI.On('Progress.Bar', true);
                switch (xhr.type) {
                    case 'login':
                        UMC.UI.On('Login');
                        return;
                    case 'dashboard':
                        $(window).on('page', 'subject/dashboard', '');
                        return;
                    case 'home':
                        if ($.UI.On('UI.Error') !== true) {
                            $.nav($.SPA);
                        }
                        return;
                    case 'nav':
                        xhr.click ? $.Click(xhr.click) : 0;
                        $.nav(xhr.nav || $.SPA);
                        return;
                    case 'page':
                        $(window).on('page', 'page/' + (location.pathname.substring($.SPA.length) || 'index'), '');
                        return;

                }
                team.text(xhr.text);
                document.body.className = xhr.Auth || '';

                $.UI.ProjectId = xhr.id;
                $.UI.IsAuthenticated = xhr.IsAuthenticated || false;
                delete $.UI.IsFollow;
                $.UI.SPAPfx = $.SPA + xhr.code + '/';
                if (xhr.IsFollow) {
                    $.UI.IsFollow = xhr.IsFollow;
                    $('.umc-subject-view .umc-sub-follower').remove();
                }
                team.attr('href', $.SPA + xhr.code);
                nav.html($.format('<li class="{cls}"><a ui-spa href="{Path}" data-id="{id}">{text}</a></li>', xhr.menu, {
                    Path: function (x) {
                        return $.SPA + x.path;
                    }
                })).find('li').eq(xhr.selectIndex || 0).addClass('is-active');
                $.UI.On('Portfolio.List', { subs: xhr.subs });

                var disabled = navbar.css('transition').indexOf('max-height') > -1;
                switch (xhr.Auth) {
                    case 'EditerItem':
                    case 'EditerAll':
                        navSort.option('disabled', disabled);
                        menuSort.option('disabled', disabled);
                        $.UI.On('Page.Menu', [{
                            title: '回收站', url: '#subject/recycle', icon: '\ue940'
                        }]);
                        break;
                    case 'EditerDoc':
                        menuSort.option('disabled', disabled);
                        navSort.option('disabled', true);

                        $.UI.On('Page.Menu', [{
                            title: '回收站', url: '#subject/recycle', icon: '\ue940'
                        }]);
                        break;
                    default:
                        $.UI.On('Page.Menu', [])
                        menuSort.option('disabled', true);
                        navSort.option('disabled', true);
                        break;
                }
                if ($(window).on('popstate', 'Menu') === false) {
                    if (xhr.spa) {
                        xhr.spa.path ? history.replaceState(null, null, $.SPA + xhr.spa.path) : 0;
                        switch (xhr.spa.type || 'subject') {
                            case 'subject':
                                $(window).on('page', 'subject/' + xhr.spa.id, '');
                                break;
                            case 'item':
                                $(window).on('page', 'subject/item/' + xhr.spa.id, '');
                                break;
                            case 'project':
                                $(window).on('page', 'subject/project/' + xhr.spa.id, '');
                                break;
                        }
                    } else if ($.UI.On('UI.Error') !== true) {
                        $.nav($.SPA + xhr.nav);
                    }
                }

            });

        }).On('Subject.Portfolio.Add', function (e, xhr) {
            var input = $('.el-submenu__title input', menubar);
            var ntext = document.createTextNode(xhr.Text)
            var title = input.parent();
            title[0].replaceChild(ntext, input[0]);
            var pid = xhr.Id;

            $.UI.On('Subject.Sequence', title.attr('data-id', xhr.Id)
                .siblings('ul').append('<li class="el-menu-item"><a sub-id="' + pid + '"  ></a></li>')[0]);

        }).On('Subject.Portfolio.Del', function (e, xhr) {
            $('.el-submenu__title', menubar).each(function () {
                var a = $(this);
                if (a.attr('data-id') == xhr.Id) {
                    var wrapper = a.parent('.el-submenu');
                    wrapper.remove();
                    return false;
                }
            })
        }).On('Progress.Bar', function (e, b) {
            if (b) {
                document.body.style.setProperty('--loading', '100%');
                clearInterval(intervalBar);
                intervalBar = 0;
                setTimeout(() => {
                    document.body.style.removeProperty('--loading')
                }, 500);
            } else if (intervalBar == 0) {
                document.body.style.setProperty('--loading', '5%');
                var time = 1;
                intervalBar = setInterval(function () {
                    time++;
                    var v = time % 10;
                    if (v) {
                        document.body.style.setProperty('--loading', v + '0%');
                    } else {
                        clearInterval(intervalBar);
                    }
                }, 200);
            }

        });
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
        })

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
                    pId ? menubar.append($({ tag: 'li', cls: 'el-submenu', html: '<div class="el-submenu__title"><input><i class="el-submenu__icon-arrow"></i><em></em></div><ul class="el-menu"></ul>' })).find('input')
                        .focus().blur(function () {
                            var m = $(this);
                            if (this.value) {
                                $.UI.API('Subject', 'Portfolio', {
                                    KEY_DIALOG_ID: 'Caption',
                                    Key: 'EDITER', 'Caption': this.value,
                                    ItemId: pId,
                                    Id: 'News'
                                });
                            } else {
                                m.parent('.el-submenu').remove();
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

        })
        $('#Import input').change(function () {
            var items = this.files;
            var sid = $('.el-submenu__title.is-active', menubar).attr('data-id') || $('.el-submenu__title', menubar).attr('data-id');

            if (sid) {
                for (var i = 0; i < items.length; i++) {
                    scanFiles(items[i], sid);
                }
            } else {
                $.UI.Msg('请选择文集');

            }
        });

        function scanFiles(item, sid) {
            var name = item.name;
            switch (name.substring(name.lastIndexOf('.') + 1).toUpperCase()) {
                case 'MD':
                case 'JSON':
                    $.uploader(item, function (xhr) {
                        $.UI.Command('Subject', "Upload", { Id: sid, Key: xhr.key });
                    });
                    break;
                default:
                    $.UI.Msg('文件格式不支持')
                    break;
            };
        }
        var search = $('#header-search');
        search.find('form').submit(function () {
            var input = $(this).find('input');
            var value = input.val();
            var root = $('section.app-main>div[ui].ui');
            if (root.has('search') == false) {
                var paging = root.find('.pagination-container');
                if (paging.has('search')) {
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
                if (!root.has('searchValue') || root.on('searchValue', value, input) === false) {
                    if (UMC.UI.ProjectId) {
                        UMC.UI.API('Subject', 'Keyword', { Keyword: value, Project: UMC.UI.ProjectId }, function (xhr) {
                            showMenu(xhr);
                        });
                    }
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
            var spm = $.query(location.search.substring(1)).spm;
            $.UI.API("Account", "Check", spm || "Info", function (xhr) {
                $.UI.Device = xhr.Device;
                if (xhr.Src) {
                    uBox.html(['<a ui-spa href="/dashboard" title="我的工作台" class="box-card-user dashboard"></a><a onclick="UMC.UI.On(\'Share\')" class="box-card-user share"></a><a model="Account" cmd="Self" send="User" class="box-card-user"></a>'].join(''));
                } else {
                    uBox.html('<a onclick="UMC.UI.On(\'Login\')" class="el-button--small el-button">登录</a>')
                }
            });
            spm ? import('/js/fingerprint.js')
                .then(FingerprintJS => FingerprintJS.load()).then(fp => fp.get())
                .then(result => $.UI.API('Platform', 'Fingerprint', { AuthKey: spm, VisitorId: result.visitorId }))
                .catch(error => console.error(error)) : 0;
        } checkInfo();
        UMC.UI.On('User', function () {
            checkInfo();
            delete $.UI.SPAPfx;
            requestAnimationFrame(function () { $(window).on('popstate') });
        }).On('Close', function () {
            location.reload(false);
        }).On('Share', function () {
            $.UI.Command('Platform', 'Share', location.pathname);
        })

        $(document.body).ui('Key.Pager', function (e, v) {
            $.UI.On('Pager', v);
        });
    });


})(UMC);