(function ($) {

    WDK.page('proxy/org', '应用账户', function (root) {
        var active = false;
        var Organize = root.find('#Organize').click('a', function () {
            Organize.find('a').removeClass('is-active');
            var m = $(this).addClass('is-active');
            m.cls('open', !m.is('.open'))

            if (active !== this) {
                active = this;
                root.on('Organize', m.attr('data-id'));
            }
            var ul = m.siblings('ul');
            if (!ul.length) {
                ul = $(document.createElement("ul")).appendTo(m.parent());
                UMC.UI.Command('Settings', 'Organize', { ParentId: m.attr('data-id') , limit: 'PC' }, function (xhr) {
                    if (xhr.length > 0) {
                        for (var i = 0; i < xhr.length; i++) {
                            var x = xhr[i];
                            var li = $(document.createElement('li')).appendTo(ul);
                            var a = $(document.createElement("a")).attr('data-id', x.Id).text(x.Caption).appendTo(li);
                            $(document.createElement("em")).appendTo(a);
                            li.append(document.createElement('s'));
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
        var site = 0;
        root.on('event', function (e, v, em) {

            switch (v) {
                case 'New':
                    break;
                case 'Role':
                    UMC.UI.Command('Settings', 'Role', { Site: site });
                    break;
                case 'User':
                    UMC.UI.Command('Proxy', 'User', { Id: em.attr('data-id'), Site: site });
                    break;
            }
        }).on('Organize', function (e, v) {
            WDK.UI.Command('Settings', 'Organize', { ParentId: v, Type: "User", limit: 'PC' }, function (x) {
                root.find('table tbody').format(x || [], {}, true)
                    .parent('.el-table').attr('msg', x.length === 0 ? "此组织未有成员" : false).cls('msg', x.length === 0);

            });
        }).on('search', function (e, v) {
            if (v) {
                $('.filter-container-item').text(['搜索“', v || '所有账户', '”'].join('')).attr('data-icon', '\uf1e5');
                UMC.UI.Command('Settings', 'User', { Keyword: v, start: 0, limit: 40 }, function (x) {
                    root.find('table tbody').format(x.data || [], {}, true)
                        .parent('.el-table').attr('msg', x.msg || (x.length === 0 ? "此组织未有账户" : false)).cls('msg', x.data.length === 0);
                })
            } else {
                Organize.find('a.is-active').click();
            }
        }).ui('Settings.Organize', function (e, v) {
            var v2 = v || { Top: true };
            if (v2.Caption) {
                Organize.find('a.is-active').text(v2.Caption).append(document.createElement("b"));
            } else {
                if (v2.Parent) {
                    active = Organize.find('a.is-active');
                    var a = active.parent('ul').siblings('a');
                    if (a.length) {
                        active.removeClass('is-active');
                        a.addClass('is-active');
                    } else {
                        v2.Top = true;
                    }

                }
                if (v2.Top) {
                    UMC.UI.Command('Settings', 'Organize', { limit: 'PC' }, function (xhr) {
                        Organize.children().remove();
                        if (xhr.length > 0) {
                            for (var i = 0; i < xhr.length; i++) {
                                var x = xhr[i];
                                var li = $(document.createElement('li')).appendTo(Organize);
                                var a = $(document.createElement("a")).attr('data-id', x.Id).text(x.Caption).appendTo(li);
                                $(document.createElement("em")).appendTo(a);
                                li.append(document.createElement('s'));
                            }
                            Organize.find('a').eq(0).click();
                        } else {
                            root.find('.el-table').attr('msg', "未有组织，请搜索或新建组织").cls('msg');
                        }
                    });
                } else {

                    var active = Organize.find('a.is-active');
                    active.siblings('ul').remove();
                    active.click();
                }
            }
        });

        root.on('hash', function (e, v) {
            site = v.Site;
            root.ui('Settings.Organize');
        });
    })
})(WDK)