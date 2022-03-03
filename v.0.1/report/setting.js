(function ($) {

    $.page('report/setting', "报表配置", function (root) {
        var paging = $('.pagination-container', root).paging("Report", "Setting", $('table tbody', root)).on('sort', root.find('.el-sort'));

        $('table', root).thead();
        root.ui('Report.Edit', function () {
            paging.on('search')
        })
    })
})(WDK);