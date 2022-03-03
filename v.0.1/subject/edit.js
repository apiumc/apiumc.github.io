(function ($) {

    WDK.page('subject/edit', "内容编辑", false, function (root) {
        $.script('js/editable.min.js')
            .wait();
        root.find('form').submit(function () {
            var form = $(this);

            var editer = WDK.UI.Editable(root.find('#des'));
            var pro = form.val();

            var desc = editer.Value();

            if (pro) {

                if (desc.markdown) {
                    pro.Markdown = desc.markdown;
                } else {
                    pro.Content = desc.html || desc.markdown;
                    pro.DataJSON = JSON.stringify(desc.list);
                }
                pro._model = 'Subject';
                pro._cmd = 'Submit';
                var blob = new Blob([JSON.stringify(pro)]);
                blob.name = 'cmd.json';
                WDK.uploader(blob, function (xhr) {
                    WDK.UI.Command('Upload', 'Command', xhr)
                }, false, true);
            }
            return false;
        });


        root.on('hash', function (e, v) {
            WDK.UI.Command("Subject", 'Search', v.id || 'News', function (xhr) {

                var editer = WDK.UI.Editable($('#des', root));
                root.find('form').reset().val(xhr);
                var ContentType = xhr.ContentType || '';
                if (ContentType == 'markdown' || !(xhr.Content)) {
                    editer.Markdown(xhr.Content);

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
            });
        });



    })
})(WDK);
