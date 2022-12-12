(function ($) {

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
        var navs = root.find('#nav').html($.format('<div class="wdk-subject-nav-item" style="padding-left:{value};"><a>{text}</a></div>', keys, {
            value: function (x) {
                return (parseInt(x.index) || 0) * 10 + 'px'
            }
        })).find('.wdk-subject-nav-item')
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

    $.tpl('subject', 'subject/subject', function (root) {
        var view = root.find('#view');
        root.ui('UI.Edit', function (e, v) {
            requestAnimationFrame(function () {
                view.ui('UI.Edit', v);
            });
            return false;
        });

        root.on('active', function () {
            if ($.UI.IsFollow) {
                $('.umc-subject-view .umc-sub-follower').remove();
            }
        });
        var t = new $.UI.Pager(view);
        view.on('section', function (e, em) {
            if (em.is('#Subject')) {
                $.UI.On('Subject.Comments.View', root);
            }
        });
        t.model = "Subject";
        t.cmd = 'UIData'
        t.search = { Id: root.attr('ui-key') };
        root.ui('User', function () {
            $.UI.API(t.model, t.cmd, WDK.extend({
                limit: 30
            }, t.search), function (xhr) {
                t.b.html('');
                t.dataSource(xhr);
                var tt = xhr.Title;
                if (tt && tt.Id) {
                    $.UI.On('Subject.Show', { Id: tt.Id });
                }

                $.UI.On('Subject.Path', { Path: tt.Path });
                root.on('menu', tt.Editer ? { key: tt.Id, icon: '\uf044' } : []);
                subNav(t, root);
                if (tt.Follow) {
                    view.find('#Subject').append($(document.createElement('div')).addClass('umc-sub-follower').html("有公众号赞助此内容<br>需要<a data-key=\"" + tt.Follow + "\">关注</a> 后,才可解锁内容<a class=\"ad\" target=\"_blank\" href=\"/wiki/media/income\">了解此推广方式</a>").click('a[data-key]', function () {
                        $.UI.On('Login', { code: $(this).attr('data-key') });
                    }));
                }
                if (tt.releaseId)
                    $.UI.On('UI.Publish', tt.title, tt.Keywords || root.find('#nav').text().replace(/\s+/g, ' '), tt.Description || view.text().replace(/\s+/g, ' '), {
                        type: 'Sub', Id: tt.releaseId
                    });

            });
        }, true).ui('User');

        root.ui('Markdown', function (e, v) {
            $(window).on('page', 'subject/markdown', 'id=' + v.Id);
        }).on('event', function (e, key) {
            $(window).on('page', 'subject/markdown', 'id=' + key);
        }).on('active', function () {
            $.UI.On('Subject.Show', { Id: root.attr('ui-key') });
        });

    }, '正文').tpl('subject/item', 'subject/item', function (root) {
        var nav = root.find('.umc-subitem-nav').click('.umc-subitem-nav-title', function () {
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

        $.UI.Command('Subject', 'Item', root.attr('ui-key'), function (xhr) {
            $('.umc-subitem-caption', root).text(xhr.caption);
            root.find('.umc-subitem-users').html($.format('<li><a model="Subject" cmd="Account" send="{id}"><img src="{src}" /></a></li>', xhr.users));
            var htmls = [];
            var keys = [];
            for (var i = 0; i < xhr.data.length; i++) {
                var it = xhr.data[i];
                keys.push(it.text);
                htmls.push('<li>', '<div class="umc-subitem-nav-title"><i class="umc-subitem-nav-arrow"></i>', it.text, '</div>', '<ul class="umc-subitem-nav-items">')
                htmls.push($.format('<li class="umc-subitem-nav-item"><span class="umc-subitem-nav-left"><a ui-spa href="{Path}">{text}<small>{state}</small></a></span><span class="umc-subitem-nav-right"> <a data-id="{id}" >{code}</a><em></em></span></li>', it.subs || [], {
                    Path: function (x) {
                        keys.push(x.text);
                        return $.SPA + x.path;
                    }
                }), '</ul></li>');

            }
            root.find('.umc-subitem-nav>ul').html(htmls.join(''));
            root.find('.umc-subitem-users-sum span').text(xhr.users.length);
            $.UI.On('Subject.Path', { Path: xhr.path });
            if (xhr.releaseId)
                $.UI.On('UI.Publish', xhr.caption, keys.join(','), keys.join(','), {
                    type: 'Item', Id: xhr.releaseId
                });
        });
        root.ui('Subject.Change', function (e, xhr) {
            nav.find('.umc-subitem-nav-right a').each(function () {
                var m = $(this);
                if (m.attr('data-id') == xhr.id) {
                    m.text(xhr.code);
                    m.parent('li').find('.umc-subitem-nav-left a')
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
                paging.on('search', { Project: $.UI.ProjectId });
            }
        });
        root.on('active', function () {
            paging.on('search', { Project: $.UI.ProjectId });

        }).on('searchValue', function () {
        }).on('active');

    }, false).page('subject/dashboard', '我的工作台', false, function (root) {
        var tabs = {}
        $('.weui_navbar', root)
            .on('click', 'div.weui_navbar_item', function () {
                var me = $(this);
                me.addClass('weui_bar_item_on').siblings('div').removeClass('weui_bar_item_on');
                var index = parseInt(me.attr('data-index')) || 0;
                var body = me.parent().siblings('.wdk_tab_bd').children('div').eq(index);
                body.show().siblings('div').hide();
                if (!tabs[index]) {
                    tabs[index] = true;
                    switch (index) {
                        case 0: {
                            var pager = new WDK.UI.Pager(body);
                            pager.model = 'Subject'
                            pager.cmd = 'Follow'

                            pager.query();
                            root.ui('User', function () {
                                pager.query();
                            }, true);
                        }
                            break;
                        case 1: {
                            var pager = new WDK.UI.Pager(body);
                            pager.model = 'Subject'
                            pager.cmd = 'Self'
                            pager.search = { NextKey: 'Self', Type: 'PC' };

                            pager.query();
                            root.ui('User,Subject.Portfolio.New', function () {
                                pager.query();
                            }, true)
                        }
                            break;
                        case 2: {

                            var pager = new WDK.UI.Pager(body);
                            pager.model = 'Subject'
                            pager.cmd = 'Dynamic'

                            pager.query();

                            root.ui('User', function () {
                                pager.query();
                            }, true);
                        }
                            break;
                    }
                }

            }).find('div.weui_navbar_item').eq(0).click();

        var pager2 = new WDK.UI.Pager(root.find("#myProject"));
        pager2.model = 'Subject'
        pager2.cmd = 'Account'
        pager2.search = { NextKey: 'Self', selectIndex: 1 };
        root.on("self.init", function () {
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
        }).on('self.init');

        root.on('search', function () {
            return false;
        }).on('hash', function () {
            pager2.query();

        }).ui('User', function () {
            root.on('hash');
            root.on('self.init');


        }, true).ui('Subject.Member', function (e, v) {
            root.on('hash');
        }, true).ui('Subject.Project', function (e, v) {
            root.on('hash');
            $.UI.On('Subject.Path', { Path: v.code || v.Code });
        });
        root.ui('Subject.Portfolio.New,Subject.Del', function () {
            root.ui('image');
            root.find('.weui_tab_bd_item').on('refresh');
            root.find('.pagination-container').on('search');
        }, true);//.ui('UI.Setting')

    }, false).tpl('subject/project', 'subject/project', function (root) {
        var editer = root.find('.umc-project-head').click('*[data-key]', function () {
            if (editer.is('.editer')) {
                $.UI.Command("Subject", 'ProjectUI', { Id: root.attr('ui-key'), Model: $(this).attr('data-key') });
            }
        })
        var teamP = new $.UI.Pager(root.find(".umc-project-team"));
        teamP.model = 'Subject'
        teamP.cmd = 'Team'
        teamP.search = { Project: root.attr('ui-key'), Type: 'M' };
        teamP.query();
        root.find('#join').click(function () {
            $.UI.Command('Subject', 'Follow', root.attr('ui-key'));
        });

        var tabs = {};
        root.on('search', function (e, v) {
            var active = root.find('.weui_bar_item_on');
            var index = parseInt(active.attr('data-index')) || 0;
            switch (index) {
                case 0:
                    return false;
                default:
                    tabs[index].query(v);
                    break;
            }

        }).on('event', function (e, key) {
            switch (key) {
                case 'upgrade':
                    $.UI.Command('Platform', 'Project', root.attr('ui-key'));
                    break;
            }
        }).ui('User', function () {
            root.ui('Subject.Project');
        }, true).ui('Subject.Project,System.Picture,Subject.Member', function () {
            $.UI.API('Subject', 'Project', root.attr('ui-key'), function (xhr) {
                root.find('*[data-field]').each(function () {
                    var m = $(this);
                    m.is('img') ? m.css({ 'background-image': ['url(', xhr[m.attr('data-field')], ')'].join('') }) : m.text(xhr[m.attr('data-field')]);

                });
                editer.cls('editer', xhr.IsAuth);
                editer.cls('adver', xhr.IsAdver);
                
                $.UI.On('Subject.Path', { Path: xhr.Code });
                if (xhr.releaseId) {
                    $.UI.On('UI.Publish', xhr.Name, xhr.Keywords || xhr.Name, xhr.Desc, {
                        type: 'Project', Id: xhr.releaseId
                    });

                }

            });

        }).on('searchValue', function () {

            var active = root.find('.weui_bar_item_on');
            var index = parseInt(active.attr('data-index')) || 0;
            switch (index) {
                case 1:
                case 2: break;
                case 0:
                    return false;
            }
        }).ui('Subject.Team', function () {
            teamP.query();
        })


        $('.weui_navbar', root)
            .on('click', 'div.weui_navbar_item', function () {
                var me = $(this);
                me.addClass('weui_bar_item_on').siblings('div').removeClass('weui_bar_item_on');
                var index = parseInt(me.attr('data-index')) || 0;
                var body = me.parent().siblings('.wdk_tab_bd').children('div').eq(index);
                body.show().siblings('div').hide();
                if (!tabs[index]) {
                    var pager = new WDK.UI.Pager(body);
                    tabs[index] = pager;
                    switch (index) {
                        case 0: {
                            pager.model = 'Subject'
                            pager.cmd = 'UI'
                            pager.search = { Project: root.attr('ui-key') }
                            pager.query();
                            body.on('section', function () {
                                root.ui('Subject.Project');
                            }, 1);
                        }
                            break;
                        case 1: {
                            pager.model = 'Subject'
                            pager.cmd = 'Team'
                            pager.search = { Project: root.attr('ui-key') }
                            pager.query();
                            root.ui('Subject.Team,Subject.Member', function () {
                                pager.query();
                            })
                        }
                            break;
                        case 2: {
                            pager.model = 'Subject'
                            pager.cmd = 'Dynamic'
                            pager.search = { Id: root.attr('ui-key') }
                            pager.query();
                        }
                            break;
                    }
                }

            }).find('div.weui_navbar_item').eq(0).click();;

    }, '项目专栏');
})(WDK)