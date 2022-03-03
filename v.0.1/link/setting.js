(function ($) {

    $.page('link/setting', "网页连接", function (root) {
        var paging = $('.pagination-container', root).paging("Settings", "Link", $('table tbody', root)).on('sort', root.find('.el-sort'));

        $('table', root).thead();
        root.ui('Settings.Link', function () {
            paging.on('search')
        })
    })
})(WDK);