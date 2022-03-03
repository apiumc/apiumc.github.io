
(function ($) {
    $.page('proxy/app').page('proxy/log').page('proxy/user')
        .page('proxy', '应用网关', function (root) {
            var search = {};
            root.on('menu', { text: '新增', click: { model: 'Proxy', cmd: 'Site', send: 'Create' } });
            root.ui('Site.Config', function () {
                WDK.UI.Command('Proxy', 'Site', search, function (xhr) {
                    root.find('table tbody').format(xhr.data || [], true)
                        .parent('.el-table').attr('msg', xhr.msg || (search.Keyword ? '未有搜索到相关记录' : "未有配置的应用，请新增")).cls('msg', xhr.data.length === 0);
                });
            });
            root.on('hash', function () {
                root.ui('Site.Config')
            }).on('search', function (e, v) {
                if (v) {
                    search.Keyword = v;
                } else {
                    delete search.Keyword;
                }
                root.ui('Site.Config');
            })
        });
})(WDK);