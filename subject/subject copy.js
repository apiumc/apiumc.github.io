($ => {
    function subNav(t, root) {

        var keys = [];
        var emKeys = t.b.find('div[data-key]').each(function () {
            var m = $(this);
            keys.push({ index: m.attr('data-key'), text: m.text() });
        });
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

    $.tpl('subject/help', 'subject/subject', function (root) {
        var view = root.find('#view');
        var t = new WDK.UI.Pager(view);
        t.model = "Subject";
        t.cmd = 'UIMin'
        root.on('hash', function (e, v) {
            if (v.key) {
                t.search = { Id: v.key };
                WDK.api(t.model, t.cmd, WDK.extend({
                    limit: 30
                }, t.search), function (xhr) {
                    t.b.html('');
                    t.dataSource(xhr);
                    subNav(t, root);
                });

            }
        });

    }, '帮助文档').tpl('subject', 'subject/subject', function (root) {
        var view = root.find('#view');
        root.ui('UI.Edit', function (e, v) {
            requestAnimationFrame(function () {
                view.ui('UI.Edit', v);
            });
            return false;
        }).on('event', function (e, v, em) {
            switch (v) {
                case 'Editer':
                    $.UI.Command("Subject", 'Content', em.attr('data-id'));
                    break;
            }
        });
        var t = new WDK.UI.Pager(view);
        view.on('section', function (e, em) {
            if (em.is('#Comments')) {
                $.UI.On('Subject.Comments.View', em);
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

                    t.b.html('');
                    t.dataSource(xhr);
                    var theader = t.b.find('#Subject>div').eq(0);
                    var tt = xhr.Title;
                    if (tt && tt.Id) {
                        root.attr('data-id', tt.Id);
                        $.UI.On('Subject.Show', { Id: tt.Id });
                        theader
                            .append('<a ui-event="Editer" title="编辑此文档" class="ui-markdown-editer"></a>')
                            .find('.ui-markdown-editer').attr('data-id', tt.Id);

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
        }).on('active', function () {
            if (root.attr('data-id'))
                $.UI.On('Subject.Show', { Id: root.attr('data-id') });
        });

    }, '正文').tpl('subject/toc', 'subject/toc', function (root, title) {
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
                                return $.SPA + x.path;//.substring(x.path.indexOf('/') + 1)
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
                        .attr('href', xhr.path);
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
        }).on('event', function (e, key, em) {
            switch (key) {
                case 'view':
                    break;
            }
        })
        root.find('table').thead();

        root.on('active', function () {
            var pid = root.attr('project-id');
            if (pid != WDK.UI.ProjectId) {
                root.attr('project-id', WDK.UI.ProjectId);

                paging.on('param', { Project: WDK.UI.ProjectId }).on('search');
            }

        }).on('active');
    }, false).page('subject/index', '项目动态', function (root) {
        $.link('css/umc.sub.index.css');
        root.find('.umc-sub-middle-container ul').click('li', function () {
            var me = $(this);
            me.parent('.el-row').find('.umc-sub-middle-tabs>div').cls('active', 0)
                .eq(parseInt(me.attr('data-index')) || 0).cls('active', 1);
            me.cls('active', 1).siblings().cls('active', 0);

        }).find('li').each(function (i) {
            $(this).attr('data-index', i + '')
        })

    }, false).page('subject/self', '我的项目', false, function (root) {

        // let selfPager = null;
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
                            pager.query();

                            break;
                        case 1:
                           var selfPager = new WDK.UI.Pager(body);
                            selfPager.model = 'Subject'
                            selfPager.cmd = 'Self'
                            selfPager.query();

                            break;
                        case 2:
                            root.find('.pagination-container').paging("Subject", "Dynamic", root.find('.el-table>div').click('div[data-time]', function () {
                                var m = $(this);//.attr
                                $.UI.Command('Subject', 'Dynamic', { Id: m.attr('data-id'), Time: m.attr('data-time') });
                            })).on('search');
                            break;
                    }
                }

            }).find('div.weui_navbar_item').eq(0).click();

        var myProject = new WDK.UI.Pager($('#myProject', root));

        myProject.model = 'Subject'
        myProject.cmd = 'Account'

        root.on('hash', function () {
            myProject.search = { NextKey: 'Self', selectIndex: 1 }
            myProject.query();
        }).on('search', function () {
            return false;
        }).ui('UI.Setting,image', function () {
            $.UI.Command('Subject', 'Member', function (xhr) {
                root.find('*[data-field]').each(function () {
                    var m = $(this);
                    if (m.is('img')) {
                        m.attr('src', xhr[m.attr('data-field')]);
                    } else {

                        m.text(xhr[m.attr('data-field')]);
                    }
                });
            })
        }).ui('Subject.Project', function () {
            root.on('hash');
        }).ui('Markdown', function (e, v) {
            history.pushState(null, null, $.SPA + 'Editer/' + v.Id);
             $(window).on('page', 'subject/markdown', 'id=' + v.Id);
            root.ui('image');
        });
        root.ui('Subject.Portfolio.New,Subject.Portfolio.Change', function () {
            root.ui('image');
            root.find('.weui_tab_bd_item').on('refresh');
        },true).ui('UI.Setting')

    }, false).page('subject/dynamic', '项目动态', function (root) {
        root.attr('project-id', WDK.UI.ProjectId);
        var memberPage = new WDK.UI.Pager($('#myProject', root));
        memberPage.model = 'Subject'
        memberPage.cmd = 'ProjectUI'
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
        root.on('dynamic', function () {
            root.ui('image')
            paging.on('search', { Project: WDK.UI.ProjectId });
            memberPage.search = { Id: WDK.UI.ProjectId, NextKey: 'Self' }
            memberPage.query();
        }).on('search', function (e, v) {
            return false;

        }).ui('Subject.Project,image', function () {
            $.UI.Command('Subject', 'Project', WDK.UI.ProjectId, function (xhr) {
                root.find('*[data-field]').each(function () {
                    var m = $(this);
                    if (m.is('img')) {
                        m.attr('src', xhr[m.attr('data-field')]);
                    } else {

                        m.text(xhr[m.attr('data-field')]);
                    }
                });
                editer.cls('editer', xhr.IsAuth)

            })

        }).on('dynamic');
        root.ui('Subject.Member', function () {
            root.on('dynamic');
        });


        root.find('#join').click(function () {
            $.UI.Command('Subject', 'Member', { Project: WDK.UI.ProjectId, Id: 'Self' });
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