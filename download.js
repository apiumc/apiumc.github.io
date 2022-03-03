(function ($) {


    $.page('download', '应用下载', false, function (root) {
        $.page('builder', '架建应用', false);
        var browser = {
            versions: function () {
                var u = navigator.userAgent;
                return {
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios缁堢
                    android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android缁堢
                    weixin: u.indexOf('MicroMessenger') > -1,
                };
            }()
        };
        $.script('js/qrcode.min.js').wait(function () {
            var href = $.UI.On('App.DownloadUrl') || location.href;
            new QRCode(document.getElementById("qrcode"), {
                width: 200,
                height: 200
            }).makeCode(href);
        });
        $.UI.Command("UI", "App", 'json', function (xhr) {
            root.find('h1.name span').text(xhr.AppName || '未设置');
            root.find('.icon img').attr("src", xhr.IconSrc || 'https://www.365lu.cn/UserResources/app/pos_app_180.png');


            var btn = root.find('#actions').click(function () {
                if (browser.versions.weixin) {
                    root.addClass('wechat');
                } else if (browser.versions.ios) {
                    if (!xhr.IOS) {
                        xhr.IsMaster ? $(window).on('page', 'builder', '') : $.UI.Msg('未生成IOS应用');

                    } else {
                        location.href = xhr.IOS;
                    };
                } else {
                    if (!xhr.Android) {
                        xhr.IsMaster ? $(window).on('page', 'builder', '') : $.UI.Msg('未生成Android应用');

                    } else {
                        location.href = xhr.Android
                    };
                }

            }).find('button')
            if (!xhr.Android && !xhr.IOS) {
                btn.text(xhr.IsMaster ? "生成移动应用" : "请联系管理员")
            }
        })
    })
})(WDK);