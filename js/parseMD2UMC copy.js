
var webRel = {};
var links={};
var cells = []; 
function Append(item) {
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
function Header(text,  item)
{
    var i = 0;
    while (i < text.length && text.charAt(i) == '#') {
        i++;
        if (i == 6) {
            break;
        }
    } 
    var size = 26 - (i - 1) * 2;
    item.style['font-weight'] = 'bold';
    item.style['font-size'] = size;
    item.data['text'] = text.substring(i);
    item.data['Key'] = i;///text.substring(i);
    item.format.push("{text}");

    newItem(values, item);
} 
        
         function Transform( text)
        {
            var mk = new Markdown();
            mk.Check(text);
            foreach (UIClick click in mk.links)
            {
                click.Send(mk.webRel[(String)click.Send()]);
            }
            foreach (WebMeta meta in mk.webRels)
            {
                meta.Put("src", mk.webRel.Get(meta.Get("src")));
            }
            return mk.cells.ToArray();

        } 
       
      
        function CheckRow( text,  index,  isNextLIne)
        {
            if ( !text)
            {
                return index + 1;
            }
            var  oldIndex = -1;
            while (index + 1 < text.length && text.charAt(index) != '\n')
            {
                if (oldIndex == index)
                {
                    index++;
                    continue;
                }
                else
                {
                    oldIndex = index;

                }

                switch (text.charAt(index))
                {
                    case '\r':
                        index++;
                        continue;
                    case '!':
                        if (text.charAt(index + 1) == '[' && isNextLIne)
                        {
                            var end = text.indexOf("]", index + 1);
                            if (end > index)
                            {

                                var content = text.substring(index + 1, end - index - 1).Trim('[', ']');
                                if (content.indexOf('\n') == -1)
                                {
                                    if (text.charAt(end + 1) == '(')
                                    {
                                        Append();
                                        var end2 = text.indexOf(")", end + 1);
                                        if (end2 > end)
                                        {
                                            var url = text.Substring(end + 1, end2 - end - 1).Trim(' ', '(', ')').Split(' ')[0];
                                           
                                            cell.push({
                                                _CellName: 'CMSImage',
                                                value: {
                                                    src: url
                                                },style:{'padding':10}
                                            });
 
                                            index = end2 + 1;

                                            continue;
                                        }
                                    }
                                    else
                                    {
                                        Append();

                                        if (content in  webRel)
                                        { 
                                            cells.push({
                                                _CellName: 'CMSImage',
                                                value: {
                                                    src: content,// webRel[content]
                                                }, style: { 'padding': 10 }
                                            });
                                        }
                                        else
                                        {
                                            cells.push({
                                                _CellName: 'CMSImage',
                                                value: {
                                                    src: content,
                                                }, style: { 'padding': 10 }
                                            });
                                            // var src = new WebMeta().Put("src", content);
                                           webRels[content]=true;  

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
                            var end = text.IndexOf("]", index + 1);
                            if (end > index)
                            {
                                var content = text.Substring(index, end - index).trim('[', ']');
                                if (content.IndexOf('\n') == -1)
                                {
                                    if (text.Length > end + 1 && text[end + 1] == '(')
                                    {

                                        var end2 = text.IndexOf(")", end + 1);
                                        if (end2 > end)
                                        {
                                            var url = text.Substring(end + 1, end2 - end - 1).Trim(' ', '(', ')').Split(' ')[0];


                                            AppendData();
                                            style.Name("m" + data.Count.ToString(), new UIStyle().Click(new UIClick(url) { Key = "Url" }));
                                            data.Put("m" + data.Count.ToString(), content);

                                            index = end2 + 1;

                                            continue;
                                        }
                                    }
                                    else
                                    {
                                        AppendData();
                                        if (webRel.ContainsKey(content))
                                        {
                                            style.Name("m" + data.Count.ToString(), new UIStyle().Click(new UIClick(webRel[content]) { Key = "Url" }));
                                        }
                                        else
                                        {
                                            var click = new UIClick(content) { Key = "Url" };
                                            this.links.Add(click);
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

                            var end = text.IndexOf("`", index + 1);
                            if (end > index)
                            {
                                var  content = text.Substring(index, end - index);
                                if (content.IndexOf('\n') == -1)
                                {
 
                                    item.style['m'+item.format.length]={'color':"#c60"};
                                    item.data['m' + item.format.length] = content.trim();
                                    item.format.push('{' +   item.format.length+"}"); 


                                    index = end + 1;

                                    continue;
                                }
                            }
                        }
                        break;
                    case '~':
                        if (text[index + 1] == '~')
                        {

                            var end = text.IndexOf("~~", index + 1);
                            if (end > index)
                            {
                                
                                var content = text.Substring(index, end - index);
                                if (content.IndexOf('\n') == -1)
                                {

                                    item.style['m' + item.format.length] = { 'DelLine': "#c60" };
                                    item.data['m' + item.format.length] = content.trim('~');
                                    item.format.push('{' + item.format.length + "}"); 

                                    // AppendData();
                                    // style.Name("m" + data.Count.ToString(), new UIStyle().DelLine());
                                    // data.Put("m" + data.Count.ToString(), content.Trim('~'));

                                    index = end + 2;

                                    continue;

                                }
                            }

                        }
                        else
                        {
                            var end = text.IndexOf("~", index + 1);
                            if (end > index)
                            {
                                var content = text.Substring(index, end - index);
                                if (content.IndexOf('\n') == -1)
                                {
                                    AppendData();
                                    style.Name("m" + data.Count.ToString(), new UIStyle().UnderLine());
                                    data.Put("m" + data.Count.ToString(), content.trim('*'));
                                    index = end + 1;

                                    continue;


                                }
                            }

                        }
                        break;
                    case '*':
                        if (text[index + 1] == '*')
                        {

                            var end = text.IndexOf("**", index + 1);

                            if (end > index)
                            {
                                var content = text.Substring(index, end - index);
                                if (content.IndexOf('\n') == -1)
                                {

                                    AppendData();
                                    style.Name("m" + data.Count.ToString(), new UIStyle().Bold());
                                    data.Put("m" + data.Count.ToString(), content.Trim('*'));

                                    index = end + 2;

                                    continue;

                                }
                            }

                        }
                        else
                        {
                            var end = text.IndexOf("*", index + 1);
                            if (end > index)
                            {
                                var content = text.Substring(index + 1, end - index);
                                if (content.IndexOf('\n') == -1)
                                {

                                    AppendData();
                                    style.Name("m" + data.Count.ToString(), new UIStyle().UnderLine());
                                    data.Put("m" + data.Count.ToString(), content.Trim('*'));
                                    index = end + 1;

                                    continue; ;

                                }
                            }

                        }
                        break;
                }
                dataText.Append(text[index]);
                index++;
            }
            if (index + 1 == text.Length)
            {
                dataText.Append(text[index]);
            }
            if (isNextLIne)
            {
                Append();
                return index + 1;
                //Check(text, index + 1);
            }
            return index;

        }
        function Grid( rows)
        {
            var hStyle =[];// new List<UIStyle>();
            var header = rows[1].trim('|').split('|');
            var grid =[];// new List<List<WebMeta>>();
            var flexs = 0;
            for (var h in header)
            {
                var st ={};// new UIStyle();
                var s = h.trim();
                if (s.StartsWith(":") && s.EndsWith(":"))
                {
                    st.AlignCenter();
                }
                else if (s.EndsWith(":"))
                {
                    st.AlignRight();
                }
                else
                {
                    st.AlignLeft();
                }
                var flex = s.Split('-').Length - 1;
                st.Name("flex", flex);
                flexs += flex;
                hStyle.append(st);
            }
            rows.RemoveAt(1);
            for (var row in rows)
            {
                var cells = row.Trim('|').Split('|');
                var cdata =[];// new List<WebMeta>();
                for (var i = 0; i < hStyle.length; i++)
                {
                    var cstyle = new UIStyle();
                    cstyle.Copy(hStyle[i]);
                    this.style = cstyle;
                    this.data = new WebMeta();
                    this.dataText = new StringBuilder();
                    if (i < cells.Length)
                    {
                        CheckRow(cells[i].Trim(), 0, false);
                    }
                    if (dataText.Length > 0)
                    {
                        this.data.Put("m" + data.Count.ToString(), dataText.ToString().Trim());
                    }
                    var sb = new StringBuilder();
                    for (var c = 0; c < data.Count; c++)
                    {
                        sb.Append("{m");
                        sb.Append(c);
                        sb.Append("}");
                    }
                    cdata.Add(new WebMeta().Put("format", sb.ToString()).Put("data", this.data).Put("style", this.style));

                }
                grid.Add(cdata);
            }

            var cell = UICell.Create("CMSGrid", new WebMeta().Put("grid", grid).Put("flex", flexs));
            cells.Add(cell);
            data = new WebMeta();
            style = new UIStyle();
            dataText = new StringBuilder();

        }

        void Check( text)
        {
            var index = 0;
            while (index < text.Length)
            {
                if (index + 1 >= text.Length)
                {
                    Append();
                    return;
                }
                switch (text[index])
                {
                    case '#':
                        {
                            var end = text.IndexOf('\n', index);
                            if (end > index)
                            {
                                Header(text.Substring(index, end - index));

                                index = end + 1;
                            }
                            else
                            {
                                Header(text.Substring(index));
                                index = text.Length;
                            }
                            continue;
                        }
                    case '`':
                        {
                            if (text.Substring(index, 3) == "```")
                            {

                                var end = text.IndexOf("\n```", index + 1);
                                if (end > index)
                                {
                                    var content = text.Substring(index, end - index);
                                    var hindex = content.IndexOf('\n');
                                    var htype = content.Substring(3, hindex - 3).Trim();
                                    content = content.Substring(hindex + 1);

                                    var cell = UICell.Create("CMSCode", new WebMeta().Put("code", content).Put("type", htype));

                                    cell.Format.Put("text", "{code}");


                                    cells.Add(cell);
                                    index = text.IndexOf('\n', end + 1) + 1;

                                    continue;
                                }
                            }
                        }
                        break;
                    case '>':
                        {
                            if (cells.Count > 0)
                            {
                                var cell = cells[cells.Count - 1];
                                if (cell.Type == "CMSRel")
                                {
                                    var d = cell.Data as WebMeta;

                                    cells.RemoveAt(cells.Count - 1);
                                    this.data = d;
                                    this.dataText.Append("\r\n");
                                    this.style = cell.Style;
                                    this.data.Put("type", "CMSRel");
                                    index = CheckRow(text, index + 1);
                                    continue;

                                }
                            }
                            this.data.Put("type", "CMSRel");
                            index = CheckRow(text, index + 1);
                            continue;
                        }
                    case '|':
                        {

                            int end = text.IndexOf('\n', index);
                            if (end > index)
                            {
                                var grids = new List<String>();
                                String conent = text.Substring(index, end - index).Trim().Replace(" ", "");
                                if (conent[conent.Length - 1] == '|')
                                {
                                    int end2 = text.IndexOf('\n', end + 1);//.Trim();
                                    String conent2 = text.Substring(end + 1, end2 - end - 1).Trim();
                                    grids.Add(conent);
                                    conent2 = conent2.Replace(" ", "");

                                    if (System.Text.RegularExpressions.Regex.IsMatch(conent2, "^[\\|:-]+$"))
                                    {
                                        grids.Add(conent2);
                                        if (conent2.Split('|').Length == conent.Split('|').Length)
                                        {
                                            bool isGO = true;
                                            while (isGO)
                                            {
                                                isGO = false;
                                                int end3 = text.IndexOf('\n', end2 + 1);//.Trim();

                                                String conent3 = end3 > 0 ? text.Substring(end2 + 1, end3 - end2 - 1).Trim() : text.Substring(end2 + 1).Trim();
                                                if (conent3.StartsWith("|") && conent3.EndsWith("|"))
                                                {
                                                    isGO = true;
                                                    grids.Add(conent3);
                                                    end2 = end3;
                                                }
                                            }
                                            this.Grid(grids);
                                            //Check(text, end2 + 1);
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
                            int end = text.IndexOf("]", index + 1);
                            if (end > index && end + 1 < text.Length)
                            {
                                if (text[end + 1] == ':')
                                {
                                    String content = text.Substring(index, end - index).Trim('[', ']');
                                    if (content.IndexOf('\n') == -1)
                                    {
                                        int end2 = text.IndexOf("\n", end + 1);
                                        if (end2 == -1)
                                        {
                                            var url = text.Substring(end + 2).Trim().Trim(' ', '(', ')').Split(' ')[0];
                                            webRel.Put(content, url);
                                        }
                                        else
                                        {

                                            var url = text.Substring(end + 2, end2 - end - 2).Trim().Trim(' ', '(', ')').Split(' ')[0];
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
                        while (text.Length > index && text[index] == ' ')
                        {
                            index++;
                        }
                        break;

                }

                index = this.CheckRow(text, index);
            }
            //return index;
        }
    }