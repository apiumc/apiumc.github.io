UMC.page('authority', '功能授权', function (root) {
    root.on('menu', { text: '新建', click: { model: 'Settings', cmd: 'AuthKey', send: { Key: 'News', Type: 'Desc', Site: UMC.UI.Config().site || '0' } } })
    var paging = root.find('.pagination-container').paging("Settings", "AuthKey", root.find('table tbody'))
    UMC('table', root).thead();
    root.ui('Settings.Authority', function () {
        paging.on('search', { Site: UMC.UI.Config().site || '0' });
    }).ui('Settings.Authority');
})