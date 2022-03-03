($ => {
    $.UI.On('UMC.Debug', function (e, root, meun) {
        var uls = UMC.UI.Config().posurl.split('/');
        var hurls = [];
        if (uls[0]) {
            hurls.push(uls[0], '//', uls[2], '/', uls[3])
        } else {
            hurls.push('/', uls[1])
        }


        $.api('Message', 'mqtt', cfg => root.ui('MQTT', cfg));
        let client;

        root.on('push', function (e, xhr) {
            var setup = root.find('.ui-setup');

            if (setup.is('.ui-debug') == false) {
                setup.addClass('ui-debug');
                meun.find('a').removeClass('ui-debug-mapping')
                    .addClass('ui-debug-log')
            }

            var log = $(document.createElement("div"));
            var logp = root.find('#log');
            log.appendTo(logp);
            log.addClass("log");
            var req = $(document.createElement("div"));
            req.addClass("req");
            req.text([xhr.Alias, ':', xhr.Desc, '->', xhr.Value.substring(xhr.Value.indexOf('/') + 1)].join(""));
            log.append(req);
            var src = hurls.join('') + '/' + xhr.Value ;
            logp.prop('scrollTop', 10000);
            fetch(src + '&_v=Debug').then(res => res.text())
                .then(text => {
                    var msg = [{
                        type: 'Bridge',
                        timespan: new Date().getTime(),
                        Content: text,
                        Bridge: xhr.Bridge
                    }];
                    var message = new Paho.MQTT.Message(JSON.stringify(msg));
                    message.destinationName = 'UMC/p2p/' + xhr.Device;
                    client.send(message);
                    var res = WDK(document.createElement("div"));
                    res.addClass("res");
                    res.html('桥接成功!');
                    log.append(res);
                    logp.prop('scrollTop', 10000);
                }).catch(r => {
                    var msg = [{
                        type: 'Tip',
                        text: "调试端有错误"
                    }];
                    var message = new Paho.MQTT.Message(JSON.stringify(msg));
                    message.destinationName = 'UMC/p2p/' + xhr.Device;
                    client.send(message);
                    var res = WDK(document.createElement("div"));
                    res.addClass("res error");
                    res.html(['但本地有<a target="_blank" href="', src, '">错误</a>'].join(''));
                    log.append(res);

                })
        }).ui('MQTT', function (e, cfg) {
            client = new Paho.MQTT.Client(cfg.broker, 80, cfg.client);
            client.onConnectionLost = function () { };
            client.onMessageArrived = function (message) {
                var uss = JSON.parse(message.payloadString);
                if (uss instanceof Array) {
                    uss.forEach(v => {
                        switch (v.type) {
                            case 'Bridge':
                                root.on('push', v)
                                break;
                        }
                    });
                }
            };

            client.connect({
                useSSL: false,
                userName: cfg.user,
                password: cfg.pass,
                onSuccess: function () {
                    console.log('mqtt Success');
                },
                timeout: 3,
                mqttVersion: 4,
                onFailure: function (e) {
                    console.log(e);
                }
            });


        }).on('debug', function (e, cfg) {
            var dom = WDK(document.createElement('div')).attr({ 'ui': 'Debug', 'class': 'wdk-dialog' }) //.css({ 'background-color': '#FAFCFF'})
                .on('transitionend,webkitTransitionEnd', function () {
                    dom.is('.ui') ? 0 : dom.on('pop');
                }).appendTo(document.body)
                .on('pop', function () {
                    dom.on('close').remove();
                });
            var qrcode = new UMC.UI.Form({
                "Title": "开发调试", "DataSource": [{
                    "Title": "调试模块", "Name": "Models", DefaultValue: cfg.Models, "Type": "Text", "placeholder": "多model用,分割"
                }, {
                    "Title": "初始模块", "Name": "Model", DefaultValue: cfg.Model || '', "placeholder": "扫码后调用的模块", "Type": "Text"
                }, {
                    "Title": "初始指令", "Name": "Command", DefaultValue: cfg.Command || '', "placeholder": "扫码后调用的指令", "Type": "Text"
                }],
                "Type": "Form"
            }, dom);
            qrcode.Submit = function (v) {
                $.api('Platform', 'Dev', v);
            };
            UMC.UI.On("UI.Show", dom, 'Debug');
            dom.addClass('ui');

        });
    });
})(WDK)