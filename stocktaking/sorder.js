
(function ($) {
    WDK.page('stocktaking/sorder', "门店盘点单明细", function (root, title, menu) {
        // menu.html(root.find('#menu').text()).cls('right-menu-item', 1);
        var isEditer = false;
        var StocktakingId;
        var inputHtml = $('#editer', root).text();
        var htmldata = {
            html: function (x) {
                var sku = x.SKU;

                return $.format('<tr><td class="is-center">{SKUName}</td><td class="is-center">{StockQty}</td><td class="is-center {editer}">{PurQty} </td></tr>', sku, htmldata);

            },
            PurQty: function (x) {
                if (isEditer) {
                    return $.format(inputHtml, x);
                } else {
                    return x.ConfirmQty;
                }
            },
            editer: function () {

                return isEditer ? "el-tag--danger" : ''
            },
            rowspan: function (x) {
                return x.SKU.length + 1;
            }
        }
        var table = $('table', root).thead().on('change', 'input', function (e) {

            var me = $(this);
            var p = parseFloat(this.value);
            if (isNaN(p) == false) {
                WDK.UI.Command('Stocktaking', 'Store', { Id: me.attr('stocktaking_id'), product_id: me.attr('product_id'), sku_id: me.attr('sku_id'), Quantity: this.value });

            } else {
                this.value = me.attr('value');
            }
        }).on('keydown', 'input', function (e) {
            var m = this;
            switch (e.keyCode) {
                case 40:
                case 13:
                    var b = -1;
                    table.find('input').each(function (c) {
                        if (this == m) {
                            b = c;
                            return false;
                        }
                    }).eq(b + 1).select().focus();
                    return false;
                case 38:
                    table.find('input').each(function (c) {
                        if (this == m) {
                            b = c;
                            return false;
                        }
                    }).eq(b - 1).select().focus();
                    return false;
            }
        });
        var paging = $('.pagination-container', root).paging("Stocktaking", "StoreSKU", $('table tbody', root), htmldata);


        root.on('hash', function (e, v) {
            WDK.UI.Command('Stocktaking', "Search", { Type: 'Store', Id: v.Id }, function (xhr) {
                isEditer = xhr.IsEditer;
                StocktakingId = xhr.Id;
                if (xhr.ButtonText) {
                    menu.find('a').attr('send', StocktakingId).text(xhr.ButtonText).cls('hide', false);
                } else {

                    menu.find('a').attr('send', StocktakingId).cls('hide', true);
                }
                paging.on('param', { Id: StocktakingId }).on('search');
                root.find('.el-row *[data-field]').each(function () {
                    var m = $(this);
                    m.text(xhr[m.attr('data-field')]);
                });
            });
        }).on('search', function (e, v) {
            if (isEditer) {
                if (StocktakingId && v) {
                    WDK.UI.Command('Stocktaking', "StoreDetail", { product_id: v, Id: StocktakingId });
                    return false;
                }
            };
        }).ui('Stocktaking.Item', function (e, v) {
            $('table tbody', root).format([v], htmldata, true);

        }).ui('Stocktaking.Edit', function () {
            root.on('hash', $.query(root.attr('hash')));
        });




    });
})(WDK);