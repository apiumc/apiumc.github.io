( function($)  {
    function Paging(dom, l) {
        this.dom = dom;
        this.search = { limit: l || 30 };
        var me = this;
        this.dom.on('search', function (e, str) {
            if (str) {
                if (typeof str == 'string') {
                    me.search = $.extend(me.search, me.param);
                    me.search.Keyword = str;
                } else if (typeof str == 'object') {
                    var limit = me.search.limit;
                    var Keyword = me.search.Keyword;
                    me.search = $.extend({ limit: limit }, me.param);
                    if (Keyword) {
                        me.search.Keyword = Keyword;
                    }
                    for (var k in str) {
                        me.search[k] = str[k];
                    }

                }
            } else {
                me.search = $.extend(me.search, me.param);
                delete me.search.Keyword;
            }
            me.search.start = 0;
            me.dom.on('paging', me.search);
            return false;
        });
        this.dom.on('total', function (e, total) {
            me.bind(me.search.start, me.search.limit, total);

        });
        this.dom.on('click', 'button,li', function () {
            var currentPage = (me.start) / me.limit;
            var start = -1;
            var a = WDK(this);
            if (a.is('.active')) {
                return;
            } else if (a.is('.btn-prev')) {
                if (currentPage > 1) {
                    start = me.start - (me.limit * 2);
                    if (start < 0) {
                        start = 0;
                    }
                } else {
                    return false;
                }
            } else if (a.is('.btn-next')) {
                if (currentPage > 0) {
                    if (me.total > me.start) {
                        start = me.start;
                    } else {
                        return false;
                    }
                }
            } else if (a.is('.number')) {
                if (currentPage > 0) {
                    start = (parseInt(a.text()) - 1) * me.limit;
                }
            }
            if (start >= 0) {
                me.start = start;
            }
            if (me.total > me.start) {
                me.search.start = me.start;
                me.dom.on('paging', me.search);
            }
            return false;

        });
        this.dom.find('input').change(function () {
            var start = (parseInt(this.value) - 1) * me.limit;
            if (start >= 0) {
                me.search.start = start;
            }
            if (me.total > start) {
                me.dom.on('paging', me.search);
            }
        });

        this.dom.on('param', function (e, param) {
            me.param = $.extend(me.search, param);
        });
        this.dom.on('sort', function (e, em) {
            var cs = $(em).click(function () {
                var m = $(this);
                var sort = m.attr('sort');
                var search = {};
                var ksort = m.attr('sort-key') || 'sort';
                sort ? search[ksort] = sort : 0;
                if (m.is('.is-active')) {
                    var i = m.find('i');
                    i.cls('desc', !i.is('.desc'));
                    search.dir = i.is('.desc') ? 'DESC' : 'ASC';
                    me.dom.on('search', search);
                } else {
                    m.cls('is-active', 1).siblings().cls('is-active', 0);
                    me.dom.on('search', search);
                }
            });
            cs.eq('.is-active').click();
            cs.length ? 0 : me.dom.on('search', {});

        })
    }
    Paging.prototype = {
        bind: function (start, limit, total) {

            this.total = parseInt(total) || 0;
            var currentPage = parseInt(start / limit);
            this.curent = currentPage;
            this.start = start + limit;
            this.limit = limit;
            this.search.limit = limit;
            var pageNavStr = [];
            var totalPage = Math.ceil(this.total / limit) || 1;
            var startBN = currentPage - 5;
            var endBN = currentPage + 5;
            if (startBN < 0) {
                endBN -= startBN;
                startBN = 0;
            }
            if (endBN > totalPage) {
                endBN = totalPage;
            }
            for (; startBN < endBN; startBN++) {
                pageNavStr.push('<li  class="number', startBN == currentPage ? " active" : '', '">', startBN + 1, '</li>');
            }
            this.dom.find(".total").html('共' + (totalPage) + '页')
            this.dom.find('ul').html(pageNavStr.join(''));
            this.dom.find('input').attr('max', totalPage).val(currentPage + 1);

            this.dom.find('.btn-prev')[0].disabled = currentPage == 0;
            this.dom.find('.btn-next')[0].disabled = currentPage >= (totalPage - 1);
        }
    }
    WDK.prototype.paging = function (m, c, fn, o, l) {
        if ($.isfn(m)) {
            fn = m;
            l = c || 0;
            this.each(function () {
                new Paging($(this), l);
            }).on('paging', fn)
        } else if ($.isfn(fn)) {
            this.each(function () {
                new Paging($(this), l);
            }).on('paging', function (e, s) {
                var me = $(this);
                WDK.UI.Command(m, c, s, function (x) {
                    me.on('total', x.total || 0);
                    fn(x);
                });
            })

        } else if (fn instanceof $) {
            this.each(function () {
                new Paging($(this), l);
            }).on('paging', function (e, s) {
                var me = $(this);
                WDK.UI.Command(m, c, s, function (x) {
                    me.on('total', x.total || 0);
                    $(fn).format(x.data || [], o || {}, true)
                        .parent('.el-table').attr('msg', x.msg || (x.total === 0 ? "未有数据" : false)).cls('msg', x.msg || x.total === 0);

                });
            })

        }
        return this;
    }
    WDK.prototype.menu = function () {
        return this.on('click', function () {
            var m = $(this);
            if (m.is('.is-active')) {
                m.siblings('*[role=menu]').click();
            } else {
                var rect = this.getBoundingClientRect();
                m.cls('is-active', 1);
                var mask = $(document.createElement('div')).addClass('weui_mask')
                    .click(function () {
                        $(this).remove();
                        m.cls('is-active', 0);
                        menu.css('transform', 'translateX(-1000px)');
                    }).css({
                        opacity: '0',
                        'z-index': '0'
                    }).appendTo(document.body);

                var menu = m.siblings('*[role=menu]')
                .css('transform', ['translate(', (rect.left), 'px,', (rect.top + rect.height + 5), 'px)'].join(''))
                    .click(function () {
                        mask.click();
                    }, 1);
            }

        });
    }
    WDK.prototype.thead = function () {
        this.find('thead').each(function () {
            var tTD;
            $(this).find('th')
                .on('mousedown', function (e) {
                    tTD = this;
                    if (e.offsetX > tTD.offsetWidth - 10) {
                        tTD.mouseDown = true;
                        tTD.oldX = e.x;
                        tTD.oldWidth = tTD.offsetWidth;
                        tTD.tableWidth = tTD.table.offsetWidth;
                    }
                }).on('mouseup', function () {
                    if (!tTD) tTD = this;
                    tTD.mouseDown = false;
                    tTD.style.cursor = 'default';
                }).on('mousemove', function (e) {
                    if (e.offsetX > this.offsetWidth - 10)
                        this.style.cursor = 'col-resize';
                    else
                        this.style.cursor = 'default';
                    if (!tTD) tTD = this;
                    if (tTD.mouseDown == true) {
                        var px = (e.x - tTD.oldX);
                        if ((tTD.oldWidth + px) > 0) {
                            tTD.col.width = tTD.oldWidth + px;
                            tTD.table.style.width = (tTD.tableWidth + px) + 'px'
                        }
                        tTD.style.cursor = 'col-resize';
                    }
                }).each(function (i) {
                    var table = $(this).parent('table');
                    this.col = table.children('colgroup').find('col')[i];
                    this.table = table[0];
                });
        });
        return this;
    }
})(WDK);