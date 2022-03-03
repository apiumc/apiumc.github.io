(function ($) {
    var gcount = 1;

    function Grid(param, content) {
        this.init(param, content);
    };
    Grid.prototype = {
        init: function (param, content) {
            this.rowKey = 0;
            this.values = {};
            var me = this;
            var header = this.Header = param.Header;
            var fields = [],
                cms = [];
            for (var i = 0; i < header.fields.length; i++) {
                var f = header.fields[i];
                if (f.config) {
                    fields.push(f.Name);
                    cms.push(f.config.text);
                }
            }
            this.fields = fields;
            this.columns = cms;
            this.parms = {};
            header.pageSize = parseInt(header.pageSize) || 0;
            var search = this.search = param.search || {};
            var parm = this.parms = this.search.params || {};
            if (search.model) {
                $.extend(parm, { _model: search.model, _cmd: search.cmd });
            }
            if (header.pageSize > 0) {
                parm.start = 0;
                parm.limit = header.pageSize;
            }
            content.attr('search', search.model || null);
            var headers = ['<div class="header"><a class="back"></a><h1>', param.Title || "请选择", '</h1> '];
            if (param.menu) {
                this.menu = param.menu;
                if (this.menu.length == 1) {
                    headers.push('<a class="right">', this.menu[0].text, '</a>');
                } else {
                    headers.push('<a class="right"><span class="icon-menu"></span></a>');
                }
            }
            headers.push('</div><div class=" weui_cell_primary" style="overflow: auto"></div>');
            var cont = content.html(headers.join('')).find('.weui_cell_primary');
            content.find('.header a').click(function () {
                var menu = me.menu;
                var b = $(this)
                if (b.is('.back')) {
                    content.addClass('right').removeClass('ui');
                } else if (menu.length > 1) {
                    $.UI.Sheet('菜单', menu, function (v) {
                        UMC.UI.Command(v.model, v.cmd, v.send);
                    }, 'text');
                } else {
                    var v = menu[0];
                    UMC.UI.Command(v.model, v.cmd, v.send);
                }
            });
            var htmls = []
            htmls.push('<div class="weui_cells" style=" margin-top: 0px;">');
            this.columns.length > 1 ? htmls.push(this.cell(false, this.columns, true)) : 0;

            if (header.search) {
                htmls.push('<div class="weui_search_bar">',
                    '<form class="weui_search_outer">',
                    '<div class="weui_search_inner">',
                    '<i class="weui_icon_search"></i>',
                    '<input type="search" class="weui_search_input" id="gridSearch', gcount, '" placeholder="', (header.search || '搜索'), '">',
                    '<a class="weui_icon_clear"></a>',
                    '</div>',
                    '<label for="gridSearch', gcount, '" class="weui_search_text">',
                    '<i class="weui_icon_search"></i>',
                    '<span>', (header.search || '搜索'), '</span>',
                    '</label>',
                    '</form>',
                    '<a class="weui_search_cancel">取消</a>',
                    '</div>');
                gcount++;
            }
            htmls.push('</div>');
            htmls.push('<div class="weui_cells">');
            htmls.push('</div>');
            cont.html(htmls.join(''));


            var search_bar = cont.find('.weui_search_bar');
            search_bar.on('tap', '.weui_icon_clear', function () {
                search_bar.find('input').val('');
            }).on('tap', '.weui_search_cancel', function () {
                search_bar.removeClass('weui_search_focusing');
            }).find('form').on('submit', function () {
                me.query($(this).find('input').val());
                return false;
            }).find('.weui_search_input').on('focus', function () {
                search_bar.addClass('weui_search_focusing');
            });

            htmls = []
            this.items = cont.find('.weui_cells').eq(1);

            if (header.pageSize > 0) {
                cont.append(this.paging = $(document.createElement('div')).click(function () {
                    var m = $(this).attr('data-src', 'click');
                    me.next() ? m.show() : m.hide();
                }).attr('data-src', 'click').css('height', '5px'));
                content.on('defer', true);
            }
            if (header.type == 'dialog') {
                me.send = header.send || header.ValueField;
                me.items.addClass('weui_cells_access');
                me.items.on('click', 'a', function () {
                    me.submit($(this));

                });
            }
            if (param.Data) {
                me.destData = param.Data;
                me.html();
            } else if (!header.search || header.auto) {
                this.refresh();
            }
            this.dom = content.on('refresh', function () {

                me.parms.start = 0;
                me.clear = true;
                me.refresh();
            });
        },
        submit: function (em) {
            var t = em.attr('data-value');
            if (t) {
                var value = this.values[parseInt(t)];
                var me = this;
                var su = me.search.submit;
                if (su) {
                    if (su.send) {
                        if (typeof value == 'object') {
                            UMC.extend(su.send, value)
                        } else {
                            su.send[me.send] = value;
                        }
                        $.UI.Command(su.model, su.cmd, su.send);
                    } else {
                        $.UI.Command(su.model, su.cmd, value)
                    }
                } else {
                    $.UI.Command(value);
                    this.dom.addClass('right').removeClass('ui');
                }
            }
        },

        refresh: function () {
            var me = this;
            $.UI.Command(this.parms, function (json) {
                me.destData = json;
                me.html();
                delete me.clear;
            });
        },
        query: function (v) {
            if (v) {
                this.parms.Keyword = v;
            } else {
                delete this.parms.Keyword; // = v;
            }
            this.parms.start = 0; // = v;
            this.clear = true;
            this.refresh();
        },
        cellValue: function (v) {
            this.rowKey++;
            this.values[this.rowKey] = v;
            return 'data-value="' + this.rowKey + '"'
        },

        cell: function (a, as, h) {
            var html = [];
            if (as.length > 0) {
                html.push(a ? '<a' : '<div', '  class="weui_cell" ');
                if (a) html.push(this.cellValue(a));
                html.push('><div class="weui_cell_primary">');
                html.push(as[0]);
                html.push('</div>');
                if (as.length > 1) {
                    html.push('<div class="', as.length == 2 ? 'weui_cell_ft' : 'weui_cell_primary', '">');
                    html.push(as[1]);
                    html.push('</div>');
                }
                if (as.length > 2) {
                    html.push('<div class="', a ? 'weui_cell_ft' : '', '"', h ? 'style="text-align:center"' : '', '>');
                    html.push(as[2]);
                    html.push('</div>');
                }

                html.push(a ? '</a>' : '</div>');
            }
            return html.join('');
        },
        html: function () {
            var htmls = [];
            var res = this.destData.data || [];
            for (var i = 0; i < res.length; i++) {
                htmls.push(this.renderCell(res[i], i));
            }
            this.clear ? this.items.html(htmls.join('')) : this.items.append(htmls.join(''));
            var total = parseInt(this.destData.total) || 0;
            if (total == 0 && htmls.length == 0) {
                this.items.append('<div class="weui_cell"><div class="wdk-gird-empty" style="margin: auto;">' + (this.destData.msg || '没有数据'), '</div></div>');
            }
            if (this.paging) {
                this.paging.css('display', ((this.parms.start || 0) + this.Header.pageSize) < total ? 'block' : 'none');
            }


        },
        renderCell: function (re, row) {
            var vs = [];
            var vf = this.Header.ValueField;
            var style = re.__Style || {};
            for (var i = 0; i < this.fields.length; i++) {
                vs.push($.format('{' + this.fields[i] + '}', re, style));
            }
            var svalue = false;
            if (vf) {
                if (typeof vf == 'object') {
                    var s = {};
                    for (var key in vf) {
                        s[key] = re[vf[key]];
                    }
                    svalue = s;

                } else {
                    svalue = re[vf];
                }
            }
            return this.cell(svalue, vs, row);
        },

        next: function () {
            if (this.destData && !$.UI.loading) {
                var total = parseInt(this.destData.total) || 0;
                var start = (this.parms.start || 0) + this.Header.pageSize;
                if (start && start < total) {
                    this.parms.start = start;
                    this.refresh();
                    return true;
                }
            }
            return false;
        }
    };

    $.UI.Grid = Grid;


    function Map(param, content) {
        this.init(param, content);
    };

    $.UI.Map = Map;

    var __mm = 0;;
    Map.prototype = {
        init: function (send, content) {

            var headers = ['<div class="header"><a class="back"></a><h1>地图</h1><a target="_blank" class="right">导航</a> '];

            headers.push('</div><section style="flex: 1;margin: 0;display: flex;flex-direction: column;" ><div class="weui_cells weui_cells_access"></div><div id="img" style="width: 100%; flex: 1"><img /></div></section>');
            var cont = content.html(headers.join('')).find('section');
            content.find('.header a').click(function () {

                var b = $(this)
                if (b.is('.back')) {
                    content.addClass('right').removeClass('ui');

                }
            });
            var addr = (typeof send == 'string') ? send : send.address;
            var title = addr;
            var items = send.items || [];
            if (items.length == 0) {
                items.push({
                    data: {
                        icon: '\uf041',
                        text: addr
                    }
                });
            } else {

                title = items[0].text || addr;
            }
            var htmls = [];
            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                htmls.push($.format('<div class="weui_cell"><b style="padding-right:0.8em">{icon}</b>  {text}</div>', it.data, it.style || {
                    icon: {
                        font: 'wdk'
                    }
                }));
            }
            cont.find('.weui_cells').html(htmls.join(''));
            setTimeout(function () {
                var img = cont.find('#img');
                var gourl = ['https://api.map.baidu.com/marker?title=', addr, '&content=', title, '&output=html&src=webapp.baidu.openAPIdemo&location=']
                var o = img.offset();
                var url = ['https://api.map.baidu.com/staticimage/v2?ak=3E56F4E307101790633c27f05967494c&zoom=13&width=', o.width, '&height=', o.height - 5]
                if (send.location) {
                    var lcs = send.location.split(',');
                    gourl.push(lcs[1], ',', lcs[0]);
                    url.push('&markers=', send.location, '&center=', send.location);
                    img.find('img').attr('src', url.join(''));
                    content.find('.header a.right').click(function () {
                        try {
                            dd.biz.map.view({
                                latitude: lcs[1],
                                longitude: lcs[0],
                                title: title
                            });
                            return false;
                        } catch (e) {

                        }
                    }).attr('href', gourl.join(''));
                } else {
                    window['c__' + (++__mm)] = function (xhr) {
                        var loc = xhr.result.location;
                        var lng = loc.lng + ',' + loc.lat;
                        gourl.push(loc.lat, ',', loc.lng);
                        url.push('&markers=', lng, '&center=', lng);
                        img.find('img').attr('src', url.join(''));
                        content.find('.header a.right').click(function () {

                            dd.biz.map.view({
                                latitude: loc.lat,//39.903578, // 纬度
                                longitude: loc.lng,//116.473565, // 经度
                                title: title//"北京国家广告产业园" // 地址/POI名称
                            });
                            return false;
                        })
                    };
                    var srcs = ['https://api.map.baidu.com/geocoder/v2/?output=json&ak=3E56F4E307101790633c27f05967494c&address=', encodeURIComponent(addr), '&callback=c__', __mm];
                    var script = document.createElement("script");
                    script.src = srcs.join('');
                    $(script).on('load', function () { script.remove() })
                        .appendTo('head');
                    // return true;
                }
            }, 300)

        }
    };

    function WFlow(param, content) {
        this.init(param, content);
    };
    UMC.UI.Flow = WFlow;
    WFlow.prototype = {
        init: function (send, content) {

            var headers = ['<div class="header"><a class="back"></a><h1>流程图</h1>'];

            headers.push('</div><section style="flex: 1;margin: 0;display: flex;flex-direction: column;" ><div style="width: 100%;overflow: auto;position: absolute;height: 100%; text-align: center "><svg style="width: 100%;"><g></g></svg></div></section>');
            var cont = content.html(headers.join('')).find('section');
            content.find('.header a').click(function () {

                var b = $(this)
                if (b.is('.back')) {
                    content.addClass('right').removeClass('ui');

                }
            });

            var graph = new dagreD3.graphlib.Graph()
                .setGraph({
                    // rankdir: "LR",
                    marginx: 20,
                    marginy: 20
                })
                .setDefaultEdgeLabel(function () {
                    return {};
                });

            var task = send.Result;//UMC.UI.Task = v.Task;
            for (var i = 0; i < task.Shapes.length; i++) {
                var shape = task.Shapes[i];
                graph.setNode(shape.Id, {
                    labelType: "html",
                    label: ['<div class="wdk-shape" shape="', shape.Id, '" instance="', task.InstanceId, '">', shape.Text, '<i>', shape.Id, '</i></div>'].join(''),
                    id: shape.Id,
                    class: 'wf ' + shape.Status
                })
            }
            for (var i = 0; i < task.Lines.length; i++) {
                var line = task.Lines[i];
                graph.setEdge(line.FromId, line.ToId, {

                    id: line.Id,
                    class: 'wf ' + line.Status
                });
            }


            var svg = cont.find('svg g');//.remove();
            requestAnimationFrame(function () {
                var render = new dagreD3.render();
                render(d3.select(svg[0]), graph);
                var graphHeight = graph.graph().height + 40;
                var offset = svg.parent().css({
                    'height': graphHeight + 'px',
                    'width': (graph.graph().width + 40) + 'px'
                }).offset();

                var xCenterOffset = (offset.width - graph.graph().width) / 2;
                svg.attr("transform", "translate(" + xCenterOffset + ", 20)");
                $('.wdk-shape').click(function () {
                    var me = $(this);
                    UMC.UI.Command("WorkFlow", "Log", { Id: me.attr('instance'), Shape: me.attr('shape') });
                });

            });

        }
    };

})(WDK);