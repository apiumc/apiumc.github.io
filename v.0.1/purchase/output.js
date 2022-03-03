(function ($) {

    $.page('purchase/output', "门店采购单", function (root) {
        $('.pagination-container', root).paging("Stocktaking", "Search", $('table tbody', root), {
            down: function (x) {
                return x.OffLine ? "el-tag--danger" : ''
            }
        }).on('param', { 'Type': 'PurchaseOutput' }).on('sort', root.find('.el-sort'));

        $('table', root).thead();

        root.ui('Purchase.Edit', function () {
            paging.on('search')
        })
    })
})(WDK);