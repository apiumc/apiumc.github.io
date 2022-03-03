function callback(u, o, n, html) {
    html = html.substr(html.indexOf('name="_SecuritySeed"'), 100);
    var vi = 'value="';
    html = html.substring(html.indexOf(vi) + vi.length);

    var _SecuritySeed = html.substr(0, html.indexOf('"'));
    var us = CryptoJS.enc.Utf8.parse(n);
    var nowpassword_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);

    us = CryptoJS.enc.Utf8.parse(u);
    var individualName_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);

    us = CryptoJS.enc.Utf8.parse(o);
    var formerpassword_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);

    return JSON.stringify({
        Method: "POST",
        ContentType: 'application/x-www-form-urlencoded',
        Content: ['nowpassword=', encodeURIComponent(nowpassword_encrypted), '&individualName=', encodeURIComponent(individualName_encrypted), '&formerpassword=', encodeURIComponent(formerpassword_encrypted)].join('')
    });
}

function callback(u, o, n, html) {
    var _SecuritySeed = findValue(html, "_SecuritySeed")
    var us = CryptoJS.enc.Utf8.parse(n);
    var nowpassword_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);

    us = CryptoJS.enc.Utf8.parse(u);
    var individualName_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);

    us = CryptoJS.enc.Utf8.parse(o);
    var formerpassword_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);
    return JSON.stringify({
        nowpassword: nowpassword_encrypted,
        individualName: individualName_encrypted,
        formerpassword: formerpassword_encrypted
    });
}
fetch('/?$=$')
    .then(response => response.json())
    .then(response => {
        sessionStorage.setItem('authToken', response.authToken)
        sessionStorage.setItem('userCode', response.usercode)
        sessionStorage.setItem('tokenSession', response.xAuthToken)
        sessionStorage.setItem('fromType', 'loginInit')
        History.pushState({ state: 1 }, null, "#main");
    });
function findValue(h, n) { var i = h.indexOf('name="' + n + '"'); i = h.indexOf('value="', i); var e = h.indexOf('"', i + 7); return h.substr(i + 7, e - i - 7) }
function callback(u, o, n, html) {
    var _SecuritySeed = findValue(html, "_SecuritySeed")
    var us = CryptoJS.enc.Utf8.parse(n);
    var nowpassword_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);

    us = CryptoJS.enc.Utf8.parse(u);
    var individualName_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);

    us = CryptoJS.enc.Utf8.parse(o);
    var formerpassword_encrypted = CryptoJS.DES.encrypt(us, _SecuritySeed);
    return JSON.stringify({
        nowpassword: nowpassword_encrypted+'',
        individualName: individualName_encrypted+'',
        formerpassword: formerpassword_encrypted+''
    });
}