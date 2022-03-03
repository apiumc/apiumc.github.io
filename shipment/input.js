(function ($) {

    $.page('shipment/input', "入库调拨单", function (root) {
        var paging = $('.pagination-container', root).paging("Stocktaking", "Search", $('table tbody', root), {
            down: function (x) {
                return x.OffLine ? "el-tag--danger" : ''
            }
        }).on('param', { 'Type': 'ShipmentInput' }).on('sort', root.find('.el-sort'));

        $('table', root).thead();
        root.ui('Shipment.Edit', function () {
            paging.on('search');
        })

    })

})(WDK);