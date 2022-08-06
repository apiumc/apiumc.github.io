(function ($) {
    $.page('exp/favoriter', '我的收藏', function (root) {
        root.on('active', function () {

            WDK.UI.Command('Exp', 'Nav', { type: 'Favorite' }, function (xhr) {
                root.find('.sso-explore').format(xhr, true);
                if (xhr.length == 0) {
                    root.find('.sso-explore').html('<div class="umc-favoriter-empty"></div>')
                }

            });
        });
        root.on('active');
        root.on('searchValue', function (e, v) {
            WDK.UI.Command('Exp', 'Nav', { name: v, type: 'search' }, function (xhr) {
                if (Array.isArray(xhr)) {
                    var vs = [];
                    xhr.forEach((item, index) => vs.push({ text: item.text, click: { key: 'Url', send: item.href } }));
                    $(window).on('select', vs);
                }
            });
        })

    });
})(WDK);