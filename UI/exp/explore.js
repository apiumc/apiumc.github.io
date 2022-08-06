(function ($) {
    $.page('exp/explore', '我的浏览', function (root) {
        // menu.html(root.find('#menu').text()).cls('right-menu-item', 1).find('.ListScreen').click(function () {
        //     $(this).cls('base');
        //     root.cls('navlist')
        // });
        // root.on('menu', {
        //     icon: '\f0c9',
        //     key:'ShowModel'
        // });
        var menus = [];
        root.on('nav', function (e, v) {
            WDK.UI.Command('Exp', 'Nav', { name: v, type: 'nav' }, function (xhr) {
                var tree = []; var leaf = [];
                var data = xhr.navs;
                for (var i = 0; i < data.length; i++) {
                    var it = data[i];
                    if (it.href) {
                        it.item = "leaf";
                        leaf.push(it);
                    } else {
                        it.type = 'Nav'
                        tree.push(it);
                    }

                }
                menus = [];
                for (var i = 0; i < xhr.menu.length; i++) {
                    menus.push({ text: xhr.menu[i].name, key: xhr.menu[i].id })
                }
                root.on('title', menus);
                root.find('.sso-explore').format(tree.concat(leaf), {
                    attr: function (x) {
                        if (x.item == 'leaf')
                            return 'href="#exp/view?key=' + x.id + '"'
                        else
                            return 'data-id="' + x.id + '"'
                    }
                }, true);
            });
        });

        root.on('hash', function (e, v) {
            root.on('nav', v.n || '2794')

        }).on('searchValue', function (e, v) {
            WDK.UI.Command('Exp', 'Nav', { name: v, type: 'search' }, function (xhr) {
                if (Array.isArray(xhr)) {
                    var vs = [];
                    xhr.forEach((item, index) => vs.push({ text: item.text, click: { key: 'Url', send: item.href } }));
                    $(window).on('select', vs);
                }
            });
        }).ui('Check.Pass', function () {
            root.on('nav', '2794');
        }).ui('image', function () {
            root.on('nav', menus[menus.length - 1].id || '2794');
        }).on('event', function (e, k) {

            root.on('nav', k);
        })


        root.find('.sso-explore').click('.sso-nav-tap', function () {

            var me = $(this);
            var mid = me.attr('data-id');
            if (mid) {
                if (me.is('.leaf') == false) {
                    root.on('nav', mid);
                } else {
                    location.hash = 'exp/view?key=' + mid;
                }
                return false;
            }
        }).click('.sso-nav-name', function (e) {

            $(e.target).is('a') ? 0 : $(this).parent('.sso-nav').find('a').eq(0).click();
        });

    });
})(WDK);