(function ($) {
    UMC.page('platform', '我的客户', function (root) {
        root.on('search', function (e, v) {
            UMC.UI.Command('Platform', 'Search', { Keyword: v || '', start: 0, limit: 40 }, function (x) {
                root.find('table tbody').format(x.data || [], {}, true)
                    .parent('.el-table').attr('msg', x.msg || "未有数据").cls('msg', x.data.length === 0);
            })
        }).on('search');
    });
})(UMC);
