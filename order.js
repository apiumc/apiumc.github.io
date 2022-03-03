WDK.page('order', '订单管理', function (root) {
    var paging = root.find('.pagination-container').paging("Order", "Search", root.find('table tbody'))
        .on('sort', root.find('.el-sort'));
    root.ui('schedule', function () {
        paging.on('search')
    });
    WDK('table', root).thead();
})
