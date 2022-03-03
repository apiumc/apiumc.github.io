function Trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
function Header(text, cells) {
    var i = 0;
    while (i < text.length && text.charAt(i) == '#') {
        i++;
        if (i == 6) {
            break;
        }
    }
    var size = 26 - (i - 1) * 2;

    var cell = { _CellName: 'CMSText', style: { 'font-size': size, 'font-weight': 'bold' }, value: { text: Trim(text.substring(i)) }, format: { text: '{text}' } };
    cells.push(cell);
}
function Append(item, cells) {
    if (item.format.length > 0) {
        cells.push({
            _CellName: 'CMSText',
            format: {
                text: item.format.join('')
            },
            style: item.style,
            value: item.data
        });
        item.format = [];
        item.data = {};
        item.style = {};
    }
}
function CheckRow(item, text, index, isNextLIne) {
    if (!text) {
        return index + 1;
    }
    var oldIndex = -1;
    while (index + 1 < text.length && text.charAt(index) != '\n') {
        if (oldIndex == index) {
            index++;
            continue;
        }
        else {
            oldIndex = index;

        }

        switch (text.charAt(index)) {
            case '\r':
                index++;
                continue;
            case '!':
                if (text.charAt(index + 1) == '[' && isNextLIne) {
                    var end = text.indexOf("]", index + 1);
                    if (end > index) {

                        var content = text.substring(index + 1, end - index - 1).Trim('[', ']');
                        if (content.indexOf('\n') == -1) {
                            if (text.charAt(end + 1) == '(') {
                                Append(item);
                                var end2 = text.indexOf(")", end + 1);
                                if (end2 > end) {
                                    var url = text.substring(end + 1, end2 - end - 1).Trim(' ', '(', ')').split(' ')[0];

                                    cells.push({
                                        _CellName: 'CMSImage',
                                        style: { 'padding': '0 10' },
                                        value: { src: url }
                                    });
                                    index = end2 + 1;

                                    continue;
                                }
                            }
                            else {
                                Append(item);
                                var src = webRel[conent];
                                if (src) {
                                    cells.push({
                                        _CellName: 'CMSImage',
                                        style: { 'padding': '0 10' },
                                        value: src
                                    });
                                }
                                else {
                                    src = { src: content };
                                    this.webRels[conent] = src;
                                    cells.push({
                                        _CellName: 'CMSImage',
                                        style: { 'padding': '0 10' },
                                        value: src
                                    });
                                }
                                index = end + 1;

                                continue;
                            }

                        }

                    }
                }
                break;
            case '[':
                {
                    var end = text.indexOf("]", index + 1);
                    if (end > index) {
                        var content = text.substring(index, end - index).Trim('[', ']');
                        if (content.indexOf('\n') == -1) {
                            if (text.length > end + 1 && text[end + 1] == '(') {

                                var end2 = text.indexOf(")", end + 1);
                                if (end2 > end) {
                                    var url = text.substring(end + 1, end2 - end - 1).trim(' ', '(', ')').split(' ')[0];


                                    AppendData();
                                    style.Name("m" + data.Count.ToString(), new UIStyle().Click(new UIClick(url) { Key = "Url" }));
                                    data.Put("m" + data.Count.ToString(), content);

                                    index = end2 + 1;

                                    continue;
                                }
                            }
                            else {
                                AppendData();
                                if (webRel.ContainsKey(content)) {
                                    style.Name("m" + data.Count.ToString(), new UIStyle().Click(new UIClick(webRel[content]) { Key = "Url" }));
                                }
                                else {
                                    // var click = new UIClick(content) { Key = "Url" };
                                    // this.links.Add(click);
                                    //click.Value
                                    style.Name("m" + data.Count.ToString(), new UIStyle().Click(click));

                                }
                                data.Put("m" + data.Count.ToString(), content);


                                index = end + 1;

                                continue;
                            }

                        }
                    }
                }
                break;
            case '`':
                {

                    var end = text.indexOf("`", index + 1);
                    if (end > index) {
                        var content = text.substring(index, end - index);
                        if (content.indexOf('\n') == -1) {

                            AppendData();
                            style.Name("m" + data.Count.ToString(), new UIStyle().Color(0xCC6600));
                            data.Put("m" + data.Count.ToString(), content.Trim('`'));


                            index = end + 1;

                            continue;
                        }
                    }
                }
                break;
            case '~':
                if (text[index + 1] == '~') {

                    var end = text.indexOf("~~", index + 1);
                    if (end > index) {

                        var content = text.substring(index, end - index);
                        if (content.indexOf('\n') == -1) {

                            AppendData();
                            style.Name("m" + data.Count.ToString(), new UIStyle().DelLine());
                            data.Put("m" + data.Count.ToString(), content.Trim('~'));

                            index = end + 2;

                            continue;

                        }
                    }

                }
                else {
                    var end = text.indexOf("~", index + 1);
                    if (end > index) {
                        var content = text.substring(index, end - index);
                        if (content.indexOf('\n') == -1) {
                            AppendData();
                            style.Name("m" + data.Count.ToString(), new UIStyle().UnderLine());
                            data.Put("m" + data.Count.ToString(), content.Trim('*'));
                            index = end + 1;

                            continue;


                        }
                    }

                }
                break;
            case '*':
                if (text[index + 1] == '*') {

                    var end = text.indexOf("**", index + 1);

                    if (end > index) {
                        var content = text.substring(index, end - index);
                        if (content.indexOf('\n') == -1) {

                            AppendData();
                            style.Name("m" + data.Count.ToString(), new UIStyle().Bold());
                            data.Put("m" + data.Count.ToString(), content.Trim('*'));

                            index = end + 2;

                            continue;

                        }
                    }

                }
                else {
                    var end = text.indexOf("*", index + 1);
                    if (end > index) {
                        var content = text.substring(index + 1, end - index);
                        if (content.indexOf('\n') == -1) {

                            AppendData();
                            style.Name("m" + data.Count.ToString(), new UIStyle().UnderLine());
                            data.Put("m" + data.Count.ToString(), content.Trim('*'));
                            index = end + 1;

                            continue;;

                        }
                    }

                }
                break;
        }
        dataText.Append(text[index]);
        index++;
    }
    if (index + 1 == text.length) {
        dataText.Append(text[index]);
    }
    if (isNextLIne) {
        Append();
        return index + 1;
        //Check(text, index + 1);
    }
    return index;

}
function Grid(cells, rows) {
    var hStyle = [];
    var header = rows[1].trim('|').split('|');
    var grid = [];
    var flexs = 0;
    for (var i = 0; i < header.length; i++) {
        var h = header[i];
        var st = new UIStyle();
        var s = h.Trim();
        if (s.charAt(0) == ":" && s.charAt(s.length - 1) == (":")) {
            st['text-align'] = 'center'
        }
        else if (s.charAt(s.length - 1) == (":")) {
            st['text-align'] = 'right'
        }
        var flex = s.split('-').length - 1;
        st["flex"] = flex;
        flexs += flex;
        hStyle.push(st);
    }
    rows.splice(0, 1);
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.trim('|').split('|');
        var cdata = [];
        for (var i = 0; i < hStyle.length; i++) {
            var item = {};
            item.format = [];
            item.data = {};
            item.style = {};
            $.extend(item.style, hStyle[i])

            if (i < cells.length) {
                CheckRow(item, cells[i].Trim(), 0, false);
            }
            // if (dataText.length > 0) {
            //     this.data.Put("m" + data.Count.ToString(), dataText.ToString().Trim());
            // }
            // var sb = new StringBuilder();
            // for (var c = 0; c < data.length; c++) {
            //     sb.Append("{m");
            //     sb.Append(c);
            //     sb.Append("}");
            // }
            cdata.push({ format: item.format.join(''), "data": item.data, "style": item.style });

        }
        grid.push(cdata);
    }
    cells.push({
        _CellName: 'CMSGrid',
        style: { 'padding': '0 10' },
        value: { grid: grid, flex: flexs }
    });


}

