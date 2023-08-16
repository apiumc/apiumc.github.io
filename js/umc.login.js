
UMC(function ($) {
    var data = JSON.parse($('#feildItems').text());
    var feilds = $('#feilds');
    var htmls = [];
    for (var k = 0; k < data.length; k++) {
        var v = data[k];
        var select = $(document.createElement('select')).addClass('el-input__inner')
            .attr('required', 'true').attr('name', v.name)
            .attr('forchange', v.change);
        var ops = v.data || [{ Text: ['--请选择', v.title, '--'].join(''), Value: '' }]

        for (var i = 0; i < ops.length; i++) {
            select.append(new Option(ops[i].Text, ops[i].Value));
        }
        $(document.createElement('div')).addClass('el-form-item el-input')
            .append(select).appendTo(feilds);
        $(document.createElement('input')).attr('type', 'hidden')
            .attr('name', v.name + '_Text').val(ops[0].Text).appendTo(feilds);

    }

    var fm = $('form').submit(function () { return $(this).val(); });
    fm.find('input,select').change(function () {
        var me = $(this);
        var name = this.name;
        if (me.is('select')) {
            fm.find('input[name=' + name + '_Text]').val(this.options[this.selectedIndex].text);
        }
        var fmValue = {};
        fm.find('input,select').each(function () {
            if (this.value) {
                fmValue[this.name] = this.value
            }
        });

        fm.find('select')
            .each(function () {
                var cv = $(this).attr('forchange');
                if (cv) {
                    var nv = cv.split(',');
                    var isOk = 0;
                    for (var i = 0; i < nv.length; i++) {
                        if (!fmValue[nv[i]]) return;
                        if (!isOk) {
                            isOk = nv[i] == name;
                        }
                    }
                    if (isOk) {
                        delete fmValue[this.name];

                        while (this.options.length > 1) {
                            this.remove(this.options.length - 1);
                        }
                        var slt = $(this);
                        fetch('/UMC.Login/' + this.name, {
                            credentials: 'include',
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: $.query(fmValue)
                        }).then(function (r) { return r.json() }).then(function (json) {

                            for (var i = 0; i < json.length; i++) {
                                var vk = json[i];
                                slt.append(new Option(vk.Text, vk.Value));
                            }
                            if (json.length) {
                                slt[0].selectedIndex = 1;
                                slt.change();
                            }
                        });

                    }
                }
            })
    }).eq(0).change().length ? $('button').text('确认对接') : fm.submit();

});