(function ($) {
    $.page('shop/member', 'shop/member', function (root) {
        root.on('event', function (e, v) {
            root.find('.lk_member_detail>div[ui]').each(function () {
                var m = $(this);
                var ui = m.attr('ui');
                m.removeClass('ui');
                if (ui == v) {
                    if (!m.attr('init')) {
                        m.attr('init', '1');
                        root.on(ui + '.init', m);
                    }
                    m.addClass('ui');
                    return
                }

            });
            root.find('.lk_member_menu li a').each(function () {
                var m = $(this);
                var ui = m.attr('ui-event');
                if (ui == v) {
                    m.parent('li').addClass('active').siblings().removeClass('active')
                    return false;
                }
            })
        });
        root.on('hash', function (e, v) {
            root.on('event', 'main');

        }).ui('Login', function () {
            $(window).on('page', 'shop/login', '');
        }).on('active', function () {
            if (root.attr('login')) {
                $(window).on('page', 'shop/login', '');

            }
        })
        root.on('main.init', function (e, em) {

            var search = {
                limit: 30
            };

            em.on("Search", function () {
                WDK.UI.Command('Member', "Order", search, function (xhr) {
                    if (xhr.isLogin) {
                        root.attr('login', 'yes');
                        $(window).on('page', 'shop/login', '');
                    }
                    var tpl = root.find('#order')[0].text;// document.getElementById('order').text;
                    var pro = root.find('#pro')[0].text;/// document.getElementById('pro').text;
                    var htmls = []
                    htmls.push($.format(tpl, xhr.data, {

                        Product: function (x) {
                            return $.format(pro, x.order.Products, {
                                src: function (d) {
                                    return [x.src, d.product_id, '/1/0.jpg!100'].join('')
                                }
                            })
                        },
                        Commands: function (x) {
                            return $.format('<a ui-spa {Click}>{text}</a>', x.cmds, {
                                Click: function (c) {
                                    return WDK.UI.Format(c.click);
                                }
                            })
                        }
                    }));
                    if (xhr.msg) {
                        htmls.push('<div class="empty">', xhr.msg, '</div>');
                    }

                    var pageCount = parseInt(xhr.total / search.limit);
                    if (xhr.total % search.limit > 0) {
                        pageCount++;
                    }
                    var index = (search.start || 0) / search.limit + (xhr.total ? 1 : 0);
                    em.find('.page-count .page').text(index + '/' + pageCount)
                        .parent().attr({
                            'data-start': search.start || 0,
                            'data-total': xhr.total
                        });
                    em.find('#cells').html(htmls.join(''));
                });
            });

            $('.lk_member_tabs li', em).click(function () {
                var m = $(this);
                m.addClass('active').siblings('li').removeClass('active');
                search.sort = m.attr("data-sort");
                if (!search.sort) {
                    delete search.sort;
                }
                em.on("Search");

            }).eq(0).click();

            em.find('#cells').on('click', 'a[data-order-id]', function () {
                var me = $(this);
                WDK.UI.Command('Order', 'Data', me.attr('data-order-id'), function (xhr) {
                    var data = xhr.data || []; //[].splice
                    data.splice(0, 2);
                    var htmls = [];
                    htmls.push('<ul>',
                        $.format('<li><i>{name}</i>{value}</li>', data || []), '</ul>');
                    me.parent(".lk_order").find('.lk_order_logistic').html(htmls.join(''));

                });
            });
        }).on('setting.init', function (e, em) {

            WDK.UI.Command('Account', "Info", "Me", function (xhr) {
                var dom = $(document.createElement("div"));
                new WDK.UI.Form({
                    DataSource: xhr,
                    submit: false,
                    Type: "Form"
                }, dom);
                // console.log(xhr);
                em.find('#cells').append(dom);
                dom.removeClass('ui').addClass('lk_member_info').find('.header').remove();
            });
        }).on('favoriter.init', function (e, em) {
            var search = {
                limit: 30
            };
            root.ui('Favoriter', function () {
                var cells = WDK.UI.Cells;
                WDK.UI.Command('Member', "Favoriter", search, function (xhr) {

                    var favoriter = root.find('#favoriter')[0].text;/// document.getElementById('pro').text;

                    var htmls = [$.format(favoriter, xhr.data, {
                        Src: function (x) {
                            return x.data.src;
                        }, Title: function (x) {

                            return $.format(x.format.title || '{title}', x.data, x.style);

                        }, Desc: function (x) {

                            return $.format(x.format.desc || '{desc}', x.data, x.style);

                        }, Click: function (x) {
                            return WDK.UI.Format(x.data.click)
                        }
                    })];

                    if (xhr.msg) {
                        htmls.push('<label><div class="empty">', xhr.msg, '</div></label>');
                    }

                    em.find('#cells .weui_cells').html(htmls.join(''));

                    var pageCount = parseInt(xhr.total / search.limit);
                    if (xhr.total % search.limit > 0) {
                        pageCount++;
                    }
                    var index = (search.start || 0) / search.limit + (xhr.total ? 1 : 0);
                    em.find('.page-count .page').text(index + '/' + pageCount)
                        .parent().attr({
                            'data-start': search.start || 0,
                            'data-total': xhr.total
                        });
                });
            });
            em.find('#cells .weui_cells').on('click', 'div[href]', function () {

                var k = ($(this).attr('href') || '').split('=')[1];
                WDK.UI.Hash('format', k);
            }).on('click', 'a[data-remove-id]', function () {
                var m = $(this);
                WDK.UI.Command("Member", "Favoriter", m.attr('data-remove-id'));
                m.parent('.weui_cell').remove();
            });
            root.ui("Favoriter");
        });
    });
})(WDK);