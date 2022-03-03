(function ($) {
    WDK.page('site', '站点资源', function (root) {
        var rootPath = WDK.UI.Config().posurl.split('/')[3];

        function upload(files, index, dem) {
            var i = index || 0;
            if (i >= files.length) {
                dem.removeClass('loading');
                dem.attr('data-index', false);
                root.on('UI.Reload');
                return;
            } else {
                dem.addClass('loading');
                dem.attr('data-index', (i + '/' + files.length));
            }

            var file = files[i]
            // var xhr = new XMLHttpRequest();
            var formdata = new FormData();
            var path = file.webkitRelativePath || file.name;
            if (prefix) {
                path = prefix + path;

            }
            formdata.append('key', 'TEMP/' + rootPath + '/' + path);
            formdata.append('file', file);
            formdata.append('success_action_status', '200');


            fetch('https://oss.365lu.cn', {
                method: 'POST',
                body: formdata
            }).then(res => {
                upload(files, i + 1, dem);
                WDK.UI.Command('Platform', 'WebResource', path);
            });

        }
        $('.filter-container', root).change('input', function () {
            upload(this.files, 0, $(this).parent('.el-button'));
            this.value='';
        });

        var prefix = '';
        var list_li = $('table tbody', root).on('click', 'a[path]', function () {
            prefix = $(this).attr('path');
            root.on('UI.Reload');
        });
        var path = $('#root', root).click(function () {
            prefix = $(this).attr('path') || '';
            root.on('UI.Reload');
        });
        root.on('hash', function (e, v) {
            prefix = v.p ? (v.p + "/") : ''
            root.on('UI.Reload');
        });
        root.on('UI.Reload', function () {
            WDK.UI.Command('Platform', 'WebSite', prefix || '', function (xhr) {
                if (xhr.name) {
                    path.html('<b class="wdk_cell_icon" data-icon="&#xF07c;"></b>' + xhr.name).attr('path', xhr.pre)
                        .attr('disabled', false);
                } else {
                    path.html('根目录').attr('disabled', 'disabled');
                }
                var data = xhr.dir.concat(xhr.files)
                list_li.format(data, {
                    icon: function (x) {
                        return x.dir ? ' <b class="wdk_cell_icon" data-icon="&#xF07c;"></b>' : ''
                    },
                    href: function (x) {
                        return x.dir ? [' path="', x.dir, '" '].join('') : [' target="_blank" class="link-type" href="', x.href, '" '].join('');
                    },
                    send: function (x) {
                        return 'type=Del&prefix=' + (x.file || x.dir)
                    }
                }, true);
            })
        })
    });
})(WDK)