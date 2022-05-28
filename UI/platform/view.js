(function ($) {
    $.page('platform/view', "专项验证", false, function (root, title, menu) {


        // var auther = menu.html(root.find('#menu').text()).cls('right-menu-item', 1).find('.favoriter');
        // var url = location.hash;
        // auther.click(function () {
        //     WDK.UI.Command('Exp', 'Favorite', { Url: url });
        // });
        // root.ui('Link', function (e, v) {
        //     root.find('iframe').attr('src', v.Url).attr('url', v.Url);
        //     title.html(['<div node-id="2794">浏览</div>', $.format('<div node-id="{id}" class="sso-nav-title">{name}</div>', v.menu), '<div class="sso-nav-title">', v.name, '</div>'].join(''));
        //     auther.text(v.fav ? "已经收藏" : "加入收藏")
        // });

        root.on('hash,active', function (e, v) {
            root.find('iframe').attr('src', $.UI.ViewUrl || 'about:blank');
            // url = location.hash;
            // v.key ? WDK.UI.Command('Exp', 'Link', v.key) : 0;
            // }).on('backstage', function () {
            //     return false;
            // }).on('active',function(){

        })
        // title.cls('sso-nav-header', 1).click('div[node-id]', function () {
        //     location.hash = 'exp/explore?n=' + $(this).attr('node-id');
        // });

        // root.ui('Favorite', function (e, v) {
        //     auther.text(v.fav ? "已经收藏" : "加入收藏")
        // });

        // function isFullscreenForNoScroll() {
        //     var explorer = window.navigator.userAgent.toLowerCase();
        //     if (explorer.indexOf('chrome') > 0) {//webkit
        //         if (document.body.scrollHeight === window.screen.height && document.body.scrollWidth === window.screen.width) {
        //             return true;
        //         } else {
        //             return false
        //         }
        //     } else {
        //         if (window.outerHeight === window.screen.height && window.outerWidth === window.screen.width) {
        //             return true;
        //         } else {
        //             return false
        //         }
        //     }
        // }
        // $(window).on('resize', function () {
        //     requestAnimationFrame(function () {
        //         $(document.body).cls('umc-fullscreen', isFullscreenForNoScroll());
        //     });
        // });
        // menu.find('.refresh').click(function(){
        //     // root.find('iframe')[0].contentDocument.body
        //     var m =  root.find('iframe');//[0].contentDocument.body).find('#iframeflash iframe');
        //         m.parent().append(m.remove());

        // });
        // menu.find('.fullscreen').click(function () {

        //     let element = document.documentElement;
        //     if (element.requestFullscreen) {
        //         element.requestFullscreen();
        //     } else if (element.webkitRequestFullScreen) {
        //         element.webkitRequestFullScreen();
        //     } else if (element.mozRequestFullScreen) {
        //         element.mozRequestFullScreen();
        //     } else if (element.msRequestFullscreen) {

        //         element.msRequestFullscreen();
        //     }
        // });

    });
})(WDK);