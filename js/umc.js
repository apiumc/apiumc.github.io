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
        has: function (k) {
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
            var timeId = 0;
            return this.on("scroll", function () {
                var cache = this.cache || [];
                clearTimeout(timeId);
                timeId = setTimeout(function () {
                    for (var i = 0; i < cache.length; i++) {
                        var o = cache[i];
                        if (o && o.is('[' + k + ']')) {
                            if (o[0].getBoundingClientRect().top < window.outerHeight) {
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
                }, 300)
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
        var key = name || [new Date().getTime(), file.name].join('/');
        var urlKey = 'TEMP/' + key;
        var url = (posurl.possrc || 'https://wdk.oss-accelerate.aliyuncs.com/') + urlKey;

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
        if ((typeof q) == 'string') {
            var d = decodeURIComponent;
            var value = {};
            var ks = k || [];
            each(q.split('&'), function () {
                var vs = this.split('=');
                value[d(vs[0])] = d(vs[1] || '');
                ks.push(vs[0]);
            });
            return value;
        } else {
            var e = encodeURIComponent;
            var vs = [];
            for (var k in q)
                vs.push(e(k) + '=' + e(q[k]));
            return vs.join("&");
        }
    };
    UMC.Click = function (data) {
        if (typeof data == 'object') {
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
    var posurl = { "posurl": "/UMC/" };

    function dialog(title, content, fn, btn) {
        var pxf = "weui_dialog";
        var me = UMC(document.createElement("div"));
        var html = ['<form action="', posurl.posurl, '?_v=Form" method="post" target="_blank">',
            '<div class="', pxf, '_hd">',
            '<strong class="', pxf, '_title">', title, '</strong></div>',
            '<div class="', pxf, '_bd">', content, '</div>',
            '<div class="', pxf, '_ft">',
            fn ? '<a class="weui_btn_dialog default">取消</a>' : '',
            '<a class="weui_btn_dialog primary">', btn || (fn ? '确认' : '关闭'), fn ? ' <input type="submit" />' : '', '</a></div></form>'
        ];
        me.html(html.join('')).on('close', function () {
            me.remove();
            mask.remove();
        });
        me.appendTo(document.body);
        var mask = UMC({ tag: 'div', cls: 'weui_mask' }).appendTo(document.body);
        me.show().addClass(pxf).addClass(pxf + (fn ? '_confirm' : '_alert'));

        me.find('.weui_dialog_ft a').click(function () {
            fn ? (matches(this, '.primary') ? 0 : me.on('close')) : me.on('close');
        })
        me.find('form').submit(function () {
            requestAnimationFrame(function () {
                me.on('close');
            })
            return fn(UMC(this).val()) || false;
        }).find('input').focus();
        return me;
    }


    function actionSheet(title, data, fn, fd, cells) {
        var pxf = "weui_actionsheet";
        var sheet = UMC({ tag: 'form', cls: pxf, action: posurl.posurl + '?_v=Form', method: 'post', target: '_blank' });
        var mask = UMC({
            tag: 'div',
            cls: 'weui_mask',
            click: function () {
                sheet.removeClass(pxf + '_toggle');
                setTimeout(function () {
                    sheet.remove();
                    mask.remove();
                }, 300);
            }
        });
        UMC({ tag: 'div', cls: pxf + '_title', text: title }).appendTo(sheet);
        var cells = UMC({ tag: 'div', cls: pxf + '_cells ' + pxf + '_cells' + ((cells || 1) % 4) }).appendTo(UMC({ tag: 'div', cls: pxf + '_menu' }).appendTo(sheet));
        UMC({ tag: 'div' }).appendTo(cells);
        for (var i = 0; i < data.length; i++) {
            var t = data[i];
            UMC({ tag: 'input', type: 'submit', value: i + '' }).appendTo(UMC({ tag: 'div', cls: pxf + '_cell', text: t[fd || 'Text'] || t['text'] }).appendTo(cells));
        }
        UMC({ tag: 'input', type: 'submit', value: -1 }).appendTo(UMC({ tag: 'div', cls: pxf + '_cell', text: '取消' }).appendTo(UMC({ tag: 'div', cls: pxf + '_action' }).appendTo(sheet)));

        sheet.appendTo(document.body).submit(function (e) {
            mask.click();
            var index = parseInt(e.submitter.value)
            return index > -1 ? (fn(data[index], index, sheet) || false) : false;
        });
        mask.appendTo(document.body);
        sheet.addClass(pxf + '_toggle');
        return sheet;
    };


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
        Click: function (e) {
            switch (e.key) {
                case 'Url':
                    return e.send;
                    break;
            }
        },
        Msg: function (text) {
            __p.On('Prompt', { Text: text });
        },
        Bridge: function (v, fn) {
            var xhr = new XMLHttpRequest();
            if (__p.On('XHR.Bridge', xhr, fn, v) !== false) {
                xhr.onload = function () { fn(JSON.parse(xhr.responseText)); };
            }
            xhr.open('POST', [posurl.posurl, __p.Ver ? "?_v=" + __p.Ver : ''].join(''), true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(v);
        },
        Sheet: actionSheet,
        Confirm: dialog
    };

    function imageShow(title, url, context, href) {
        dialog(title, ['<a ', href ? ('target="_blank" href="' + href + '"') : '', '><img style="max-width: 100%;" src="', url, '"/></a><p>', context, '</p>'].join(''));
    }
    var uiEvent = {};
    __p.On('UI.Event', function (e, v) {
        var ue = uiEvent[v.key];
        if (ue) {
            var val = v.value;
            __cmd(ue.Submit, ue.Name, val.Value, val.Text);
            delete uiEvent[v.key];
        }
    });
    function __cmd(c, n, v, t) {
        var s = UMC.extend({}, c.send || {});
        s[n] = v;
        t ? (s[n + '_Text'] = t) : 0;
        __p.Command(c.model, c.cmd, s);
    }
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

                        var smt = p.Submit;
                        var sht = actionSheet(p.Title || '请选择', p.DataSource || [], function (v, i, f) {
                            if (v.Value) {
                                if (p.Action) {
                                    UMC({ tag: 'input', 'value': v.Value, name: p.Name, type: 'hidden' }).appendTo(f);
                                    UMC.Click(p.Action);
                                    return true;
                                } else {
                                    var val = f.val();
                                    val[p.Name] = v.Value;
                                    __p.Command(val);
                                }

                            } else {
                                UMC.Click(v)
                            }
                        }, 'Text', p.Cells || 1);
                        var send = UMC.extend({}, smt.send);
                        send._model = smt.model;
                        send._cmd = smt.cmd;
                        for (var k in send) {
                            UMC({ tag: 'input', 'value': send[k], name: k, type: 'hidden' }).appendTo(sht);
                        }

                        break;
                    case "Prompt":
                        dialog(p.Title || '提示', p.Text);
                        break;
                    case "Confirm":
                        var smt = p.Submit;
                        var cfm = dialog(p.Title || '提示', p.Text, function (v) {
                            if (p.Action) {
                                UMC.Click(p.Action);
                                return true;
                            } else {
                                __p.Command(v);
                            }
                        }, smt.text || '').attr('ui', 'Confirm').addClass('not').find('form');
                        var send = UMC.extend({}, smt.send);
                        send._model = smt.model;
                        send._cmd = smt.cmd;
                        send[p.Name] = p.DefaultValue || 'OK';
                        for (var k in send) {
                            UMC({ tag: 'input', 'value': send[k], name: k, type: 'hidden' }).appendTo(cfm);
                        }
                        break;
                    case "Image":
                        imageShow(p.Title || '图片', p.Url, p.Text, p.Href);
                        break;
                    case 'Grid':
                        __p.On("Grid", p, v, cfn);
                        break;
                    case "UI.Event":
                        uiEvent[p.Key] = { Name: p.Name, Submit: p.Submit };
                        UMC.Click(p.Click);
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
                            UMC.Click(p.Click);
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
        } else if (ISFN(cfn)) cfn(v)
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
            default:
                t ? srcs.push('&', t) : 0;
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
        __p.Bridge(args[0], function (xhr) { check(xhr, call) });
        return __p;
    };
    UMC.error = function (o) {
        var i = document.createElement('em');
        i.className = o.className;
        o.parentElement.replaceChild(i, o);
    }

    __p.Ready = check;
    var dlgIndex = 0;
    UMC.POS = UMC.UI = __p;
    __p.On('XHR', function (e, s) {
        var b = __p.Body || false;
        b ? b.cls('loading', !s) : false
    }).On("Grid,Form,DataSource,Pager,Map,Flow", function (e, v) {

        var evs = e.type.split('.');
        var key = evs[evs.length - 1];
        var Dialog = UMC.UI[key];
        if (Dialog) {
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
                dom.addClass('ui');
            });
            if (__p.On("UI.Show", dom, key, v) !== false) {
                new Dialog(v, dom);
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