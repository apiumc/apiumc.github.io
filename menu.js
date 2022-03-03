
(function ($) {
    $.page('menu', '菜单管理', false, function (root) {
        root.on('menu', { text: '新建', click: { model: 'Settings', cmd: 'Menu', send:'News'}})
      //  menu.html(root.find('#menu').text()).cls('right-menu-item el-link-menu ', 1)
        var thmls = ' <td rowspan="{length}" class="is-center"> <a class="el-tag el-tag--small" model="Settings" cmd="Menu" send="Id=News&ParentId={id}"><b class="wdk_cell_icon" data-icon="{icon}"></b> </a> </td><td rowspan="{length}" > <a class="link-type" model="Settings" cmd="Menu" send="{id}">{text}</a> </td>'

        root.ui('Settings.Menu', function () {
            $.UI.Command("Settings", "Menu", function (xhr) {

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
                    },
                    status: function (x) {
                        return x.disable ? "已禁用" : "正常"
                    }
                }, true);
            });
        });
        root.ui('Settings.Menu');


    })





})(WDK);