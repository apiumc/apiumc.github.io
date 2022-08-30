UMC.UI.Config({ 'posurl': 'https://api.apiumc.com/UMC/' + (UMC.cookie('device') || UMC.cookie('device', UMC.uuid())) });
UMC.Src = '/UI/';
UMC.SPA = '/';
UMC(function ($) {
    requestAnimationFrame(function () {
        $(window).on("page", function () {
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
            var m=$('.box-card-user.dashboard');
            m.cls('is-active', m.attr('href')==path);
        }).on('popstate');
    });

});