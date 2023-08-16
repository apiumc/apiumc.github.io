
(function ($) {
    $.page('debug', 'API UMC', false, function (root) {

        root.on('event', function (e, v) {
            switch (v) {
                case "Scanning":
                    $.UI.Command('System', 'Setup', 'Scanning');
                    break;
                case 'builder':
                    $(window).on('page', 'builder', '');
                    break;
                case 'Webs':
                    $.UI.Command('System', 'Web', 'New')
                    break;
                case 'Command':
                    $.UI.Command('System', 'Setup', 'Command');
                    break;
            }
        }).ui('System.Web', function (e, v) {
            if (v.data) {
                root.find('#webs table tbody').format(v.data || [], true);
            }
        }).ui('System.Setup', function () {
            $.UI.Command("System", 'Setup', "Mapping", function (xhr) {

                root.find('#component').format(xhr.component || [], {
                    OK: function (x) {
                        return x.setup ? 'el-tag--success' : ''
                    },
                    Status: function (x) {
                        return x.setup ? '已安装' : '去安装'
                    }
                }, true);
                root.find('#mapping table tbody').format(xhr.data || [], true);

                var isnat = false;
                for (var i = 0; i < xhr.data.length; i++) {
                    if (xhr.data[i].name == 'Http.Bridge') {
                        isnat = true;
                        break;
                    }
                }
                if (isnat) {
                    root.find('#nat').removeClass('hide');
                    $.UI.Command("Http", "Bridge", function (x) {
                        root.ui('Http.Bridge', x)
                    });
                }
            });
        }).ui('License', function (e, x) {
            $.UI.Command("Http", "Bridge", function (x) {
                root.ui('Http.Bridge', x)
            });
        }).ui('Http.Bridge', function (e, x) {
            var ths = root.find('#nat td');
            if (x.msg) {
                ths.eq(1).html(['<a model="System" cmd="License" class="link-type">', x.msg, '</a>'].join(''));
            } else if (x.domain) {
                ths.eq(0).removeClass('el-tag--danger el-tag--success').addClass(x.bridge ? 'el-tag--success' : 'el-tag--danger').find('a').text(x.status);
                if (x.domain.indexOf('http://') == 0) {
                    ths.eq(1).html(['<a class="link-type" target="_blank" href="', x.domain, '">', x.domain, '</a> <a  model="Proxy" cmd="Server" send="VIP" style="transform: translateX(-100%);width:6rem" class="swipe el-button--primary"">升级成https</a>'].join('')).addClass('rel');

                } else {
                    ths.eq(1).html(['<a class="link-type" target="_blank" href="', x.domain, '">', x.domain, '</a>'].join(''));

                }
            }
        }).ui('System.Setup');

        $.UI.Command("System", 'Web', "MAPPING");


    })





})(WDK);