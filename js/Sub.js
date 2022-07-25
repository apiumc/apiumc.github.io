UMC.UI.Config({ 'posurl': 'http://fc.365lu.cn/UMC/' + (UMC.cookie('device') || UMC.cookie('device', UMC.uuid())) });
UMC.Src = '/UI/';
UMC.SPA = '/';
UMC(function ($) {
    requestAnimationFrame(function () {
        $(window).on("popstate", function () {
            var path = location.pathname;
            $('.header-sub-nav .menu-site').find('li').cls('is-active', 0).find('a').each(function () {
                var m = $(this);
                var s = m.attr('ui-spa');

                var k = s ? ($.SPA + s) : m.attr('href');
                if (k == path) {
                    m.parent().cls('is-active', 1);
                    return false;
                }
            });
        }).on('popstate');
    });

});