(function ($) {

    function createlabel(title, htmls, k, t) {
        if (k != '_')
            htmls.push('<div class="weui_cell_hd ', k ? 'weui_cell_primary' : '', '"><label class="', title ? 'weui_label' : '', '">', title, '</label></div>');

    }

    function htmlEncode(sHtml) {

        return sHtml.replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; });
        // return $(document.createElement("div")).attr(""text).html();
    }

    function createSubmit(v, htmls) {
        if (v !== false) {
            htmls.push('<div class="weui_btn_area">');
            htmls.push('<input type="submit" class="weui_btn weui_btn_primary" value="', (typeof v) == 'string' ? v : ((v || {}).text || '确认提交'), '" /></div>');
        }
    }

    function createField(v, key, title) {
        var htmls = [];
        var defaultValue = v.DefaultValue ? htmlEncode(v.DefaultValue) : '';
        switch (v.Type) {
            case "Select":
                htmls.push('<div class="weui_cell weui_cell_select weui_select_after">');
                createlabel(title, htmls);
                htmls.push('<div class="weui_cell_bd weui_cell_primary">',
                    '<select class="weui_select"', v.required ? '' : 'required', ' placeholder="', v.placeholder || ("请输入" + v.Title), '"  name="', key, '">',
                    $.format('<option value="{Value}" {Sel} >{Text}</option>', v.DataSource, { Sel: function (x) { return x.Selected ? 'selected' : '' } }),
                    '</select></div></div>');
                break;
            case "RadioGroup":
            case "CheckboxGroup":
                if (defaultValue) {
                    htmls.push('<input type="hidden" value="', defaultValue || '', '"  name="', key, '" />');
                }
                var items = v.DataSource || [];
                for (var i = 0; i < items.length; i++) {
                    htmls.push('<label class="weui_cell weui_check_label"  for="', key, '-', i, '">');
                    var item = items[i];
                    htmls.push('<div class="weui_cell_bd weui_cell_primary"><p>', item.Text, '</p></div><div class="weui_cell_ft">');
                    htmls.push('<input class="weui_check" type="', v.Type == "CheckboxGroup" ? "checkbox" : "radio", '" ', item.Selected ? 'checked' : '', item.Disabled ? 'disabled' : '', ' value="', item.Value, '" name="', key, '" id="', key, '-', i, '"/>');
                    htmls.push('<i class="weui_icon_checked"></i></div></label>');
                }

                if (!v.required) {
                    htmls.push('<input name="', key, '" type="hidden" disabled ', v.required ? '' : 'required', ' placeholder="', v.placeholder || ("请选择" + v.Title), '"/>')
                }
                break;
            case "Receiver":
                htmls.push('<input ', v.required ? '' : 'required', ' type="hidden" value="', defaultValue || '', '" placeholder="', v.placeholder || ("请选择" + v.Title), '"  name="', key, '" />');
                if (v.Receiver) {
                    htmls.push('<a class="weui_cell"  data-key="', key, '">',
                        '<div class="weui_cell_bd weui_cell_primary">',
                        '<p>收货人</p>',
                        '</div><div class="weui_cell_ft">', v.Receiver, '</div></a>');
                } else {
                    htmls.push('<a class="weui_cell"  data-key="', key, '">',
                        '<div class="weui_cell_ft">', v.Empty || '请点击设置收单人信息', '</div></a>');
                }
                if (v.Address) {
                    htmls.push('<a class="weui_cell"  data-key="', key, '">',
                        '<div class="weui_cell_bd weui_cell_primary">',
                        '<p>收货地址</p>',
                        '</div><div class="weui_cell_ft">', v.Address, '</div></a>');
                }
                break;
            case "Score":
                htmls.push('<div class="weui_cell no_access">');
                createlabel(title, htmls);
                htmls.push('<div class="weui_cell_bd weui_cell_primary">');
                htmls.push('<div class="wdk-ui-score">');

                for (var i = 5; i > 0; i--) {
                    htmls.push(
                        '<input  type="radio"  ', (defaultValue == (i + '')) ? 'checked="checked"' : '', ' value="', i, '" id="', key, '-', i, '" name="', key, '" />',
                        '<label for="', key, '-', i, '"></label>');
                }
                if (!v.required) {
                    htmls.push('<input name="', key, '" type="hidden" disabled ', v.required ? '' : 'required', ' placeholder="', v.placeholder || ("请选择" + v.Title), '"/>')
                }
                htmls.push('</div>', '</div></div>');
                break;
            case "TextValue":
                htmls.push($.format(
                    '<div class="weui_cell"><div class="weui_cell_bd weui_cell_primary"><p>{Text}</p></div><div class="weui_cell_ft">{Value}</div></div>', v.DataSource || [], v.style
                ));
                break;
            case "TextNameValue":
                htmls.push($.format(
                    ['<div class="weui_cell">',
                        '<div class="weui_cell_bd weui_cell_primary" style="flex:2">',
                        '<p>{Title}</p>',
                        '</div><div class="weui_cell_bd weui_cell_primary">',
                        '<p>{Text}</p>',
                        '</div><div class="weui_cell_ft ">{Value}</div></div>'
                    ].join(''), v.DataSource || [], v.style
                ));
                break;
            case 'Image':
                htmls.push('<div class="weui_cell">', '<img class="wdk-ui-image" src="', v.Src, '"/>', '</div>');
                break;
            case 'Command':
            case "UI":
                htmls.push('<a class="weui_cell" data-key="', key, '">');
                if (v.Icon) {
                    htmls.push('<b class="wdk_cell_icon" data-icon="', v.Icon, '" ', v.Color ? ('style="color:' + v.Color + '"') : '', '></b>');
                }

                htmls.push('<div class="weui_cell_primary">', title, '</div><div class="weui_cell_ft">', v.DefaultValue || v.placeholder, '</div></a>');
                break;

            case "Option":
            // case "BarCode":
            case "Area":
                htmls.push('<a class="weui_cell wdk-option" data-key="', key, '">');
                createlabel(title, htmls, key);
                htmls.push('<input type="hidden" ', v.required ? '' : 'required', ' value="', defaultValue || '', '"  name="', key, '"', ' placeholder="', v.placeholder || v.Title, '"  />');
                htmls.push('<div class="weui_cell_ft">', v.Text || defaultValue || v.placeholder, '</div></a>');
                break;
            case "Textarea":
                htmls.push('<div class="weui_cell">', '<div class="weui_cell_bd weui_cell_primary">', '<textarea class="weui_textarea" ', v.required ? '' : 'required', ' placeholder="', v.placeholder || v.Title, '"  name="', key, '" rows="', v.Rows || '3', '">', defaultValue , '</textarea></div></div>');
                break;
            case "File":
                htmls.push('<div class="weui_cell">', '<div class="weui_cell_bd weui_cell_primary">', '<input type="hidden" ', v.required ? '' : 'required', ' value="', defaultValue || '', '"  name="', key, '" />', '<div class="weui_uploader_input_wrp" style="background-size:100%;background-image: url(', v.DefaultValue || '', ');">', '<input class="weui_uploader_input" type="file" name="_f" data-key="', key, '" accept="', v.Accept || 'image/jpg,image/jpeg,image/png,image/gif', '"></div></div>'

                    , '<div class="weui_cell_ft">', v.placeholder || v.Title, '</div></div>');
                break;
            case 'Files':
                var values = [];
                if (defaultValue) values = (defaultValue || '').split(',');
                htmls.push('<div class="weui_cell">',
                    '<div class="weui_cell_bd weui_cell_primary">',
                    '<div class="weui_uploader">',
                    '<div class="weui_uploader_hd weui_cell">',
                    '<div class="weui_cell_bd weui_cell_primary">',
                    v.Title,
                    '</div><div class="weui_cell_ft">', values.length, '/', (v.Max || '5'),
                    '</div></div>',
                    '<div class="weui_uploader_bd">',
                    '<input type="hidden" ', v.required ? '' : 'required', ' value="', values.length || '', '"  name="', key, '" />',
                    '<ul class="weui_uploader_files">');

                for (var i = 0; i < values.length; i++) {
                    htmls.push('<li class="weui_uploader_file" style="background-image: url(', values[i], ')"></li>');

                }
                htmls.push('</ul><div class="weui_uploader_input_wrp">',
                    '<input class="weui_uploader_input" name="_s" type="file" data-key="', key, '" accept="image/jpg,image/jpeg,image/png,image/gif" multiple=""></div></div></div></div></div>');
                break;
            case "Verify":
            case "Address":
                htmls.push('<div class="weui_cell">')
                createlabel(title, htmls);
                htmls.push('<div class="weui_cell_bd weui_cell_primary">',
                    '<input class="weui_input" ', v.required ? '' : 'required', ' placeholder="', v.placeholder || v.Title, '" class="text" name="', key, '" type="text" value="', defaultValue || '', '" />', '</div>',
                    '<a class=" ', v.Type == 'Address' ? 'wdk_cell_address' : 'wdk_cell_verify', '" data-key="', key, '"></a></div>');
                break;
            default:
                var fn = WDK.UI.Cells[v.Type];
                if (fn) {
                    htmls.push(fn(v.value, v.format || {}, v.style || {}));
                } else {
                    htmls.push('<div class="weui_cell">');
                    createlabel(title, htmls);
                    htmls.push('<div class="weui_cell_bd weui_cell_primary">');
                    htmls.push('<input class="weui_input" ', v.step ? ('step="' + v.step + '"') : '', v.required ? '' : 'required', ' placeholder="', v.placeholder || v.Title, '" class="text" name="', key, '" type="', (v.Type || 'text').toLowerCase(), '" value="' + (defaultValue || '') + '" />');
                    htmls.push('</div></div>');
                }
                break;
        }
        return htmls.join('');
    }

    function Dialog(v, dom) {
        dom.ui("UI.Setting", function (e, v) {
            delete v.type;
            dom.find('input').each(function () {
                if (this.name in v) {
                    var vl = v[this.name];
                    this.value = vl.Value || vl;
                }
            });
            dom.find('*[data-key]').each(function () {
                var m = WDK(this);
                var key = m.attr('data-key');
                if (key in v) {
                    var vl = v[this.name];
                    m.find('.weui_cell_ft').text(vl.Text || vl);
                }
            })
        });
        this.param = v;
        this.dom = dom;
        this.item = {};
        var header = this.Header = v.Header || {};
        var fhn = WDK.UI.Headers || {};
        var fnh = fhn[header.type] || function () { return '' };
        var htmls = [fnh(header.type == 'Slider' ? header : header.data || {}, header.format || {}, header.style || {})];
        var isSubmit = false;
        var isInput = false;
        switch (v.Type) {
            case "Form":
                var iswriter = false;
                var items = v.DataSource;
                for (var i = 0, l = items.length; i < l; i++) {
                    var cfg = items[i];
                    var key = cfg.Name || '_';
                    this.item[key] = cfg;
                    switch (cfg.Type) {

                        case 'Confirm':
                            isInput = true;
                            htmls.push('<input type="hidden" value="', cfg.DefaultValue || 'YES', '"  name="', key, '" />');
                        case "Prompt":
                            if (iswriter) {
                                iswriter = false;
                                htmls.push('</div>');
                            }
                            htmls.push('<div class="weui_cells_tips">');
                            htmls.push(cfg.Text);
                            htmls.push('</div>');
                            break;
                        case "Receiver":
                        case "RadioGroup":
                        case "CheckboxGroup":
                            isInput = true;
                        case "TextValue":
                        case "TextNameValue":
                            if (iswriter) {
                                iswriter = false;
                                htmls.push('</div>');
                            }
                            if (cfg.Title) {
                                htmls.push('<div class="weui_cells_title">', cfg.Title, '</div>');
                            }
                            htmls.push('<div class="weui_cells ')
                            switch (cfg.Type) {
                                case "RadioGroup":
                                case 'CheckboxGroup':
                                    htmls.push("weui_cells_checkbox");
                                    break;
                            }
                            htmls.push('">');
                            htmls.push(createField(cfg, cfg.Name));
                            htmls.push('</div></div>');
                            break;
                        default:
                            if (iswriter) {
                                if (cfg.hasOwnProperty('tip')) {
                                    htmls.push('</div>');
                                    if (cfg.tip) htmls.push('<div class="weui_cells_title">', cfg.tip, '</div>');
                                    htmls.push('<div class="weui_cells weui_cells_access">');
                                }
                            } else {
                                iswriter = true;
                                if (cfg.tip) {
                                    htmls.push('<div class="weui_cells_title">', cfg.tip, '</div>');
                                }
                                htmls.push('<div class="weui_cells weui_cells_access">');
                            }
                            isInput = true;
                            htmls.push(createField(cfg, cfg.Name, cfg.Title));

                            break;
                    }
                    if (cfg.Submit) {
                        if (iswriter) {
                            iswriter = false;
                            htmls.push('</div>');
                        }
                        isSubmit = true;
                        createSubmit(v.submit, htmls);
                    }


                }
                if (iswriter) {
                    iswriter = false;
                    htmls.push('</div>');
                }
                break;

            case "BarCode":
                v.Type = 'Number';
            default:
                isInput = true;
                this.item['_'] = v;
                htmls.push('<div class="weui_cells">');
                htmls.push(createField(v, "_"));
                htmls.push('</div>');
                break;
        }
        if (!isSubmit) {
            var smt = v.submit;
            createSubmit(smt === false ? smt : (smt || { text: isInput ? '确认提交' : '关闭' }), htmls);
        }
        var headers = ['<div class="header"><a class="back"></a><h1>', v.Title || "请输入", '</h1> '];
        if (v.menu) {
            if (v.menu.length == 1) {
                headers.push('<a class="right">', v.menu[0].text, '</a>');
            } else {
                headers.push('<a class="right"><span class="icon-menu"></span></a>');
            }
        }
        headers.push('</div><form data-ui="form" class="weui_cell_primary" style="overflow: auto"></form>')
        var me = this;
        var form = dom.html(headers.join(''))
            .find('form').html(htmls.join('')).submit(function () {
                var f = $(this);
                var vs = f.val();
                if (vs !== false) {
                    me.Submit(vs) !== false ? (me.param.CloseEvent ? 0 : dom.addClass('right').removeClass('ui')) : 0;

                }
                return false;
            }).on('file', function (e, f, t) {

                var data = me.item[f.attr('data-key')];
                var model = data.Model;
                var command = data.Command;
                var value = t.media_id || t.src;
                var map = { media_id: value };
                if (data.Type == 'File') {
                    f.parent('.weui_uploader_input_wrp').css('background-image', 'url(' + (t.min || t.src) + ')');
                    f.parent('.weui_cell').find('input[type=hidden]').val(value);
                } else {
                    var fm = f.parent('.weui_uploader').find('.weui_uploader_files');
                    fm.append(['<li class="weui_uploader_file" style="background-image: url(', t.min || t.src, ')"></li>'].join(''));
                    var size = fm.find('li').length;
                    fm.parent('.weui_uploader').find('.weui_cell_ft').text([size, '/', data.Max || 5].join(''));
                    fm.siblings('input').val(size + '');
                    map.seq = size;
                }

                var sendValue = data.SendValue;
                if (model && command) {

                    switch (typeof sendValue) {
                        case 'object':
                            WDK.extend(map, sendValue);
                            break;
                        case 'string':
                            map = sendValue + '&media_id=' + encodeURIComponent(value);
                            break;
                    }
                    UMC.UI.Command(model, command, map);
                }
            });
        if (window.wx) {
            form.find('input[type=file]').click(function () {
                var f = $(this);
                wx.chooseImage({
                    count: 1,
                    success: function (res) {
                        var localId = res.localIds[0];
                        wx.uploadImage({
                            localId: localId,
                            isShowProgressTips: 1,
                            success: function (res) {
                                WDK.UI.Command('Platform', 'Release', res.serverId, function (t) {
                                    form.on('file', f, t);
                                });
                            }
                        });
                    }
                });
                return false;
            })
        } else {
            form.find('input[type=file]').on('change', function () {
                var f = $(this);
                if (this.files.length > 0) {
                    if (this.name == '_f')
                        f.parent('.weui_cell').find('.weui_cell_ft').text(this.files[0].name);
                    f.parent('form').addClass('wdk-loading');
                    WDK.uploader(this.files[0], function (t) {
                        form.removeClass('wdk-loading');
                        form.on('file', f, t)
                    });
                }
            });
        }
        dom.find('.header a').click(function () {
            var menu = me.param.menu;
            var b = $(this)
            if (b.is('.back')) {
                dom.addClass('right').removeClass('ui');
            } else if (menu.length > 1) {
                $.UI.Sheet('菜单', menu, function (v) {
                    dom.addClass('right').removeClass('ui');
                    WDK.UI.Command(v.model, v.cmd, v.send);
                }, 'text');
            } else {
                dom.addClass('right').removeClass('ui');
                var v = menu[0];
                WDK.UI.Command(v.model, v.cmd, v.send);
            }
        });
        dom.on('click', 'a[data-key]', function () {
            var m = $(this);
            var key = m.attr('data-key');
            var data = me.item[key];
            switch (data.Type) {
                case "Verify":
                    if (m.is('.wdk_verify_send')) return;
                    var fName = data["For"];

                    if (fName) {
                        var vlaue = m.parent('form').find('input[name=' + fName + ']').val();
                        if (vlaue) {
                            var toKey = data["To"];
                            if (toKey) {
                                var vs = data.SendValue || {};
                                vs[toKey] = vlaue
                                WDK.UI.Command(data.Model, data.Command, vs)
                            } else {

                                WDK.UI.Command(data.Model, data.Command, vlaue)
                            }
                        } else { return; }
                    } else {
                        WDK.UI.Command(data.Model, data.Command, data.SendValue);

                    }
                    if (!data.bindEvent) {
                        data.bindEvent = true;
                        dom.ui('VerifyCode', function () {
                            m.addClass('wdk_verify_send');
                            var t = 100;
                            var initer = setInterval(function () {
                                t--;
                                m.attr('data-time', '(' + t + ')');
                                if (t == 0) {
                                    clearInterval(initer);
                                    m.removeClass('wdk_verify_send');
                                }
                            }, 1000);
                        });
                    }
                    break;
                case 'Option':
                    if (!m.attr('notify')) {
                        m.attr('notify', 'y');
                        dom.ui(key, function (e, v) {
                            var field = data.ValueField || 'Value';
                            if (v) {
                                m.find('.weui_cell_ft').text(v.Text || v[field]);
                                var pts = m.find('input');
                                pts.eq(0).val(v[field]);
                                if (pts.length == 1) {
                                    var input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = pts.attr('name') + '_Text';
                                    input.value = v.Text || v[field];
                                    m.append(input);
                                } else {
                                    pts.eq(1).val(v.Text || v[field]);
                                }
                            }
                        });
                        data.SendValue = data.SendValue || key;
                    }
                case "UI":
                    var model = data.Model;
                    var cmd = data.Command;
                    if (model && cmd) {
                        WDK.UI.Command(model, cmd, data.SendValue)
                    }
                    break;
                case "BarCode":
                    break;
            }
        }).addClass('ui');
    }
    Dialog.prototype = {
        Msg: function (titls, t) {
            if (t) titls[1] = t;
            $.UI.On("Prompt", { Text: titls.join('') });
        },

        Submit: function (v) {
            if (v) {
                var isv = false;
                for (var k in v) {
                    isv = true;
                    var value = v[k];
                    var item = this.item[k];
                    if (!item)
                        continue;

                    var minSize = parseInt(item.MinSize) || 0;

                    var maxSize = parseInt(item.MaxSize) || 0;
                    if (minSize > 0 && value.length < minSize) {
                        this.Msg([item.Title, '不能小于', minSize, '个字']);
                        return false;
                    }
                    if (maxSize > 0 && value.length > maxSize) {
                        this.Msg([item.Title, '不能大于', maxSize, '个字']);
                        return false;
                    }
                    if (item.ForName) {
                        var compare = item.Compare;
                        var forItem = this.item[item.ForName];

                        var forValue = v[item.ForName];
                        var fValue = parseFloat(value) || 0;
                        var iforValue = parseFloat(forValue) || 0;
                        var titls = [item.Title, '', forItem.Title]
                        switch (compare) {
                            case 'Greater':
                                if (fValue <= iforValue) {
                                    this.Msg(titls, '需要大于');
                                    return false;
                                }
                                break;
                            case 'GreaterEqual':
                                if (fValue < iforValue) {
                                    this.Msg(titls, '需要大于等于');
                                    return false;
                                }
                                break;
                            case 'Less':
                                if (fValue >= iforValue) {
                                    this.Msg(titls, '需要小于');

                                    return false;
                                }
                                break;
                            case 'LessEqual':
                                if (fValue > iforValue) {
                                    this.Msg(titls, '需要小于等于');

                                    return false;
                                }
                                break;
                            case 'Not':
                                if (forValue == value) {
                                    this.Msg(titls, '需要不等于');

                                    return false;
                                }
                                break;
                            default:
                                if (forValue != value) {
                                    this.Msg(titls, '需要等于');

                                    return false;
                                }
                                break;
                        }
                    }
                }
            }
            var submit = this.param.submit;
            switch (typeof submit) {
                case 'object':
                    var vs = v || {};
                    $.extend(vs, submit.send || {})
                    WDK.UI.Command(submit['model'], submit['cmd'], vs);
                    break;
                default:
                    if (v && isv)
                        WDK.UI.Command(v._ ? v._ : v);
                    break;
            }

        }
    }
    $.UI.Form = Dialog;


    if (navigator.userAgent.toLowerCase().indexOf('micromessenger') != -1) {
        var isWXInit = false;
        var h = $('head').append($({
            tag: "script",
            load: function () {
                wx.ready(function () {
                    isWXInit = true;
                    WDK.UI.On('WX.Loaded')
                });
                $({
                    tag: "script",
                    error: function () {
                        $.UI.Command('Platform', 'WeiXin', { Key: $(this).attr('src') }, function (xhr) {
                            wx.config(xhr);
                        });
                    },
                    'src': ['/jweixin/', Math.abs($.hash(location.href.split('#')[0]) + ''), '/', Math.floor(new Date().getTime() / 6000000), '/', WDK.UI.On("UI.Corp") || 'wx', '.js'].join('')
                }).appendTo(h);
            },
            src: '//res.wx.qq.com/open/js/jweixin-1.2.0.js'
        }));

        function addCard(v) {
            wx.addCard({
                cardList: [{
                    cardId: v.cardId,
                    cardExt: JSON.stringify(v.card)
                }],
                success: function (res) {
                    if (WDK.UI.On('WX.addCard') !== false) {
                        wx.closeWindow();
                    }
                }
            });
        }
        WDK.UI.On('OpenWeiXinCard', function (e, v) {
            wx.openCard({
                cardList: v.card
            });


        }).On('AddWeiXinCard', function (e, v) {
            isWXInit ? addCard(v) : wx.ready(function () { addCard(v); })

        }).On('Form.BarCode', function () {
            wx.scanQRCode({
                needResult: 1,
                success: function (res) {
                    WDK.UI.Command(escape(res.resultStr));
                }
            });
            return false;
        });
    }
})(WDK);