(function ($) {
    WDK.page('platform/items', '平台账户', function (root) {
        root.on('menu', { text: '新建账户', click: { model: "Platform", cmd:"Register"}})
        root.find('.pagination-container').paging("Platform", "Search", root.find('table tbody'), {
            down: function (x) {
                return x.OffLine ? "el-tag--danger" : ''
            }
        }).on('sort', root.find('.el-sort'));
        WDK('table', root).thead();
    }, '\uf0c2');
    
    
    
})(WDK);
