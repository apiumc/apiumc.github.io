
(function ($) {
    $.tpl('page', 'page/page', function (root) {
        root.on('page.card', function () {
            root.find('ul[type=tabs] li').on('mouseenter', function () {
                var me = $(this);
                var pem = me.parent();
                if (!me.is('li[data-index]')) {
                    pem.children('li').each(function (i) {
                        $(this).attr('data-index', i + '')
                    });
                }
                root.find(pem.attr('for')).children('div').cls('active', 0)
                    .eq(parseInt(me.attr('data-index')) || 0).cls('active', 1);
                me.cls('active', 1).siblings().cls('active', 0);

            });
            root.find('.clue-button_wechat-consultation').on('mouseenter', function () {
                root.find('.clue-card_wechat-consultation').addClass('hover')
            }).on('mouseleave', function () {
                root.find('.clue-card_wechat-consultation').removeClass('hover')
            })
            root.find('.clue-button_app-download').on('mouseenter', function () {
                root.find('.clue-card_app-download').addClass('hover')
            }).on('mouseleave', function () {
                root.find('.clue-card_app-download').removeClass('hover')
            })
            var key = root.attr('ui-key');
            $.UI.API('Subject', 'Publish', { Key: root.attr('ui-key'), type: 'Check' }, function (xhr) {
                if (xhr.isPublish) {
                    var em = root.find('.umc-sub-page-container').children().eq(0);
                    $.UI.On('UI.Publish', em.attr('data-title') || key, em.attr('data-keywords') || key, em.text().replace(/\s+/g, ' '))
                }
            })
        });
        if (root.find('.umc-sub-page-container').children().length == 0) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status < 400 && xhr.responseText.indexOf('<body') == -1) {
                    root.find('.umc-sub-page-container').html(xhr.responseText);
                    root.on('page.card');
                } else {
                    delete $.page()['page/' + root.attr('ui-key')];
                    $.nav('/');
                }

            };
            xhr.open('GET', [$.Src || '', 'page/', root.attr('ui-key'), '.html'].join(''), true);
            xhr.send('');
        } else {
            root.on('page.card');
        }
    }, '我的主页')
})(UMC);