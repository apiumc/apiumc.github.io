(function ($) {
    function urlKey(p, l) {

        var model = p.model;
        var cmd = p.cmd;

        delete p.model;
        delete p.cmd;
        var path = [$.Root || 'UMC'];
        if (model) {
            path.push('Page', model, cmd)
        }
        for (var k in p) {
            path.push(k, p[k]);
        }
        if (l)
            path.push(l)
        return '/' + path.join('/');
    }

    WDK.UI.Click = function (submit) {
        if (submit) {
            var sender = submit.send;
            switch (submit.key) {
                case 'Tel':
                    return 'tel:' + sender;
                case 'Url':
                    return sender;
                case 'Category':
                    return urlKey({ Category: (sender.Id || sender), model: 'Data', cmd: 'Search' });
                case 'Subject':
                    return urlKey({ Id: (sender.Id || sender), model: 'Subject', cmd: 'UIData' });
                case 'Product':
                    return urlKey({ Id: (sender.Id || sender), model: 'Product', cmd: 'UI' });
                case 'Pager':
                    var p = WDK.extend({}, sender.search);
                    p.model = sender.model;
                    p.cmd = sender.cmd;
                    return urlKey(p);
            }
        }
    }

    $(function () {
        var app = $(document.body)
            .ui('Key.Map,Key.Subject,Key.Product,Key.Category,Key.Tel,Key.Url', function (e, v) {
                var key = e.type.substring(e.type.lastIndexOf('.') + 1);
                switch (key) {
                    case 'Map':
                        WDK.UI.On(key, v);
                        break;
                    case 'Subject':
                    case 'Product':
                    case 'Category':
                    case 'Tel':
                    case 'Pager':
                        location.href = WDK.UI.Click({ key: key, send: v });
                        break;
                    case 'Search':
                        location.hash = 'search';
                        break;
                    case 'Url':
                        location.href = v;
                        break;
                }
            });
        WDK.UI.On('Product', function (e, v) {
            location.href = urlKey({ Id: v.value, model: 'Product', cmd: 'UI' });

        }).On('UI.Push', function (e, xhr) {
            app.children('div[ui].ui').each(function () {
                var m = $(this);
                if (!m.is('.wdk-dialog')) {
                    m.cls('ui', false).remove();
                }
            });
            app.append(xhr.root.cls('ui', true));
        });
    });
})(WDK) 