
(function ($) {
    $.SPA = '/UMC/';
    $.Src = '/UMC.UI/'
    $.page('main', 'API UMC', false, function (root) {

        root.on('event', function (e, v) {
            switch (v) {
                case 'Command':
                    $.script('/js/qrcode.min.js').wait(function () {
                        $.UI.Ready({ "ClientEvent": 6, "Headers": { "AsyncDialog": { "Text": "请用Apiumc App扫一扫，快速安装", "Url": "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "Type": "Image", "Title": "发布到Apiumc网关" } } });

                        var qr = $('.weui_dialog .weui_dialog_bd a');
                        var qrcode = new QRCode(qr[0]);

                        location.pathname.substring(location.pathname.indexOf('/', 3))
                        qrcode.makeCode(['https://api.apiumc.com/UMC/Platform/Apper?Setup=', location.origin, '/UMC'].join(''), {
                            width: 256,
                            height: 256
                        });
                        qr.find('img').last().css('margin', 'auto')
                    });
                    break;
                case "Scanning":
                    $.UI.Command('System', 'Setup', 'Scanning');
                    break;
            }
        }).find('#mapping.el-table').click('a.link-type', function () {
            var ns = $(this).text().split('.');
            if (ns[0] && ns[1]) {
                root.on('debug', ns[0], ns[1]);
            } else if (ns[0]) {
                root.on('debug', ns[0]);
            } else {
                root.on('debug');
            }
        });
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

        });
    })

    UMC(function ($) {
        var app = $(document.body).ui('Key.Pager', function (e, v) {
            var key = 'Pager';
            var dom = WDK(document.createElement('div')).attr({
                'ui': key,
                'class': 'wdk-dialog'
            }).on('transitionend', function () {
                dom.is('.ui') ? 0 : dom.on('pop');
            }).appendTo(document.body).on('pop', function () {
                dom.on('close').remove();
            });

            var r = v.RefreshEvent;
            var c = v.CloseEvent;
            r ? dom.ui(r, function () {
                dom.on('refresh');
            }) : 0;
            c ? dom.ui(c, function () {
                dom.addClass('right').removeClass('ui');
            }) : 0;


            if (UMC.UI.On("UI.Show", dom, key, v) !== false) {
                new UMC.UI.Pager(v, dom);
                dom.addClass('ui');
            }
        }).ui('Key.Url', function (e, v) {
            location.href = v;
        });
        $.UI.On('UI.Push', function (e, xhr) {
            document.title = xhr.title || 'API UMC'
            var last = app.children('div.ui').cls('ui', 0);
            if (last.on('backstage') !== false)
                last.remove();
            if (xhr.root.cls('ui', 1).parent()[0] != app[0]) {
                xhr.root.appendTo(app);
            }
            xhr.root.on('active');
        }).On("UI.Show", function (e, v) {
            var doc = WDK(document.createElement("div")).addClass('weui_mask')
                .click(function () {
                    WDK('div[ui].wdk-dialog').addClass('right').removeClass('ui');
                })
                .appendTo(document.body);
            v.on('close', function () {
                doc.remove();
            });
        }).Off('Prompt')
            .On("Prompt", function (e, p) {
                var msg = WDK('#wdk-msg');
                if (msg.length == 0) {
                    var m = document.createElement("div");
                    m.id = 'wdk-msg';
                    document.body.appendChild(m);
                    msg = new WDK([m]);
                }
                msg.addClass('animate').html(p.Text);
                setTimeout(function () {
                    msg.removeClass('animate');
                }, 5000);
            });
        var p = location.pathname.substring($.SPA.length).replace(/(^\/+)|(\/+$)/g, '');
        if (p) {
            if (p.endsWith('.html')) {
                var p2 = p.substring(0, p.length - 5);
                $.page(p2);
                $(window).on('page', p2 || 'main', location.search.substring(1));
            } else {
                $.page(p);
                requestAnimationFrame(() => $(window).on('popstate', 1));
            }
        } else {
            requestAnimationFrame(() => $(window).on('popstate', 1));
        }
    });
})(UMC); 