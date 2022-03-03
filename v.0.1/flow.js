(function ($) {


    $.page('flow', '流程设计', false, function (root) {

        $.script('js/d3.v4.min.js')
            .script('js/dagre-d3.js')
            .link('css/flow.css')
            .wait();
        // title.click(function () {
        //     if (WDK.UI.Task)
        //         WDK.UI.Command('WorkFlow', 'Setting', WDK.UI.Task.TaskId);
        // });

        root.on('event', function (e, v) {
            if (!WDK.UI.Task) {
                WDK.UI.Msg("未加载流程，请打开或新建.")
                return;
            }
            switch (v) {
                case 'Subscribe':
                case 'Button':
                case 'Command':

                    WDK.UI.Command('WorkFlow', v, {
                        Task: WDK.UI.Task.TaskId
                    });
                    break;
                case 'Control':
                    WDK.UI.Command('WorkFlow', 'Control', WDK.UI.FormId);
                    break;
                case 'UI':
                    WDK.UI.Command('WorkFlow', 'Setting', {
                        Task: WDK.UI.Task.TaskId,
                        Type: 'Form'
                    });
                    break;
            }
        })
        var rsvg = root.find('svg');
        root.ui("WorkFlow.Design,WorkFlow.Del", function (e, v) {
            if (!v.Task) return;
            var graph = new dagreD3.graphlib.Graph()
                .setGraph({
                    rankdir: "LR",
                    marginx: 0,
                    marginy: 0
                })
                .setDefaultEdgeLabel(function () {
                    return {};
                });

            var task = WDK.UI.Task = v.Task;
            if (v.Form) {
                WDK.UI.FormId = v.Form;
            }
            root.on("title", {
                text: task.Text, click: { model: 'WorkFlow', cmd: 'Setting', send: WDK.UI.Task.TaskId }
            });
            
            for (var i = 0; i < task.Shapes.length; i++) {
                var shape = task.Shapes[i];
                graph.setNode(shape.Id, {
                    labelType: "html",
                    label: ['<div class="wdk-shape">', shape.Text, '<i>', shape.Id, '</i></div>'].join(''),
                    id: shape.Id,
                    class: 'wf'
                })
            }
            for (var i = 0; i < task.Lines.length; i++) {
                var line = task.Lines[i];
                graph.setEdge(line.FromId, line.ToId, {
                    id: line.Id,
                    class: 'wf'
                });
            }

            $('#services', root).html(WDK.format('<a id="{Id}">{Text}</a>', task.Registes));


            $('svg g', root).remove();

            var svg = d3.select(rsvg[0]),
                inner = svg.append("g");


            new dagreD3.render()(inner, graph);
            var graphHeight = graph.graph().height + 40;

            var xCenterOffset = ($('svg', root).css({
                'height': graphHeight + 'px',
                'width': (graph.graph().width + 40) + 'px'
            }).offset().width - graph.graph().width) / 2;
            inner.attr("transform", "translate(" + xCenterOffset + ", 20)");


        });


        var svg = root.find('svg').click('*.wf', function () {
            svg.find('*.wf').removeClass('sel');
            var me = $(this).addClass('sel');

            $('.wdk-dialog').removeClass("ui");
            WDK.UI.Command('WorkFlow', 'Design', {
                Id: me.attr('id'),
                Task: WDK.UI.Task.TaskId
            });
            $('#services a').removeClass('sel');
        });
        $('#services', root).click('a', function () {

            svg.find('*.wf').removeClass('sel');
            var me = $(this);
            $('.wdk-dialog').removeClass("ui");
            WDK.UI.Command('WorkFlow', 'Design', {
                Id: me.attr('id'),
                Task: WDK.UI.Task.TaskId
            });
            me.addClass('sel').siblings().removeClass('sel')
        });

        function click() {
            var me = $(this);
            if (!WDK.UI.Task) {
                WDK.UI.Msg("未加载流程，请打开或新建.")
                return;
            }
            WDK.UI.Command('WorkFlow', 'Subassembly', {
                Type: me.attr('type'),
                Task: WDK.UI.Task.TaskId
            });
        }

        WDK.UI.Command("WorkFlow", 'Subassembly', function (xhr) {
            var data = [].concat(xhr.lines).concat(xhr.induces).concat(xhr.shapes);
            $('#sub', root).html($.format('<a type="{type}" class="{class} {name}">{text}</a>', data))
                .click('a', click)

            $('#service', root).html($.format('<a type="{type}" class="{class} {name}">{text}</a>', xhr.responders))
                .click('a', click);
        });

    });
})(WDK)