(function ($) {

    $.page('exp/recent', "最近浏览", function (root) {

        root.on('active', function () {
            WDK.UI.Command('Exp', 'Nav', { type: 'Accesss' }, function (xhr) {

                root.find('.sso-explore').format(xhr, true);
                if (xhr.length == 0) {
                    root.find('.sso-explore').html('<div class="umc-recent-empty"></div>')
                }

            });
        })
        root.on('active');

        root.on('searchValue', function (e, v) {
            WDK.UI.Command('Exp', 'Nav', { name: v, type: 'search' }, function (xhr) {
                WDK.UI.On('Tip.Search', xhr);
            });
        })

    });
})(WDK);