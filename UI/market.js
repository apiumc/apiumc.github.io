(function ($) {
    UMC.page('market', '应用市场', function (root) {

        var node = document.getRootNode().childNodes[2];
        var Version = "1.0.0";
        if (node && node.nodeType == 8) {
            Version = node.nodeValue.substring(8);
        }
        root.find('.topic_category').click('a', function () {
            var m = $(this);
            if (!m.is('.item_selected')) {
                root.on('category', m.attr('data-id'));
            }
            m.addClass('item_selected').siblings('a').cls('item_selected', false);

        });
        $.api('Platform', "Market", { Category: -2, Version: Version }, function (xhr) {

            root.find('.topic_header').html($.UI.Cells.Slider({ data: xhr.header }, {}, {}));

            root.find('.topic_category').html($.format('<a data-id="{id}"  class="item">{text}</a>', xhr.category, {})).find('a').eq(0).click();
        })
        root.on('category', function (e, v) {
            $.api('Platform', "Market", { Category: v, Version: Version }, function (xhr) {
                root.find('.umc-market-container').format(xhr.data || [], true).attr('data-msg', xhr.msg || false);
            })
        }).on('search', function (e, v) {
            if (v) {
                $.api('Platform', "Market", { Category: -3, Keyword: v, Version: Version }, function (xhr) {
                    root.find('.umc-market-container').format(xhr.data || [], true).attr('data-msg', xhr.msg || false);
                })
            } else {
                root.on('category', root.find('.topic_category .item_selected').attr('data-id'));
            }
        });
        root.find('.umc-market-container').click('div[data-id]', function () {
            var m = $(this);
            $.api("Platform", "Market", m.attr('data-id'));
        });

        window.top.postMessage(JSON.stringify({
            type: 'nav',
            value: [ { key: 'Setup', text: '发布新应用', menu: [{ text: '发布Web应用', click: { model: 'Proxy', cmd: 'Setup', send: 'Proxy' } }, { text: '发布文件应用', click: { model: 'Proxy', cmd: 'Setup', send: 'File' } }] },{ text: '帮助文档', click: { model: 'Proxy', cmd: 'App', send: 'Docs' } }]
        }), "*");

        if (location.search.endsWith("Setup")) {
            window.top.postMessage(JSON.stringify({
                type: 'nav',
                value: 'Setup'
            }), "*");
        }
        root.ui('Site.Config', function () {
            window.top.postMessage(JSON.stringify({
                type: 'close'
            }), "*");
        })


    });
})(UMC)