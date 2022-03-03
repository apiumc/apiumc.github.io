
(function ($) {
    function subNav(t, root) {
        var keys = [];
        var emKeys = t.b.find('div[data-key]').each(function () {
            var m = $(this);
            keys.push({ index: m.attr('data-key'), text: m.text() });
        });
        if (keys.length == 0) {
            var ps = [];
            t.b.find('div[style].wdk-cms-text').each(function () {
                var fs = parseInt(this.style['font-size'] || 0) || 0;
                if (fs > 18) {
                    if (fs > 26) {
                        fs = 26;
                    }
                    ps.push(this);
                    keys.push({ index: parseInt((26 - fs) / 2) + 1, text: $(this).text() });
                }
            });
            emKeys = new $(ps);
        }
        var navs = root.find('#nav').format(keys, {
            value: x => {
                return (parseInt(x.index) || 0) * 10 + 'px'
            }
        }, true).find('.wdk-subject-nav-item')
            .click(function () {
                var ofset = emKeys.eq(parseInt($(this).attr('data-index'))).offset();
                var top = ofset.top - con.top;
                var stop = t.r[0].scrollTop + top + 20;
                var sctop = t.r[0].scrollTop;
                var num = (stop - sctop) / 30;
                function run() {
                    sctop = sctop + num;
                    if (num > 0) {
                        if (sctop >= stop) {
                            sctop = stop
                        } else {
                            requestAnimationFrame(run);
                        }
                    } else {

                        if (sctop <= stop) {
                            sctop = stop
                        } else {
                            requestAnimationFrame(run);
                        }
                    }

                    t.r[0].scrollTop = sctop;
                }
                run();

            }).each(function (i) {
                $(this).attr('data-index', i + '');
            });
        if (keys.length > 0) {
            var con = t.r.offset();
            t.r.on('scroll', function () {
                var index = -1;
                emKeys.each(function (i) {
                    var me = $(this)
                    var m = me.offset();
                    if (m.top - con.top < 0) {
                        index = i;
                    }
                });
                navs.cls('is-active', 0)
                if (index > -1) {
                    navs.eq(index).cls('is-active', 1);
                }
            });
        }
    }
    UMC.tpl('help', 'help', function (root) {
        var view = root.find('#view');
        root.ui('UI.Edit', function (e, v) {
            requestAnimationFrame(function () {
                view.ui('UI.Edit', v);
            });
            return false;
        });
        var t = new $.UI.Pager(view);

        t.model = "Subject";
        t.cmd = 'UIMin'
        root.on('hash', function (e, v) {
            if (v.key) {
                var fs = v.key.split('/');
                switch (fs.length) {
                    case 1:
                        fs = ['365lu', 'Docs', fs[0]];
                        break;
                    case 2:
                        fs = [fs[0], 'Docs', fs[1]];
                        break;
                    case 3:
                        break;
                    default:
                        return;

                }
                t.search = { Id: fs.join('/') };
                $.api(t.model, t.cmd, UMC.extend({
                    limit: 30
                }, t.search), function (xhr) {
                    root.attr('data-id', (xhr.Title || {}).Id);
                    t.b.html('');
                    t.dataSource(xhr);
                    subNav(t, root);
                });

            }
        }).on('active', function () {
            if (root.attr('data-id'))
                $.UI.On('Subject.Show', { Id: root.attr('data-id') });
        });

    }, '帮助文档');
})(UMC)