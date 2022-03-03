(function ($) {
    $.page('proxy/log', '我的访问', false, function (root) {
        $.link('css/date.css')
        var searchValue = {};
        root.find('.filter-container .el-sort').click(function () {
            var m = $(this);
            if (!m.is('.is-active')) {
                m.cls('is-active', 1).siblings().cls('is-active', 0);
            }
            searchValue.type = m.attr('search-value');
            root.on('query');
        });

        root.find('.el-date-value').date().on('change', function (e, v, q) {
            var dateValue = v || this.value;
            if (dateValue) {
                var gs = dateValue.split(/-|\//g);
                var bs = $(this).find("b");
                bs.eq(0).text(gs[0]);
                bs.eq(1).text(gs[1]);
                bs.eq(2).text(gs[2]);
                searchValue.date = dateValue;
                if (!q) {
                    root.on('query');
                }
            }
        });

        root.on('query', function () {
            $.UI.Command('Proxy', 'Log', searchValue, function (xhr) {
                root.find('span[data-field]').each(function () {
                    var me = $(this);
                    me.text(xhr[me.attr('data-field')]);
                })
                root.find('.umc-proxy-logs').html($.format(['<div class="umc-proxy-log-info"><div class="umc-proxy-log-time" title="{date}" data-text="{time}"></div>',
                    '<div class="umc-proxy-log-desc">共请求<em>{quantity}</em>次，耗时<em>{duration}</em></div><div class="umc-proxy-log-sites">{sites}</div>',
                    '</div>'].join(''), xhr.data, {
                    sites: function (v) {
                        return $.format('<div>在<a>{caption}</a>请求<em>{quantity}</em>次，耗时<em>{duration}</em></div>', v.sites)
                    }
                })).cls('umc-proxy-logone', xhr.data.length == 1);

                root.find('.el-date-value').on('change', xhr.date, true);
            })
        });
        root.on('query');

    });
})(WDK);