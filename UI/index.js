(function ($) {
    WDK.page('cashier', '收银台', '\uf0d6')
        .page('debug', '开发调试', '\uf188').page('chain', '分店管理', function (root) {
            $('.pagination-container', root).paging("Store", "Search", $('table tbody', root)).on('sort', root.find('.el-sort'));
            $('table', root).thead();
        }, '\uf1b3').page('paylog', '支付对账', '\uf260').page('order', '订单管理', '\uf298')
        .page('member', '会员管理', function (root) {
            $('.pagination-container', root).paging("Member", "Search", $('table tbody', root)).on('sort', root.find('.el-sort'));
            $('table', root).thead();
        }, '\uf2ba').page('product/items', '商品管理', '\uf290').menu('\ue934', "营销管理").page('card', '卡券管理', function (root) {
            $('.pagination-container', root).paging("Promotion", "Coupon", $('table tbody', root)).on('search');
            $('table', root).thead();
        }, true).page('prizes', '营销活动', function (root) {
            $('.pagination-container', root).paging("Promotion", "Prize", $('table tbody', root)).on('search');
            $('table', root).thead();
        }, true).page('coupons', '促销策略', function (root) {
            $('.pagination-container', root).paging("Promotion", "Search", $('table tbody', root)).on('search');
            $('table', root).thead();
        }, true);

    $.menu('\uf0d1', "采购调拨")
        .page('purchase/input', "门店采购单").page("purchase/output", "出库采购单").page('purchase/order')
        .page("shipment/output", "门店调拨单").page("shipment/input", "入库调拨单").page('shipment/order');

    $.menu('\uf1c0', "库存盘点")
        .page('stocktaking/store', '门店盘点单').page('stocktaking/product', '商品盘点单')
    //  .page('stocktaking/porder').page('stocktaking/sorder')

    $.page('flow', "流程设计", '\uf0e8').page('link/setting', "连接管理", '\uf0c1').page('site', "站点管理", '\uf0c2').page('chart/sale')
    // .page('report/exce').page('report/group');

    $.menu('\uf1fe', "数据分析").page('report/group', '数据连接').page('report/setting', '报表配置')
        .page('report/control', "选项配置").page('report/warn', '数据监听')


    $.page('subject/items', '内容管理').page('organize', '用户管理', '\uf0c0').page('product/edit').page('subject/edit')
        .page('platform/explore', '我的平台', '\uf0c2').page('platform/items', '平台账户', '\uf0c2').page('cashier', '收银台', false).page('menu', '菜单管理');

    // $.page('mobile', '移动界面', '\uf0c2');
    $.menu();

    $.page('main', '我的门店', false);
    $.page('proxy/user', false);

    $(e => {
        $.UI.Command('Store', 'Account', 'Info', function (xhr) {
            $(document.createElement('div')).cls('right-menu el-link-menu', 1)
                .html('<a model="Store" cmd="Select" class="el-button store">' + xhr.Store_Name + '</a>')
                .appendTo('.navbar').find('a');
            WDK.UI.On('Store.Change', function (e, v) {
                location.reload(false);
            });
        });
        $(window).on('popstate');
    })


})(WDK)