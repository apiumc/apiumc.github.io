

UMC.page('dingtalk', '钉钉登录', false, function (root) {
    root.ui("User", function () {
        dd.biz.navigation.close({
            onSuccess: function (result) {
            },
            onFail: function (err) { }
        });
    });
    UMC.script('https://g.alicdn.com/dingding/dingtalk-jsapi/2.7.13/dingtalk.open.js').wait(function () {
        var errs = [];
        var query = UMC.query(location.search.substring(1));
        var corps = (query.appid || '').split(',');
        function permission(i) {
            var index = i || 0;
            if (index < corps.length) {
                var corpId = corps[index];
                dd.runtime.permission.requestAuthCode({
                    corpId: corpId,
                    onFail: function (err) {
                        errs.push(JSON.stringify(err));
                        permission(index + 1);
                    },
                    onSuccess: function (info) {
                        UMC.UI.Command('Account', 'Login', {
                            'type': 'dingtalk',
                            'code': info.code,
                            appid: corpId,
                            transfer: query.state

                        });

                    }
                });
            } else {
                root.find('.weui_msg_desc').text("您不在钉钉组织架构中，如有疑问请联系项目管理员" + errs.join(','))
            }
        }
        root.find('.weui_btn').click(function () {
            UMC(this).addClass('weui_btn_disabled').text('正在登录');
            permission(0);
        });
    });
})
//dingc4bb06703bb57b23ffe93478753d9884
//dingymfelgsaafp3g56z
//Xy68s9Ozv8ESokVW-vA_iiXaRFaMw_dYvjB5ar51MX_lcrx-Z8bSY4_Bmwo-Prn9