
(function ($) {
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

                    htmls.push($.format('<li class="el-menu-item"><a {spa} href="{url}">{title}</a></li>', menu, {
                        spa: function (x) {
                            if (x.url.indexOf('#') == 0) {
                                return 'ui-spa'
                            }
                            return 'data-proxy="umc_' + x.root, '"'
                        }
                    }), '</ul></li>');
                } else {
                    var spa = it.url.indexOf('#') == 0 ? 'ui-spa' : ('data-proxy="umc_' + it.root + '"')
                    htmls.push('<li class="el-menu-item" data-icon="', it.icon || '\uf02d', '"><a ', spa, ' href="', it.url, '">', it.title, '</a></li>');
                }
                htmls.push('</div>');
            }
            $('#menubar').html(htmls.join(''));


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
    UMC(function ($) {

        $('#hamburger-container').click(function () {
            $(document.body).children('#app').cls('hideSidebar');
        });

        $('#menubar').click('a', function (e) {
            var m = $(this);
            $('#menubar li.is-active').cls('is-active', false);
            m.parent('li').cls('is-active', true);
            if (m.is('[data-proxy]')) {
                var proxy = $('#proxy').css('z-index', 99);
                requestAnimationFrame(function () {
                    proxy.attr('src', m.attr('href'))
                })
                return false;
            }
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
            var input = $(this);
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


        $.UI.Command("Account", "Check", "Info", function (xhr) {
            $.UI.Device = xhr.Device;
            if (xhr.Src) {
                $('.sidebar-logo-container a')
                    .attr('data-name', xhr.Alias.substr(0, 1)).find('img').attr('src', xhr.Src);
                $('.umc-logo-name').text(xhr.Alias);

            }
            if (xhr.IsCashier) {
                $.UI.On('Cashier', xhr);

            } else {
                location.href = '/Unauthorized?oauth_callback=' + unescape(location.pathname + location.search);
            }
        });

        $.page('proxy/log')
        $.page('proxy/app')
        $.page('proxy/error')
        $.page('proxy/setting')

        WDK.UI.On('Cashier', function (e, v) {
            UMC.UI.Command('Proxy', "Recent", function (xhr) {
                $.UI.On('Page.Menu', xhr);
            });
            WDK.shift('main', 'proxy/log');

            $(window).on('popstate');

        }).On('Close,User', function () {
            location.reload(false);
        });


    });

})(WDK);