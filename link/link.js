(function ($) {
    $.tpl('link', 'link/link', function (root, menu, title) {
        root.on('hash', function (e, v) {

            v.key ? WDK.UI.Command('Account', 'Link', v.key) : 0;
        });
        root.ui('Link', function (e, v) {
            root.find('iframe').src(v.link.Url);
        })
    });
})(WDK);