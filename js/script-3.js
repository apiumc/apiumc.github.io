
function findValue(html, name) {
    var index = html.indexOf('name="' + name + '"');
    index = html.indexOf('value="', index);
    var end = html.indexOf('"', index + 7);
    return html.substr(index + 7, end - index - 7)
}
function callback(xhr) { 
    var v={};
    v.__VIEWSTATE = findValue(xhr, '__VIEWSTATE');
    v.__VIEWSTATEGENERATOR= findValue(xhr, '__VIEWSTATEGENERATOR');
    v.__EVENTVALIDATION = findValue(xhr, '__EVENTVALIDATION'); 
    return JSON.stringify(v);
}