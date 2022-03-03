(function ($) {
    $.page('proxy/app', '应用分析', false, function (root) {
        $.link('css/date.css')
        var searchValue = {};
        var isSearchUser = false;
        var userName = 'SELF';
        var Quantity = 3;

        root.on('event', function (e, v) {
            switch (v) {
                case 'user':
                    var dom = WDK(document.createElement('div')).attr({ 'ui': 'Debug', 'class': 'wdk-dialog' }) //.css({ 'background-color': '#FAFCFF'})
                        .on('transitionend,webkitTransitionEnd', function () {
                            dom.is('.ui') ? 0 : dom.on('pop');
                        }).appendTo(document.body)
                        .on('pop', function () {
                            dom.on('close').remove();
                        });
                    var debug = new UMC.UI.Form({
                        "Title": "应用分析", "DataSource": [{
                            "Title": "用户名", "Name": "User", "Type": "Text", "placeholder": "输入分析的用户名"
                        }],
                        "Type": "Form"
                    }, dom);
                    debug.Submit = function (v) {
                        userName = v.User;
                        searchValue.user = userName;
                        root.on('query');
                    };
                    WDK.UI.On("UI.Show", dom, 'Debug');
                    dom.addClass('ui');
                    break;
                case "Quantity":
                    var dom = WDK(document.createElement('div')).attr({ 'ui': 'Debug', 'class': 'wdk-dialog' }) //.css({ 'background-color': '#FAFCFF'})
                        .on('transitionend,webkitTransitionEnd', function () {
                            dom.is('.ui') ? 0 : dom.on('pop');
                        }).appendTo(document.body)
                        .on('pop', function () {
                            dom.on('close').remove();
                        });
                    var debug = new UMC.UI.Form({
                        "Title": "应用分析", "DataSource": [{
                            "Title": "日志数", "Name": "Quantity", DefaultValue: Quantity, "Type": "Number", "placeholder": "确认加载页面的日志数"
                        }],
                        "Type": "Form"
                    }, dom);
                    debug.Submit = function (v) {
                        Quantity = v.Quantity;
                        // Quantity=
                        searchValue.user = userName;
                        searchValue.Quantity = Quantity;
                        root.on('query');
                    };
                    WDK.UI.On("UI.Show", dom, 'Debug');
                    dom.addClass('ui');
                    break;
                    break;
            }
        });
        root.find('.filter-container .el-sort').click(function () {
            var m = $(this);

            if (!m.is('.is-active')) {
                m.cls('is-active', 1).siblings().cls('is-active', 0);
            }
            var sName = m.attr('search-name');
            switch (sName) {
                case 'user':
                    isSearchUser = true;
                    searchValue.user = userName;
                    break;
                case 'status':
                    isSearchUser = false;
                    searchValue[sName] = m.attr('search-value');
                    delete searchValue.user;
                    break;
                default:
                    searchValue[sName] = m.attr('search-value');
                    break;
            }



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
                if (isSearchUser) {
                    var table = root.find('.el-table').show();
                    table.find('tbody').format(xhr.data || [], {
                        fmt: function (x) {
                            var date = new Date(x.Time * 1000);//.toISOString();

                            return [date.getDate(), '日 ', date.getHours(), ':', date.getMinutes(), ':', date.getSeconds()].join('')
                            // "Y+": date.getFullYear().toString(),        // 年
                            //     "m+": (date.getMonth() + 1).toString(),     // 月
                            //         "d+": date.getDate().toString(),            // 日
                            //             "H+": date.getHours().toString(),           // 时
                            //                 "M+": date.getMinutes().toString(),         // 分
                            //                     "S+": date.getSeconds().toString()     
                        }
                    }, true);
                    root.find('.umc-proxy-logs').parent().hide();

                    table.cls('msg', !xhr.data.length).find('.el-empty-msg').find('a').text(xhr.user);
                    table.find('#user').text(xhr.user);
                } else {
                    root.find('span[data-field]').each(function () {
                        var me = $(this);
                        me.text(xhr[me.attr('data-field')]);
                    });

                    root.on('title', (xhr.site || "") + '日志分析')

                    var s200 = '<div class="umc-proxy-log-desc">有<em>{users}</em>用户，共请求<em>{quantity}</em>次，耗时<em>{duration}</em></div><div class="umc-proxy-log-sites">{sites}</div>';
                    if (xhr.error) {
                        s200 = '<div class="umc-proxy-log-desc">有<em>{users}</em>用户，出现错误<em>{quantity}</em>次</div><div class="umc-proxy-log-sites">{status}</div>'
                    }
                    root.find('.umc-proxy-logs').html($.format(['<div class="umc-proxy-log-info"><div class="umc-proxy-log-time" title="{date}" data-text="{time}"></div>',
                        s200,
                        '</div>'].join(''), xhr.data, {
                        status: function (v) {
                            return $.format('<div>其中<a>{caption}</a>错误<em>{quantity}</em>次，耗时<em>{duration}</em></div>', v.sites)
                        },
                        sites: function (v) {
                            return $.format('<div>在<a>{caption}</a>请求<em>{quantity}</em>次，耗时<em>{duration}</em></div>', v.sites)
                        }
                    })).cls('umc-proxy-logone', xhr.data.length == 1).parent().show();
                    root.find('.el-table').hide();

                    root.find('.el-date-value').on('change', xhr.date, true);
                }
            })
        });
        root.on('hash', function (e, v) {
            searchValue.site = v.key;
            root.on('query');
        });



    });
})(WDK);