
(function ($) {
    $.page('debug', 'API UMC', false, function (root) {

        // root.on('menu', [{ text: '授权信息', click: { model: 'System', cmd: 'License' }}])
        $.page('builder', '架建应用', false);
        root.on('event', function (e, v) {
            switch (v) {
                case 'builder':
                    $(window).on('page', 'builder', '');
                    break;
                case 'Webs':
                    $.UI.Command('System', 'Web', 'New')
                    break;
                case 'Command':
                    $.UI.Command('System', 'Web', 'Command')
                    break;
            }
        }).ui('Config', function (e, v) {
            if (v.data) {
                root.find('#webs table tbody').format(v.data || [], true);
            }
        }).ui('License', function (e, x) {
            $.UI.Command("Proxy", "Nat", function (x) {
                root.ui('Proxy.Nat', x)
            });
        }).ui('Proxy.Nat', function (e, x) {
            var ths = root.find('#nat td');
            if (x.msg) {
                ths.eq(1).html(['<a model="System" cmd="License" class="link-type">', x.msg, '</a>'].join(''));
            } else if (x.domain) {
                ths.eq(0).removeClass('el-tag--danger el-tag--success').addClass(x.bridge ? 'el-tag--success' : 'el-tag--danger').find('a').text(x.status);
                ths.eq(1).html(['<a class="link-type" target="_blank" href="', x.scheme || 'http', '://', x.domain, '">', x.domain, '</a>'].join(''));
            }
        }).find('#mapping.el-table').click('a.link-type', function () {
            if (root.attr('debug')) {
                var ns = $(this).text().split('.');
                if (ns[0] && ns[1]) {
                    root.on('debug', { Models: ns[0], Model: ns[0], Command: ns[1] });
                } else if (ns[0]) {
                    root.on('debug', { Models: ns[0], Model: ns[0], });
                } else {
                    root.on('debug', {});
                }
            } else {
                cmdEm = $(this);
                root.find('.ui-setup .ui-debug-start').click();
            }
        });
        $.UI.Command("System", "Mapping", function (xhr) {
            root.find('#component').format(xhr.component || [], {
                Setup: function (x) {
                    return x.setup ? ('<a class="el-tag el-tag--success el-tag--small" href="/' + x.name + '">已安装</a>') : '<a model="System" cmd="Setup"  class="el-tag el-tag--small">去安装</a>'
                }
            }, true);
            root.find('#mapping table tbody').format(xhr.data || [], true);

            var isnat = false;
            for (var i = 0; i < xhr.data.length; i++) {
                if (xhr.data[i].name == 'Proxy.Nat') {
                    isnat = true;
                    break;
                }
            }
            root.find('#webs table tbody').format(xhr.webs || [], true);
            if (isnat) {
                root.find('#nat').removeClass('hide');
                $.UI.Command("Proxy", "Nat", function (x) {
                    root.ui('Proxy.Nat', x)
                });
            }
        });



    })





})(WDK);