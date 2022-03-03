(function ($) {

    $.page('report/control', "选项配置", function (root) {
        var paging = $('.pagination-container', root).paging("Report", "Control", $('table tbody', root)).on('search');

        $('table', root).thead();
        root.ui('Report.Control', function () {
            paging.on('search')
        })
    })
})(WDK);