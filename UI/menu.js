
(function ($) {
    $.page('menu', '应用菜单', false, function (root) {
        root.on('menu', { text: '新建', click: { model: 'Settings', cmd: 'Menu', send: { Site: UMC.UI.Config().site || '0', Id: 0 } } })
        var thmls = ' <td rowspan="{length}" class="is-center"><b class="wdk_cell_icon" data-icon="{icon}"></b> </td><td rowspan="{length}" class="rel" > <a class="link-type" model="Settings" cmd="Menu" send="Site={site}&Id={id}">{text}</a> <a class="swipe el-button--primary" model="Settings" cmd="Menu" send="Site={site}&Id=0&ParentId={id}">新增</a></td>'

        root.ui('Settings.Menu', function () {
            $.UI.Command("Settings", "Menu", { Site: UMC.UI.Config().site || '0', limit: 'PC' }, function (xhr) {

                var data = [];
                xhr.forEach(v => {
                    var m = v.menu || [];
                    v.length = m.length;
                    if (v.length == 0) {
                        v.header = v;
                        v.length = 1;
                        data.push(v)

                    } else {
                        m.forEach((it, idex) => {
                            if (idex == 0) {
                                it.header = v;
                            }
                            data.push(it);
                        });
                    }
                });

                root.find('table tbody').format(data || [], {
                    Parent: function (v) {
                        return v.header ? $.format(thmls, v.header) : '';
                    }
                }, true);
            });
        }).ui('Settings.Menu');


    })





})(WDK);