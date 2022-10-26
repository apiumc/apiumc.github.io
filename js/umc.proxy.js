
UMC(function ($) {
    $.UI.Off('Prompt').On("Prompt", function (e, p) {
        var msg = $('.el-message').removeClass('el-message-fade-leave-active');
        msg.find('.el-message__content').html(p.Text);
        setTimeout(function () {
            msg.addClass('el-message-fade-leave-active');
        }, 3000);
    }).On("User", function () {
        var v = UMC.query(location.search.substring(1));
        if (v.oauth_callback) {
            location.href = v.oauth_callback;
        } else {
            location.reload(true);
        }
    });

    var login = $('.login-container');
    var func = login.find('.loginFunc').click(function () {
        var mp = $(this).parent().cls('scanning');
        login.on(mp.is('.scanning') ? "connect" : 'disconnect');
    });
    login.find('form').submit(function () {
        var v = $(this).val();
        $.UI.Command('Account', "Login", v);
        return false;
    });
    $.UI.API("Account", "Scan", function (cfg) {
        if (cfg.bgsrc) {
            login.css({ 'background-image': ['url(', cfg.bgsrc, ')'].join('') });
        }
        if (cfg.scan) {
            var scan = cfg.scan;
            login.find(".qrcode_view #tip").text(scan.title);

            new QRCode(document.getElementById("qrcode"), {
                width: 200,
                height: 200
            }).makeCode(scan.url);
            var client = new Paho.MQTT.Client(scan.broker, 443, scan.client);
            client.onConnectionLost = function () { };

            login.find(".context").click('a', function () {
                UMC.UI.Command("Account", "Check", "Session");
                login.on("connect");
            });


            var timeId = 0;
            client.onMessageArrived = function (message) {
                var uss = [].concat(JSON.parse(message.payloadString))[0];
                if (uss.msg) {
                    if (uss.msg == 'OK') {
                        UMC.UI.Command("Account", "Check", "Session");
                    } else {
                        clearTimeout(timeId);
                        login.find(".qrcode_view .context").html(['<b>', uss.msg, '</b>'].join(''));
                        timeId = setTimeout(function () {
                            login.on('disconnect');
                            UMC.UI.Command("Account", "Check", "Session");
                        }, 60000);
                    }
                }

            };

            login.on('disconnect', function () {
                clearTimeout(timeId);
                login.find(".qrcode_view .context").html("<a>刷新二维码</a>");
                client.disconnect();
            }).on('connect', function () {
                client.connect({
                    useSSL: true,
                    userName: scan.user,
                    password: scan.pass,
                    onSuccess: function () {
                        login.find(".qrcode_view .context").children().remove();
                        timeId = setTimeout(function () {
                            login.on('disconnect');
                            UMC.UI.Command("Account", "Check", "Session");
                        }, 60000);
                    },
                    mqttVersion: 4,
                    onFailure: function (e) {
                        login.find(".qrcode_view .context").html("<a>扫码错误，请刷新</a>");
                    }
                });
            });

            login.on(UMC.query(location.search.substring(1)).un ? 'disconnect' : 'connect');

            if (cfg.form === false) {
                func.hide();
            } else {
                func.show();
            }
        } else {
            func.click();
            func.hide();
        }
    });

    $.UI.API("Account", "Check", "Session", function (xhr) {
        $.UI.Device = xhr.Device;
    });



})