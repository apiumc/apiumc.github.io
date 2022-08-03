($ => {

    function Slider(data) {
        var htmls = [];
        for (var i = 0; i < data.length && i < 5; i++) {
            htmls.push('<input ', i == 0 ? 'checked="checked"' : '', ' class="slider-', i + 1, '" type="radio" name="slider" id="disslider', i + 1, '"/>');
        }
        htmls.push('<div class="sliders"><div id="overflow"><div class="inner">');


        htmls.push($.format('<article><a ui-spa href="{Path}" style="background-image:url({src})"></a><div class="sub"><a ui-spa href="{Path}" class="title">{title}</a><div class="desc"><a model="Subject" cmd="Account" send="{uid}">{poster}</a> 发布于 <a ui-spa  href="{PPath}">{project}</a>  {last}</div></div></article>', data, { Path: d => $.SPA + d.path, PPath: d => $.SPA + d.ppath }));
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
    function subNav(t, root) {

        var keys = [];
        var emKeys = t.b.find('div[data-key]').each(function () {
            var m = $(this);
            keys.push({ index: m.attr('data-key'), text: m.text() });
        });
        if (keys.length == 0) {
            var ps = [];
            t.b.find('div[style].wdk-cms-text').each(function () {
                var fs = parseInt(this.style['font-size'] || 0) || 0;
                if (fs > 18) {
                    if (fs > 26) {
                        fs = 26;
                    }
                    ps.push(this);
                    keys.push({ index: parseInt((26 - fs) / 2) + 1, text: $(this).text() });
                }
            });
            emKeys = new $(ps);
        }
        var navs = root.find('#nav').format(keys, {
            value: x => {
                return (parseInt(x.index) || 0) * 10 + 'px'
            }
        }, true).find('.wdk-subject-nav-item')
            .click(function () {
                var ofset = emKeys.eq(parseInt($(this).attr('data-index'))).offset();
                var top = ofset.top - con.top;
                var stop = t.r[0].scrollTop + top + 20;
                var sctop = t.r[0].scrollTop;
                var num = (stop - sctop) / 30;
                function run() {
                    sctop = sctop + num;
                    if (num > 0) {
                        if (sctop >= stop) {
                            sctop = stop
                        } else {
                            requestAnimationFrame(run);
                        }
                    } else {

                        if (sctop <= stop) {
                            sctop = stop
                        } else {
                            requestAnimationFrame(run);
                        }
                    }

                    t.r[0].scrollTop = sctop;
                }
                run();

            }).each(function (i) {
                $(this).attr('data-index', i + '');
            });
        if (keys.length > 0) {
            var con = t.r.offset();
            t.r.on('scroll', function () {
                var index = -1;
                emKeys.each(function (i) {
                    var me = $(this)
                    var m = me.offset();
                    if (m.top - con.top < 0) {
                        index = i;
                    }
                });
                navs.cls('is-active', 0)
                if (index > -1) {
                    navs.eq(index).cls('is-active', 1);
                }
            });
        }
    }

    $.page('subject/project', 'subject/explore', function (root) {
        var myProject = new WDK.UI.Pager($('.weui_tab_bd_item', root));
        myProject.model = 'Subject'
        myProject.cmd = 'UI';
        $.UI.Send('Subject', 'Spread', 'Project', function (xhr) {
            $('#myProject', root).format(xhr, {
                Path: (x) => {
                    return $.SPA + x.path
                }
            }, true);

        }).Send('Subject', 'Spread', 'NewProject', function (xhr) {
            $('#newProject', root).format(xhr, {
                Path: (x) => {
                    return $.SPA + x.path
                }
            }, true);
        }).Send('Subject', 'Spread', 'Favs', function (xhr) {
            var d = xhr.data || xhr;
            $('#sliders').html(Slider(d.length > 0 ? d : [{
                'src': '/css/slider.png'
            }]));
            xhr.isPublish ? requestAnimationFrame(function () {
                $.UI.On('UI.Publish', "发现", $('#newProject', root).text().replace(/\s+/g, ' '), $('#myProject', root).text().replace(/\s+/g, ' '), {
                    type: 'Explore'
                });
            }) : 0;

        }).Send(myProject.model, myProject.cmd, WDK.extend({
            limit: 30
        }, myProject.search), function (xhr) {
            myProject.b.html('');
            myProject.dataSource(xhr);
        }).Send();


    }, false).page('subject/explore', 'subject/explore', function (root) {
        var myProject = new WDK.UI.Pager($('.weui_tab_bd_item', root));
        myProject.model = 'Subject'
        myProject.cmd = 'UI';
        $.UI.Send('Subject', 'Spread', 'Project', function (xhr) {
            $('#myProject', root).format(xhr, {
                Path: (x) => {
                    return $.SPA + x.path
                }
            }, true);

        }).Send('Subject', 'Spread', 'NewProject', function (xhr) {
            $('#newProject', root).format(xhr, {
                Path: (x) => {
                    return $.SPA + x.path
                }
            }, true);
        }).Send('Subject', 'Spread', 'Favs', function (xhr) {
            var d = xhr.data || xhr;
            $('#sliders',root).html(Slider(d.length > 0 ? d : [{
                'src': '/css/slider.png'
            }]));
            xhr.isPublish ? requestAnimationFrame(function () {
                $.UI.On('UI.Publish', "发现", $('#newProject', root).text().replace(/\s+/g, ' '), $('#myProject', root).text().replace(/\s+/g, ' '), {
                    type: 'Explore'
                });
            }) : 0;

        }).Send(myProject.model, myProject.cmd, WDK.extend({
            limit: 30
        }, myProject.search), function (xhr) {
            myProject.b.html('');
            myProject.dataSource(xhr);
        }).Send();


    }, false).tpl('subject', 'subject/subject', function (root) {
        var view = root.find('#view');
        root.ui('UI.Edit', function (e, v) {
            requestAnimationFrame(function () {
                view.ui('UI.Edit', v);
            });
            return false;
        });
        var t = new WDK.UI.Pager(view);
        view.on('section', function (e, em) {
            if (em.is('#Subject')) {
                $.UI.On('Subject.Comments.View', root);
            }
        });
        t.model = "Subject";
        t.cmd = 'UIData'
        root.on('hash', function (e, v) {
            if (v.key) {
                t.search = { Id: v.key };
                WDK.UI.Command(t.model, t.cmd, WDK.extend({
                    limit: 30
                }, t.search), function (xhr) {
                    root.attr('data-id', (xhr.Title || {}).Id);
                    t.b.html('');
                    t.dataSource(xhr);
                    var tt = xhr.Title;
                    if (tt && tt.Id) {
                        $.UI.On('Subject.Show', { Id: tt.Id });
                        tt.Editer ? root.on('menu', { key: tt.Id, text: '编辑文档' }) : 0

                    }
                    subNav(t, root);
                    if (tt.releaseId)
                        $.UI.On('UI.Publish', tt.title, root.find('#nav').text().replace(/\s+/g, ' '), view.text().replace(/\s+/g, ' '), {
                            type: 'Sub', Id: tt.releaseId
                        });
                });

            }
        }).ui('Markdown', function (e, v) {
            $(window).on('page', 'subject/markdown', 'id=' + v.Id);
        // }).on('event', function (e, key) {
        //     $(window).on('page', 'subject/markdown', 'id=' + key);
        }).on('active', function () {
            if (root.attr('data-id'))
                $.UI.On('Subject.Show', { Id: root.attr('data-id') });
        });

    }, '正文').tpl('subject/toc', 'subject/toc', function (root) {
        var nav = root.find('.umc-toc-nav').click('.umc-toc-nav-title', function () {
            var m = $(this).parent();
            m.cls('is-closed', !m.is('.is-closed'));
        }).click('em', function () {
            var m = $(this);
            $(document.createElement("input")).val(m.siblings('a').text()).appendTo(m.parent())
                .focus()
                .blur(function () {
                    $(this).remove();
                }).change(function () {
                    if (this.value) {
                        var m = $(this).siblings('a');
                        WDK.UI.Command('Subject', 'Code', { Id: m.attr('data-id'), 'Code': this.value });
                    }
                }).on('keydown', function (e) {
                    switch (e.key) {
                        case 'Backspace':
                            break;
                        case 'Enter':
                            this.blur();
                            break;
                        default:
                            if (/[^a-z0-9]/.test(e.key)) {
                                return false
                            }
                            this.value = this.value.replace(/[^a-z0-9]/g, '')
                            break;
                    }
                })
            return false;

        })

        root.on('hash', function (e, v) {
            if (v.key) {
                WDK.UI.Command('Subject', 'Toc', v.key, function (xhr) {
                    $('.umc-toc-caption', root).text(xhr.caption);
                    root.find('.umc-toc-users').format(xhr.users, true);
                    var htmls = [];
                    var keys = [];
                    xhr.data.forEach(it => {
                        keys.push(it.text);
                        htmls.push('<li>', '<div class="umc-toc-nav-title"><i class="umc-toc-nav-arrow"></i>', it.text, '</div>', '<ul class="umc-toc-nav-items">')
                        htmls.push($.format('<li class="umc-toc-nav-item"><span class="umc-toc-nav-left"><a ui-spa href="{Path}">{text}<small>{state}</small></a></span><span class="umc-toc-nav-right"> <a data-id="{id}" >{code}</a><em></em></span></li>', it.subs || [], {
                            Path: function (x) {
                                keys.push(x.text);
                                return $.SPA + x.path;
                            }
                        }), '</ul></li>');

                    });
                    root.find('.umc-toc-nav>ul').html(htmls.join(''));
                    root.find('.umc-toc-users-sum span').text(xhr.users.length);
                    if (xhr.releaseId)
                        $.UI.On('UI.Publish', xhr.caption, keys.join(','), keys.join(','), {
                            type: 'Item', Id: xhr.releaseId
                        });
                });

            }
        }).ui('Subject.Change', function (e, xhr) {
            nav.find('.umc-toc-nav-right a').each(function () {
                var m = $(this);
                if (m.attr('data-id') == xhr.id) {
                    m.text(xhr.code);
                    m.parent('li').find('.umc-toc-nav-left a')
                        .attr('href', ($.SPA || '/') + xhr.path);
                    return false;
                }
            });
        });


    }, '栏位目录').page('subject/markdown').page('subject/recycle', '回收站', function (root) {
        var paging = root.find('.pagination-container').paging("Subject", "Recycle", root.find('table tbody'));

        var table = root.find('table').thead();
        root.ui('Subject.Portfolio.Change', function (e, xhr) {
            var pid = xhr.Sub;
            var t = table.find('tbody tr').each(function () {
                var m = WDK(this);
                if (m.attr('data-id') == pid) {
                    m.remove();
                    return false;
                }
            });
            if (t.length == 1) {
                paging.on('search', { Project: WDK.UI.ProjectId });
            }
        });
        root.on('active', function () {
            var pid = root.attr('project-id');
            if (pid != WDK.UI.ProjectId) {
                root.attr('project-id', WDK.UI.ProjectId);

                paging.on('search', { Project: WDK.UI.ProjectId });
            }

        }).on('active');

    }, false).page('subject/team', '项目成员', function (root) {
        var paging = root.find('.pagination-container').paging("Subject", "Team", root.find('table tbody'))
            .on('param', { Project: WDK.UI.ProjectId })
            .on('sort', root.find('.el-sort'));


        root.ui('Subject.Team', function () {
            paging.on('search');
        }).on('searchValue', function () {
        })
        root.find('table').thead();

        root.on('active', function () {
            var pid = root.attr('project-id');
            if (pid != WDK.UI.ProjectId) {
                root.attr('project-id', WDK.UI.ProjectId);

                paging.on('param', { Project: WDK.UI.ProjectId }).on('search');
            }

        }).on('active');
    }, false).page('subject/login', '登录', function (root) {
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
            var mp = $(this).parent().cls('scanning');
            if (!mp.attr('mqtt')) {
                mp.attr('mqtt', 'YES');
                $.script('js/mqttws31.min.js').script('js/qrcode.min.js').wait(function () {
                    $.UI.API("Account", "Check", 'Mqtt', function (cfg) {

                        if (!cfg.client) {

                            login.find(".qrcode_view .context").html("<a>扫码配置不正确</a>");
                            return;
                        }
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

                                    qrcode.makeCode([UMC.UI.Config().domain || location.origin, , '/Auth?', $.UI.Device].join(''));

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
            // var me = $(this);
            var frm = me.parent('form');

            frm.find('.link-type').each(function () {
                frm.removeClass($(this).attr('ui-event'));
            });

            frm.addClass(v);

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

    }, false).page('subject/index', '我的主页', false, function (root) {
        root.find('ul[type=tabs] li').on('mouseenter', function () {
            var me = $(this);
            var pem= me.parent();
            if (!me.is('li[data-index]')) {
                pem.children('li').each(function (i) {
                    $(this).attr('data-index', i + '')
                });
            }
            root.find(pem.attr('for')).children('div').cls('active', 0)
                .eq(parseInt(me.attr('data-index')) || 0).cls('active', 1);
            me.cls('active', 1).siblings().cls('active', 0);

        });

        if ($('div.navbar').css('transition').indexOf('max-height') > -1) {
            $(window).on('page', 'download', '');
        } else {

            $.UI.API('Subject', 'Publish', { key: 'index.html', 'type': 'Check' }, function (xhr) {
                if (xhr.isPublish) {
                    requestAnimationFrame(function () {
                        $.UI.On('UI.Publish', "为创作而生", root.text().replace(/\s+/g, ' '), root.text().replace(/\s+/g, ' '), {
                            type: 'Index'
                        });
                    })
                }
            })
        }

    }, false).page('subject/dashboard', '我的工作台', false, function (root) {

        $('.weui_navbar', root)
            .on('click', 'div.weui_navbar_item', function () {
                var me = $(this);
                me.addClass('weui_bar_item_on').siblings('div').removeClass('weui_bar_item_on');
                var index = parseInt(me.attr('data-index')) || 0;
                var body = me.parent().siblings('.wdk_tab_bd').children('div').eq(index);
                body.show().siblings('div').hide();
                if (!body.attr('inited')) {
                    body.attr('inited', 'OK');
                    switch (index) {
                        case 0:
                            var pager = new WDK.UI.Pager(body);
                            pager.model = 'Subject'
                            pager.cmd = 'Follow'
                            // pager.search = { NextKey: 'Self', selectIndex: 1 }

                            root.on('hash', function () {
                                pager.query();
                            })

                            break;
                        case 1:
                            var pager = new WDK.UI.Pager(body);
                            pager.model = 'Subject'
                            pager.cmd = 'Self'
                            pager.search = { NextKey: 'Self', Type: 'PC' };

                            pager.query();
                            break;
                        case 2:
                            body.find('.pagination-container').paging("Subject", "Dynamic", body.find('.el-table>div').click('div[data-time]', function () {
                                var m = $(this);//.attr
                                $.UI.Command('Subject', 'Dynamic', { Id: m.attr('data-id'), Time: m.attr('data-time') });
                            })).on('search');
                            break;
                    }
                }

            }).find('div.weui_navbar_item').eq(0).click();

        var pager2 = new WDK.UI.Pager(root.find("#myProject"));
        pager2.model = 'Subject'
        pager2.cmd = 'Account'
        pager2.search = { NextKey: 'Self', selectIndex: 1 };

        $.UI.Command('Subject', 'Project', 'self', function (xhr) {
            root.find('*[data-field]').each(function () {
                var m = $(this);
                if (m.is('img')) {
                    m.attr('src', xhr[m.attr('data-field')]);
                } else {

                    m.text(xhr[m.attr('data-field')]);
                }
            });
        })

        root.on('search', function () {
            return false;
        }).on('hash', function () {
            pager2.query();
        }).ui('Subject.Member', function (e, v) {
            root.on('hash');
        }, true).ui('Subject.Project', function (e, v) {
            root.on('hash');
            $.UI.On('Subject.Path', { Path: v.code || v.Code });
        });
        root.ui('Subject.Portfolio.New,Subject.Del', function () {
            root.ui('image');
            root.find('.weui_tab_bd_item').on('refresh');
            root.find('.pagination-container').on('search');
        }, true).ui('UI.Setting')

    }, false).page('subject/dynamic', '项目专栏', function (root) {
        root.attr('project-id', WDK.UI.ProjectId);

        var paging = root.find('.pagination-container').paging("Subject", "Dynamic", root.find('.el-table>div')
            .click('div[data-time]', function () {
                var m = $(this);//.attr
                $.UI.Command('Subject', 'Dynamic', { Id: m.attr('data-id'), Time: m.attr('data-time') });
            })
        );
        var editer = root.find('.umc-project-head').click('*[data-key]', function () {
            if (editer.is('.editer')) {
                WDK.UI.Command("Subject", 'ProjectUI', { Id: WDK.UI.ProjectId, Model: $(this).attr('data-key') });
            }
        })
        var projectInfo = false;
        root.on('dynamic', function () {
            root.ui('image')
            paging.on('search', { Id: WDK.UI.ProjectId });
        }).on('search', function (e, v) {
            return false;

        }).ui('Subject.Project,System.Picture', function () {
            $.UI.Command('Subject', 'Project', WDK.UI.ProjectId, function (xhr) {
                root.find('*[data-field]').each(function () {
                    var m = $(this);
                    if (m.is('img')) {
                        m.attr('src', xhr[m.attr('data-field')]);
                    } else {

                        m.text(xhr[m.attr('data-field')]);
                    }
                });
                editer.cls('editer', xhr.IsAuth);
                if (projectInfo === true && xhr.releaseId) {
                    $.UI.On('UI.Publish', xhr.Name, xhr.Desc, xhr.Desc, {
                        type: 'Project', Id: xhr.releaseId
                    });
                }

                projectInfo = xhr;
            });

        }).on('tab.page', function () {
            if (projectInfo && projectInfo.releaseId) {
                $.UI.On('UI.Publish', projectInfo.Name, projectInfo.Desc, projectInfo.Desc, {
                    type: 'Project', Id: projectInfo.releaseId
                });
            } else {
                projectInfo = true;
            }
        }).on('dynamic');
        root.ui('Subject.Member', function () {
            root.on('dynamic');
        });


        root.find('#join').click(function () {
            var me = $(this);
            $.UI.Command('Subject', 'Team', { Project: $.UI.ProjectId, Id: 'Self' }, (xhr) => me.text(xhr.text));
        });
        let pager = null;
        $('.weui_navbar', root)
            .on('click', 'div.weui_navbar_item', function () {
                var me = $(this);
                me.addClass('weui_bar_item_on').siblings('div').removeClass('weui_bar_item_on');

                var index = parseInt(me.attr('data-index')) || 0;

                var body = me.parent().siblings('.wdk_tab_bd').children('div').eq(index);
                body.show().siblings('div').hide();
                if (!body.attr('inited')) {
                    body.attr('inited', 'OK');
                    switch (index) {
                        case 0:
                            body.on('defer', function () {
                                root.on('tab.page');
                            });
                            pager = new WDK.UI.Pager(body);
                            pager.model = 'Subject'
                            pager.cmd = 'UI'
                            pager.search = { Project: WDK.UI.ProjectId }
                            pager.query();
                            break;
                    }
                }

            }).find('div.weui_navbar_item').eq(0).click();

        root.on('active', function () {
            var pid = root.attr('project-id');
            if (pid != WDK.UI.ProjectId) {
                projectInfo = false;
                root.attr('project-id', WDK.UI.ProjectId);
                if (pager) {
                    pager.search = { Project: WDK.UI.ProjectId }
                    pager.query();
                }
                root.on('dynamic');
            }

        });

    }, false);
})(WDK)