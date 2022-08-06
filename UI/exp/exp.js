(function ($) {
    $.page('exp/explore', '浏览', function (root) {
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
                            return ' ui-spa href="#exp/view?key=' + x.id + '"'
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
    $.page('exp/favoriter', '我的收藏', false, function (root) {
        root.on('hash', function () {
            WDK.UI.Command('Exp', 'Nav', { type: 'Favorite' }, function (xhr) {
                root.find('.sso-explore').format(xhr, true);
                if (xhr.length == 0) {
                    root.find('.sso-explore').html('<div class="umc-favoriter-empty"></div>')
                }

            });
        });

    });

    $.page('exp/recent', "最近浏览", false, function (root) {

        root.on('active', function () {
            WDK.UI.Command('Exp', 'Nav', { type: 'Accesss' }, function (xhr) {
                root.find('.sso-explore').format(xhr, true);
                if (xhr.length == 0) {
                    root.find('.sso-explore').html('<div class="umc-recent-empty"></div>')
                }

            });
        })
        root.on('active');


    });
    $.page('exp/view', "数据分析", false, function (root) {
        root.on("menu", [{ key: 'fullscreen', icon: '\uf065' }, { key: 'analyse', text: '分析参数' }, { key: 'favoriter', text: '加入收藏' }, { key: 'refresh', hide: true, text: '刷新' }]);
        root.ui('Link', function (e, v) {
            if (v.Url) {
                root.find('iframe').attr('src', v.Url).attr('url', v.Url);
                root.on('menu', { key: 'refresh', hide: v.Url.indexOf('embed=y') == -1 })
            } else {
                WDK.UI.Command('Exp', 'ReportATT', {
                    Id: v.ReportId,
                    Auto: true
                });
            }
            root.attr('rid', v.ReportId);
            var ts = [{ key: '2794', text: '浏览' }];
            for (var i = 0; i < v.menu.length; i++) {
                ts.push({ key: v.menu[i].id, text: v.menu[i].name })
            }
            ts.push(v.name);
            root.on("title", ts);

            root.on('menu', { key: 'favoriter', text: v.fav ? "已经收藏" : "加入收藏" })
        }).ui('Report.Open', function (e, v) {
            $(document.body).addClass('wdk-loading');
            root.find('iframe').attr('src', v.Url).attr('url', v.Url);
            root.on('menu', { key: 'refresh', hide: v.Url.indexOf('embed=y') == -1 })

        }).ui('Favorite', function (e, v) {
            root.on('menu', { key: 'favoriter', text: v.fav ? "已经收藏" : "加入收藏" })
        }).on('hash', function (e, v) {
            root.find('iframe').attr('src', 'about:blank');
            v.key ? WDK.UI.Command('Exp', 'LinkAtt', v.key) : 0;
        }).on('backstage', function () {
            return false;
        }).on('event', function (e, k) {
            switch (k) {
                case 'favoriter':
                    WDK.UI.Command('Exp', 'Favorite', {
                        Url: '#exp/view?' + root.attr('hash')
                    });
                    break;
                case 'analyse':
                    var rid = root.attr('rid');
                    if (rid) {
                        WDK.UI.Command('Exp', 'ReportATT', rid);
                    }
                    break;
                case 'fullscreen':
                    var element = document.documentElement;
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.webkitRequestFullScreen) {
                        element.webkitRequestFullScreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.msRequestFullscreen) {

                        element.msRequestFullscreen();
                    }
                    break;
                case 'refresh':
                    var iframe = root.find('iframe');
                    var url = iframe.attr('url'); // v.Url);
                    if (url.indexOf('Cache=NO') == -1 && url.indexOf('embed=y') > 0) {
                        url = url + "&Cache=NO";
                        root.find('iframe').attr('src', url).attr('url', url);

                    }
                    root.on('menu', { key: 'refresh', hide: true })
                    break;
                default:
                    location.hash = 'exp/explore?n=' + k;
                    break;
            }
        }).find('iframe').on('load', function () {
            $(document.body).removeClass('wdk-loading');
        });

    });
})(WDK);