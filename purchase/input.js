(function ($) {

    $.page('purchase/input', "门店采购单", function (root) {
       var paging= $('.pagination-container', root).paging("Stocktaking", "Search", $('table tbody', root), {
            down: function (x) {
                return x.OffLine ? "el-tag--danger" : ''
            }
        }).on('param', { 'Type': 'PurchaseInput' }).on('sort', root.find('.el-sort'));

        $('table', root).thead();
        root.ui('Purchase.Edit', function () {
            paging.on('search') 
        })
    })
})(WDK);