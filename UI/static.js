(function ($) {
    WDK.page('static', '静态资源', false, function (root) {
        function upload(files, index, dem) {
            var i = index || 0;
            if (i >= files.length) {
                dem.removeClass('loading');
                dem.attr('data-index', false);
                root.ui('System.Dir');
                return;
            } else {
                dem.addClass('loading');
                dem.attr('data-index', (i + '/' + files.length));
            }

            var file = files[i]
            var formdata = new FormData();
            var path = file.webkitRelativePath || file.name;
            if (prefix) {
                path = prefix + path;

            }
            var media_id = Math.random();
            formdata.append('key', 'TEMP/Static/' + media_id);
            formdata.append('file', file);
            formdata.append('success_action_status', '200');

            fetch('https://oss.365lu.cn', {
                method: 'POST',
                body: formdata
            }).then(res => {
                UMC.UI.Command('System', 'Dir', { dir: path, media_id: media_id }, function (xhr) {
                    upload(files, i + 1, dem);
                });
            });

        }
        $('.filter-container', root).change('input', function () {
            upload(this.files, 0, $(this).parent('.el-button'));
            this.value='';
        });

        var prefix = '';
        var list_li = $('table tbody', root).on('click', 'a[path]', function () {
            prefix = $(this).attr('path');
            root.ui('System.Dir');
        });
        var path = $('#root', root).click(function () {
            prefix = $(this).attr('path') || '';
            root.ui('System.Dir');
        });
        root.on('hash', function (e, v) {
            prefix = v.p ? (v.p + "/") : ''
            root.ui('System.Dir');
        });
        root.ui('System.Dir', function () {
            WDK.UI.Command('System', 'Dir', prefix || '/', function (xhr) {
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
                        return 'type=Del&dir=' + (x.file || x.dir)
                    }
                }, true);
                root.find('.el-table').cls('msg', !data.length).attr('msg', "当前目录没有文件")

            })
        })
    });
})(UMC)