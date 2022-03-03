($ => {
    $.pivot = (root, title) => {
        let reportId;
        let myChart;
        let searchValue = {};
        let paging = $('#table.pagination-container', root).paging("Report", "Data", $('#table table tbody', root));
        let pivotPaging = $('.el-pivot-table .pagination-container', root).paging("Report", "PivotData", $('.el-pivot-table table tbody', root), {
            html: function (x) {
                return $.format('<th {c} {r}>{n}</th>', x, {
                    c: function (x) {
                        return x.ColSpan ? ['ColSpan="', x.ColSpan, '"'].join('') : '';
                    },
                    r: function (x) {
                        return x.RowSpan ? ['RowSpan="', x.RowSpan, '"'].join('') : '';
                    },
                    n: function (x) {
                        return (typeof x) == 'object' ? x.Name : x;
                    }
                })
            }
        });
        $.script('js/echarts.min.js').link('css/umc.report.css')
            .wait(function () {
                var dom = root.find('#charts');
                $('.main-container').on('resize', function () {
                    console.log(dom.offset())
                });
                myChart = echarts.init(dom[0]);
            });

        root.find('.filter-container ').click('a.el-sort', function () {
            var m = $(this);
            if (!m.is('.is-active')) {
                m.cls('is-active', 1).siblings().cls('is-active', 0);
            }
            searchValue.Index = m.attr('data-index') || 0;
            root.on('chart');
        }).click('a.is-active em', function () {
            var index = $(this).parent().attr('data-index') || 0;

            WDK.UI.Command('Report', 'PivotSession', { Id: searchValue.Session, Index: index });

            return false;
        })
        root.find('#table table').click('thead th', function () {
            var me = $(this);
            if (me.is('.is-active')) {
                me.cls('desc', !me.is('.desc'));
            } else {
                $(this).addClass('is-active').siblings().cls('is-active', false);
            }
            paging.on('search', { sort: me.find('i').attr('data-field'), dir: me.is('.desc') ? 'DESC' : "ASC" })
        });
        root.find('#table table thead').click('th i[data-field]', function () {
            var me = $(this);
            WDK.UI.Command('Report', 'Filter', { Session: searchValue.Session, Field: me.attr('data-field') });
            return false;
        });
        root.on('chart', function () {
            if (root.find('#Options a').length == 0) return;
            WDK.UI.Command('Report', 'Chart', searchValue, function (xhr) {
                var dom = root.find('#charts');
                dom.parent().attr('chart', xhr.Type);
                if (xhr.Type == 'Pivot') {

                    root.find('.el-pivot-table table thead').html($.format('<tr>{html}</tr>', xhr.headers, {
                        html: function (x) {
                            return $.format('<th {c} {r}>{n}</th>', x, {
                                c: function (x) {
                                    return x.ColSpan ? ['colspan="', x.ColSpan, '"'].join('') : '';
                                },
                                r: function (x) {

                                    return x.RowSpan ? ['rowspan="', x.RowSpan, '"'].join('') : '';
                                },
                                n: function (x) {
                                    return (typeof x) == 'object' ? x.Name : x;
                                }
                            })
                        }
                    }));
                    if (xhr.headers.length)
                        pivotPaging.on('param', { Session: searchValue.Session, Name: xhr.name }).on('search')

                    pivotPaging.cls('hide', !xhr.headers.length);

                } else {
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
                    if (xhr.Type == 'Pie') {
                        option.grid = { top: '55%' };
                        series.push({
                            type: 'pie',
                            seriesLayoutBy: 'row',
                            id: 'pie',
                            radius: '30%',
                            center: ['50%', '25%'],
                            label: {
                                formatter: '{b}: {@' + xhr.source[0][1] + '} ({d}%)'
                            },
                            encode: {
                                itemName: xhr.source[0][0],
                                value: xhr.source[1][0],
                                tooltip: xhr.source[1][0]
                            }
                        });

                        myChart.on('updateAxisPointer', function (event) {
                            var xAxisInfo = event.axesInfo[0];
                            console.log(event.axesInfo)
                            if (xAxisInfo) {
                                var dimension = xAxisInfo.value + 1;
                                myChart.setOption({
                                    series: {
                                        id: 'pie',
                                        label: {
                                            formatter: '{b}: {@[' + dimension + ']} ({d}%)'
                                        },
                                        encode: {
                                            value: dimension,
                                            tooltip: dimension
                                        }
                                    }
                                });
                            }
                        });
                    } else {

                        myChart.off('updateAxisPointer');
                    }
                    var ofset = dom.offset();
                    myChart.setOption(option, true);
                    myChart.resize(ofset.width, ofset.height);


                }
            });
        }).on('event', function (e, v) {
            switch (v) {
                case 'add':
                    searchValue.Session ?
                        WDK.UI.Command('Report', 'PivotSession', { Id: searchValue.Session, Index: -1 }) : 0;
                    break;
                case 'exce':
                    reportId ? WDK.UI.Command('Report', 'Execue', reportId) : 0;
                    break;
                case 'export':

                    searchValue.Session ?
                        WDK.UI.Command('Report', 'Export', searchValue.Session) : 0;
                    break;
            }
        }).on('hash', function (e, v) {
            WDK.UI.Command('Report', "Session", v.key || v.Id);
        }).ui('Report.Open', (e, v) => {
            reportId = v.id;
            title.text(v.text);
            WDK.UI.Command('Account', 'Link', { Url: location.hash, Caption: v.text });
        }).ui('Report.Chart', (e, v) => {

            root.on('chart');

        }).ui('Report.Filter', (e, v) => {
            root.on('Filter', v);
            paging.on('search');
            root.on('chart');
        }).on('Filter', (e, v) => {
            let keys = {};
            (v.Filter || []).forEach((e, i) => {
                keys[e] = true;
            });
            root.find('#table.el-table thead th i').each(function () {
                var me = $(this);
                me.cls('is-active', keys[me.attr('data-field')]);
            });

        }).ui('Report', (e, v) => {
            if (v.id) {
                root.ui('Report.Open', v);
            }
            searchValue.Session = v.Session;
            root.find('#Options').format(v.chart || [], true).find('a').eq(0).click();


            paging.on('param', searchValue).on('search');
            var header = v.header || [];
            var table = root.find('#table.el-table');

            if (table.is('.hide')) {
                table.find('colgroup').html($.format('<col width="100"/>', header));
                table.find('thead').html(['<tr>', $.format('<th>{Header}<i data-field="{Name}"></i></th>', header), '</tr>'].join(''));
                table.find('tbody').html(['<script type="text/html"><tr>', $.format('<td>{{Name}}</td>', header), '</tr></script>'].join(''));
                table.cls('hide', false);
                paging.on('param', searchValue)
                    .cls('hide', false).on('search')

                $('#table  table', root).thead();
            } else {
                paging.on('param', searchValue).on('search');
            }
            root.find('#table.el-table thead th i').removeClass('is-active');

            root.on('Filter', v);
        });

        return $;
    };

    $.pivotDWM = (root, model, cmd) => {

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
                WDK.UI.Command(model, cmd, dateValue);
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

        return $;
    }
})(UMC)