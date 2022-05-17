(function () {
    var readyRE = /complete|loaded|interactive/;
    var addEvent = function (e, t, h) {
        e.addEventListener ? e.addEventListener(t, h, false) :
            e.attachEvent ? e.attachEvent("on" + t, h) :
                e["on" + t] = h;
    }

    function UMC(sltr, dom) {
        var al = arguments.length;
        if (al == 1)
            switch (typeof sltr) {
                case 'string':
                    return new UMC(document.querySelectorAll(sltr));
                case 'function':
                    readyRE.test(document.readyState) ? sltr(UMC) :
                        addEvent(document, 'DOMContentLoaded', function () { sltr(UMC) })
                    break;
                case 'undefined':
                case 'boolen':
                    return new UMC([]);
                default:
                    if (sltr instanceof UMC)
                        return sltr;
                    else if (sltr == window || sltr == document || sltr.nodeType === 1)
                        return new UMC([sltr]);
                    else if (typeof sltr.length == 'number') {
                        var l = sltr.length;
                        for (var i = 0; i < l; i++)
                            this[i] = sltr[i];
                        this.length = l;
                    } else if (typeof sltr.tag == 'string') {
                        var em = new UMC([document.createElement(sltr.tag)]);
                        delete sltr.tag;
                        for (var k in sltr) {
                            var v = sltr[k];
                            if (ISFN(v)) {
                                em.on(k, v)
                            } else {
                                switch (k) {
                                    case 'cls':
                                        em.addClass(v)
                                        break;
                                    case 'text':
                                        em.text(v)
                                        break;
                                    case 'html':
                                        em.html(v);
                                        break;
                                    default:
                                        em.attr(k, v);
                                        break;
                                }
                            }
                        }
                        return em;

                    } else
                        return new UMC([sltr]);
                    break;
            } else if (al == 2) {
                return UMC(dom).find(sltr);
            }
    }

    function each(es, fn, scope) {
        for (var i = 0, l = es.length; i < l; i++) {
            var e = es[i];
            if (fn.call(scope || e, i, e, es) === false)
                return false;
        }
        return (l === undefined) ? fn.call(scope || es) : l;
    }
    UMC.each = each;

    function hand(e, em, f, params, fns) {
        if (f.time > 0) {
            if (f.time == 1) {
                requestAnimationFrame(function () {
                    fns.remove(f);
                });
            }
            f.time = f.time - 1;
        }
        if ((e.eventValue = f.fn.apply(em, params)) === false) {

            e.preventDefault();
            e.cancelBubble = true;
            e.returnValue = false;
            e.stopPropagation();
        }
    }
    Array.prototype.remove = function (c) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == c) this.splice(i, 1)
        }
    }

    function handler(e, elen, t) {
        var c = elen._event || {};
        var fns = c[t || e.type] || [];
        var params = e.params || [];
        params.splice(0, 0, e);
        var fs = [];
        each(fns, function (i, f) {
            f.del ? fs.push(f) : hand(e, elen, f, params, fns);
        });
        if (fs.length > 0) {
            var em = e.target || elen;
            while (em !== elen && em) {
                each(fs, function (i, f) {
                    matches(em, f.del) ? hand(e, em, f, params, fns) : 0
                });
                if (e.returnValue === false) return;
                em = em.parentNode;
            }
        }
    }

    function add(em, event, fn, selector, time) {
        var _e = em._event || {};
        var fns = _e[event] || [];
        fns.push({
            fn: fn,
            del: selector,
            time: time || 0
        });
        if (_e.hasOwnProperty(event) == false) {
            _e[event] = fns;
            em._event = _e;
            if (event == 'tap') {
                var t = 0;
                addEvent(em, 'touchstart', function () { t = new Date().getTime() })
                addEvent(em, 'touchend', function (e) {
                    if ((new Date().getTime() - t) < 250)
                        handler(e, this, "tap");
                })
                addEvent(em, 'mousedown', function (e) {
                    if (t == 0) handler(e, this, "tap");
                })
            }
            addEvent(em, event, function (e) { handler(e, this) })

        }
    }

    function matches(e, selector) {
        var m = e.webkitMatchesSelector || e.mozMatchesSelector ||
            e.oMatchesSelector || e.matchesSelector || e.msMatchesSelector;
        return m ? m.call(e, selector) : false;
    }

    function ISFN(a) {
        return typeof a == 'function'
    }
    UMC.isfn = ISFN;

    function offset(o) {
        if (o == window) {
            return {
                left: o.pageXOffset,
                top: o.pageYOffset,
                width: o.outerWidth,
                height: o.outerHeight
            }
        }
        var obj = o.getBoundingClientRect()
        return {
            left: obj.left + window.pageXOffset,
            top: obj.top + window.pageYOffset,
            width: obj.width,
            height: obj.height
        }
    }

    function On(em, type, params) {

        var e = document.createEvent('Events');
        e.initEvent(type, true, true);
        e.params = params;
        em.dispatchEvent(e)
        return e.eventValue;
    }
    UMC.prototype = {
        is: function (s) {
            if (this.length > 0)
                return matches(this[0], s);
            return false;
        },
        ui: function () {
            var es = arguments[0].split(',');
            if (arguments[arguments.length - 1] === true) {
                delete arguments[arguments.length - 1];
                var ls = this.prop('_ls') || {};
                for (var k = 0; k < es.length; k++) {
                    ls[es[k]] = true;
                }
                this.prop('_ls', ls);
            }
            arguments[0] = 'UI.' + es.join(',UI.');
            return this.on.apply(this, arguments);
        },
        iso: function (k) {
            if (this.length > 0)
                return (this[0]._event || {}).hasOwnProperty(k);
            return false;

        },
        on: function (evt, selector, fn, time) {
            if (ISFN(selector) || ISFN(fn)) {
                if (ISFN(selector)) {
                    time = fn || 0;
                    fn = selector;
                    selector = "";
                }
                each(this, function () {
                    each(evt.split(','), function (i, v) {
                        add(this, v, fn, selector, time);
                    }, this);
                });
                return this;
            } else {
                var args = [];
                var ag = arguments;
                for (var i = 1; i < ag.length; i++) {
                    args.push(ag[i])
                }
                var re = true;
                each(this, function () {
                    each(evt.split(','), function (i, v) {
                        re = On(this, v, [].concat(args));
                    }, this);
                })

                return re === undefined ? this : re;
            }

        },
        prop: function (n, v) {
            if (arguments.length > 1)
                return this.each(function () {
                    this[n] = v;
                });
            else
                return this.length ? this[0][n] : null;

        },
        attr: function (n, v) {
            if (arguments.length > 1)
                return this.each(function () {
                    v ? this.setAttribute(n, v) : this.removeAttribute(n)
                });
            else if (n instanceof Object)
                return this.each(function () {
                    for (var k in n)
                        n[k] ? this.setAttribute(k, n[k]) : this.removeAttribute(k)
                });
            else
                return this.length ? this[0].getAttribute(n) : null;

        },
        siblings: function (selector) {
            var data = [];
            this.each(function () {
                var me = this
                each(this.parentNode.children, function () {
                    if (me !== this)
                        if (!selector || matches(this, selector)) data.push(this)

                });
            });
            return new UMC(data);
        },
        children: function (selector) {
            var data = [];
            this.each(function () {
                each(this.children, function () {
                    if (selector) { if (matches(this, selector)) data.push(this) } else data.push(this);
                });
            });
            return new UMC(data);
        },
        off: function (event, callback) {
            each(this, function () {
                var c = this._event || {};
                if (c[event]) {
                    callback ? each(c[event] || [], function (i, v, es) { if (this.fn == callback) { es.splice(i, 1); return true } }) : c[event] = [];
                }
            })
            return this;
        },
        css: function (n, v) {
            var css = ''
            if (arguments.length == 1) {
                if (n instanceof Object) {
                    for (key in n) {
                        if (n[key])
                            css += key + ':' + n[key] + ';'
                        else
                            this.each(function () { this.style.removeProperty(key) })
                    }
                } else
                    return this.length ? (this[0].style[n] || getComputedStyle(this[0], false)[n]) : undefined;

            } else if (v) {
                css = n + ':' + v;
            } else if (n) {
                return this.each(function () { this.style.removeProperty(n) })
            }
            return this.each(function () { this.style.cssText += ';' + css })
        },
        val: function (a) {
            var selector = 'input,select,textarea';
            if (a !== undefined) {
                return this.each(function () {
                    if (a instanceof Object) {
                        each(this.querySelectorAll(selector), function () {
                            if (this.name in a) {
                                var v = a[this.name] + '';
                                switch (this.type.toLowerCase()) {
                                    case 'checkbox':
                                    case 'radio':
                                        this.checked = this.value == v;
                                        break;
                                    case 'file':
                                        return;
                                    default:
                                        this.value = v
                                        break;
                                }
                            }
                        });
                    } else {
                        this.value = a;
                    }
                });
            }
            if (this.is(selector))
                return this[0].value;
            if (this.length > 0) {
                var vs = {};
                var very = {}
                this.find(selector).each(function () {
                    var ty = this.type;
                    if (ty == 'submit')
                        return;
                    var isCheck = false
                    if (this.required || this.getAttribute('required')) {
                        very[this.name] = isCheck = true;

                    }
                    var v = vs[this.name];
                    if (!v) vs[this.name] = v = [];
                    switch (ty) {
                        case 'checkbox':
                        case 'radio':
                            if (this.checked) v.push(this.value);
                            break;
                        case 'file':
                            if (this.files.length > 0)
                                vs[this.name] = this.files[0];
                            else if (isCheck) {
                                UMC.UI.On('UI.Verify', this);
                                vs = false;
                                return false;
                            }
                            break;
                        default:
                            if (this.disabled && isCheck) {
                                if (!v.length) {
                                    UMC.UI.On('UI.Verify', this);
                                    vs = false;
                                    return false;

                                }
                            } else if (isCheck && !this.value) {

                                UMC.UI.On('UI.Verify', this);
                                vs = false;
                                return false;
                            } else {
                                v.push(this.value)
                            }

                            break;
                    }
                });
                if (vs) {
                    for (var k in vs) {
                        var v = vs[k];
                        if (v instanceof Array) {
                            vs[k] = v = v.join(',')
                            if (!v && very[k]) {
                                return false;
                            }
                        }
                    }
                }
                return vs;
            }
        },
        text: function (text) {
            return text === undefined ? (this.length > 0 ? this[0].textContent : null) :
                this.each(function () { this.textContent = text })
        },
        focus: function () {
            if (this.length > 0)
                this[0].focus();
            return this;
        },
        html: function (text) {
            return text === undefined ? (this.length > 0 ? this[0].innerHTML : null) :
                this.each(function () { this.innerHTML = text })
        },
        show: function (t) {
            return this.css('display', t || 'block');
        },
        hide: function () {
            return this.css('display', 'none');
        },
        remove: function () {
            return this.each(function () {
                if (this.parentNode)
                    this.parentNode.removeChild(this)
            })
        },
        eq: function (c) {
            var ems = [];
            if (typeof c == 'string') {
                each(this, function () {
                    if (matches(this, c))
                        ems.push(this)
                });

            } else if (c < this.length)
                ems.push(this[c]);
            return new UMC(ems);
        }, last: function (i) {
            var n = i || 1;
            return new UMC(n <= this.length && n > 0 ? this[this.length - n] : []);

        },
        offset: function () {
            if (this.length == 0) return null
            return offset(this[0])
        },
        each: function (c) {
            each(this, c);
            return this;
        },
        removeClass: function (c) {
            return this.cls(c, false);
        },
        addClass: function (c) {
            return this.cls(c, true);
        },
        cls: function (c, k) {
            if (arguments.length == 1) {
                k = function (v) { return !this.is('.' + v) };
            }
            return this.each(function () {
                var e = UMC(this);
                each(c.split(' '), function () {
                    if (this)
                        e.attr('class', (" " + (e.attr('class') || '') + " ").replace(" " + this + " ", ' ').replace(/(^\s*)|(\s*$)/g, "") + " " + ((ISFN(k) ? k.call(e, this) : k) ? this : ''));
                });
            });

        },
        find: function (selector) {
            var data = [];
            this.each(function () {
                each(this.querySelectorAll(selector), function () { data.push(this) });
            })
            return new UMC(data);
        },
        parent: function (selector) {
            var t = selector === undefined;
            var data = [];
            this.each(function () {
                var p = this.parentNode;
                if (t) {
                    data.push(p)
                } else {
                    while (!matches(p, selector)) {
                        p = p.parentNode;
                        if (p === document.body) {
                            return;
                        }
                    }
                    data.push(p);
                }
            });
            return new UMC(data);
        },
        appendTo: function (c) {
            if (!(c instanceof UMC))
                c = UMC(c);
            if (c.length > 0) {
                var m = c[0];
                this.each(function () {
                    m.appendChild(this);
                });
            }
            return this;
        },
        append: function (c) {
            if (typeof c == 'string') {
                var e = document.createElement("div");
                e.innerHTML = c;
                c = new UMC(e.children);
            }
            if (!(c instanceof UMC))
                c = UMC(c);
            return this.each(function () {
                var m = this;
                c.each(function () {
                    m.appendChild(this);
                });
            });
        },
        format: function (o, fn, h) {
            var ch = (fn === true) ? true : h;
            return this.each(function () {
                var me = UMC(this);
                var html = me.attr('html') || me.find('script').text();
                me.attr('html', html);

                html = UMC.format(html, o, fn);
                ch ? me.html(html) : me.append(html);
            });
        },
        defer: function () {
            var k = 'data-src';
            return this.on("scroll", function () {
                var con = offset(this);
                var cache = this.cache || [];
                for (var i = 0; i < cache.length; i++) {
                    var o = cache[i];
                    if (o && o.is('[' + k + ']')) {
                        var cw = o.offset();
                        post = cw.top - (con.top + con.height);
                        posb = cw.top + cw.height - con.top;
                        posl = cw.left - (con.left + con.width);
                        posr = cw.left + cw.width - con.left;

                        if ((post < 0 && posb > 0) && (posl < 0 && posr > 0)) {
                            var src = o.attr(k)
                            o.attr(k, null);
                            src.match(/[a-z]+/) == src ? o.on(src) : o.is('img') ? o.attr('src', src) : o.css("background-image", "url(" + src + ")");
                            if (!o.attr(k)) {
                                cache.splice(i, 1);
                                i--;
                            }

                        }
                    }
                };
            }).on('defer', function (e, v) {
                var ch = [];
                each(this.querySelectorAll('[' + k + ']'), function () { ch.push(UMC(this)) });;
                this.cache = ch;
                if (!v) On(this, 'scroll');
            });
        },
        swipe: function (selector) {

            var active, X, Y;
            var start = ['touchstart'];
            if (selector) start.push(selector);
            start.push(function (event) {
                X = event.changedTouches[0].pageX;
                Y = event.changedTouches[0].pageY;
                if (active) {
                    if (matches(event.target, '*[wdk-swipe-area]') == false) {

                        if (matches(active, '*[wdk-swipe]')) {
                            active.removeAttribute('wdk-swipe');
                            return false;
                        }
                    }
                }
                active = this;

            });
            this.on.apply(this, start);
            start[0] = 'touchend';
            start[start.length - 1] = function (event) {
                if (active == this) {
                    var x = event.changedTouches[0].pageX;
                    var y = event.changedTouches[0].pageY;
                    if (Math.abs(X - x) - Math.abs(Y - y) > 0) {
                        if (x - X > 10) {
                            if (On(active, 'swipe', ['right']) !== false)
                                active.setAttribute('wdk-swipe', 'right');

                            return false;
                        }
                        if (X - x > 10) {
                            if (On(active, 'swipe', ['left']) !== false)
                                active.setAttribute('wdk-swipe', 'left');
                            return false;
                        }
                    }
                }
            };
            return this.on.apply(this, start);

        }, after: function (c) {

            return this.each(function () {
                var m = this.parentNode;
                var b = this;
                if (typeof c == 'string') {
                    UMC(document.createElement("div")).html(c).children()
                        .each(function () {
                            m.lastChild == b ? m.appendChild(this) : m.insertBefore(this, b.nextSibling);
                        });
                } else {
                    UMC(c).each(function () {
                        m.lastChild == b ? m.appendChild(this) : m.insertBefore(this, b.nextSibling);
                    });
                    return false;
                }
            })
        }, before: function (c) {
            return this.each(function () {
                var m = this.parentNode;
                var b = this;
                if (typeof c == 'string') {
                    UMC(document.createElement("div")).html(c).children()
                        .each(function () {
                            m.insertBefore(this, b);
                        });
                } else {
                    UMC(c).each(function () {
                        m.insertBefore(this, b);
                    });
                    return false;
                }
            })

        }


    };
    (function (t) {
        UMC.prototype[t] = function (a) {
            var ag = arguments;
            if (ag.length) {
                var args = [t];
                each(ag, function () {
                    args.push(this)
                });
                this.on.apply(this, args);
            } else {
                this.each(function () {
                    if (ISFN(this[t])) {
                        this[t]();
                    } else {
                        On(this, t, []);
                    }
                });
            }
            return this;
        };
        return arguments.callee;
    })('click')('select')('blur')('submit')('reset')('focus')('change');
    UMC.extend = function (a, t) {
        var as = arguments;
        var ts = t === true;
        for (var i = ts ? 2 : 1; i < as.length; i++) {
            var f = as[i];
            for (var k in f) {
                ts && a[k] ? 0 : a[k] = f[k];
            }
        }
        return a;
    }
    UMC.cookie = function (name, value) {
        if (value) {
            var exp = new Date();
            exp.setTime(exp.getTime() * 2);
            document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toUTCString();
            return value;
        } else {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return unescape(arr[2]);

        }
    }
    UMC.hash = function (str) {
        var hash = 5381;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char;
        }
        return hash;
    }
    UMC.uuid = function () {
        return btoa((Math.random() + '').substr(2)).replace(/=+$/g, '');
    }
    function format(style, htmls) {
        var st = [];
        var click = UMC.style(style, st);
        if (st.length || click) {
            htmls.push('<', click ? 'a' : 'span', ' style="', st.join(''), '" ')
            if (click) {
                var href = UMC.UI.Click(click);
                if (href) {
                    htmls.push(' ', (href.charAt(0) == '/' && UMC.SPA) ? 'ui-spa' : 'target="_blank"');
                    htmls.push(' href="', href, '">');
                } else {
                    htmls.push(' click-data="', UMC.encode(JSON.stringify(click)), '">');

                }
                return '</a>'
            } else {
                htmls.push('>');
                return '</span>'
            }
        }
        return '';

    }
    UMC.format = function (html, o, fn) {
        var t = [].concat(o);
        var cfn = UMC.extend((fn instanceof Object) ? fn : {});

        var htmls = [];
        var ids = [];
        var reg = /\{(\d*):?([\w_-]+):?(\d*)\}/g;
        var keys;
        var headerEnd = format(cfn, htmls);
        var sindex = 0;
        while ((keys = reg.exec(html)) != null) {
            var bpfx = parseInt(keys[1]) || 0;
            var key = keys[2];
            var epfx = parseInt(keys[3]) || 0;
            var index = keys.index;
            var lastIndex = reg.lastIndex;
            htmls.push(html.substring(sindex, index - bpfx));
            sindex = lastIndex + epfx;
            var cf = cfn[key];
            var end = format(UMC.extend({}, cf), htmls);
            htmls.push(html.substr(index - bpfx, bpfx), '');

            ids.push({ i: htmls.length - 1, k: ISFN(cf) ? cf : key })

            htmls.push(html.substr(sindex - epfx, epfx));
            htmls.push(end);

        }
        if (sindex < html.length) {
            htmls.push(html.substr(sindex));
        }
        htmls.push(headerEnd);

        var data = [];
        for (var i = 0; i < t.length; i++) {
            var o = t[i];
            for (var c = 0; c < ids.length; c++) {
                var id = ids[c];
                htmls[id.i] = (ISFN(id.k) ? id.k(o, i, t) : String(o[id.k] === undefined ? '' : o[id.k]).replace(/>/g, "&gt;").replace(/</g, "&lt;"))
            }
            data.push(htmls.join(''));
        }

        return data.join('');
    }

    UMC.uploader = function (file, callback, name) {
        var rotts = posurl.posurl.split('/');;
        var root = rotts[3] ? rotts[3] : rotts[1];
        var key = name || [new Date().getTime(), file.name].join('/');
        var urlKey = 'TEMP/' + root + '/' + key;
        var url = (posurl.possrc || 'https://oss.365lu.cn/') + urlKey;

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            UMC.isfn(callback) ? callback({ src: url, key: key }) : 0;
        };
        xhr.open('PUT', url, true);
        xhr.send(file);

    }
    UMC.encode = function (st) {
        var all = document.createElement('div');
        all.setAttribute("d", st);
        return all.outerHTML.split('"')[1];
    }
    UMC.style = function (style, htmls) {
        var click = false;
        for (var k in style) {
            var v = style[k];
            var t = typeof v;
            if (k == 'click') {
                click = v;
            } else if (t == 'string' || t == 'number') {
                switch (k) {
                    case 'font':
                        htmls.push(k, '-family:', v, ';');
                        break;
                    case 'border-radius':
                    case 'font-size':
                        htmls.push(k, ':', v, 'px;');
                        break;
                    case 'padding':
                        htmls.push(k, ':', v.split(' ').join('px '), 'px;');
                        break;
                    case 'height':
                        htmls.push('min-height:', v, 'px;');
                        break;
                    default:
                        htmls.push(k, ':', v, ';');
                        break;
                }
            }
        }
        return click;
    }
    UMC.query = function (q, k) {
        var e = decodeURIComponent;
        if ((typeof q) == 'string') {
            var value = {};
            var ks = k || [];
            each(q.split('&'), function () {
                var vs = this.split('=');
                value[e(vs[0])] = e(vs[1] || '');
                ks.push(vs[0]);
            });
            return value;
        } else {
            var vs = [];
            for (var k in q)
                vs.push(e(k) + '=' + e(q[k]));

            return vs.join("&");
        }
    };
    UMC.Click = function (data) {
        if (data) {
            if (data.key == 'Click') {
                data = data.send;
            }
            var model = data.model;
            var cmd = data.cmd;
            if (model && cmd)
                __p.Command(model, cmd, data.send || '');
            else {
                var href = UMC.UI.Click(data);
                if (href) {
                    location.href = href;
                } else if (href !== false) {
                    UMC(document.body).on('UI.Key.' + data.key, data.send);
                }
            }
        }
    }
    UMC.datefmt = function (date, fmtstr) {
        var format = fmtstr || 'yyyy-MM-dd HH:mm:ss';
        var json = {};
        json.yyyy = date.getFullYear();
        json.yy = json.yyyy.toString().substr(2);
        var m = date.getMonth() + 1;
        json.MM = m > 9 ? m : '0' + m;
        json.M = m;
        var d = date.getDate();
        json.dd = d > 9 ? d : '0' + d;
        json.d = d;
        var h = date.getHours();
        json.HH = h > 9 ? h : '0' + h;
        json.H = h;
        var mi = date.getMinutes();
        json.mm = mi > 9 ? mi : '0' + mi;
        json.m = mi;
        var s = date.getSeconds();
        json.ss = s > 9 ? s : '0' + s;
        json.s = s;
        for (var item in json) {
            format = format.replace(item, json[item]);
        }
        return format;
    };

    function dialog(title, content, fn) {
        var pxf = "weui_dialog";
        var me = UMC(document.createElement("div"));
        var html = [
            '<div class="', pxf, '_hd">',
            '<strong class="', pxf, '_title">', title, '</strong></div>',
            '<div class="', pxf, '_bd">', content, '</div>',
            '<div class="', pxf, '_ft">',
            fn ? '<a class="weui_btn_dialog default">取消</a>' : '',
            '<a class="weui_btn_dialog primary">确认</a></div>'
        ];
        me.html(html.join(''));
        me.appendTo(document.body);
        var mask = UMC(document.createElement("div")).addClass('weui_mask').appendTo(document.body);
        me.show().addClass(pxf).addClass((content || '').length < 20 ? (pxf + '_confirm') : (pxf + '_alert'));
        me.find('.weui_dialog_ft a').on('click', function () {
            if (fn && matches(this, '.primary') && (fn(me) === false))
                return;

            me.remove();
            mask.remove();

        });
        return me;
    }


    function actionSheet(title, data, fn, fd, cells) {
        var pxf = "weui_actionsheet";
        var sheet = UMC(document.createElement("div")).addClass(pxf);
        var mask = UMC(document.createElement("div")).addClass('weui_mask').on('click', function () {
            sheet.removeClass(pxf + '_toggle');
            setTimeout(function () {
                sheet.remove();
                mask.remove();
            }, 300);
        });

        var html = [
            '<div class="', pxf, '_menu">',
            '<div class="', pxf, '_title">', title, '</div><div class="', pxf, '_cells ', pxf, '_cells', (cells || 1) % 4, '"><div></div>'
        ];
        for (var i = 0; i < data.length; i++) {
            var t = data[i];
            html.push('<div class="', pxf, '_cell" data-index="', i, '">', t[fd || 'Text'] || t['text'], '</div>');
        }

        html.push('</div></div><div class="', pxf, '_action">',
            '<div class="', pxf, '_cell">取消</div>');
        sheet.html(html.join(''));
        sheet.appendTo(document.body);
        mask.appendTo(document.body);
        sheet.find('.' + pxf + '_cell').on('click', function () {
            mask.click();
            var index = parseInt(this.getAttribute('data-index') || '-1');
            if (index > -1)
                fn(data[index], index);
        });
        sheet.addClass(pxf + '_toggle');

    };
    var ___c, ___cb;
    var ___b = 0;
    var posurl = { "posurl": sessionStorage.posurl || "/UMC/" };


    var __p = {
        UI: 'body>div[ui]',
        Map: {},
        loading: false,
        On: function (type, fn, time) {
            var tm = time || 0;
            if (ISFN(fn)) {
                each(type.split(','), function () {
                    add(document, 'UMC.' + this, fn, "", tm);
                });
            } else {
                var events = [];
                for (var i = 1; i < arguments.length; i++) {
                    events.push(arguments[i]);
                }
                return On(document, 'UMC.' + type, events);
            }
            return __p;
        },
        Off: function (type, fn) {
            UMC.prototype.off.call(document, fn ? ['UMC.' + type, fn] : ['UMC.' + type]);
            return __p;
        },
        Config: function (url) {
            if (arguments.length > 0)
                posurl = url;
            else {
                return posurl;
            }
        },
        Msg: function (text) {
            __p.On('Prompt', { Text: text });
        },
        Bridge: function (v, fn) {
            __p.loading = true;
            if (__p.On('XHR.Bridge', v, fn) !== false) {
                window['j__' + (++___b)] = fn;
                var srcs = [posurl.posurl, '?jsonp=j__', ___b, v, __p.Ver ? "&_v=" + __p.Ver : ''];
                var script = document.createElement("script");
                script.src = srcs.join('');
                add(script, 'load', script.remove);
                UMC("Head").append(script);
            }
        },
        Sheet: actionSheet,
        Confirm: dialog
    };

    function imageShow(title, url, context, href) {
        dialog(title, ['<a ', href ? ('target="_blank" href="' + href + '"') : '', '><img style="max-width: 100%;" src="', url, '"/></a><p>', context, '</p>'].join(''));
    }
    var uiEvent = {};
    __p.On('UI.Event', function (e, v) {
        var ev = uiEvent[v.key];
        if (ev) {
            v.value;
            var send = $.extend({}, ev.send);
            send[ev.Name] = ev.Value;
            send[ev.Name_Text] = ev.Text;
            __p.Command(ev.model, ev.cmd, send);
            delete uiEvent[v.key];

        }
    });
    function check(v, cfn) {
        __p.loading = false;
        __p.On('XHR', 1, v);
        var event = parseInt(v.ClientEvent);
        if (!isNaN(event)) {
            __p.On("Event", event, v);

            if ((event & 4) > 0) {
                var p = (v.Headers || {})["AsyncDialog"];
                switch (p.Type) {
                    case 'Select':
                    case 'RadioGroup':
                        actionSheet(p.Title || '请选择', p.DataSource || [], function (v) {
                            v.Value ? __p.Command(v.Value) : UMC.Click(v)
                        }, 'Text', p.Cells || 1);
                        break;
                    case "Prompt":
                        dialog(p.Title || '提示', p.Text);
                        break;
                    case "Confirm":
                        dialog(p.Title || '提示', p.Text, function (v) { __p.Command(p.DefaultValue || 'OK') });
                        break;
                    case "Image":
                        imageShow(p.Title || '图片', p.Url, p.Text, p.Href);
                        break;
                    case 'Grid':
                        __p.On("Grid", p, v, cfn);
                        break;
                    case "UI.Event":
                        uiEvent[p.Id] = { Name: p.Name, Click: p.Submit };
                        $.Click(p.Click);
                        break;
                    default:
                        __p.On('Form.' + p.Type, p, v, cfn) === false ? 0 : __p.On("Form", p, v, cfn);
                        break;
                }
                __p.On("Dialog", p, v);
            }
            if ((event & 1) > 0)
                __p.On("Prompt", (v.Headers || {})["Prompt"], v)

            if ((event & 64) > 0) {
                var ps = [].concat((v.Headers || {})["DataEvent"]);
                for (var i = 0; i < ps.length; i++) {
                    var p = ps[i]
                    switch (p.type) {
                        case "OpenUrl":
                            window.open(p.value, "_self");
                            break;
                        case "Wxpay":
                            var bd = typeof WeixinJSBridge == 'undefined' ? false : WeixinJSBridge;
                            bd ? bd.invoke('getBrandWCPayRequest', p.value, function (res) {
                                __p.On(res.err_msg == "get_brand_wcpay_request:ok" ? p.type : 'Debug', p, v, res);
                            }) : __p.On("Debug", p, v);
                            break;
                        case "Click":
                            $.Click(p.Click);
                        default:
                            if (p.type) {
                                __p.On("DataEvent", p);
                                __p.On(p.type, p, v, cfn);
                                UMC('div[ui].ui').on('UI.' + p.type, p, v);
                            }
                            break;
                    }
                }
            }
            if ((event & 1024) > 0) {
                __p.On("Change", v.Ticket, v);
                UMC('div[ui].ui').ui('Change', v.Ticket, v)
            }

            if (ISFN(cfn))
                ___cb = cfn;
            return;
        } else if (ISFN(cfn)) cfn(v)
        else {
            var fn = ISFN(___c) ? ___c : ___cb;
            if (ISFN(fn)) {
                fn(v);
            }
            ___c = false;
            ___cb = false;
        }
    }
    var encodeUArgs = function (model, cmd, t) {
        var enc = encodeURIComponent;
        var call;
        var srcs = [];
        switch (typeof t) {
            case 'function':
                call = t;
                break;
            case 'object':
                srcs.push('&', UMC.query(t));
                break;
            case 'undefined':
                break;
            default:
                srcs.push('&', t);
                break;
        }
        switch (typeof cmd) {
            case 'function':
                call = cmd;
            case 'undefined':
                switch (typeof model) {
                    case 'object':
                        srcs.push('&', UMC.query(model));
                        break;
                    default:
                        srcs.push('&', model);
                        break;
                }
                break;
            case 'string':
                srcs.push('&_model=', enc(model), '&_cmd=', enc(cmd));
                break;
        }
        return [srcs.join(''), call];
    };
    __p.Command = function (m, c, t, b) {

        __p.On('XHR', b !== false ? 0 : 1);
        var args = encodeUArgs(m, c, t);
        var call = b || args[1];

        __p.Bridge(args[0], function (xhr) { check(xhr, call) });
        return __p;
    };
    __p.API = function (m, c, t, b) {
        var args = encodeUArgs(m, c, t);
        var call = b || args[1];
        __p.Bridge(args[0], function (xhr) { ISFN(call) ? call(xhr) : 0 });
        return __p;
    };
    UMC.api = function (m, c, t, b) {
        var args = encodeUArgs(m, c, t);
        var call = b || args[1];

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            check(JSON.parse(xhr.responseText), call);
        };
        xhr.open('GET', ['https://api.365lu.cn/UMC/', UMC.UI.Config().posurl.split('/').pop(), '?', args[0]].join(''), true);
        xhr.send();
    };

    __p.Ready = check;
    var dlgIndex = 0;
    UMC.POS = UMC.UI = __p;
    __p.On('XHR', function (e, s) {
        var b = __p.Body || false;
        b ? b.cls('loading', !s) : false
    }).On("Grid,Form,DataSource,Pager,Map,Flow", function (e, v, p, f) {

        var evs = e.type.split('.');
        var key = evs[evs.length - 1];
        var Dialog = UMC.UI[key];
        if (v.StaticUI && ISFN(f) && f == ___c)
            f(v, p);
        else if (Dialog) {
            var dom = UMC(document.createElement('div')).attr({ 'ui': key, 'class': 'wdk-dialog' }) //.css({ 'background-color': '#FAFCFF'})
                .on('transitionend,webkitTransitionEnd', function () {
                    dom.is('.ui') ? 0 : dom.on('pop');
                }).appendTo(document.body)
                .on('pop', function () {
                    dom.on('close').remove();
                }).attr('page-name', 'd' + dlgIndex)
            dlgIndex++;
            var re = v.RefreshEvent;
            var ce = v.CloseEvent;
            requestAnimationFrame(function () {
                re ? dom.ui(re, function () {
                    dom.on('refresh');
                }) : 0;
                ce ? dom.ui(ce, function () {
                    dom.addClass('right').removeClass('ui');
                }) : 0;
            });
            if (__p.On("UI.Show", dom, key, v) !== false) {
                new Dialog(v, dom);
                dom.addClass('ui');
            }

        }
    });
    (function ($) {
        var mds = [];
        var _mds = {};

        function sendback(xhr) {
            for (var key in xhr) {
                var cfn = _mds[key];
                var d = xhr[key];
                d.hasOwnProperty('ClientEvent') ? check(d) : (ISFN(cfn) ? cfn(d) : 0);

            }
        }

        function post(fn) {
            if (mds.length) {
                var url = '_model=' + encodeURIComponent(JSON.stringify(mds));
                mds = [];
                __p.Command(url, function (xhr) {
                    requestAnimationFrame(function () {
                        fn(xhr.TimeSpan);
                    });
                    sendback(xhr);
                });
            } else {
                fn();
            }
        }
        __p.Send = (function () {

            var pos = {
                Send: function (m, c, v, f) {
                    switch (typeof v) {
                        case 'function':
                            f = v;
                            v = '';
                            break;
                        case 'object':
                            v = UMC.query(v) || '';
                            break;
                        case 'undefined':
                            post(ISFN(m) ? m : function () { })
                            return pos;
                    }
                    mds.push({ model: m, cmd: c, value: v });

                    switch (typeof f) {
                        case 'function':
                            if (v) {
                                _mds[m + '.' + c + '.' + v] = f;
                            } else {
                                _mds[m + '.' + c] = f;
                            }
                            break;
                    }
                    return pos;
                }
            }
            return pos.Send;
        })();


    })(UMC);
    window.UMC = window["UMC"] = window["WDK"] = window.WDK = UMC;
    UMC(function ($) {
        requestAnimationFrame(function () {
            $(window).on('hashchange');
            __p.Send(function () {
                __p.On("UI.Loaded");
            });
        });
    });

})();