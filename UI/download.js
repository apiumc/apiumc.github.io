(function ($) {


    $.page('download', '应用下载', false, function (root) {
        // $.page('builder', '架建应用', false);
        var browser = {
            versions: function () {
                var u = navigator.userAgent;
                return {
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios
                    android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android
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
        root.find('h1.name span').text('Apiumc 移动管理端');
        root.find('.icon img').attr("src", 'https://www.apiumc.com/css/images/lappicon.png');


        // var btn = 
        root.find('#actions').click(function () {
            if (browser.versions.weixin) {
                root.addClass('wechat');
            } else if (browser.versions.ios) {
                location.href = "https://apps.apple.com/cn/app/apiumc/id6450646185";//xhr.IOS;

            } else {
                location.href = "/app/apiumc.apk";
            }

        });
    })
})(WDK);