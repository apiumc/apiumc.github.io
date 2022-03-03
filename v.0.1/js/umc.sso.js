
(function ($) {
    $.page('download');
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

    $.UI.On('Page.Menu', function (e, Menu) {
        $(function () {
            var htmls = [];
            for (var i = 0; i < Menu.length; i++) {
                var it = Menu[i];
                var menu = it.menu || [];
                htmls.push('<div class="menu-wrapper">');
                if (menu.length) {
                    htmls.push('<li  class="el-submenu">', '<div class="el-submenu__title" data-icon="', it.icon || '\uf02d', '" >', it.title, '<i class="el-submenu__icon-arrow"></i></div>', '<ul class="el-menu">')

                    htmls.push($.format('<li class="el-menu-item"><a ui-spa href="{url}">{title}</a></li>', menu), '</ul></li>');
                } else {
                    htmls.push('<li class="el-menu-item" data-icon="', it.icon || '\uf02d', '"><a ui-spa href="', it.url, '">', it.title, '</a></li>');
                }
                htmls.push('</div>');
            }
            $('#menubar').append(htmls.join(''));

            $.UI.Command('Exp', 'Menu', 'Root', function (xhr) {
                var b = false;
                for (var i = 0; i < xhr.length; i++) {
                    if (xhr[i].id == '4448') {
                        b = true;
                        break;
                    }
                }
                if (b)
                    $('#menubar').append('<div class="menu-wrapper"><li class="el-menu-item" data-icon="\uf108"><a target="_blank" href="https://irpt.kukahome.com/irpt/esmain/portal/loginportal.do?portalid=metroL">手工采集</a></li></div>')
                        ;
            })

        });
    }).On('UI.Push', function (e, xhr) {
        $('.navbar #header-search').cls('hide', xhr.search == false);
        var m = $('.navbar #menu');
        m.children().remove()
        m.append(xhr.menu);
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
        xhr.title.appendTo($('#breadcrumb-container')).siblings().remove();
        app.parent('#app').cls('hideSidebar', xhr.root.is('div[hidesidebar]'))
            .cls('hideScrollbar', xhr.root.is('div[hidescrollbar]'));

        $(document.body).cls(ocls || '', 0).cls(cls || '', 1);
    });
    WDK(function ($) {

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
        var search = $('#header-search');
        search.find('form').submit(function () {
            var input = $(this).find('input');
            var value = input.val();
            var root = $('section.app-main>div[ui].ui');
            root.on('search', value, input) !== false ?
                root.find('.pagination-container')
                    .on('search', value) : 0;
            return false;
        }).find('input').on('input', function () {
            var input = $(this);//.find('input');
            var value = input.val();
            if (!value) {
                search.siblings('*[role=menu]').click();
            } else {
                var root = $('section.app-main>div[ui].ui');
                root.on('searchValue', value, input);
            }

        })

        WDK.UI.On('Tip.Search', function (e, v, f) {
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
                menu.html($.format(f || '<li ><a href="{href}">{text}</a></li>', v));
            }


        });


        $('.navbar .help').click(function () {
            var ui = $('section.app-main>div[ui].ui');
            var id = ui.attr('help-id') || ui.attr('ui').split('/')[0];
            var me = $(this);
            me.attr('href', 'subject/help/' + id)
        });

        var login = $('.login-container');
        if (login.css('display').indexOf('none') > -1) {

            $(window).on('page', 'download', '');
            return;
        }

        $.UI.Command("Account", "Check", "Info", function (xhr) {
            $.UI.Device = xhr.Device;
            if (xhr.IsCashier) {
                $.UI.On('Cashier', xhr);
            } else {
                $.api('Message', 'mqtt', cfg => {
                    var client = new Paho.MQTT.Client(cfg.broker, 443, cfg.client);
                    client.onConnectionLost = function () { };
                    login.find(".qrcode_view .context").click('a', function () {
                        login.on("connect");
                    });

                    var qrcode = new QRCode(document.getElementById("qrcode"), {
                        width: 200,
                        height: 200
                    });
                    client.onMessageArrived = function (message) {
                        var uss = [].concat(JSON.parse(message.payloadString))[0];
                        if (uss.msg) {
                            if (uss.msg == 'OK') {
                                if (uss.code) {
                                    $.UI.Command('Exp', 'Login', {
                                        'Code': uss.code,
                                        CorpId: uss.corpId
                                    });
                                } else {
                                    location.reload(false);
                                }
                            } else {
                                login.find(".qrcode_view .context").html(['<b>', uss.msg, '</b>'].join(''));
                            }
                        }

                    };
                    var timeId = 0;
                    login.on('disconnect', function () {
                        client.disconnect();
                        clearTimeout(timeId);
                        login.find(".qrcode_view .context").html("<a>刷新二维码</a>");
                    }).on('connect', function () {
                        client.connect({
                            useSSL: true,
                            userName: cfg.user,
                            password: cfg.pass,
                            onSuccess: function () {
                                login.find(".qrcode_view .context").children().remove();
                                qrcode.makeCode(['https://data.kukahome.com/umc.sso.html?', xhr.Device].join(''));
                                timeId = setTimeout(function () {
                                    login.on('disconnect')
                                }, 60000);
                            },
                            mqttVersion: 4,
                            onFailure: function (e) {
                                console.log(e);
                                login.find(".qrcode_view .context").html("<a>扫码错误，请刷新</a>");
                            }
                        });
                    }).on('connect');
                });
            }
        });
        login.find('form').submit(function () {
            var v = $(this).val();
            WDK.UI.Command('Settings', "Login", v);
            return false;
        });

        WDK.UI.On('Cashier', function (e, v) {
            $('.sidebar-logo-container a')
                .attr('data-name', v.Alias.substr(0, 1)).find('img').attr('src', v.Src);
            $('.umc-logo-name').text(v.Alias);
            login.cls('hide', 1);

            WDK.shift('main', 'exp/explore');
            $.page('exp/explore', '数据浏览', '\uf1fe').page('exp/favoriter', '我的收藏', '\uf006').page('exp/recent', '最近浏览', '\uf0f4').page('exp/view', '数据', false);

            $.menu();

            $(window).on('popstate');
        }).On('User', function () {
            location.reload(false);

        }).On('Close', function () {
            location.reload(false);
        });


    });

})(WDK);