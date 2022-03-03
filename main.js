($ => {
    $.page('main', '我的门店', false, function (root, title, menu) {
     
        menu.html(root.find('#menu').text()).cls('right-menu-item el-link-menu ', 1).find('a')

        WDK.UI.Command('Store', 'Account', function (xhr) {
            $(' *[data-field]', root).each(function () {
                var me = $(this);
                var v = xhr[me.attr('data-field')];
                me.text(v || '');
            });
        });
        $.script('js/umc.pivot.js').wait(function () {
            $.pivotDWM(root, 'Report', 'Sale');
        });

    });
})(WDK);