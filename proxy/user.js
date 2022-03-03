(function ($) {

    WDK.page('proxy/user', '使用人员', false, function (root) {
        var site = 'oa';
        var active = false;
        var Organize = root.find('#Organize').click('a', function () {
            Organize.find('a').removeClass('is-active');
            var m = $(this).addClass('is-active').removeClass('loadsub');
            m.cls('open', !m.is('.open'))
            var ul = m.siblings('ul');
            if (active !== this) {
                active = this;
                root.on('dept_id', m.attr('data-id'), true);
            }
            if (!ul.length) {
                ul = $(document.createElement("ul")).appendTo(m.parent());
                UMC.UI.Command('Settings', 'DingTalk', {
                    Path: '/topapi/v2/department/listsub',
                    dept_id: m.attr('data-id'),
                    "language": "zh_CN"
                }, function (r) {
                    var xhr = r.result;
                    if (xhr.length > 0) {
                        for (var i = 0; i < xhr.length; i++) {
                            var x = xhr[i];
                            var li = $(document.createElement('li')).appendTo(ul);
                            var a = $(document.createElement("a")).attr('data-id', x.dept_id).text(x.name).appendTo(li);
                            li.append(document.createElement('s'));
                            a.append(document.createElement('em'));
                        }
                    }
                });
            }
            var text = [];
            text.push(m.text());
            var p = m.parent('ul');
            while (!p.is('#Organize')) {
                var c = p.siblings('a');
                text.push(c.text());
                p = c.parent('ul');
            }
            $('.filter-container-item').text(text.reverse().join('  /  ')).attr('data-icon', '\uf0e8');
        });
        root.on('hash', function (e, v) {
            site = v.key;//
            Organize.find('a').eq(0).click();
        }).on('event', function () {
            var active = Organize.find('a.is-active');

            if (!active.is('.loadsub')) {
                active.addClass('loadsub');
                Organize.find('a.is-active~ul>li>a').each(function () {
                    root.on('dept_id', $(this).attr('data-id'), false);
                });
            }
        }).on('dept_id', function (e, dept_id, clear) {
            WDK.UI.Command('Settings', 'DingTalk', {
                Path: '/topapi/v2/user/list',
                "cursor": 0,
                "contain_access_limit": false,
                "size": 100,
                "order_field": "modify_desc",
                "language": "zh_CN",
                "dept_id": dept_id
            }, function (x) {
                var data = x.result.list || [];
                var ls = [];
                for (var i = 0; i < data.length; i++) {
                    var v = data[i];
                    ls.push(v.job_number || v.mobile || v.userid)
                }
                WDK.UI.Command('Proxy', 'User', {
                    Key: site || 'oa',
                    User: ls.join(',')
                }, function (x) {
                    root.on('title', x.caption);
                    var resKey = x.data;
                    for (var i = 0; i < data.length; i++) {
                        var v = data[i];
                        var k = v.job_number || v.mobile || v.userid;
                        v.Username = k;
                        v.activeTime = resKey[k] || '未使用'
                    }

                    var tbody = root.find('table tbody');
                    if (clear) {
                        tbody.format(data, {}, true);
                    } else {
                        tbody.html(tbody.html() + $.format(tbody.attr('html'), data, {}));
                    }
                    root.find('.el-table').attr('msg', tbody.html() ? false : "此组织未有成员").cls('msg', tbody.html() ? false : true);

                });
            });
        });
        UMC.UI.Command('Settings', 'DingTalk', {
            Path: '/topapi/v2/department/listsub',
            dept_id: 1,
            "language": "zh_CN"
        }, function (r) {
            var xhr = r.result;
            if (xhr.length > 0) {
                for (var i = 0; i < xhr.length; i++) {
                    var x = xhr[i];
                    var li = $(document.createElement('li')).appendTo(Organize);
                    var a = $(document.createElement("a")).attr('data-id', x.dept_id).text(x.name).appendTo(li);
                    li.append(document.createElement('s'));
                    a.append(document.createElement('em'));
                }
            }
            Organize.find('a').eq(0).click();
        });

    })
})(WDK)