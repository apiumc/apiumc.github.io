(function ($) {

    WDK.page('subject/markdown', "图文编辑", false, function (root) {
        $.script('js/editable.min.js')
            .wait();
        let isChange = false;
        var form = root.find('form').submit(function () {
            var form = $(this);
            var pro = form.val();

            if (pro) {
                pro.Markdown = 'none';
                WDK.UI.API('Subject', 'Submit', pro)
            }
            return false;
        }).on("save", function () {
            var pro = form.val();

            if (isChange) {
                isChange = false;
            } else {
                return;
            }
            var editer = WDK.UI.Editable(root.find('#des'));

            var desc = editer.Value();

            if (pro) {

                if (desc.markdown) {
                    pro.Markdown = desc.markdown;
                } else {
                    pro.Content = desc.html || desc.markdown;
                    pro.DataJSON = JSON.stringify(desc.list);
                }
                WDK.UI.API('Subject', 'Submit', pro);
            }
        });
        root.ui('Subject.Submit', function (e, v) {
            root.on('title', "保存于" + v.time);
            delete $.page()['subject/' + v.id];

        }).ui('WebResource', function (e, v) {
            root.find('#des').on('WebResource', v);

        }).find('#des,textarea').on('input', function () {
            isChange = true;
        })
        form.find('input.el-input').on('input', function () {
            var m = $(this).parent().val();
            $.UI.On('Sub.Title.Change', m);
        }).change(function () {
            var pro = $(this).parent().val();
            if (pro) {
                pro.Markdown = 'none';

                WDK.UI.API('Subject', 'Submit', pro)

            }

        })
        var timeid = 0;

        root.find('#des').on("toHtml", function (x, m) {
            form.on('save', m);
        });

        root.on('backstage', function () {
            clearInterval(timeid);
            form.on('save');
        }).on('event', function (e, v, m) {
            switch (v) {
                case 'EditUI':
                case 'UISetting':
                    WDK.UI.Command('Subject', v, form.val().Id)
                    break;
            }
        }).on('active', function () {
            clearInterval(timeid);
            requestAnimationFrame(function () {
                WDK.UI.On('Subject.Editer.Path', root.attr('path'));
            });

            timeid = setInterval(function () {
                form.on('save');
            }, 10000)
        }).on('hash', function (e, v) {
            WDK.UI.Command("Subject", 'Search', v.id || 'News', function (xhr) {
                root.on('active');
                var editer = WDK.UI.Editable($('#des', root));
                form.on('save').reset().val(xhr);
                var ContentType = xhr.ContentType || '';
                if (ContentType == 'markdown' || !(xhr.Content || ContentType)) {
                    editer.Markdown(xhr.Content || '');

                } else {
                    var data = JSON.parse(xhr.DataJSON || '[]') || [];
                    var htmls = [];
                    for (var c = 0, cl = data.length; c < cl; c++) {
                        var row = data[c];
                        var fn = WDK.UI.Cells[row._CellName] || function () {
                            return ''
                        };
                        htmls.push(fn(row.value || {}, row.format || {}, row.style || {}));
                    }

                    editer.Value(htmls.join(''));
                }
                root.attr('path', xhr.Path)
                WDK.UI.On('Subject.Editer.Path', xhr.Path);
            });
        });



    })
})(WDK);
