(function ($) {

    $.page('stocktaking/product', '商品盘点单', function (root) {
       var paging= $('.pagination-container', root).paging("Stocktaking", "Search", $('table tbody', root), {
            down: function (x) {
                return x.OffLine ? "el-tag--danger" : ''
            }
        })
            .on('param', { 'Type': 'Product' })
            .on('sort', root.find('.el-sort'));

        $('table', root).thead(); 
        root.ui('Stocktaking.Edit', function () {
            paging.on('search');
        })
    })
})(WDK);