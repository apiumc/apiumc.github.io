(function ($) {
    // $.page('')
    $.page('proxy/setting', '门神网关', function (root) {

        // menu.html(root.find('#menu').text()).cls('right-menu-item', 1);

        root.on('menu', { text: '新增', click: { model: 'Proxy', cmd: 'Site', send: 'Create' } });
        root.ui('Site.Config', function () {
            WDK.UI.Command('Proxy', 'Site', function (xhr) {
                root.find('table tbody').format(xhr.data || [], true);
            });
        });
        root.on('hash', function () {
            root.ui('Site.Config')
        });
    });
})(WDK);