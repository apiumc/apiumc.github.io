UMC.UI.Config({ 'posurl': 'https://api.apiumc.com/UMC/' + (UMC.cookie('device') || UMC.cookie('device', UMC.uuid())) });
// UMC.UI.Config({ 'posurl': 'http://127.0.0.1:5188/UMC/' + (UMC.cookie('device') || UMC.cookie('device', UMC.uuid())) });
UMC.Src = '/UI/';
UMC.SPA = '/';

var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?9f08376e93197587c3cb30e45a9d0091";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();

UMC(function ($) {
var site=$('.header-sub-nav .menu-site');///proxy/image/cast
site.html([
    '<li><a ui-spa href="/">知识录</a></li>',
    '<li><a ui-spa href="/Gateway">应用网关</a></li>',
    '<li><a ui-spa href="/Bridge">内网穿透</a></li>'].join(''));
    requestAnimationFrame(function () {
        $(window).on("page", function () {
            var path = location.pathname;
            site.find('li').cls('is-active', 0).find('a').each(function () {
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