WDK.page('subject/access', '快速访问', false, function (root) {
    var access = root.find('#access').text();
    WDK.UI.Command("Account", "Access", function (xhr) {
        var data = xhr.data || [];
        if (data.length > 0) {
            var htmls = [];
            while (data.length > 0) {
                var s = data.splice(0, 5);
                while (s.length < 5) {
                    s.push({ cls: 'hidden' });
                }
                htmls.push('<div class="el-row">', WDK.format(access, s), '</div>');
            }
            root.find('#factAccess').html(htmls.join(''));
        }
    })
}, false);