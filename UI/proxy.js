
(function ($) {
    $.page('proxy', '应用网关', function (root) {
        var search = { limit: 'PC' };
        root.on('menu', [{
            text: '加载日志', click: { model: 'Proxy', cmd: 'Site', send: 'LogSetting' }
        }, {
            text: '新增应用', click: { model: 'Proxy', cmd: 'Site', send: 'Create' }
        }]);
        // root.on('menu', { text: '新增', click: { model: 'Proxy', cmd: 'Site', send: 'Create' } });
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

var s = [{ "data": [{ Text: "中文（简体）", Value: "zh_CN" }, { Text: "中文（繁體）", Value: "zh_TW" }, { Text: "English", Value: "en" }], "name": "_lang", "title": "设置语音" }]
