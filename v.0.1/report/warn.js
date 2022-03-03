(function ($) {

    $.page('report/warn', "数据监听", function (root) {
        var paging = $('.pagination-container', root).paging("Report", "SettingWarn", $('table tbody', root)).on('sort', root.find('.el-sort'));

        $('table', root).thead();
        root.ui('Report.Warn', function () {
            paging.on('search')
        })
    })
})(WDK);