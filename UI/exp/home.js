
(function ($) {

    function Slider(data) {
        var htmls = [];
        for (var i = 0; i < data.length && i < 5; i++) {
            htmls.push('<input ', i == 0 ? 'checked="checked"' : '', ' class="slider-', i + 1, '" type="radio" name="slider" id="disslider', i + 1, '"/>');
        }
        htmls.push('<div class="sliders"><div id="overflow"><div class="inner">');
        for (var i = 0; i < data.length && i < 5; i++) {
            var srcs = (data[i].src || '').split('?');
            htmls.push('<article><a style="background-image: url(', srcs[0], '!cms1?', srcs[1], ');" target="_blank" ', data[i].design ? '  ui-design="Y" ' : '', '><img  src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /></a></article>');
        }
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
    };

    $.page('exp/home', "主页", false, function (root) {

        WDK.UI.Command('Exp', 'Home', function (xhr) {
            root.find('#sliders').html(Slider(xhr.Slider || [{
                'src': 'https://tableaudev.kukahome.com/img/home_welcome_screen_main.png?2019_2_20_zbvdujcmr2l"'
            }])).find('a').each(function (i) {
                $(this).attr('data-index', i + '');
            }).click(function () {
                var me = $(this);
                var c = xhr.Slider[parseInt($(this).attr('data-index'))];
                if (c && c.click && c.click.key == 'Url') {
                    me.attr('href', c.click.send);
                    return true
                } else {
                    WDK.Click(c.click);
                }
                return false;
            });


            root.find('.sso-explore').format(xhr.Access, true);
            if (xhr.length == 0) {
                root.find('.sso-explore').html('<div class="umc-recent-empty"></div>')
            }

        });

    });
})(WDK);