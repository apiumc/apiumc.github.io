($ => {

    WDK.UI.Slider = function (data) {

        var htmls = [];

        var emptyImg = 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        for (var i = 0; i < data.length && i < 5; i++) {
            htmls.push('<input ', i == 0 ? 'checked="checked"' : '', ' class="slider-', i + 1, '" type="radio" name="slider" id="disslider', i + 1, '"/>');
        }
        htmls.push('<div class="sliders"><div id="overflow"><div class="inner">');
        for (var i = 0; i < data.length && i < 5; i++) {//data[i].src,
            htmls.push('<article><a  ', data[i].design ? ' ui-design="Y" ' : '', ' ui-spa ', WDK.UI.Format(data[i].click), '><img  onerror="this.src=\'', emptyImg, '\'" src="', data[i].src || emptyImg, '" /></a></article>');
        }
        htmls.push('</div></div></div>');

        htmls.push('<div id="controls" class="controls">');
        for (var i = 0; i < data.length && i < 5; i++) {
            htmls.push('<label for="disslider', i + 1, '"></label>');
        }
        htmls.push('</div>');

        htmls.push('<div id="active" class="active">');
        for (var i = 0; i < data.length && i < 5; i++) {
            htmls.push('<label for="disslider', i + 1, '"></label>');
        }
        htmls.push('</div>');
        return htmls.join('');
    }
    $.page('shop/index', 'shop/index', function (root) {
        $('script[data-key]', root).each(function () {
            var sc = $(this)
            var tpl = this.text;

            var ids = [];
            var uis = $(sc.attr('data-for-id') + '[data-ui-id]').each(function () {
                ids.push($(this).attr('data-ui-id'));
            })
            WDK.UI.Send('Design', "UI", {
                Id: ids,
                Config: sc.attr('data-key')
            }, function (xhr) {
                uis.each(function () {
                    var m = $(this);
                    var key = m.attr('data-ui-id');
                    $.each(xhr, function () {
                        if (this.id == key) {
                            var s = WDK.hashUrl(this.click);
                            if (s != null) {
                                m.attr('href', s);
                            } else {
                                m.attr('click-data', JSON.stringify(this.click));
                            }

                            if (this.design) {
                                m.attr('ui-design', 'Yes')
                            }
                            m.html($.format(tpl, this))

                        }
                    });
                });
            });

        });
        WDK.UI.Send('Subject', 'Publish', { Key: 'index.html', 'Type': 'Check' }, function (xhr) {
            if (xhr.isPublish) {
                requestAnimationFrame(function () {
                    $.UI.On('UI.Publish', "新零售商城", root.text().replace(/\s+/g, ' '), root.text().replace(/\s+/g, ' '), {
                        type: 'Index'
                    });
                })
            }
        }).Send();
    }).tpl('category', 'shop/category', function (root) {
        var search = {
            limit: 30
        };
        var attrbites = {};
        root.on('hash', function (e, v) {
            search.Category = v.key;

            WDK.UI.Send('Data', "filter", v.key, function (xhr) {

                $('#sliders', root).html(WDK.UI.Slider(xhr.Slider || [{
                    'src': 'image/category_top.png"'
                }]));

                var filter = xhr.Filter || [];
                var html = [];
                for (var index = 0; index < filter.length; index++) {
                    var element = filter[index];
                    html.push('<div class="filter"><div data-key="', element.key, '" class="filter_title">', element.name, '</div><ul>');
                    var data = element.value;
                    html.push('<li class="active">不限</li>')
                    for (var c = 0; c < data.length; c++) {
                        var ele = data[c];
                        html.push('<li data-value="', ele.Value, '">', ele.Text, '</li>')

                    }
                    html.push('</ul></div>')
                }
                $('.lk_category_filter', root).html(html.join(''));
                if (xhr.releaseId)
                    $.UI.On('UI.Publish', xhr.Name, xhr.Description, xhr.Description, {
                        type: 'Brand', Id: xhr.releaseId
                    });

            });
            root.on('Search');
        }).on('Search', function () {
            WDK.UI.Send('Product', 'Search', search, function (xhr) {

                var tpl = root.find('#cell')[0].text;// document.getElementById('cell').text;
                var series = xhr.data || [];
                var htmls = [];
                for (var i = 0; i < series.length; i++) {
                    var it = series[i];
                    if (i % 3 == 0) {
                        if (htmls.length > 0) {
                            htmls.push('</div>')
                        }
                        htmls.push('<div class="lk_content_row">')
                    }
                    htmls.push(WDK.format(tpl, it));
                };
                if (htmls.length > 0) {
                    var cl = 3 - (series.length % 3);
                    if (cl < 3) {
                        for (var i = 0; i < cl; i++) {
                            htmls.push('<div class="lk_content_cell3"></div>')
                        }
                    }

                    htmls.push('</div>')
                } else if (xhr.msg) {
                    htmls.push('<div class="empty">', xhr.msg, '</div>');
                }
                var pageCount = parseInt(xhr.total / search.limit);
                if (xhr.total % search.limit > 0) {
                    pageCount++;
                }
                var index = (search.start || 0) / search.limit + (xhr.total ? 1 : 0);
                WDK('.page-count .page', root).text(index + '/' + pageCount)
                    .parent().attr({
                        'data-start': search.start || 0,
                        'data-total': xhr.total
                    });
                WDK('#cells', root).html(htmls.join(''));
            }).Send()
        });
        $('.sort-row', root).on('click', 'li', function () {
            var m = $(this);
            if (!m.is('.active')) {
                m.addClass('active').siblings().removeClass('active');
                search.sort = m.attr('data-sort');
                search.dir = m.attr('data-dir') || 'asc';
                if (!search.sort) {
                    delete search.sort;
                }
                delete search.start;
                root.on("Search");
            } else {
                var dir = m.attr('data-dir');
                if (dir) {
                    m.removeClass(dir);
                    switch (dir) {
                        case 'asc':
                            m.addClass('desc');
                            m.attr('data-dir', 'desc');
                            break;
                        default:
                            m.addClass('asc');
                            m.attr('data-dir', 'asc');
                            break;
                    }
                    delete search.start;
                    search.dir = m.attr('data-dir') || 'asc';
                    root.on("Search");
                }
            }


        });
        $('.lk_category_filter', root).on('click', 'li', function () {
            var m = $(this);
            if (!m.is('.active')) {
                m.addClass('active').siblings().removeClass('active');
                var key = m.parent().siblings('.filter_title').attr('data-key');
                var value = m.attr('data-value');

                if (value) {
                    search[key] = m.attr('data-value');

                } else {
                    delete search[key];
                }
                delete search.start;
                root.on("Search");
            }
        });
        $('.page-count .prev', root).click(function () {
            var m = $(this).parent();
            var start = parseInt(m.attr('data-start') || '0');
            if (start - search.limit >= 0) {
                search.start = (search.start || 0) - search.limit;
                root.on("Search");
            }


        }).siblings('.next').click(function () {

            var m = $(this).parent();
            var start = parseInt(m.attr('data-start') || '0');
            var total = parseInt(m.attr('data-total') || '0');
            if (start + search.limit <= total) {
                search.start = (search.start || 0) + search.limit;
                root.on("Search");
            }
        });

    }).tpl('brand', 'shop/brand', function (root) {
        root.on('hash', function (e, va) {
            var v = va.key
            WDK.UI.Send("Data", "Brand", v, function (xhr) {
                WDK('*[data-field]', root).each(function () {
                    var m = WDK(this);
                    if (m.is('img')) {
                        m.attr('src', xhr[m.attr('data-field')] + '!m400')
                    } else {
                        m.text(xhr[m.attr('data-field')]);
                    }
                })
                var tpl = root.find("#cell")[0].text;// document.getElementById('cell').text;
                var series = xhr.series || [];
                var htmls = [];
                for (var i = 0; i < series.length; i++) {
                    var it = series[i];
                    if (i % 3 == 0) {
                        if (htmls.length > 0) {
                            htmls.push('</div>')
                        }
                        htmls.push('<div class="lk_content_row">')
                    }
                    htmls.push(WDK.format(tpl, it));
                };
                if (htmls.length > 0) {
                    var cl = 3 - (series.length % 3);
                    if (cl < 3) {
                        for (var i = 0; i < cl; i++) {
                            htmls.push('<div class="lk_content_cell3"></div>')
                        }
                    }
                    htmls.push('</div>')
                }
                WDK('#cells', root).html(htmls.join(''));
                if (xhr.releaseId)
                    $.UI.On('UI.Publish', xhr.Name, xhr.Description, xhr.Description, {
                        type: 'Brand', Id: xhr.releaseId
                    });

            }).Send("Design", 'UI', v, function (xhr) {

                WDK('#sliders', root).html(WDK.UI.Slider(xhr));
            }).Send();
        });

    }).tpl('series', 'shop/series', function (root) {
        var search = {
            limit: 30
        };
        WDK.UI.On('Search', function () {
            WDK.UI.Send('Product', 'Search', search, function (xhr) {

                var tpl = root.find('#cell')[0].text;// document.getElementById('cell').text;
                var series = xhr.data || [];
                var htmls = [];
                for (var i = 0; i < series.length; i++) {
                    var it = series[i];
                    if (i % 3 == 0) {
                        if (htmls.length > 0) {
                            htmls.push('</div>')
                        }
                        htmls.push('<div class="lk_content_row">')
                    }
                    htmls.push(WDK.format(tpl, it));
                };
                if (htmls.length > 0) {
                    var cl = 3 - (series.length % 3);
                    if (cl < 3) {
                        for (var i = 0; i < cl; i++) {
                            htmls.push('<div class="lk_content_cell3"></div>')
                        }
                    }
                    htmls.push('</div>')
                }
                WDK('#cells', root).html(htmls.join(''));
                var pageCount = parseInt(xhr.total / search.limit);
                if (xhr.total % search.limit > 0) {
                    pageCount++;
                }
                var index = (search.start || 0) / search.limit + (xhr.total ? 1 : 0);
                WDK('.page-count .page', root).text(index + '/' + pageCount)
                    .parent().attr({
                        'data-start': search.start || 0,
                        'data-total': xhr.total
                    });

            }).Send();
        });
        root.on('hash', function (e, v) {
            search.SeriesId = v.key;
            WDK.UI.Send("Data", "Series", v.key, function (xhr) {
                WDK('*[data-field]', root).each(function () {
                    var m = WDK(this);
                    if (m.is('img')) {
                        m.attr('src', xhr[m.attr('data-field')])
                    } else {
                        m.text(xhr[m.attr('data-field')]);
                    }
                })

                var htmls = ['<li class="selected">全部</li>'];
                htmls.push(WDK.format('<li data-id="{id}">{name}</li>', xhr.Category || []));
                WDK("#category", root).html(htmls.join(''))

                if (xhr.releaseId)
                    $.UI.On('UI.Publish', xhr.Name, xhr.Description, xhr.Description, {
                        type: 'Series', Id: xhr.releaseId
                    });

            }).Send("Design", 'UI', v.key, function (xhr) {
                WDK('#sliders', root).html(WDK.UI.Slider(xhr));
            }).Send();

        });
        WDK("#category", root)
            .on('click', 'li', function () {
                var m = WDK(this);
                if (m.is('.selected') == false) {
                    m.siblings('li').removeClass('selected');
                    m.addClass('selected');
                    var id = m.attr('data-id');
                    if (id) {
                        search.Category = id;
                    } else {
                        delete search.Category;
                    }
                    delete search.start;
                    // search.start=0;
                    WDK.UI.On('Search');
                }
            });
        $('.page-count .prev', root).click(function () {
            var m = $(this).parent();
            var start = parseInt(m.attr('data-start') || '0');
            if (start - search.limit >= 0) {
                search.start = (search.start || 0) - search.limit;
                WDK.UI.On("Search");
            }


        }).siblings('.next').click(function () {

            var m = $(this).parent();
            var start = parseInt(m.attr('data-start') || '0');
            var total = parseInt(m.attr('data-total') || '0');
            if (start + search.limit < total) {
                search.start = (search.start || 0) + search.limit;
                WDK.UI.On("Search");
            }
        });
    }).tpl('product', 'shop/product', function (root) {

        var image = $('.lk_product_image .image', root).on('mouseenter,mousemove,mouseleave', function (e) {

            //计算坐标
            var top = e.clientY - box.offsetTop - mark.offsetHeight / 2;
            var left = e.clientX - box.offsetLeft - mark.offsetWidth / 2;

            var minLeft = minTop = 0;
            var maxLeft = maxTop = mark.offsetHeight;

            top = top < minTop ? minTop : (top > maxTop ? maxTop : top);
            left = left < minLeft ? minLeft : (left > maxLeft ? maxLeft : left);


            mark.style.top = top + 'px';
            mark.style.left = left + 'px';
            img.style.left = -left * 800 / 500 + 'px';
            img.style.top = -top * 800 / 500 + 'px';

        });

        $('.wdk-sku', root).on('changeitem', function (e, f) {
            if (f.max) {
                image.css('background-image', 'url(' + f.max + '!350' + ')')
                img.css('background-image', 'url(' + f.max + ')')
            }
        })

        var mark = image.find('.zooms-handle')[0];
        var boxRight = image.find('.zooms')[0];
        var img = image.find('.maxImage')[0];
        var box = image[0];
        var list = $('.thumbnail-list', root).on('click', 'li', function () {
            var m = $(this);
            m.parent().find('li').removeClass('active');
            m.addClass('active');
            image.css('background-image', 'url(' + (m.attr('max-src')) + ')')
            WDK(img).css('background-image', 'url(' + (m.attr('zoom-src')) + ')')
        });
        $('.prev', root).click(function (xhr) {
            var lem = list.eq(0).parent()[0];

            lem.scrollLeft -= 102;
        });
        $('.next', root).click(function (xhr) {
            var lem = list.eq(0).parent()[0];
            lem.scrollLeft += 102;
        });

        $('.product-tab-main .tabs li', root).click(function () {
            var p = $(this);

            var active = p.parent().siblings('div').children().hide().eq(parseInt(p.attr('data-index')))
                .show();

            if (!active.attr('data-init')) {
                active.attr('data-init', 'Y');
                active.on('init');
                active.find('a[model]').more().on('format', function (e, xhr, start) {
                    var m = $(this);
                    if (xhr instanceof Array) {
                        xhr = {
                            data: xhr
                        };
                    }

                    var fmt = WDK.UI.Cells.Comment;

                    var htmls = [];
                    for (var i = 0, l = xhr.data.length; i < l; i++) {
                        htmls.push(fmt(xhr.data[i], {}, {}, {}));
                    }
                    var em = m.siblings('div');
                    start ? em.append(htmls.join('')) : em.html(htmls.join(''));

                    return false;
                }).on('last', function () {
                    $(this).find('b').text(this.title);
                }).click();
            }
            p.parent().find('li').removeClass('active');
            p.addClass('active');

        }).each(function (i) {
            $(this).attr('data-index', i + '');
        })
        $('#favoriter', root).click(function () {

            root.on('SKUBuy', true);
        });
        $('#buy', root).click(function () {
            root.on('SKUBuy');
        }).parent('.wdk-sku').on('buy', function (e, n, q) {
            var cart = $('#cart').attr('data-add', q);
            var doc = $(document.createElement("div"));
            doc.addClass('image').css('background-image', image.css('background-image'));
            image.append(doc);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    doc.addClass('min');
                    setTimeout(function () {
                        doc.remove();
                        var nv = cart.attr('data-new');

                        cart.attr('data-num', nv ? nv : (parseInt(cart.attr('data-num')) + parseInt(q))).attr('data-add', false)
                            .attr('data-new', false);
                    }, 1000)
                });
            });
        });
        var dom = root.find('.wdk-sku');

        var selectItem;

        var _sku = JSON.parse(dom.attr('wdk-sku')) || { data: [], sku: [] };
        dom.siblings('.wdk-sku-mask').click(function () { dom.removeClass('show') });


        dom.find('.wdk-sku-qty').on('click', 'a', function () {
            var m = $(this);

            var val = m.parent().find('input');
            var v = parseInt(val.val()) || 0;
            if (m.is('.wdk-sku-add')) {
                v++;
            } else if (v > 1) {
                v--;
            }
            val.val(v + '')

            dom.on('sku');
        });
        dom.find('.wdk-sku-items').on('tap', 'a', function () {
            var m = $(this);
            if (!m.is('.selected')) {
                if (m.is('.disable') == false) {
                    var skus = _sku.sku || [];
                    m.addClass('selected').siblings('a').removeClass('selected');
                    dom.on('sku', m);
                    var ids = m.attr('sku-index').split(',');
                    dom.on('changeitem', skus[parseInt(ids[0])].data[parseInt(ids[1])]);
                }
            } else {
                m.removeClass('selected');
                selectItem = false;
            }
        });
        dom.find('.wdk-sku-footer').on('click', 'a', function () {
            if (!selectItem) {
                return false;
            }
        });
        dom.on('sku', function () {
            var size = [];
            var text = [];
            var seles = dom.find('.wdk-sku-items a.selected').each(function (i) {
                var m = $(this);
                size.push(m.attr('sku-id'));
                text.push(m.text());

            });
            var data = _sku.data || [];
            if (size.length == _sku.sku.length) {
                var sizeStr = size.sort().join();
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var sk = item.skus.sort();
                    if (sk.join() == sizeStr) {
                        if (item.off) {
                            seles.eq(seles.length - 1).removeClass('selected')
                                .addClass('disable');
                            return;

                        }
                        selectItem = item;
                        break;
                    }
                }
                if (_sku.sku.length == 0) {
                    selectItem = { id: _sku.defaultValue, price: _sku.price };
                }
                if (selectItem) {
                    dom.find('.wdk-sku-price').text('¥' + selectItem.price);

                    $('div[ui].ui').ui("SKUItemChange", selectItem, dom.find('.wdk-sku-text').text());
                }
            } else if (size.length + 1 == _sku.sku.length) {
                var l = dom.find('.wdk-sku-group').each(function (i, s, es) {
                    if (i == es.length - 1) {
                        var t = $(this);
                        if (t.find('a.selected').length == 0) {
                            t.find('a').removeClass('disable').each(function () {
                                var slts = size.slice(0);
                                var m = $(this);
                                slts.push(m.attr('sku-id'));
                                var sizeStr = slts.sort().join();
                                for (var i = 0; i < data.length; i++) {
                                    var item = data[i];
                                    var sk = item.skus.sort();
                                    if (sk.join() == sizeStr) {
                                        if (item.off) {
                                            m.addClass('disable');

                                        }
                                        break;
                                    }
                                }
                            });
                        }

                    }
                });

            } else {
                dom.find('.wdk-sku-items a').removeClass('disable');
            }
            if (text.length > 0 || _sku.sku.length == 0) {
                dom.find('.wdk-sku-text').text('已选 ' + text.join(', ') + ' ' + dom.find('input').val() + '件');
            } else {

                dom.find('.wdk-sku-text').text((data.length == 0 && _sku.sku.length > 0) ? "SKU未配置,请联系运维人员" : '请选择规格');
            }
        });

        root.on('SKUSheet', function (e, data) {
            selectItem = false;
            _sku = data.sku;
            dom.attr('wdk-sku', JSON.stringify(_sku));
            dom.find('.wdk-sku-image').css('background-image', 'url(' + data.src + ')');
            dom.find('.wdk-sku-price').html($.format('¥{price}', _sku, {}));
            dom.find('.wdk-sku-qty input').val('1');
            var values = _sku.data || [];
            for (var i = 0; i < values.length; i++) {
                var it = values[i];
                if (!it.off) {
                    selectItem = it;
                    break;
                }
            }
            var skus = _sku.sku || [];
            var size = '';
            if (selectItem) {

                size = (selectItem.skus || ['']).join(',');
            }
            var htmls = [];
            for (var i = 0; i < skus.length; i++) {

                var sku = skus[i];
                htmls.push('<div class="wdk-sku-item"><span>', sku.text, '</span>');
                htmls.push('<div class="wdk-sku-group">');
                var sdata = sku.data || [];
                for (var s = 0; s < sdata.length; s++) {
                    var sd = sdata[s];
                    htmls.push('<a sku-id="', sd.id, '" ', size.indexOf(sd.id) > -1 ? ('class="selected"') : '', ' sku-index="', i, ',', s, '">');
                    htmls.push(sd.text);
                    htmls.push('</a>');
                }
                htmls.push('</div></div>')
            }
            dom.find('.wdk-sku-items').html(htmls.join(''));
            dom.on('sku');

        });
        root.on('SKUBuy', function (e, go) {
            if (!selectItem) {
                dom.addClass('show');
            } else {
                var num = dom.find('.wdk-sku-qty input').val();
                dom.on('buy', selectItem, num);
                $.UI.Command("Product", "Quantity", { "Quantity": "+" + num, "product_id": selectItem.id });

                dom.removeClass('show');
            }
            if (go) {

                history.pushState(null, null, '/cart');
                setTimeout(() => $(window).on('popstate'), 1000);
            }


        });
        // });
        root.on('hash', function (e, val) {
            var id = val.key;
            var cells = WDK.UI.Cells;
            var empty = cells.Cell;
            WDK.UI.Send('Data', 'pro', id, function (xhr) {
                $('.thumbnail-list ul', root).html($.format('<li max-src="{url}!500?{time}" zoom-src="{url}?{time}"><img src="{url}!100?{time}"/></li>', xhr.Image, {
                    alt: function () {
                        return xhr.Product_Name
                    }
                }))
                    .find('li').eq(0).addClass('active').click();
                $('*[data-field]', root).each(function () {
                    var m = $(this);
                    var p = xhr[m.attr('data-field')];
                    m.html(p);
                    if (m.is('a')) {
                        if (p) {

                            m.attr('href', $.format(m.attr('href'), xhr));
                        } else {

                            m.parent('li').hide();
                        }
                    }
                });




                root.on('SKUSheet', {
                    sku: xhr.Size
                });
                var htmls = [];
                var attrs = xhr.Attributes || [];
                for (var i = 0; i < attrs.length; i++) {
                    htmls.push('<div class="caption">', attrs[i].group, '</div>');
                    var data = attrs[i].data;
                    htmls.push('<ul>', $.format('<li><em>{text}</em><ins>{value}</ins></li>', data), '</ul>');
                }

                $('.lk_content_nav', root).html('<a ui-spa href="/">首页</a> ' + $.format(' / <a ui-spa href="/category/{Value}">{Text}</a>', xhr.Categorys));
                $('.attribute', root).html(htmls.join(''));
                var data = JSON.parse(xhr.DescJSON || '[]');
                htmls = [];

                for (var c = 0, cl = data.length; c < cl; c++) {
                    var row = data[c];
                    var fn = cells[row._CellName] || empty;
                    htmls.push(fn(row.value, row.format || {}, row.style || {}));
                }
                $('.detail-content .desc', root).html(htmls.join('')).find('img').each(function () {
                    if (!this.alt) {
                        this.alt = xhr.Product_Name
                    }
                });
                $('#More', root).attr('params', JSON.stringify({
                    refer: xhr.Id
                }));
                if (xhr.releaseId)
                    $.UI.On('UI.Publish', xhr.Product_Name, xhr.LongName || xhr.Product_Name, xhr.LongName || xhr.Product_Name, {
                        type: 'Product', Id: xhr.releaseId
                    });

            }).Send('Spread', 'Category', id, function (xhr) {

                var tpl = root.find('#spread')[0].text;
                $('.lk_product_spread', root).html(WDK.format(tpl, xhr));
            }).Send();
        });

    }).page('shop/cart', 'shop/cart', function (root) {

        var config = WDK.UI._cfg;
        var dem = root;

        var panel = dem.find('#products').on('click', 'a.wdk-pro-reduce', function () {
            var me = WDK(this);
            var qty = me.siblings('input');
            var t = parseInt(qty.val());
            qty.val(t - 1);
            var box = me.parent('div[data-sku]');
            if (t == 1) {
                WDK.UI.Command('Product', "Remove", {
                    sku_id: box.attr('data-sku')
                });

                requestAnimationFrame(function () {
                    box.parent('.lk_order_pro').remove();
                })
            } else {
                WDK.UI.Command('Product', "Quantity", {
                    Quantity: '-1',
                    sku_id: box.attr('data-sku')
                });
            }
        }).on('click', 'a.wdk-pro-favoriter', function () {
            WDK.UI.Command('Product', "Favoriter", $(this).attr('data-pro'));
        }).on('click', 'a.wdk-pro-del-favoriter', function () {
            var me = WDK(this);
            WDK.UI.Command('Product', "Remove", {
                sku_id: me.attr('data-sku')
            });

            WDK.UI.Command('Product', "Favoriter", me.attr('data-pro'));
            me.parent('.lk_order_pro').remove();
            return false;
        }).on('click', 'a.wdk-pro-del', function () {
            var me = WDK(this);
            WDK.UI.Command('Product', "Remove", {
                sku_id: me.attr('data-sku')
            });

            me.parent('.lk_order_pro').remove();
            return false;
        }).on('click', 'a.wdk-pro-add', function () {
            var qty = WDK(this).siblings('input');
            qty.val(parseInt(qty.val()) + 1);
            var box = qty.parent('div[data-sku]');
            WDK.UI.Command('Product', "Quantity", {
                Quantity: '+1',
                sku_id: box.attr('data-sku')
            });
        });

        root.ui('Change', function (e, t) {
            var tpl = root.find('#product')[0].text;// document.getElementById('product').text;
            var ps = t.Products || [];
            panel.html($.format(tpl, ps, {
                Size: function (x) {
                    return x.Size || '默认规格'
                },
                Src: function (x) {
                    return [config.src, x.product_id, '/1/0.jpg!100'].join('');
                }
            }));

            var SaleAmount = parseFloat(t.SaleAmount || '0.00');
            var FullAmount = parseFloat(t.FullAmount || '0.00');
            t.PromAmount = FullAmount - SaleAmount;
            t.Quantity = parseInt(t.Quantity);
            if (ps.length == 0) {
                dem.find('.empty').show().siblings().addClass('hide');
            } else {
                dem.find('.empty').hide().siblings().removeClass('hide');
            }
            dem.find('*[data-field]').each(function () {
                var m = $(this);
                m.text(t[m.attr('data-field')]);
            });
            requestAnimationFrame(function () {
                $(window).on('scroll');
            });

        }, true);


        config ? WDK.UI.Start() : WDK.UI.Command('UI', 'Config', function (xhr) {
            WDK.UI._cfg = config = xhr;
            WDK.UI.Start();
        });

    }).page('shop/login', 'shop/login', function (root) {


        var frm = root.find('form').submit(function () {
            var m = $(this);
            var p = m.val();
            if (p) {
                if (m.is('.mobile-code')) {
                    delete p.Password;
                } else {
                    delete p.VerifyCode;
                }
                WDK.UI.Command('Account', 'Login', p);
            }
            return false;

        });
        root.find('.loginFunc').click(function () {
            var mp = root.find('.signin-box').cls('scanning');
            $(this).parent().cls('scanning');
            if (!mp.attr('mqtt')) {
                mp.attr('mqtt', 'YES');
                $.script('js/mqttws31.min.js').script('js/qrcode.min.js').wait(function () {
                    $.api('Message', 'mqtt', cfg => {
                        var client = new Paho.MQTT.Client(cfg.broker, 443, cfg.client);

                        root.find(".qrcode_view .context").click('a', function () {
                            root.on("connect");
                        });
                        client.onMessageArrived = function (message) {
                            var uss = JSON.parse(message.payloadString)[0];
                            if (uss.msg) {
                                if (uss.msg == 'OK') {
                                    location.reload(false);
                                } else {
                                    root.find(".qrcode_view .context").html(['<img src="', uss.src || uss.Src, '"/><b>', uss.msg, '</b>'].join(''));

                                }
                            }
                        };
                        var qrcode = new QRCode(root.find("#qrcode").html('')[0], {
                            width: 200,
                            height: 200
                        });
                        var timeId = 0;
                        root.on('disconnect', function () {
                            client.disconnect();
                            clearTimeout(timeId);
                            root.find(".qrcode_view .context").html("<a>刷新二维码</a>");
                        }).on('connect', function () {
                            root.find(".qrcode_view .context").html("<b>正在加载</b>");
                            clearTimeout(timeId);
                            client.connect({
                                useSSL: true,
                                userName: cfg.user,
                                password: cfg.pass,
                                onSuccess: function () {
                                    root.find(".qrcode_view .context").children().remove();

                                    qrcode.makeCode([location.origin, '/download?', $.UI.Device].join(''));

                                    timeId = setTimeout(function () {
                                        root.on('disconnect')
                                    }, 1000 * 120);
                                },
                                mqttVersion: 4,
                                onFailure: function (e) {
                                    console.log(e);
                                }
                            });
                        }).on('connect');
                    });
                });
            } else {
                root.on(mp.is('.scanning') ? "connect" : 'disconnect');

            }
        });

        var m = $('#sendBtn', root).click(function () {
            if (m.is('.send') == false) {
                var val = frm.val();//$('#Username').val();
                if (val.Username) {
                    WDK.UI.Command('Account', "Login", {
                        Mobile: val.Username
                    });
                }
            }
        });
        root.on('event', function (e, v, me) {
            var fm = root.find('form').cls(v);
            me.text(fm.is('.' + v) ? "密码登录" : "免费登录")



        }).ui('VerifyCode', function () {
            m.addClass('send');
            var t = 100;
            var initer = setInterval(function () {
                t--;
                m.text('发送(' + t + ')');
                if (t == 0) {
                    clearInterval(initer);
                    m.removeClass('send').text("再次发送");

                }
            }, 1000);
        })

    }).page('shop/order', 'shop/order', function (root) {
        root.ui('Login', function () {
            $(window).on('page', 'shop/login', '');
        })
        var config = WDK.UI._cfg;
        var dem = root;
        WDK.UI.Command("Account", "Check", "Login");
        dem.find('form').submit(function () {
            var m = $(this);
            WDK.UI.Command('Schedule', 'Payment', m.val());
            return false;
        });

        var address = dem.find('#myAddress').click('.title', function () {
            var m = $(this).parent('li').addClass('active');
            m.siblings().removeClass('active');
            WDK.UI.Command('Account', 'Address', { Order: root.find('#Sessinid').val(), Id: m.attr('data-id') });
            // }
        })
        var orderFormat = root.find('#order')[0].text;
        root.ui('address.edit', function (e) {

            WDK.UI.Command('Account', "Address", function (xhr) {
                address.html($.format(root.find('#address')[0].text, xhr)).find('.title').eq(0).click();
                if (xhr.length == 0) {
                    address.html('<li class="empty"> <a model="Account" cmd="Address" send="type=Edit&Id=news">新增收货人信息</a></li>');
                }
            });
        }).ui('address', function (e, v) {
            dem.find('i[data-field]').each(function () {
                var m = $(this);
                m.text(v[m.attr('data-field')]);
            });
        }).ui('Change', function (e, t) {
            $('#Sessinid', dem).val(t["Session-Id"]);
            root.ui('address.edit');
            var Fee = parseFloat(t.Fee || '0.00');

            var Free = parseFloat(t.Free || '0.00');
            var SaleAmount = parseFloat(t.SaleAmount || '0.00');
            var FullAmount = parseFloat(t.FullAmount || '0.00');
            var TotalAmount = parseFloat(t.TotalAmount || '0.00');
            var Payable = parseFloat(t.Payable) || 0;
            if (Fee > 0 && SaleAmount < Free) {
                Payable += Fee;
            }
            t.PaidAmount = (SaleAmount - Payable) || '0.00';
            t.PayableAmount = Payable;

            t.PromAmount = TotalAmount - SaleAmount;

            if (Fee > 0 && pl > 0) {
                if (SaleAmount > Free) {
                    t.FreeAmount = '包邮';
                } else {
                    t.FreeAmount = Fee || '0.00';
                }
            } else {
                t.FreeAmount = '0.00'
            }
            t.PromAmount = TotalAmount - SaleAmount;

            dem.find('em[data-field]').each(function () {
                var m = $(this);
                m.text(t[m.attr('data-field')]);
            });
            dem.find('.lk_order_goods').html($.format(orderFormat, t.Products, {
                Size: function (x) {
                    return x.Size || '默认规格'
                },
                Src: function (x) {
                    return [config.src, x.product_id, '/1/0.jpg!100'].join('');
                }
            }));

        }, true);

        config ? WDK.UI.Start() : WDK.UI.Command('UI', 'Config', function (xhr) {
            WDK.UI._cfg = config = xhr;
            WDK.UI.Start();
        });

    }).page('shop/search', 'shop/search', function (root) {
        var search = {
            limit: 30
        };
        WDK.UI.Command('Data', "filter", "Category", function (xhr) {

            var filter = xhr.Filter || [];
            var html = [];
            for (var index = 0; index < filter.length; index++) {
                var element = filter[index];
                html.push('<div class="filter"><div data-key="', element.key, '" class="filter_title">', element.name, '</div><ul>');
                var data = element.value;
                html.push('<li class="active">不限</li>')
                for (var c = 0; c < data.length; c++) {
                    var ele = data[c];
                    html.push('<li data-value="', ele.Value, '">', ele.Text, '</li>')

                }
                html.push('</ul></div>')
            }
            $('.lk_category_filter', root).html(html.join(''));
        });
        root.on('hash', function (e, val) {
            var v = val.Key;
            delete search.start;
            search.Keyword = v;
            $('#keyword', root).text(v);
            WDK.UI.On("Search", val);
            requestAnimationFrame(function () {

                root.on("Search");

            })
        }).on('Search', function () {
            WDK.UI.Command('Product', 'Search', search, function (xhr) {

                var tpl = root.find('#cell')[0].text;
                var series = xhr.data || [];
                var htmls = [];
                for (var i = 0; i < series.length; i++) {
                    var it = series[i];
                    if (i % 3 == 0) {
                        if (htmls.length > 0) {
                            htmls.push('</div>')
                        }
                        htmls.push('<div class="lk_content_row">')
                    }
                    htmls.push(WDK.format(tpl, it));
                };
                if (htmls.length > 0) {
                    var cl = 3 - (series.length % 3);
                    if (cl < 3) {
                        for (var i = 0; i < cl; i++) {
                            htmls.push('<div class="lk_content_cell3"></div>')
                        }
                    }
                    htmls.push('</div>')
                } else if (xhr.msg) {
                    htmls.push('<div class="empty">', xhr.msg, '</div>');
                }
                var pageCount = parseInt(xhr.total / search.limit);
                if (xhr.total % search.limit > 0) {
                    pageCount++;
                }
                var index = (search.start || 0) / search.limit + (xhr.total ? 1 : 0);
                WDK('.page-count .page', root).text(index + '/' + pageCount)
                    .parent().attr({
                        'data-start': search.start || 0,
                        'data-total': xhr.total
                    });
                WDK('#cells', root).html(htmls.join(''));
            });
        });
        // $(function () {
        $('.sort-row', root).on('click', 'li', function () {
            var m = $(this);
            if (!m.is('.active')) {
                m.addClass('active').siblings().removeClass('active');
                search.sort = m.attr('data-sort');
                search.dir = m.attr('data-dir') || 'asc';
                if (!search.sort) {
                    delete search.sort;
                }
                delete search.start;
                root.on("Search");
            } else {
                var dir = m.attr('data-dir');
                if (dir) {
                    m.removeClass(dir);
                    switch (dir) {
                        case 'asc':
                            m.addClass('desc');
                            m.attr('data-dir', 'desc');
                            break;
                        default:
                            m.addClass('asc');
                            m.attr('data-dir', 'asc');
                            break;
                    }
                    delete search.start;
                    search.dir = m.attr('data-dir') || 'asc';
                    root.on("Search");
                }
            }


        });
        $('.lk_category_filter', root).on('click', 'li', function () {
            var m = $(this);
            if (!m.is('.active')) {
                m.addClass('active').siblings().removeClass('active');
                var key = m.parent().siblings('.filter_title').attr('data-key');
                var value = m.attr('data-value');

                if (value) {
                    search[key] = m.attr('data-value');

                } else {
                    delete search[key];
                }
                delete search.start;
                root.on("Search");
            }
        });
        $('.page-count .prev', root).click(function () {
            var m = $(this).parent();
            var start = parseInt(m.attr('data-start') || '0');
            if (start - search.limit >= 0) {
                search.start = (search.start || 0) - search.limit;

                root.on("Search");
            }


        }).siblings('.next').click(function () {

            var m = $(this).parent();
            var start = parseInt(m.attr('data-start') || '0');
            var total = parseInt(m.attr('data-total') || '0');
            if (start + search.limit < total) {
                search.start = (search.start || 0) + search.limit;

                root.on("Search");
            }
        });


    }).tpl('subject', 'shop/subject', function (root) {
        root.on('hash', function (e, val) {
            var v = val.key;
            $.UI.Command('Subject', 'Data', v, function (xhr) {
                var cells = WDK.UI.Cells;
                $('.wdk-cms-title', root).text(xhr.Title);
                var data = xhr.Content;
                var htmls = [];
                for (var c = 0, cl = data.length; c < cl; c++) {
                    var row = data[c];
                    var fn = cells[row._CellName] || function () {
                        return ''
                    };
                    htmls.push(fn(row.value || {}, row.format || {}, row.style || {}));
                }
                var view = $('.wdk-cms-content', root).html(htmls.join(''));
                var tag = root.find("#tag").html($.format('<h1>{text}</h1><ul>{UL}</ul>', xhr.Portfolio, {
                    UL: function (x) {
                        return $.format('<li><a ui-spa href="/subject/{id}">{text}</a></li>', x.subs)
                    }
                }));

                if (xhr.releaseId)
                    $.UI.On('UI.Publish', xhr.Title, tag.text().replace(/\s+/g, ' '), view.text().replace(/\s+/g, ' '), {
                        type: 'Subject', Id: xhr.releaseId
                    });
            });
        });
    })
})(WDK)