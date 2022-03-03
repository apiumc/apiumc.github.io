(function ($) {

    $.page('chart/sale', "门店采购单", function (root) {

        let searchValue = { type: 'day' };
        let charts = [];
        root.find('.el-date-value').date().on('change', function (e, v) {
            var dateValue = v || this.value;
            if (dateValue) {
                var gs = dateValue.split(/-|\//g);
                var bs = $(this).find("b");
                bs.eq(0).text(gs[0]);
                bs.eq(1).text(gs[1]);
                bs.eq(2).text(gs[2]);
                WDK.UI.Command('Report', 'Sale', dateValue);
            }
        });
        $.script('js/echarts.min.js').link('css/date.css').link('css/umc.report.css')
            .wait(function () {
                root.find('.el-date-value').on('change', $.datefmt(new Date(), 'yyyy-MM-dd'));

            });

        root.find('.filter-container .el-sort').click(function () {
            var m = $(this);
            if (!m.is('.is-active')) {
                m.cls('is-active', 1).siblings().cls('is-active', 0);
            }
            searchValue.type = m.attr('search-value');
            root.on('query');
        });
        root.find('.item-container .el-sort').click(function () {
            var m = $(this);
            if (!m.is('.is-active')) {
                m.cls('is-active', 1).siblings().cls('is-active', 0);
            }
            searchValue.Index = m.attr('data-index');
            root.on('chart');
        });
        let paging = $('.pagination-container', root);
        root.find('table').click('thead th', function () {
            var me = $(this);
            if (me.is('.is-active')) {
                me.cls('desc', !me.is('.desc'));
            } else {
                $(this).addClass('is-active').siblings().cls('is-active', false);
            }
            paging.on('search', { sort: me.find('i').attr('data-field'), dir: me.is('.desc') ? 'DESC' : "ASC" })
        });
        root.find('table thead').click('th i[data-field]', function () {
            var me = $(this);
            WDK.UI.Command('Report', 'Filter', { Session: searchValue.Session, Field: me.attr('data-field') });
            return false;
        });
        root.on('chart', function () {


            WDK.UI.Command('Report', 'Chart', searchValue, function (xhr) {
                var dom = root.find('#charts');
                var series = xhr.series;
                delete xhr.series;

                var option = {
                    tooltip: {
                        trigger: 'axis'
                    },
                    dataset: xhr,
                    legend: {},
                    xAxis: { type: 'category' },
                    yAxis: {},
                    series: series
                };
                echarts.init(dom[0], { width: 'auto' }).setOption(option);


            }); 

        }).on('query', function () {
            if (searchValue.Session) {
                if (charts.length > 0)
                    searchValue.Index = 0;
                paging.on('param', searchValue).on('search');

                root.on('chart'); 
            }
        }).ui('Report.Filter', (e, v) => {
            let keys = {};
            (v.Filter || []).forEach((e, i) => {
                keys[e] = true;
            });
            root.find('.el-table thead th i').each(function () {
                var me = $(this);
                me.cls('is-active', keys[me.attr('data-field')]);
            });
            root.on('query');
            // paging.on('search');

        }).ui('Report', (e, v) => {
            searchValue.Session = v.Session;
            charts = v.chart || [];
            root.on('query');
            var header = v.header || [];
            var table = root.find('.el-table');

            if (table.is('.hide')) {
                table.find('colgroup').html($.format('<col width="100"/>', header));
                table.find('thead').html(['<tr>', $.format('<th>{Header}<i data-field="{Name}"></i></th>', header), '</tr>'].join(''));
                table.find('tbody').html(['<script type="text/html"><tr>', $.format('<td>{{Name}}</td>', header), '</tr></script>'].join(''));
                table.cls('hide', false);
                paging.paging("Report", "Data", $('table tbody', root)).on('param', searchValue)
                    .cls('hide', false).on('search')

                $('table', root).thead();
            } else {
                paging.on('param', searchValue).on('search');
            }
            root.find('.el-table thead th i').removeClass('is-active')
        });



    })
})(WDK);