(function ($) {


    $.page('cashier', '收银台', function (root) {
        root.attr('tabindex', '0').on('keydown', function () {
            $('#header-search input').focus();
        });
        let paging = $('.pagination-container', root);
        WDK.UI.Command('Data', 'Category', 'Product', function (xhr) {
            $('.filter-container', root).format(xhr).find('a').eq(0).cls('is-active', 1)
            paging.paging("Product", "Search", $('.ui-products')).on('sort', root.find('.el-sort'));

        });
        // m.click("*[click-data]", function (e) {
        //     $.Click(JSON.parse($(this).attr('click-data')) || {});
        //     return false;
        // });
        var body = root.find('#body');
        $.link('css/umc.cashier.css')
        let _input;

        var t = new $.UI.Pager(body);
        t.cmd = 'Check';
        t.model = 'Ticket';
        t.query();
        let imgs = {}; let Products = {};

        paging.on('total', function () {
            requestAnimationFrame(function () {
                $('.ui-products .goods', root).each(function () {
                    var m = $(this);
                    m.attr('data-quantity', Products[m.attr('data-id')]);
                });
            });
        });
        root.find('.umc-cashier .weui_mask').click(function () {
            root.find('.ui-keyboard').cls('on', 0);
            $('.wdk-sku', root).cls('show', 0);
        });
        $.UI.On('SKU.Init', $('.wdk-sku', root));
        root.on('event', function (e, v) {
            switch (v) {
                case 'SKUBuy':
                    $('.wdk-sku', root).on(v);
                    break;
            }
        }).ui('Change', function (e, xhr, h) {
            Products = {};
            var eKey = parseInt((h || {}).ClientEvent) & 512;
            if (eKey == 0) {
                var ps = xhr.Products || [];
                for (var i = 0; i < ps.length; i++) {
                    var pro = ps[i];
                    var pid = pro.product_id;
                    Products[pid] = (Products[pid] || 0) + (parseFloat(pro.Quantity) || 0);
                }
            }
            $('.ui-products .goods', root).each(function () {
                var m = $(this);
                m.attr('data-quantity', Products[m.attr('data-id')]);
            });

        }).ui('UI.SKU', function (e, v) {
            console.log(v);
            WDK.UI.On('SKUSheet', v);
            WDK.UI.Event('SKUShow');
        }).ui('Order', function (e, xhr) {
            t.b.html('');
            t.dataSource(xhr);
          //  m.html('').append(body.find('header a.right').cls('el-button el-button--small umc-cashier-menu', 1).css('border', 'none'));
            var gs = {};
            t.b.find('img').each(function () {
                var m = $(this);
                var key = m.attr('src');
                var img = imgs[key];
                gs[key] = img ? m.parent()[0].replaceChild(img, this) : this;
            });
            imgs = gs;
        }).on('search', function (e, v, input) {
            var pv = input.attr('placeholder');

            _input = input;
            if (v) {
                WDK.UI.Command('Product', 'Scanning', v);
                input.attr('placeholder', v).val('')
            } else {
                if (pv != 'Search') {
                    input.val(pv);
                }
                _input.attr('placeholder', 'Search')
            }


            return false;
        }).ui('Change', function () {
            _input ? _input.attr('placeholder', 'Search').val('') : 0;
        });
        var price = root.find('.cashier-price');
        var input = root.find('.cashier-field input').on('input', function (e) {
            root.on('inputdata', e.data || 'Delete');
        });
        var submit = false;
        root.find('.cashier-form form').submit(function () {
            if (submit) {
                root.on("inputdata", 'OK');
            } else {
                input.blur();
                root.find('#body footer a').last().focus().click();
            }
            return false;
        });
        root.on("inputdata", function (e, c, isv) {
            var b, d = price.text().replace(/\s+/g, "") || "", f = d.split("+");
            switch (f = f.length > 1 ? f[1] : f[1] || f[0], c) {
                case "Clear":
                    price.text("0");
                    break;

                case "OK":
                    if (d && "0" != d && submit) {
                        var send = submit.send;
                        if (send instanceof Object) {
                            var vs = {};
                            for (var k in send) {
                                var v = send[k];
                                v[k] = v == 'Value' ? d : v;
                            }
                            WDK.UI.Command(submit.model, submit.cmd, vs);
                        } else {
                            WDK.UI.Command(submit.model, submit.cmd, d);
                        }
                        submit = false;
                        root.find('.ui-keyboard').cls('on', 0);
                    }
                    break;

                case "Delete":
                    d && (d = d.substr(0, d.length - 1), price.text(d || "0"));
                    break;

                case ".":
                    if (f.indexOf(".") > -1) return;
                    price.text(d + c);
                    break;

                case "+":
                    if (d.indexOf("+") > -1) return;
                    price.text(d + c);
                    break;

                case "0":
                    if ("0" == f) return;

                default:
                    if ("0" == f) price.text(d.substr(0, d.length - 1) + c); else if (d.length < 12) {
                        if (b = f.indexOf("."), b > -1 && b < f.length - 2) return;
                        price.text(d + c);
                    }
            }
            isv ? input.val(price.text()) : 0;
            requestAnimationFrame(function () {
                input.focus()
            })
        }).on('active', function (e) {
            $(document.body).children('#app').cls('hideSidebar', true);

        }).ui('Key.Number', function (e, key) {
            root.find('#caption').text(key.title);
            console.log(key);
            price.text(key.value);
            input.val(key.value).focus();
            submit = key.submit;
            root.find('.ui-keyboard').cls('on', 1);
        }).on('active').find(".ui-keyboard li,.weui_btn_area button").on("tap", function () {
            root.on('inputdata', this.getAttribute('val'), true);
            return !1;
        })
    })


})(WDK)