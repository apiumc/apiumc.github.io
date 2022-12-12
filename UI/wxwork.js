

UMC.page('wxwork', '企微登录', false, function (root) {
    var value = UMC.query(location.search.substring(1));
    UMC.UI.Command('Account', 'Login', {
        'type': 'wxwork',
        'code': value.code,
        appid: value.appid,
        transfer: value.state

    });
    UMC.script('https://res.wx.qq.com/open/js/jweixin-1.2.0.js').wait(function () {
        root.ui("User", function () {
            wx.closeWindow();
        });
    });
    root.find('.weui_btn').addClass('weui_btn_disabled').text('正在登录');
})