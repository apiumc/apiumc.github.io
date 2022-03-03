
(function ($) {
    $.SPA = '/'
    function urlKey(file, v) {
        return '/' + file + '/' + v;

    }
    WDK.hashUrl = function (submit) {
        if (submit) {
            var sender = submit.send;
            switch (submit.key) {
                case 'Category':
                    return urlKey('category', (sender.Id || sender));
                case 'Subject':
                    return urlKey('subject', (sender.Id || sender));
                case 'Product':
                    return urlKey('product', (sender.Id || sender));
                case 'Pager':
                    switch (sender.model) {
                        case 'UI':
                            switch (sender.cmd) {
                                case 'Brand':
                                    return urlKey('brand', sender.search.Id);
                                case 'Series':
                                    return urlKey('series', sender.search.Id);
                                case 'Search':
                                    if (sender.search.SeriesId) {
                                        return urlKey('series', sender.search.SeriesId);

                                    }
                                    break;
                            }
                            break;
                        case 'Data':
                            switch (sender.cmd) {
                                case 'Search':
                                    if (sender.search.SeriesId) {
                                        return urlKey('series', sender.search.SeriesId);

                                    }
                                    break;
                            }
                            break;

                    }
            }
        }
    }
    WDK.UI.Click = WDK.hashUrl;
    $.UI.EventUI = 'section.content';
    WDK.UI.On("UI.Publish", function (e, title, key, desc, t) {
        requestAnimationFrame(function () {
            var ag = t || {};
            var body = $(document.body.cloneNode(true));
            body.find('div[ui]').attr('ui', false).addClass('hide');
            body.find('#app').cls('hideSidebar', true)

            ag.Key = location.pathname.substring(1) || 'index.html';
            var json = JSON.stringify({ title: title, key: key, desc: desc, html: body.html() });
            WDK.uploader(new File([json], 'publish.json', { type: 'text/json' }),
                function () {
                    $.UI.API('UI', 'Publish', ag);
                }, ag.Key, true);
        });
    }).On("UI.Show", function (e, v) {
        var doc = WDK(document.createElement("div")).addClass('weui_mask')
            .click(function () {
                WDK('div[ui].wdk-dialog').addClass('right').removeClass('ui');
            })
            .appendTo(document.body);
        v.on('close', function () {
            doc.remove();
        });
    }).Off('Prompt').On("Prompt", function (e, p) {

        var msg = WDK('#wdk-msg');
        if (msg.length == 0) {
            var m = document.createElement("div");
            m.id = 'wdk-msg';
            document.body.appendChild(m);
            msg = new WDK([m]);
        }
        msg.addClass('animate').html(p.Text);
        setTimeout(function () {
            msg.removeClass('animate');
        }, 5000);
    }).On('UI.Push', function (e, xhr) {
        var app = $($.UI.EventUI);
        app.children('div.ui').cls('ui', 0).remove().on('backstage');
        app.append(xhr.root.cls('ui', 1));
        xhr.root.on('active');
        var ocls = app.attr('app-cls') || app.attr('append-cls');

        var cls = xhr.root.attr('app-cls');
        app.attr('app-cls', cls);
        $(document.body).cls(ocls || '', 0).cls(cls || '', 1);
    });


    WDK(function ($) {
        $.page('shop/member');
        $.page('download');

        var settings = {
            Click: function (c) {

                return c.click ? WDK.UI.Format(c.click) : ('/category/' + c.id);
            }
        };
        $('.lk_heaer_search form').submit(function () {

            var skey = $.SPA + 'search?Key=' + encodeURI($(this).val().Key);
            var key = location.pathname + location.search;
            if (key != skey) {
                history.pushState(null, null, skey);
                requestAnimationFrame(() => $(window).on('popstate'));
            }

            return false;
        });
        $.UI.Send('Product', 'Category', 'UIMenuCategory', function (xhr) {
            var cate = xhr.Category || [];
            var htmls = ['<ul><li><div class="lk_menu_text"><a ui-spa href="/">主页</a></div></li>'];
            htmls.push($.format('<li><div class="lk_menu_text">{name}</div><div class="lk_menu"><div class="lk_menu_content">{format}</div></div></li>', cate, {
                format: function (d) {
                    var count = 0;
                    var ts = [];
                    for (var i = 0; i < d.data.length; i++) {
                        var item = d.data[i];
                        ts.push('<dl><dd class="all">', item.name, '</dd>');
                        var data = item.data;
                        var nt = [];
                        if (data.length > 8)
                            nt = data.splice(8, data.length - 8);
                        ts.push($.format('<dd><a ui-spa {Click}>{name}</a></dd>', data, settings), '</dl>');
                        if (nt.length > 0) {
                            ts.push('<dl><dd class="all"> </dd>', $.format('<dd><a ui-spa  {Click}>{name}</a></dd>', nt, settings), '</dl>');
                        }
                    }
                    count += d.data.length;
                    if (count < 3) {
                        ts.push($.format('<div class="menu-item"><a {Design} ui-spa {Click}><img src="{src}" alt="{EnName}"/><p class="en">{EnName}</p><p class="cn">{Name}</p></a></div>', d.config, {
                            Click: function (x) {
                                return WDK.UI.Format(x.click);
                            },
                            EnName: function (x) {
                                return x.EnName;
                            },
                            Name: function (x) {
                                return x.Name;
                            },
                            Design: function (x) {
                                return x.design ? ' ui-design="YES" ' : ''
                            }
                        }))
                    }
                    return ts.join('');
                }
            }));
            htmls.push('</ul>')
            var nav = $('.lk_header #nav').html(htmls.join('')).click('a', function () {
                // console.log(2);
                nav.addClass('menuhide');
                requestAnimationFrame(function () {
                    nav.removeClass('menuhide');
                });
            });



        }).Send();
        $('.lk_footer form').submit(function () {
            var t = $(this).val();
            if (t.email) {
                WDK.UI.Command("Store", "Subscriber", t.email);
            }
            return false;
        });
        var cart = $('#cart');
        WDK.UI.On("Change", function (e, xhr) {

            if (cart.attr('data-add')) {
                cart.attr('data-new', parseInt(xhr.Quantity) || false).attr('data-add', false);
            } else {
                cart.attr('data-num', parseInt(xhr.Quantity) || false);
            }
        });


        $(window).off('popstate').on('popstate', function (e, v) {
            var pathKey = location.pathname;
            var pKey = pathKey.substring($.SPA.length) || 'index';
            switch (pKey) {
                case 'shop.html':
                    $(window).on('page', 'shop/index', '');
                    return;
                case 'index':
                case 'cart':
                case 'member':
                case 'order':
                case 'search':
                    $(window).on('page', 'shop/' + pKey, location.search.substring(1));
                    return;
            }
            var ps = pathKey.substring($.SPA.length).split('/');
            $(window).on('page', ps.join('/'), location.search.substring(1) || "")
        });

        WDK.UI.On('User', function () {
            WDK.UI.Command("Design", 'Check', function (xhr) {

                if (xhr.Alias) {
                    $('.lk_header .reg').html(['<a ui-spa href="/member">个人中心</a> | <a model="Account" cmd="Close" href="javascript:void(0)">退出</a>'].join(''))

                }
                if (xhr.IsDesign || xhr.IsCashier) {
                    var t = document.createElement('div');
                    t.className = "wdk-design";
                    WDK(t).html(xhr.IsDesign ? '<a class="wdk-design-page"></a>' : '<a class="wdk-design-view"></a>')
                        .on('click', 'a', function () {
                            WDK.UI.Command("Design", 'Change')
                        }).appendTo(document.body);
                }
                WDK.UI.Start();
                $(window).on('popstate');
            })
        }).On('Close', function () {
            location.reload(false);
        })
        WDK.script('shop/shop.js').wait(function () {
            WDK.UI.On('User');
        });

    });


})(WDK);