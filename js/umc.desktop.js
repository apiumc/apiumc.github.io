
(function ($) {
    $.prototype.menu = function () {
        return this.on('click', function () {
            var m = $(this);
            if (m.is('.is-active')) {
                m.siblings('*[role=menu]').click();
            } else {
                $('.el-dropdown.is-active').siblings('*[role=menu]').click()
                var rect = this.getBoundingClientRect();
                var brect = document.body.getBoundingClientRect();
                m.addClass('is-active');
                var mask = $(document.createElement('div')).addClass('weui_mask')
                    .click(function () {
                        $(this).remove();
                        m.removeClass('is-active');
                        menu.css('transform', 'translateX(-1000px)');
                    }).css({
                        opacity: '0',
                        'z-index': '999'
                    }).appendTo(document.body);
                var menu = m.siblings('*[role=menu]').click(function () {
                    mask.click();
                }, 1).each(function () {
                    var mrect = this.getBoundingClientRect();
                    var left = rect.left;
                    if (rect.left + mrect.width > brect.width) {
                        left = brect.width - mrect.width - 10;
                    }
                    $(this).css('transform', ['translate(', left, 'px,', (rect.top + rect.height + 5), 'px)'].join(''))

                });
            }
            return false;
        });
    }
    var winDesks = [];

    function Bridge(win, fn) {
        this.win = win;
        this.call = fn;
    }
    Bridge.prototype.bridge = function (r) {
        var win = this.win;
        if (win == window) {
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
            this.win.postMessage(JSON.stringify({
                type: 'umc',
                data: data,
                key: this.key || ''
            }), "*");


        }

        requestAnimationFrame(function () {
            var index = -1;
            if (win != window) {
                index = winDesks.length;
                for (var i = 0; i < winDesks.length; i++) {
                    if (winDesks[i] == win) {
                        index = i;
                        break;
                    }
                }
                if (index == winDesks.length)
                    winDesks.push(win);
            }

            $('div[ui].wdk-dialog,.weui_dialog_confirm,.weui_actionsheet').each(function () {
                var m = $(this);
                if (!m.attr('form')) {
                    m.attr('form', index + '')
                }
            })
        })
    }
    UMC.UI.On('XHR.Bridge', function (e, xhr, fn) {
        var form = parseInt($('div[ui].wdk-dialog,.weui_dialog_confirm,.weui_actionsheet').last().attr('form'));
        xhr.onload = function () {
            new Bridge((isNaN(form) || form < 0) ? window : winDesks[form], fn).bridge(JSON.parse(xhr.responseText))
        }
        return false;
    })

    var apps = {};

    $(window).on('message', function (e) {
        var data = JSON.parse(e.data);
        var win = e.source;
        if (win == window) {
            return;
        }
        switch (data.type) {
            case 'close':
            case 'open':
            case 'nav':
            case 'select':
            case 'page':
            case 'title':
            case 'menu':
                $('iframe').each(function () {
                    if (this.contentWindow == win) {
                        var dom = $(this).parent('.umc-window');
                        switch (data.type) {
                            case 'close':
                                dom.find('a.umc-window-btn-close').click();
                                break;
                            case 'page':
                                dom.on('title', data.value.title).on('menu', data.value.menu || []).find('.umc-window-search').cls('hide', !data.value.search)
                                break;
                            case 'open':
                                apps[dom.attr('app-id')].win(data.value)
                                break;
                            default:
                                dom.on(data.type, data.value);
                                break;
                        }
                        return false;
                    }

                })
                break;
            case 'msg':
                $.UI.Msg(data.value);
                break;
            case 'umc':
                var bridge = new Bridge(win);
                bridge.key = data.key;
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    bridge.bridge(JSON.parse(xhr.responseText));
                };
                xhr.open('POST', UMC.UI.Config().posurl, true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.send(data.value.replace(/(^\&*)/g, ""));
                break;
            case 'bgsrc':
                if (data.value.indexOf('http') != 0) {
                    var posUrl = UMC.UI.Config().posurl;
                    if (posUrl.indexOf('http') == 0) {
                        data.value = posUrl.substr(0, posUrl.indexOf('/', 8)) + data.value;
                    }
                }
                var img = new Image();
                img.src = data.value;
                img.onload = function () {
                    localStorage.setItem('desktop-bg', img.src);
                    $('.umc-desktop-bg').css('background-image', ['url(', img.src, ')'].join(''));
                };
                break;
            default:
                break;
        }
    }).on('fullscreenchange,webkitfullscreenchange,mozfullscreenchange', function () {
        $(document.body).cls('umc-fullscreen', document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen);
    });

    function drop(e) {
        var data = e.dataTransfer.getData('drag');
        if (data) {
            var o = JSON.parse(data);
            var m = $('#' + o.id);
            if (m.is('.max')) {
                m.css({
                    left: (e.clientX - parseInt(o.x)) + 'px',
                    top: (e.clientY - parseInt(o.y)) + 'px'
                }).removeClass('max');
                $(window).on('max', m);
            } else {
                m.css({
                    left: (parseInt(m.css('left')) + e.clientX - parseInt(o.x)) + 'px',
                    top: (parseInt(m.css('top')) + e.clientY - parseInt(o.y)) + 'px'
                });
            }
        }
    }
    $(function () {
        $('.umc-desktop').on('dragover', function () {
            return false;
        }).on('drop', drop);
    });
    var winIndex = 0;


    function APP(id, title) {
        this.cfg = {
            id: id,
            title: title
        }

        var t = apps[id] = this;
        this.cfg.menu = $(document.createElement("ul")).addClass('umc-desktop-menu').click('a', function () {
            if (!this.target) {
                t._click($(this));
                return false;
            }
        });
        this.cfg.win = $(document.createElement("ul")).attr('role', 'menu');

        var ll = $('#umc-desktop-task~ul');
        ll.find('a').removeClass('is-active');
        $({ tag: 'a', 'win-id': id, cls: 'is-active' }).text(title).appendTo($(document.createElement('li')).appendTo(ll))
            .click(function () {
                t.show();
                t.cfg.win.find('a').eq(0).click();
                $(this).parent().parent().find('a').removeClass('is-active');
                $(this).addClass('is-active')
            });
    }
    APP.prototype = {

        _click: function (me) {
            $('.el-dropdown.is-active').siblings('*[role=menu]').click();

            var data = false;
            var key = me.attr('key');
            if (key) {
                data = {
                    type: 'event',
                    data: key
                }
            } else {
                var click = me.attr('click-data');
                if (click) {
                    data = {
                        type: 'click',
                        data: JSON.parse(click)
                    }
                }

            }
            var id = this.cfg.id;
            var href = me.attr('href');
            var oneWin = this.cfg.one;

            if (data || href) {
                var isOk = false;
                $('.umc-window').each(function () {
                    var m = $(this);
                    if (m.attr('app-id') == id) {
                        if (data) {
                            m.find('iframe').each(function () {
                                this.contentWindow.postMessage(JSON.stringify(data), "*")
                            });
                            m.removeClass('min');
                            return false;
                        } else if (oneWin) {
                            m.find('iframe').attr('src', href);
                            m.removeClass('min');
                            isOk = true;
                        } else if (m.find('iframe').attr('src') == href) {
                            isOk = true;
                            m.removeClass('min');
                            return false;

                        }
                    }
                });
                if (href && isOk == false) {
                    this.win(href, me.text());
                }

            }
        },
        _item: function (v) {
            var li = $(document.createElement('li'));
            var a = $(document.createElement('a')).text(v.text || '').attr('key', v.key || false);
            v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
            v.icon ? a.attr('data-icon', v.icon) : 0;
            v.href ? a.attr('href', v.href) : 0;
            v.id ? li.attr('id', 'n' + v.id) : 0;
            v.target ? a.attr('target', v.target) : 0
            a.appendTo(li);
            var menu = v.menu || [];
            if (menu.length > 0) {
                a.addClass('el-dropdown').menu();
                this._menu($(document.createElement('ul')).attr('role', 'menu').appendTo(li), menu);
            }
            return li;
        },
        _menu: function (m, vs) {
            for (var i = 0; i < vs.length; i++) {
                var v = vs[i];
                if (typeof v == 'object') {
                    this._item(v).appendTo(m);
                }
            }
        },
        show: function () {
            var m = $('.umc-task_bar-wins');
            var mu = m.siblings('ul');
            if (mu[0] != this.cfg.win[0]) {
                mu.remove();
                m.removeClass('hide').parent().append(this.cfg.win);
                var nav = $('#umc-desktop-menu').removeClass('hide');
                nav.children().remove();
                nav.append(this.cfg.menu);
                var ls = $('.umc-task_bar-app').attr('app-id', this.cfg.id).removeClass('hide').text(this.cfg.title).siblings('ul')
                    .find('a');
                ls.eq(0).text('关于' + this.cfg.title).attr('send', this.cfg.id);
                ls.eq(1).text('隐藏' + this.cfg.title);
                ls.last().text('退出' + this.cfg.title);
            }
        },
        close: function () {
            $('.umc-task_bar-app').addClass('hide');
            $('#umc-desktop-menu').children().remove();
            $('.umc-task_bar-wins').addClass('hide').siblings('ul').remove();
            $('#umc-desktop-task~ul').find('a[win-id=' + this.cfg.id + ']').remove();
            delete apps[this.cfg.id];
        },
        win: function (cfg, text) {
            switch (typeof cfg) {
                case 'string':
                    cfg = {
                        src: cfg,
                        text: text
                    }
                    break;
            }
            this.show();
            winIndex++;
            var win = $(document.createElement('div')).addClass('umc-window').attr('id', 'umc-win-' + winIndex).attr('app-id', this.cfg.id)


            var me = this;
            var top = $(document.createElement('div')).addClass('umc-window-top').appendTo(win).prop('draggable', true)
                .click(function () {
                    $(this).parent('.umc-window').css('z-Index', $('.umc-window').each(function (i) {
                        this.style.zIndex = i + '';
                    }).length);
                    me.show();
                    return false;
                }).on('click', '.umc-window-title a,.umc-window-menu a,.umc-window-search a', function () {
                    var me = $(this);
                    var data = false;
                    var key = me.attr('key');
                    if (key) {
                        switch (key) {
                            case 'fullscreen':
                                var element = document.documentElement;
                                var requestFullscreen = element.requestFullscreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;
                                requestFullscreen ? requestFullscreen.call(element) : 0

                                return;
                        }
                        data = {
                            type: 'event',
                            data: key
                        }
                    } else {
                        var click = me.attr('click-data');
                        if (click) {
                            data = {
                                type: 'click',
                                data: JSON.parse(click)
                            }
                        }
                    }
                    data ? me.parent('.umc-window').find('iframe').each(function () {
                        this.contentWindow.postMessage(JSON.stringify(data), "*")
                    }) : 0;
                    return false;
                });
            if (cfg.max !== false) {
                top.on('dblclick', function (e) {
                    if (!$(e.target).is('input')) {
                        $(window).on('max', $(this).parent('.umc-window').cls('max'));
                    }
                })
            }

            var menuWin = $(document.createElement('a')).attr('win-id', win.attr('id')).appendTo($(document.createElement('li')).appendTo(this.cfg.win))
                .click(function () {
                    win.removeClass('min');

                    $(window).on('max', win);
                    $(this).parent().parent().find('a').removeClass('is-active')
                    $(this).addClass('is-active')
                    top.click();
                });

            var btn = $(document.createElement('div')).addClass('umc-window-btns').appendTo(top);
            $(document.createElement('a')).addClass('umc-window-btn-close').appendTo(btn).click(function () {
                win.find('iframe').each(function () {
                    for (var i = 0; i < winDesks.length; i++) {
                        if (winDesks[i] == this.contentWindow) {
                            winDesks.splice(i);
                            break;
                        }
                    }
                })
                win.remove();
                var li = menuWin.parent();
                if (li.siblings().length == 0) {
                    apps[win.attr('app-id')].close();
                }
                li.remove();

                $(window).on('max');
                return false;
            });
            if (cfg.min !== false)
                $(document.createElement('a')).addClass('umc-window-btn-min').appendTo(btn).click(function () {
                    $(this).parent('.umc-window').addClass('min');
                    menuWin.removeClass('is-active');
                    $(window).on('max', win);
                    return false;
                });
            if (cfg.max !== false)
                $(document.createElement('a')).addClass('umc-window-btn-max').appendTo(btn).click(function () {
                    $(this).parent('.umc-window').addClass('max');
                    $(window).on('max', win);
                    return false;
                });
            $(document.createElement('div')).addClass('umc-window-title').appendTo(top)

            var search = $(document.createElement('div')).addClass('umc-window-search hide').appendTo(top)

            $(document.createElement('input')).attr('type', 'input').on('input', function () {
                var value = this.value;
                if (!value) {
                    search.find('*[role=menu]').click();
                } else {
                    win.find('iframe').each(function () {
                        this.contentWindow.postMessage(JSON.stringify({
                            type: 'searchValue',
                            data: value
                        }), "*");
                    });
                }

            }).attr('placeholder', '搜索').appendTo($(document.createElement('form')).submit(function () {
                var value = $(this).find('input').val();
                win.find('iframe').each(function () {
                    this.contentWindow.postMessage(JSON.stringify({
                        type: 'search',
                        data: value
                    }), "*");
                });
                return false;
            }).appendTo($(document.createElement('div')).addClass('el-dropdown').appendTo(search)));

            $(document.createElement('ul')).attr('role', 'menu').addClass('umc-search-menu').appendTo(search);

            $(document.createElement('div')).addClass('umc-window-menu').appendTo(top);

            menuWin.click();

            $(document.createElement('iframe')).attr('allowfullscreen', 'true').appendTo($(document.createElement('div')).addClass('umc-window-content').appendTo(win))
                .attr('src', cfg.src);
            win.appendTo(document.body);
            var app = this;

            if (cfg.max === true) {
                win.addClass('max');
                $(window).on('max', win);
            }
            if (cfg.height) {
                win.css('height', cfg.height);
                win.css('top', 'calc((100vh - ' + cfg.height + ' )/2)')
            }
            if (cfg.width) {
                win.css('height', cfg.width);
                win.css('left', 'calc((100vw - ' + cfg.width + ' )/2)')
            }
            win.on('dragstart', function (e) {
                e.dataTransfer.setData('drag', JSON.stringify({
                    x: e.clientX,
                    y: e.clientY,
                    id: this.id
                }));
                $(document.body).addClass('umc-window-move');
                $(this).css('z-Index', $('.umc-window').each(function (i) {
                    this.style.zIndex = i + '';
                }).length);
                me.show();
            }).on('dragend', function () {
                $(document.body).removeClass('umc-window-move');
            }).on('dragover', function () {
                return false;
            }).on('drop', drop).on('title', function (e, vs) {
                var wtitle = $(this).find('.umc-window-title')
                wtitle.children().remove();
                if (Array.isArray(vs)) {
                    for (var i = 0; i < vs.length; i++) {
                        var v = vs[i];
                        if (i > 0) {
                            $(document.createElement('b')).appendTo(wtitle);
                        }
                        if (typeof v == 'object') {
                            var a = $(document.createElement('a')).text(v.text).attr('key', v.key || false);
                            v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                            v.icon ? a.attr('data-icon', v.icon) : 0
                            a.appendTo(wtitle);
                        } else {
                            $(document.createElement('a')).text(v + '').appendTo(wtitle);
                        }
                    }

                } else {
                    $(document.createElement('span')).text(vs || '').appendTo(wtitle);
                }
                menuWin.text(wtitle.text());
            }).on('menu', function (e, vs) {
                var menu = $(this).find('.umc-window-menu')
                menu.children().remove();
                if (Array.isArray(vs)) {
                    for (var i = 0; i < vs.length; i++) {
                        var v = vs[i];
                        if (typeof v == 'object' && v.hide !== true) {
                            var a = $(document.createElement('a')).text(v.text || '').attr('key', v.key || false);
                            v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                            v.icon ? a.attr('data-icon', v.icon) : 0
                            a.appendTo(menu);
                        }
                    }
                }


            }).on('nav', function (e, vs) {
                if (Array.isArray(vs)) {
                    app.cfg.menu.children().remove();
                    app._menu(app.cfg.menu, vs);
                } else if (typeof v == 'object') {
                    var li = app._item(v);
                    if (v.id) {
                        var ld = app.cfg.menu.find('#n' + v.id);
                        ld.length ? ld.parent()[0].replaceChild(li[0], ld[0]) : app.cfg.menu.append(li)

                    } else {
                        app.cfg.menu.append(li);
                    }
                }

            }).on('select', function (e, vs) {

                var menu = $(this).find('.umc-window-search ul[role=menu]');
                var m = menu.siblings('.el-dropdown');
                if (m.is('.is-active') == false) {

                    var rect = search[0].getBoundingClientRect();
                    m.cls('is-active', 1);
                    var mask = $(document.createElement('div'))
                        .click(function () {
                            $(this).remove();
                            m.cls('is-active', 0);
                            menu.css('transform', 'translateX(-1000px)');
                        }).css({
                            position: 'absolute',
                            opacity: '0',
                            left: '0',
                            top: '0',
                            width: '100%',
                            height: '100%'
                        }).appendTo($('.umc-window-content', this));
                    var t = (rect.top + rect.height + 5);
                    menu.css({
                        transform: ['translate(', rect.left, 'px,', t, 'px)'].join(''),
                        'max-height': ['calc(100vh - ', t, 'px)'].join('')
                    }).click(function () {
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
            }).on('title', cfg.text || this.cfg.title);


        }
    }

    $(window).on('open', function (e, a) {
        var appId = a.id;
        var ap = apps[appId];
        if (ap) {
            delete a.id;
            var isOK = false;
            $('.umc-window iframe').each(function () {
                if ($(this).attr('src') == a.src) {
                    ap.show();
                    $(window).on('max', $(this).parent('.umc-window').removeClass('min'));
                    isOK = true;
                    return false;
                }
            });
            isOK ? 0 : ap.win(a);
        } else {
            new APP(appId, a.title).win(a);
        }
    }).on('max', function (e, m) {
        if (m) {
            $(document.body).cls('umc-has-max', m.is('.max') && m.is('.min') == false);
        } else {
            $(document.body).cls('umc-has-max', $('.umc-window').last().is('.max'));
        }
    })

})(UMC);
UMC(function ($) {
    function guide(key, fn) {
        if (localStorage.getItem(key) != 'show') {
            $.link('https://unpkg.com/intro.js@4.1.0/minified/introjs.min.css').script('https://unpkg.com/intro.js@4.1.0/minified/intro.min.js').wait(function () {
                var config = typeof fn == 'function' ? fn() : fn;

                introJs().setOptions(config).onbeforeexit(function () {
                    localStorage.setItem(key, 'show');
                }).start();
            });
        }
    }


    $.UI.On("UI.Show", function (e, v) {
        var mask = $(document.createElement("div")).addClass('weui_mask')
            .click(function () {
                $('div[ui].wdk-dialog').addClass('right').removeClass('ui');
            }).appendTo(document.body);
        v.on('close', function () {
            mask.remove();
        });
    }).Off('Prompt').On("Prompt", function (e, p) {
        var msg = $('.el-message').removeClass('el-message-fade-leave-active');
        msg.find('.el-message__content').html(p.Text);
        setTimeout(function () {
            msg.addClass('el-message-fade-leave-active');
        }, 3000);
    }).On('Cashier', function (e, v) {
        $('.umc-logo-icon').attr('src', v.Src).on('error', function () {
            $(this).off('error').attr('src', '/favicon.ico');
        });
        $('.umc-logo-name').text(v.Alias);
    }).On('Desktop.Open', function (e, v) {
        $(window).on('open', v);
    }).On('Clipboard', function (e, v) {

        var clipboardData = window.clipboardData || navigator.clipboardData;
        if (clipboardData) {
            clipboardData.setData('Text', v.text);
            $.UI.Msg("内容已经成功复制");
        } else {
            var input = document.createElement('input');
            document.body.appendChild(input);
            input.value = v.text;
            input.select();

            if (document.execCommand('copy')) {
                $.UI.Msg("内容已经成功复制");
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

    }).On('Close', function (e, v) {
        location.href = ['/Unauthorized?oauth_callback=', unescape(location.pathname + location.search), v ? '' : '&un=no'].join('');
    });
    $.UI.Command("Account", "Check", "Info", function (xhr) {
        $.UI.Device = xhr.Device;
        if (xhr.IsCashier) {
            $.UI.On('Cashier', xhr);
        } else if ($.UI.Device) {
            $.UI.On('Close', {});
        }
    });
    var taskBar = $('.umc-task_bar').click(function () {
        $('.el-dropdown.is-active').siblings('*[role=menu]').click()
    }).click('a[model]', function () {
        var m = $(this);
        UMC.UI.Command(m.attr('model'), m.attr('cmd'), m.attr('send') || '');
        return false;

    }).click('a[data-key=desktop]', function () {
        $(window).on('open', {
            title: '桌面图片',
            id: 'Desktop',
            src: '/UMC.UI/bgcolor.html'
        })
    }).click('#umc-desktop-apps', function () {
        $('#appstore').removeClass('hide');

        guide('umc-desktop-guide', function () {
            var m = $($('.umc-appstore-menu')[0].cloneNode(true));
            m.find('a').attr('model', false).attr('cmd', false).attr('data-key', false);
            return {
                prevLabel: '上一个',
                doneLabel: '完成',
                nextLabel: '下一个',
                steps: [{
                    title: '应用图标',
                    element: $('.umc-appstore-list').find('a')[0],
                    intro: ['点击则打开应用，右击“应用图标”,有下例功能选择<br/><ul style="list-style:none">', m.html(), '</ul>'].join('')
                },
                {
                    title: '搜索应用',
                    element: document.querySelector('.umc-appstore-search'),
                    intro: '在此用应用名称检索，快速查找应用'
                }]
            }
        });

    }).click('.umc-desktop-show', function () {
        $('.umc-window').each(function () {
            $(this).find('a.umc-window-btn-min').click();
        });
        $('#umc-desktop-task~ul a').removeClass('is-active')
    })
    taskBar.find('.el-dropdown').menu();
    taskBar.find('.umc-task_bar-app~ul').click('a', function () {
        switch ($(this).attr('data-key')) {
            case 'exit':
                taskBar.find('.umc-task_bar-wins~ul a').each(function (i) {
                    $('#' + $(this).attr('win-id')).find('a.umc-window-btn-close').click();
                });
                break;
            case 'hide':
                taskBar.find('.umc-task_bar-wins~ul a').each(function (i) {
                    $('#' + $(this).attr('win-id')).find('a.umc-window-btn-min').click();
                });
                break;
            case 'other':
                var vs = {};
                taskBar.find('.umc-task_bar-wins~ul a').each(function () {
                    vs[$(this).attr('win-id')] = true;
                });
                $('.umc-window').each(function () {
                    if (!vs[this.id]) {
                        $(this).find('.umc-window-btn-min').click();
                    }
                })
                break;
            case 'all':
                taskBar.find('.umc-task_bar-wins~ul a').each(function (i) {
                    $('#' + $(this).attr('win-id')).removeClass('min').removeClass('max').css({
                        left: ((i + 1) * 40 + 30) + 'px',
                        top: (i + 1) * 45 + 'px'
                    });
                }).last().click();
                break;
        }
    })
    $('.umc-appstore-menu').click('a', function () {
        var me = $(this);
        var app = $('.umc-appstore-menu').attr('data-app');
        switch (me.attr('data-key')) {
            case 'plus':
                $.UI.Command('Proxy', 'App', {
                    Key: app,
                    Model: 'PlusDesktop'
                });
                $('.umc-shortcuts a[data-app=' + app + ']').remove();
                $('.umc-shortcuts').append($('.umc-appstore-list a[data-app=' + app + ']')[0].cloneNode(true));//.remove();

                $(window).on('refresh');
                break;

            case 'help':
                var help = $('.umc-appstore-list a[data-app=' + app + ']').attr('help');//[0].cloneNode(true));//.remove();

                $(window).on('open', {
                    title: '帮助文档',
                    id: 'Setting',
                    src: help,
                    max: true,
                });
                break;
            case 'about':
                $.UI.Command('Proxy', 'App', app);
                break;
            case 'use':
                var url = '/Desktop/proxy/user?key=' + app;
                var posUrl = UMC.UI.Config().posurl;
                if (posUrl.indexOf('http') == 0) {
                    url = posUrl.substr(0, posUrl.indexOf('/', 8)) + url;
                }
                $(window).on('open', {
                    title: 'API UMC',
                    id: 'Setting',
                    src: url,
                    max: true,
                });
                break;
        }
        appList.click();

    });
    var shortcutMenu = $('.umc-shortcut-menu').click('a', function () {
        var me = $(this);
        var app = shortcutMenu.attr('data-app');
        switch (me.attr('data-key')) {
            case 'user':
                $.UI.Command('Proxy', 'App', {
                    Key: app,
                    Model: 'Account'
                });
                break;
            case 'pwd':
                $.UI.Command('Proxy', 'App', {
                    Key: app,
                    Model: 'Password'
                });
                break;
            case 'del':
                $.UI.Command('Proxy', 'App', {
                    Key: app,
                    Model: 'Delete'
                });
                break;
            case 'remove':
                $.UI.Command('Proxy', 'App', {
                    Key: app,
                    Model: 'RemoveDesktop'
                });
                $('.umc-shortcuts a[data-app=' + app + ']').remove();
                $(window).on('refresh');
                break;
            case 'about':
                $.UI.Command('Proxy', 'App', app);
                break;
            case 'help':
                var help = $('.umc-shortcuts a[data-app=' + app + ']').attr('help');
                $(window).on('open', {
                    title: '帮助文档',
                    id: 'Setting',
                    src: help,
                    max: true,
                });
                break;
        }
    });


    var appList = $('#apps-list');

    var shortcuts = $('.umc-shortcuts,#dock-container,#apps-list').click('a', function () {
        var me = $(this);
        $.UI.Command("Account", "Check", "Info", function (xhr) {
            xhr.IsCashier ? 0 : $.UI.On('Close');
        });
        switch (me.attr('target')) {
            case '_blank':
                return true;
            case 'normal':
                $(window).on('open', {
                    title: me.text(),
                    id: me.attr('data-app'),
                    src: me.attr('href'),
                })
                me.parent().click();
                break;
            case 'max':
                $(window).on('open', {
                    title: me.text(),
                    id: me.attr('data-app'),
                    src: me.attr('href'),
                    max: true,
                })
                me.parent().click();
                break;
        }
        return false;

    }).eq(0).on('contextmenu', 'a', function (e) {
        var me = $(this);
        var mask = $(document.createElement('div')).addClass("weui_mask")
            .click(function () {
                $(this).remove();
                shortcutMenu.css('transform', 'translateX(-1000px)');

            }).appendTo(document.body);

        var winWidth = window.innerWidth || document.body.clientWidth;
        var winHeight = window.innerHeight || document.body.clientHeight;
        var x = e.clientX + 10;
        var y = e.clientY + 10;
        var rect = shortcutMenu.offset();
        if (winWidth < rect.width + x) {
            x = x - rect.width;
        }
        if (winHeight < rect.height + y) {
            y = y - rect.height;
        }


        shortcutMenu.css('transform', ['translate(', x, 'px,', y, 'px)'].join(''))
            .click(function () {
                mask.click();
            }, 1).attr('data-app', me.attr('data-app'));
        return false;
    });
    appList.on('contextmenu', 'a', function (e) {
        var me = $(this);
        var mask = $(document.createElement('div')).addClass("weui_mask")
            .click(function () {
                $(this).remove();
                $('.umc-appstore-menu').css('transform', 'translateX(-1000px)');

            }).css('z-index', '1005').appendTo(document.body);

        var winWidth = window.innerWidth || document.body.clientWidth;
        var winHeight = window.innerHeight || document.body.clientHeight;
        var x = e.clientX + 10;
        var y = e.clientY + 10;
        var rect = shortcutMenu.offset();
        if (winWidth < rect.width + x) {
            x = x - rect.width;
        }
        if (winHeight < rect.height + y) {
            y = y - rect.height;
        }


        $('.umc-appstore-menu').css('transform', ['translate(', x, 'px,', y, 'px)'].join(''))
            .click(function () {
                mask.click();
            }, 1).attr('data-app', me.attr('data-app'));
        return false;
    }).click('em', function () {

        var a = $(this).siblings('a');
        var app = a.attr('data-app')
        $.UI.Command('Proxy', 'App', {
            Key: app,
            Model: 'PlusDesktop'
        });
        $('.umc-shortcuts a[data-app=' + app + ']').remove();
        $('.umc-shortcuts').append(a[0].cloneNode(true));//.remove();

        $(window).on('refresh');
    });
    $('#appstore').click(function () {
        $(this).cls('hide');
    });

    var bgsrc = localStorage.getItem('desktop-bg');

    bgsrc ? $('.umc-desktop-bg').css('background-image', ['url(', bgsrc, ')'].join('')) : 0;
    UMC.UI.On('Cashier', function () {
        UMC.UI.Command('Proxy', 'App');

    }).On('Desktop', function (e,v) {
        var desktops = [];
        var xhr=v.apps;
        for (var i = 0; i < xhr.length; i++) {
            xhr[i].desktop ? desktops.push(xhr[i]) : 0;
        }
        appList.html($.format('<div><a draggable="true" data-badge="{badge}" help="{docs}" title="{title}"  data-app="{root}" href="{url}" target="{target}" class="shortcut"><img draggable="false" onerror="UMC.error(this)" data-icon="{icon}" src="{src}"  class="icon"/><em class="title">{title}</em></a></div>', xhr, true));
        shortcuts.html($.format('<a draggable="true" help="{docs}" title="{title}" data-badge="{badge}" data-app="{root}" href="{url}" target="{target}" class="shortcut"><img draggable="false" onerror="UMC.error(this)" data-icon="{icon}" src="{src}" class="icon"/><em class="title">{title}</em></a>', desktops, true));
        $(window).on('refresh');

        guide('umc-apps-guide', function () {
            var m = $($('.umc-logo-menu')[0].cloneNode(true));
            m.find('li').eq(0).remove();
            m.find('a').attr('model', false).attr('cmd', false).attr('data-key', false);
            var s = $(shortcutMenu[0].cloneNode(true));
            s.find('a').attr('model', false).attr('cmd', false).attr('data-key', false);
            return {
                prevLabel: '上一个',
                doneLabel: '完成',
                nextLabel: '下一个',
                steps: [{
                    title: '个人图标',
                    element: $('.umc-task_bar a')[0],
                    intro: ['点击“个人图标”，有下例功能选择<br/><ul style="list-style:none">', m.html(), '</ul>'].join('')
                }, {
                    title: '更多应用',
                    element: document.querySelector('#umc-desktop-apps'),
                    intro: '从这里可找查找所有应用，当然你也可以把应用放在云桌面上'
                }, {
                    title: '应用图标',
                    element: shortcuts.find('a')[0],
                    intro: ['点击则打开应用；右击“应用图标”时，有下例功能选择<br/><ul style="list-style:none">', s.html(), '</ul>同时应用的帮助文档，可在“更多应用”对应图标右击选择“查看帮助文档”'].join('')

                }]
            }
        });


    }).On('Site.Config', function () {
        UMC.UI.Command('Proxy', 'App');
    });
    $(window).on('refresh', function () {
        var h = parseInt((shortcuts[0].offsetHeight - 60) / 100);
        var x = 0,
            y = 0;
        shortcuts.find(".shortcut").each(function () {
            $(this).css({
                left: (x * 82 + 10) + 'px',
                top: (y * 100 + 20) + 'px',
            });
            y++;
            if (y >= h) {
                y = 0;
                x++;
            }
        });

    });
    $('.umc-appstore-search input').on('input', function () {
        var v = this.value;
        var isOK = false;
        appList.find('a').each(function () {
            var d = this.title.toLocaleLowerCase().indexOf(v.toLocaleLowerCase()) == -1;
            if (d) {
                $(this).parent().addClass('hide')
            } else {
                isOK = true;
                $(this).parent().removeClass('hide')
            }
        });
        appList.cls('not-find', !isOK)

    }).click(function () { return false });

});
