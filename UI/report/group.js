(function ($) {

    $.page('report/group', "数据连接", function (root) {
        var paging = $('.pagination-container', root).paging("Report", "Group", $('table tbody', root)).on('search');

        $('table', root).thead();
        root.ui('Report.Group', function () {
            paging.on('search')
        })
    })
})(WDK);