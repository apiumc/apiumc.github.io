
(function ($) {
    $.page('proxy/menu', '应用菜单', false, function (root) {
        var site = 0;
        var thmls = ' <td rowspan="{length}" class="is-center"> <a class="el-tag el-tag--small" model="Settings" cmd="Menu" send="Site={site}&Id=0&ParentId={id}"><b class="wdk_cell_icon" data-icon="{icon}"></b> </a> </td><td rowspan="{length}" > <a class="link-type" model="Settings" cmd="Menu" send="Site={site}&Id={id}">{text}</a> </td>'

        root.ui('Settings.Menu', function () {
            $.UI.Command("Settings", "Menu", { Site: site }, function (xhr) {

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
        });

        root.on('hash', function (e, v) {
            site = v.Site;
            root.on('menu', { text: '新建', click: { model: 'Settings', cmd: 'Menu', send: { Id: '0', Site: site } } });
            root.ui('Settings.Menu');
        });


    })





})(WDK);