void Check(text)
{
    var index = 0;
    while (index < text.length) {
        if (index + 1 >= text.length) {
            Append();
            return;
        }
        switch (text.charAt(index)) {
            case '#':
                {
                    var end = text.indexOf('\n', index);
                    if (end > index) {
                        Header(text.substring(index, end - index));

                        index = end + 1;
                    }
                    else {
                        Header(text.substring(index));
                        index = text.length;
                    }
                    continue;
                }
            case '`':
                {
                    if (text.substring(index, 3) == "```") {

                        var end = text.indexOf("\n```", index + 1);
                        if (end > index) {
                            var content = text.substring(index, end - index);
                            var hindex = content.indexOf('\n');
                            var htype = content.substring(3, hindex - 3).Trim();
                            content = content.substring(hindex + 1);


                            cells.push({
                                _CellName: 'CMSCode',
                                style: { 'padding': '0 10' },
                                format: { 'text': "{code}" },
                                value: { code: content, type: htype }
                            });


                            index = text.indexOf('\n', end + 1) + 1;

                            continue;
                        }
                    }
                }
                break;
            case '>':
                {
                    if (cells.length > 0) {
                        var cell = cells[cells.length - 1];
                        if (cell.Type == "CMSRel") {
                            var d = cell.Data;
                            cells.splice(cells.length - 1, 1);
                            this.data = d;
                            item.format.push("\r\n");
                            item.style = cell.Style;
                            item.data["type"] = "CMSRel";
                            index = CheckRow(item, text, index + 1);
                            continue;

                        }
                    }
                    item.data["type"] = "CMSRel";
                    index = CheckRow(item, text, index + 1);
                    continue;
                }
            case '|':
                {

                    var end = text.indexOf('\n', index);
                    if (end > index) {
                        var grids = [];
                        var conent = text.substring(index, end - index).Trim().Replace(" ", "");
                        if (conent.charAt(conent.length - 1) == '|') {
                            var end2 = text.indexOf('\n', end + 1);//.Trim();
                            var conent2 = text.substring(end + 1, end2 - end - 1).Trim();
                            grids.push(conent);
                            conent2 = conent2.replace(/\s+/g, "");

                            if (conent2.match("^[\\|:-]+$")) {
                                grids.Add(conent2);
                                if (conent2.split('|').length == conent.split('|').length) {
                                    var isGO = true;
                                    while (isGO) {
                                        isGO = false;
                                        var end3 = text.indexOf('\n', end2 + 1);//.Trim();

                                        var conent3 = end3 > 0 ? text.substring(end2 + 1, end3 - end2 - 1).Trim() : text.substring(end2 + 1).Trim();
                                        if (conent3.StartsWith("|") && conent3.EndsWith("|")) {
                                            isGO = true;
                                            grids.push(conent3);
                                            end2 = end3;
                                        }
                                    }
                                    this.Grid(grids);
                                    index = end2 + 1;
                                    continue;

                                }
                            }

                        }
                    }
                }
                break;
            case '[':
                {
                    var end = text.indexOf("]", index + 1);
                    if (end > index && end + 1 < text.length) {
                        if (text[end + 1] == ':') {
                            var content = text.substring(index, end - index).Trim('[', ']');
                            if (content.indexOf('\n') == -1) {
                                var end2 = text.indexOf("\n", end + 1);
                                if (end2 == -1) {
                                    var url = text.substring(end + 2).Trim().Trim(' ', '(', ')').Split(' ')[0];
                                    webRel.Put(content, url);
                                }
                                else {

                                    var url = text.substring(end + 2, end2 - end - 2).Trim().Trim(' ', '(', ')').Split(' ')[0];
                                    webRel.Put(content, url);
                                    //Check(text, end2 + 1);

                                    index = end2 + 1;
                                }
                                continue;

                            }


                        }
                    }
                }
                break;
            case ' ':
                while (text.length > index && text[index] == ' ') {
                    index++;
                }
                break;

        }

        index = this.CheckRow(text, index);
    }
    //return index;
} 