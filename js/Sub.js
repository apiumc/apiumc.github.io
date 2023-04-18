UMC.UI.Config({ 'posurl': 'https://api.apiumc.com/UMC/' + (UMC.cookie('device') || UMC.cookie('device', UMC.uuid())) });
// UMC.UI.Config({ 'posurl': 'http://127.0.0.1:5188/UMC/' + (UMC.cookie('device') || UMC.cookie('device', UMC.uuid())) });
UMC.Src = '/UI/';
UMC.SPA = '/';

var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?bad6c3952154c8a63970c8c40e650f66";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();

UMC(function ($) {
var site=$('.header-sub-nav .menu-site');///proxy/image/cast
site.html([
    '<li><a ui-spa href="/">应用网关</a></li>',
    '<li><a ui-spa href="/#account">统一登录</a></li>',
    '<li><a ui-spa href="/#function">强化应用</a></li>',
    '<li><a ui-spa href="/#scenarios">经典场景</a></li>',
    '<li><a ui-spa href="/#userValue">客户价值</a></li>'
].join(''));
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