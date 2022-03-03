(function ($) {
    $.page('platform/explore', '监管站点', function (root, title, menu) {

        menu.html(root.find('#menu').text()).cls('right-menu-item', 1).find('.ListScreen').click(function () {
            $(this).cls('base');
            root.cls('navlist')
        });
        root.ui('Site.Config', function () {
            WDK.UI.Command('Platform', 'Site', function (xhr) {
                var tree = xhr.data || [];

                root.find('.umc-sso-explore').format(tree, true);
             });
        });
        

        root.on('hash', function () {
            root.ui('Site.Config') 
        });

 

    });
})(WDK);