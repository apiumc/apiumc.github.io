
(function ($) {
    WDK.tpl('product/edit', 'product/edit', function (root) {

       

        $.script('js/editable.min.js')
            .link('css/admin_sku.css')
            .wait();

        function getSKU(data, indexs) {
            var strIndexs = indexs.sort().join();;
            for (var i = 0; i < data.length; i++) {
                var sku = data[i];
                if (sku.skus.sort().join() == strIndexs) {
                    return sku;
                }
            }
        }



        WDK.UI.Send('Data', 'Category', 'List', function (xhr) {
            WDK('#sltCategroy', root).each(function () {
                var select = this;
                var val = select.value;
                while (select.options.length > 1) {
                    select.options.remove(1);
                }
                for (var i = 0; i < xhr.length; i++) {
                    var x = xhr[i];

                    var option = document.createElement('option');
                    option.value = x.id;
                    option.text = x.text;
                    select.options.add(option);
                }
                select.value = val;
            });
        }).Send('Product', 'Series', 'List', function (xhr) {
            WDK('#sltSeries', root).each(function () {
                var select = this;
                var val = select.value;
                while (select.options.length > 1) {
                    select.options.remove(1);
                }
                for (var i = 0; i < xhr.length; i++) {
                    var x = xhr[i];

                    var option = document.createElement('option');
                    option.value = x.id;
                    option.text = x.text;
                    select.options.add(option);
                }
                select.value = val;
            });
        }).Send();
        var proId = false;

        root.on("hash", function (e, v) {
            WDK.UI.Command("Data", 'pro', v.key || 'News', function (pro) {
                proId = pro.Id;
                $('form', root).reset().val(pro);

                var size = pro.Size || {};
                root.ui('SKUData', size);
                $('#img_ul', root).format(pro.Image || [], {
                    Images: function (x) {
                        return x.path + '0.jpg!200?' + Math.random()
                    }
                }, true);
                if (pro.Product_Name) {
                    $('#attributes', root).html('');
                    root.ui('Attribute');
                } else {

                    $('#attributes', root).html('').parent('.el-form-item').hide();
                }
                var data = JSON.parse(pro.DescJSON || '[]') || [];
                var htmls = [];
                for (var c = 0, cl = data.length; c < cl; c++) {
                    var row = data[c];
                    var fn = WDK.UI.Cells[row._CellName] || function () {
                        return ''
                    };
                    htmls.push(fn(row.value, row.format || {}, row.style || {}));
                }
                var des = $('#des', root);
                WDK.UI.Editable(des).Value(htmls.join('').replace(/<a\s/ig, '<div ').replace(/<\/a>/ig, '</div>'))
                des.find('*').attr("class", false).attr('style', false);

            });
        }).ui('SKUData', function (e, size) {
            var sku = size.sku;
            if (sku && sku.length > 0) {
                $('#sku_div', root).show();
                $('#i_no_sku_price_wrap', root).hide();
                var htmls = ['<ul class="header">'];
                for (var i = 0; i < sku.length; i++) {

                    htmls.push('<li wdk-id="', sku[i].id, '">', sku[i].text, '</li>');
                }
                htmls.push('<li class="code">SKU码</li>');
                htmls.push('<li class="price">价格</li >');
                htmls.push('<li class="off">下架</li ></ul>');

                var count = sku[0].data.length;
                for (var i = 1; i < sku.length; i++) {
                    count *= (sku[i].data.length || 1);
                }

                for (var i = 0; i < count; i++) {

                    var index = i;
                    var indexs = [];
                    for (var c = sku.length - 1; c >= 0; c--) {
                        var v = sku[c].data.length || 1;
                        indexs.push(index % v);
                        index = parseInt(index / v) || 0;

                    }
                    indexs.reverse();
                    htmls.push('<ul>');
                    for (var v = 0; v < indexs.length; v++) {
                        var se = sku[v].data[indexs[v]] || {};
                        indexs[v] = se.id;
                        htmls.push('<li wdk-id="', se.id, '">', se.text, '</li>');
                    }
                    var kt = getSKU(size.data, indexs) || {}
                    htmls.push('<li class="code"><input wdk-id="', kt.id, '" type="text" name="code"   value="', kt.code || '', '"><i></i></li >');
                    htmls.push('<li class="price"><input wdk-id="', kt.id, '" type="text" name="price"   value="', kt.price || '', '"></li >');

                    htmls.push('<li class="off"><input wdk-id="', kt.id, '" type="checkbox" name="off" ', kt.off ? 'checked="checked"' : '', '  value="true"></li></ul>');
                    htmls.push('</ul>');
                }
                $('#jqData', root).html(htmls.join(''));
            } else {
                $('#i_no_sku_price_wrap', root).show();

                $('#sku_div', root).hide();
                $('#jqData', root).html('');
            }

        }).ui('Attribute', function () {
            WDK.UI.Command("Product", 'Attr', proId, function (xhr) {
                var htmls = [];
                for (var i = 0; i < xhr.length; i++) {
                    htmls.push('<div class="caption">', xhr[i].group, '</div>');
                    var data = xhr[i].data;
                    htmls.push('<ul>', $.format('<li><a model="Store" cmd="Attr" send="{id}">{text}</a><a model="Product" cmd="Attr" send="Id={product_id}&Attr={id}">{Val}</a></li>', xhr[i].data, {
                        Val: function (x) {
                            return x.value || '[未填写]'
                        }
                    }), '</ul>');
                }
                $('#attributes', root).html(htmls.join('')).parent('.el-form-item').show();
            });

        }).ui("sku", function (e, v) {
            WDK.UI.Command("Data", "SKU", v.id, function (xhr) {
                root.ui('SKUData', xhr);
            });
        }).ui('image', function (e, v) {

            WDK.UI.Command("Data", 'Images', proId, function (xhr) {
                $('#img_ul', root).format(xhr, {
                    Images: function (x) {
                        return x.path + '0.jpg!200?' + Math.random()
                    }
                }, true);
            })


        }).ui('Category', function (e, p) {

            var select = $('#sltCategroy', root)[0];
            var option = document.createElement('option');
            option.value = p.Value;
            option.text = p.Text;
            select.options.add(option);
            select.value = p.Value;
        }).ui('product', function (e, p) {

            var editer = WDK.UI.Editable($('#des', root));
            root.ui('Attribute');
            var desc = editer.Value();
            var pro = {
                _model: 'Product',
                _cmd: 'Desc',
                Id: p.id,
                Desc: desc.html,
                DescJSON: JSON.stringify(desc.list)
            };

            var blob = new Blob([JSON.stringify(pro)]);
            blob.name = 'cmd.json';

            WDK.uploader(blob, function (xhr) {
                WDK.UI.Command('Upload', 'Command', xhr)
            }, false, true);
        }).on('event', function (e, m, em) {
            switch (m) {
                case 'addsku':
                    WDK.UI.Command("Product", 'Size', proId);
                    break;
                case 'copysku':
                    WDK.UI.Command("Product", 'CopySize', proId);
                    break;
                case 'attr':
                    WDK.UI.Command("Store", 'Attr', proId);
                    break;
                case 'Support':
                    WDK.UI.Command("Product", 'Support', proId);
                    break;

                case 'import':
                    WDK.UI.Command("Product", 'AttrImport', proId);
                    break;
                case 'image':
                    WDK.UI.Command('Platform', 'Image', {
                        media_id: 'none',
                        id: proId,
                        seq: em.attr('seq')
                    });
                    break;
                case 'Barcode':
                    WDK.UI.Command("Product", 'EditBarCode', proId);
                    break;
            }
        });




        $('#jqData', root).on('click', 'li[wdk-id]', function () {
            var l = $(this).attr('wdk-id');
            if (l) WDK.UI.Command("Product", 'Size', $(this).attr('wdk-id'));
        }).on('change', 'input', function () {
            var ids = [];
            var p = $(this).parent('ul');
            p.find('li[wdk-id]').each(function () {
                ids.push($(this).attr('wdk-id'));
            })
            for (var i = 0; i < ids.length; i++) {
                if (!ids[i]) return;
            }
            var val = p.val();
            val.sku = ids.join(',');

            WDK.UI.Command("Product", 'SKU', {
                Size: JSON.stringify(val)
            });
        }).on('click', 'i', function () {
            var id = $(this).siblings().attr('wdk-id');
            if (id) {
                WDK.UI.Command("Product", 'EditBarCode', id);
            }
        });
        $('#uploadify input', root).on('change', function () {

            if (this.files.length > 0) {
                var p = $(this).parent().addClass('loading');
                $.uploader(this.files[0], function (t) {
                    p.removeClass('loading');
                    WDK.UI.Command("Platform", 'Image', {
                        type: 'jpg',
                        media_id: t.src,
                        id: proId
                    });
                });
            }
        });

    }, "商品编辑").page('product/items', '商品管理', function (root) {
        root.find('.pagination-container').paging("Product", "Search", root.find('table tbody'), {
            down: function (x) {
                return x.OffLine ? "el-tag--danger" : ''
            }
        }).on('sort', root.find('.el-sort'));
        WDK('table', root).thead();
    }, '\uf290');
})(WDK);