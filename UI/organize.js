(function ($) {

    $.page('organize', '账户组织', function (root) {
        var userSort;
        var active = false;
        var Organize = root.find('#Organize').click('a', function () {
            Organize.find('a').removeClass('is-active');
            userSort.option('disabled', false);
            var m = $(this).addClass('is-active');
            m.cls('open', !m.is('.open'))

            if (active !== this) {
                active = this;
                root.on('Organize', m.attr('data-id'));
            }
            var ul = m.siblings('ul');
            if (!ul.length) {
                ul = $(document.createElement("ul")).appendTo(m.parent());
                Sortable.create(ul[0], {
                    animation: 150,
                    onEnd: function (evt) {
                        if (evt.newIndex != evt.oldIndex) {
                            var ids = [];
                            $(evt.from).find('a').each(function () {
                                ids.push($(this).attr('data-id'));
                            });

                            ids.length > 1 ? UMC.UI.API('Settings', 'Organize', ids.join(',')) : 0;
                        }
                    }
                });

                UMC.UI.Command('Settings', 'Organize', { ParentId: m.attr('data-id'), limit: "PC" }, function (xhr) {
                    if (xhr.length > 0) {
                        for (var i = 0; i < xhr.length; i++) {
                            var x = xhr[i];
                            var li = $(document.createElement('li')).appendTo(ul);
                            var a = $(document.createElement("a")).attr('data-id', x.Id).text(x.Caption).appendTo(li);
                            $(document.createElement("b")).appendTo(a);
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

            $('.filter-container-item').text(text.reverse().join('  /  ')).attr('data-icon', '\uf0e8');;
        }).click('b', function () {
            UMC.UI.Command('Settings', 'Organize', $(this).parent().attr('data-id'));
            return false;
        });
        root.on('event', function (e, v) {
            switch (v) {
                case 'New':
                    var key = Organize.find('a.is-active').attr('data-id');
                    if (key) {
                        UMC.UI.Command('Settings', 'Organize', { Id: 'Create', ParentId: key });
                    } else {
                        UMC.UI.Command('Settings', 'Organize', 'Create');
                    }
                    break;
                case 'Create':
                    var key = Organize.find('a.is-active').attr('data-id');
                    if (key) {
                        UMC.UI.Command('Settings', 'User', { Id: 'Create', OrganizeId: key });
                    } else {
                        UMC.UI.Command('Settings', 'User', 'Create');
                    }
                    break;
            }
        }).on('Organize', function (e, v) {
            UMC.UI.Command('Settings', 'Organize', { ParentId: v, Type: "User", limit: "PC" }, function (x) {
                root.find('table tbody').format(x || [], {}, true)
                    .parent('.el-table').attr('msg', x.length === 0 ? "此组织未有成员" : false).cls('msg', x.length === 0);

            });
        }).on('search', function (e, v) {
            if (v) {
                active = v;
                var text = v === true ? '' : v;
                userSort.option('disabled', true);
                $('.filter-container-item').text(['搜索“', text || '所有账户', '”'].join('')).attr('data-icon', '\uf1e5');
                UMC.UI.Command('Settings', 'User', { Keyword: text, start: 0, limit: 40 }, function (x) {
                    root.find('table tbody').format(x.data || [], {}, true)
                        .parent('.el-table').attr('msg', x.msg || (x.length === 0 ? "此组织未有账户" : false)).cls('msg', x.data.length === 0);
                })
            } else {
                Organize.find('a.is-active').click();
            }
        }).ui('User.Change', function () { 
            active ? (active.getAttribute ? root.on('Organize', active.getAttribute('data-id')) : root.on('search', active)) : root.on('search', true);
        }).ui('Settings.Organize', function (e, v) {
            var v2 = v || { Top: true };
            if (v2.Caption) {
                Organize.find('a.is-active').text(v2.Caption).append(document.createElement("b"));
            } else {
                if (v2.Parent) {
                    var act = Organize.find('a.is-active');
                    var a = act.parent('ul').siblings('a');
                    if (a.length) {
                        act.removeClass('is-active');
                        a.addClass('is-active');
                    } else {
                        v2.Top = true;
                    }

                }
                if (v2.Top) {
                    UMC.UI.Command('Settings', 'Organize', { limit: "PC" }, function (xhr) {
                        Organize.children().remove();
                        if (xhr.length > 0) {
                            for (var i = 0; i < xhr.length; i++) {
                                var x = xhr[i];
                                var li = $(document.createElement('li')).appendTo(Organize);
                                var a = $(document.createElement("a")).attr('data-id', x.Id).text(x.Caption).appendTo(li);
                                $(document.createElement("b")).appendTo(a);
                                $(document.createElement("em")).appendTo(a);
                                li.append(document.createElement('s'));
                            }
                            Organize.find('a').eq(0).click();
                        } else {
                            root.find('.el-table').attr('msg', "未有组织，请搜索或新建组织").cls('msg');
                        }
                    });
                } else {

                    var act = Organize.find('a.is-active')
                    act.siblings('ul').remove();
                    act.click();
                }
            }
        });

        UMC.script('/js/Sortable.js').wait(function () {
            userSort = Sortable.create(root.find('table tbody')[0], {
                animation: 150,
                onEnd: function (evt) {
                    if (evt.newIndex != evt.oldIndex) {
                        var ids = [];
                        $(evt.from).find('a').each(function () {
                            ids.push($(this).attr('send'));
                        });

                        var key = Organize.find('a.is-active').attr('data-id');
                        if (key && ids.length > 1) {

                            UMC.UI.API('Settings', 'User', { Id: ids.join(','), OrganizeId: key, Setting: 'OrganizeMember' });

                        }
                    }
                }
            });
            Sortable.create(Organize[0], {
                animation: 150,
                onEnd: function (evt) {
                    if (evt.newIndex != evt.oldIndex) {
                        var ids = [];
                        $(evt.from).find('a').each(function () {
                            ids.push($(this).attr('data-id'));
                        });

                        ids.length > 1 ? UMC.UI.API('Settings', 'Organize', ids.join(',')) : 0;
                    }
                }
            });
            root.ui('Settings.Organize');
        });
    })
})(UMC)