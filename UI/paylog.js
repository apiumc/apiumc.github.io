($ => {
    $.page('paylog', '支付对账', function (root) {
        var paging = $('.pagination-container', root).paging("Card", "PayLog", $('table tbody', root)).on('sort', root.find('.el-sort'));
        $('table', root).thead();
        $('form', root).on('submit', function () {
            var fm = $(this);
            var search = {};
            search.startDate = $("#startDate", fm).val();
            search.endDate = $("#endDate", fm).val();
            paging.on('search', search);
            return false;
        });
        $('#exportCsv', root).click(function () {
            var f = {};
            f.startDate = $("#startDate", root).val();
            f.endDate = $("#endDate", root).val();
            f.export = "export";

            WDK.UI.Command("Card", "PayLog", f);
        });
        $('#total', root).click(function () {
            var search = {};
            search.startDate = $("#startDate").val();
            search.endDate = $("#endDate").val();
            search.total = "total";
            paging.on('search', search);

            return false;
        });

    });
})(WDK);