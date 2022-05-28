
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

    $.UI.On('Page.Menu', function (e, mu) {
        $(function () {
            var htmls = [];
            for (var i = 0; i < mu.length; i++) {
                var it = mu[i];
                var menu = it.menu || [];
                htmls.push('<div class="menu-wrapper">');
                if (menu.length) {
                    htmls.push('<li  class="el-submenu">', '<div class="el-submenu__title" data-icon="', it.icon || '\uf02d', '" >', it.text, '<i class="el-submenu__icon-arrow"></i></div>', '<ul class="el-menu">')

                    htmls.push($.format('<li class="el-menu-item"><a ui-spa href="{url}">{text}</a></li>', menu), '</ul></li>');
                } else {
                    htmls.push('<li class="el-menu-item" data-icon="', it.icon || '\uf02d', '"><a ui-spa href="', it.url, '">', it.text, '</a></li>');
                }
                htmls.push('</div>');
            }

            $('#menubar').append(htmls.join(''));

        });
    }).On('UI.Push', function (e, xhr) {
        $('.navbar #header-search').cls('hide', xhr.search == false);
        var app = $('section.app-main');
        var last = app.children('div[ui].ui').cls('ui', 0);
        $.UI.On('UI.Backstage', last);
        last.on('backstage') === false ? 0 : last.remove();
        xhr.root.cls('ui', 1).parent()[0] != app[0] ? xhr.root.appendTo(app).on('active') : xhr.root.on('active');
        $(window).on('title', xhr.title).on("menu", xhr.menu || []);
    });
    $(function ($) {
        var app = $('section.app-main');

        var menu = $('.navbar #menu').click('a', function () {
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

        });
        var title = $('#breadcrumb-container').click('a', function () {

        });
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
                        title.append(document.createTextNode(v + ''));
                    }
                }

            } else {
                $(document.createElement('span')).text(vs).appendTo(title);
            }
        });
        $(window).on('menu', function (e, vs) {
            menu.children().remove();
            if (Array.isArray(vs)) {
                for (var i = 0; i < vs.length; i++) {
                    var v = vs[i];
                    if (typeof v == 'object') {
                        var a = $(document.createElement('a')).text(v.text || '').attr('key', v.key || false).addClass('el-button filter-item el-button--primary el-button--small');
                        v.click ? a.attr('click-data', JSON.stringify(v.click)) : 0;
                        v.icon ? a.attr('data-icon', v.icon) : 0
                        a.appendTo(menu);
                    } else {
                        menu.append(document.createTextNode(v + ''));
                    }
                }
            }
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
        $('#header-search form').submit(function () {
            var input = $(this).find('input');
            var value = input.val();
            var root = $('section.app-main>div[ui].ui');
            root.on('search', value, input) !== false ?
                root.find('.pagination-container')
                    .on('search', value) : 0;
            return false;
        });
        $('.navbar .help').click(function () {
            var ui = $('section.app-main>div[ui].ui');
            var me = $(this);
            me.attr('href', ['help', (ui.attr('help-doc') || '365lu'), ui.attr('ui').split('/')[0]].join('/'))
        });

        $.UI.Command("Account", "Check", "Info", function (xhr) {
            $.UI.Device = xhr.Device;
            if (xhr.IsCashier) {
                $.UI.On('Cashier', xhr);
            }
        });
 

        $.UI.On('Cashier', function (e, v) {
            $('.sidebar-logo-container a')
                .attr('data-name', v.Alias.substr(0, 1)).find('img').attr('src', v.Src);//.attr('data-alias', v.Alias)
            $('.umc-logo-name').text(v.Alias);
            
        }).On('Close', function () {
            location.reload(false);
        }); 
    });

})(UMC);