(function ($) {

    $.page('exp/view', "数据分析", false, function (root) {
        var urlKey = location.hash;
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
            urlKey = location.hash;
            v.key ? WDK.UI.Command('Exp', 'LinkAtt', v.key) : 0;
        }).on('backstage', function () {
            return false;
        }).on('event', function (e, k) {
            switch (k) {
                case 'favoriter':
                    WDK.UI.Command('Exp', 'Favorite', {
                        Url: urlKey
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