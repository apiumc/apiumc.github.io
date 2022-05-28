WDK.page('proxy/auth', '应用授权', function (root) {
    var site = 0;
    var paging = root.find('.pagination-container').paging("Settings", "AuthKey", root.find('table tbody'));
    WDK('table', root).thead();


    root.on('hash', function (e, v) {
        site = v.Site;

        root.on('menu', { text: '新建', click: { model: 'Settings', cmd: 'AuthKey', send: { Key: 'News', Type: 'Desc', Site: site } } })
        // root.on('menu', { text: '新建', click: { model: 'Settings', cmd: 'Menu', send: { Id: 'News', Site: site } } });
        paging.on('search', { Site: site });
    });

    root.ui('Settings.Authority', function () {
        paging.on('search');
    })
})