/**
+-------------------------------------------------------------------
* jQuery leoUi--tools
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["jquery"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    var ap = Array.prototype,
        aslice = ap.slice,
        expandoId, oproto = Object.prototype,
        ohasOwn = oproto.hasOwnProperty,
        parseCss;

    $.leoTools = $.leoTools || {};

    $.leoTools.version = '1.0.0';

    $.leoTools.getUuid = (function() {

        var uuid = 0;

        return function() {

            return uuid++;

        };

    })();

    $.leoTools.getId = function(name) {

        return "Leo" + (name === undefined ? '_' : '_' + name + '_') + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    };

    $.leoTools.expando = $.leoTools.getId('leoTools');

    expandoId = $.leoTools.expando.replace(/^Leo_leoTools/g, "");

    $.leoTools.rword = /[^, ]+/g;

    $.leoTools.getExpando = function(name) {

        return 'Leo' + (name === undefined ? '' : '_' + name) + expandoId;

    };

    // 返回min<=mun<=max
    $.leoTools.range = function(mun, min, max) {

        if (max === 'max' && min === 'min') {

            return mun;

        } else if (max === 'max') {

            return mun > min ? mun : min;

        } else if (min === 'min') {

            return mun < max ? mun : max;

        } else {

            return (mun > min ? mun : min) < max ? (mun > min ? mun : min) : max;

        }

    };

    // 返回随机数
    $.leoTools.random = function(min, max) {

        if (max === undefined) {

            max = min;

            min = 0;

        }

        return min + Math.floor(Math.random() * (max - min + 1));

    };

    //获取object对象所有的属性名称。
    $.leoTools.keys = function(obj) {

        if (!(obj === Object(obj))) return [];

        if (Object.keys) return Object.keys(obj);

        var keys = [];

        for (var key in obj)
            if (ohasOwn(obj, key)) keys.push(key);

        return keys;

    };

    //返回object对象所有的属性值。
    $.leoTools.values = function(obj) {

        var keys = $.leoTools.keys(obj);

        var length = keys.length;

        var values = new Array(length);

        for (var i = 0; i < length; i++) {

            values[i] = obj[keys[i]];

        }

        return values;

    };

    //返回一个随机乱序的 obj 副本
    $.leoTools.shuffle = function(obj) {

        // var rand,shuffled = [];

        // $.each(obj, function(key,value) {

        //     rand = $.leoTools.random(key++);

        //     shuffled[key - 1] = shuffled[rand];

        //     shuffled[rand] = value;

        // });

        // return shuffled;

        return aslice.call(obj, 0).sort(function() {
            return Math.random() - 0.5;
        });

    };

    //从obj中产生一个随机样本。传递一个数字表示从list中返回n个随机元素。否则将返回一个单一的随机项。
    $.leoTools.sample = function(obj, n, guard) {

        if (n == null || guard) {

            if (obj.length !== +obj.length) obj = $.leoTools.values(obj);

            return obj[$.leoTools.random(obj.length - 1)];

        }

        return $.leoTools.shuffle(obj).slice(0, Math.max(0, n));

    };

    parseCss = $.leoTools.parseCss = function(element, property) {

        return parseFloat($.css(element, property), 10) || 0;

    };

    //返回所有滚动的父集合
    $.leoTools.scrollParents = function($box, all) {

        var scrollParent, i = 0,
            position = $box.css("position"),

            excludeStaticParent = position === "absolute",
            doc = $box[0].ownerDocument || document;

        if ((/fixed/).test(position) && !all) {

            return 'boxFixed';

        } else {

            scrollParent = $box.parents().filter(function() {

                var parent = $(this),
                    flag;

                if (excludeStaticParent && parent.css("position") === "static") {

                    return false;

                }

                if (!all) {

                    (i > 0) ? flag = false: flag = (/(auto|scroll)/).test(parent.css("overflow") + parent.css("overflow-y") + parent.css("overflow-x"));

                    (/fixed/).test($.css(this, "position")) && (i++);

                    return flag;

                } else {

                    return (/(auto|scroll)/).test(parent.css("overflow") + parent.css("overflow-y") + parent.css("overflow-x"));

                }

            });

        }

        return i === 0 ? scrollParent.add(doc) : scrollParent;

    };

    //返回所有滚动的父集合的Top
    $.leoTools.getScrollParentsTop = function(scrollParents) {

        var top = 0,
            i = scrollParents.length;

        if (scrollParents === 'boxFixed' || i === 0) {

            return top;

        } else if (i === 1) {

            return $(scrollParents[0]).scrollTop();

        } else {

            while (i--) {

                top = top + $(scrollParents[i]).scrollTop();

            }

            return top;

        }

    };

    //返回所有滚动的父集合的Left
    $.leoTools.getScrollParentsLeft = function(scrollParents) {

        var left = 0,
            i = scrollParents.length;

        if (scrollParents === 'boxFixed' || i === 0) {

            return left;

        } else if (i === 1) {

            return $(scrollParents[0]).scrollLeft();

        } else {

            while (i--) {

                left = left + $(scrollParents[i]).scrollLeft();

            }

            return left;

        }

    };

    $.leoTools.htmlEncode = function(str) {

        return $('<div/>').text(str).html();

    };

    $.leoTools.htmlDecode = function(str) {

        return $('<div/>').html(str).text();

    };

    $.leoTools.keyCode = {

        BACKSPACE: 8,

        COMMA: 188,

        DELETE: 46,

        DOWN: 40,

        END: 35,

        ENTER: 13,

        ESCAPE: 27,

        HOME: 36,

        LEFT: 37,

        PAGE_DOWN: 34,

        PAGE_UP: 33,

        PERIOD: 190,

        RIGHT: 39,

        SPACE: 32,

        TAB: 9,

        UP: 38

    };

    $.leoTools.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());

    $.leoTools.isSupport__proto__ = ({}).__proto__ == Object.prototype;

    $.leoTools.clone = function(obj) {

        var newObj, noop = function() {};

        if (Object.create) {

            newObj = Object.create(obj);

        } else {

            noop.prototype = obj;

            newObj = new noop();

        }

        return newObj;

    };

    $.leoTools.createPrototype = function(proto, constructor) {

        var newProto = $.leoTools.clone(proto);

        newProto.constructor = constructor;

        return newProto;

    };

    $.leoTools.extend = function(target) {

        var input = aslice.call(arguments, 1),
            inputIndex = 0,
            inputLength = input.length,
            key, value;

        for (; inputIndex < inputLength; inputIndex++) {

            for (key in input[inputIndex]) {

                value = input[inputIndex][key];

                if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {

                    if ($.isPlainObject(value)) {

                        target[key] = $.isPlainObject(target[key]) ? $.leoTools.extend({}, target[key], value) : $.leoTools.extend({}, value);

                    } else {

                        target[key] = value;

                    }

                }

            }

        }

        return target;

    };

    $.leoTools.bridge = function(name, isFn) {

        if (!isFn) {

            $[name] = function(options) {

                var args = aslice.call(arguments, 1),

                    instance, returnObj = {},
                    prop;

                options = args.length ? $.leoTools.extend.apply(null, [options].concat(args)) : options;

                instance = new $.leoTools.plugIn[name](options, false, false);

                function deleteObj(obj) {

                    if (obj) {

                        for (var prop in obj) {

                            delete obj[prop];

                        }

                    }

                }

                function setReturnObjMethods(prop, instance, returnObj) {

                    returnObj[prop] = (function(key, instance, returnObj) {

                        var returnFn;

                        if (key === 'destroy') {

                            returnFn = function() {

                                instance[key].apply(instance, arguments);

                                deleteObj(instance);

                                deleteObj(returnObj);

                                returnObj = null;

                                instance = null;

                            };

                        } else if (key === 'instance') {

                            returnFn = function() {

                                return instance;

                            };

                        } else {

                            returnFn = function() {

                                if (!instance) {

                                    return;

                                }

                                var returnValue = instance[key].apply(instance, arguments);

                                if (returnValue !== undefined) {

                                    return returnValue;

                                } else {

                                    return returnObj;

                                }

                            };

                        }

                        return returnFn;

                    }(prop, instance, returnObj));

                }

                for (prop in instance) {

                    if ($.isFunction(instance[prop]) && prop.charAt(0) !== "_" && prop !== 'constructor') {

                        setReturnObjMethods(prop, instance, returnObj);

                    }

                }

                setReturnObjMethods("instance", instance, returnObj);

                instance = null;

                return returnObj;

            };

        } else {

            var fullName = $.leoTools.getExpando(name + '_dataId');

            $.fn[name] = function(options) {

                var isMethodCall = typeof options === "string",
                    args = aslice.call(arguments, 1),
                    returnValue = this;

                options = !isMethodCall && args.length ? $.leoTools.extend.apply(null, [options].concat(args)) : options;

                if (isMethodCall) {

                    this.each(function() {

                        var methodValue, instance = $.data(this, fullName);

                        if (options === "instance") {

                            returnValue = instance;

                            return false;

                        }

                        if (!instance) {

                            return false;

                        }

                        if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {

                            return false;

                        }

                        methodValue = instance[options].apply(instance, args);

                        if (methodValue !== instance && methodValue !== undefined) {

                            returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;

                            return false;

                        }

                    });

                } else {

                    this.each(function() {

                        var instance = $.data(this, fullName);

                        if (instance) {

                            instance.option(options || {});

                            if (instance._init) {

                                instance._init();

                            }

                        } else {

                            new $.leoTools.plugIn[name](options, this, fullName);

                        }

                    });

                }

                return returnValue;

            };

        }

    };

    $.leoTools.plugIn = function(options, methods) {

        var plugInDefaults = {

                name: 'leoUi',

                version: '1.0',

                defaultsTarget: false,

                disableClassName: false,

                inherit: false,

                addJquery: false,

                addJqueryFn: true,

                defaults: {

                    disabledEvent: false

                },

                _init: $.noop,

                _destroy: $.noop,

                _setOption: $.noop

            },
            li = $.extend(true, {}, plugInDefaults, options),

            inherit, PlugIn,

            inheritPrototype, plugInPrototype, PlugInBasePrototypeKeys,

            leoToolsFn = $.leoTools,
            leoPlugIn;

        if (typeof li.name !== 'string') {
            return;
        }

        leoPlugIn = leoToolsFn.plugIn;

        if (!!leoPlugIn[li.inherit] && $.isFunction(inherit = leoPlugIn[li.inherit])) {

            PlugIn = function(hash, target, dataId) {

                inherit.apply(this, arguments);

            };

            PlugInBasePrototypeKeys = leoPlugIn.PlugInBasePrototypeKeys;

            inheritPrototype = inherit.prototype;

            plugInPrototype = PlugIn.prototype = leoToolsFn.createPrototype(inheritPrototype, PlugIn);

            li.defaults = leoToolsFn.extend({}, leoPlugIn[li.inherit]['prototype']['defaults'], li.defaults);

            $.extend(plugInPrototype, li);

            $.each(plugInPrototype, function(prop, value) {

                if (!$.isFunction(value) || !!PlugInBasePrototypeKeys[prop] || !inheritPrototype[prop] || !li[prop]) {

                    return;

                }

                plugInPrototype[prop] = (function() {

                    var _super = function() {

                            return inheritPrototype[prop].apply(this, arguments);

                        },

                        _superApply = function(args) {

                            return inheritPrototype[prop].apply(this, args);

                        };

                    returnFn['_super'] = _super;

                    returnFn['_superApply'] = _superApply;

                    function returnFn() {

                        var __super = this._super,
                            __superApply = this._superApply,
                            returnValue;

                        this._super = _super;

                        this._superApply = _superApply;

                        returnValue = value.apply(this, arguments);

                        this._super = __super;

                        this._superApply = __superApply;

                        return returnValue;

                    }

                    return returnFn;

                })();

            });

            plugInPrototype.superClass = leoToolsFn.createPrototype(inheritPrototype, inherit);

        } else {

            PlugIn = function(hash, target, dataId) {

                this.options = leoToolsFn.extend({}, this.defaults, hash);

                this.$target = $(target || this.options[this.defaultsTarget] || '<div>');

                this.dataId = dataId;

                this.nameSpace = leoToolsFn.getId(this.name + this.version + '_nameSpace');

                this.disableClassName = this.disableClassName || 'LeoPlugIn_' + this.name + '_disable';

                this.disableIdArr = [];

                this.offArr = [];

                this._create();

            };

            $.extend(PlugIn.prototype, {

                _create: function() {

                    var target = this.$target[0];

                    this.document = $(target.style ? target.ownerDocument : target.document || target);

                    this.window = $(this.document[0].defaultView || this.document[0].parentWindow);

                    this.dataId !== false && $.data(target, this.dataId, this);

                    this._init();

                },

                _delay: function(handler, delay) {

                    var instance = this;

                    function handlerProxy() {

                        return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);

                    }

                    if(delay === 'none'){

                        handlerProxy();

                        return;

                    }

                    return setTimeout(handlerProxy, delay || 0);

                },

                _on: function() {

                    var arg = aslice.call(arguments, 2),
                        op = this.options,

                        $self = $(arguments[0]),
                        self = $self[0],
                        leoUiGuid,

                        events = arguments[1],
                        eventStr = '',
                        This = this,
                        oldFn, last;

                    if (typeof events === 'string' && !!self) {

                        events.replace(leoToolsFn.rword, function(name) {

                            eventStr += name + '.' + This.nameSpace + ' ';

                        });

                        if (!!self.parentNode && arg[arg.length - 1] === 'supportDisabled' && arg.pop()) {

                            if ($.isFunction(oldFn = arg[last = arg.length - 1])) {

                                arg[last] = function(event) {

                                    if (op.disabledEvent === false && !$(event.target).closest("." + This.disableClassName)[0]) {

                                        oldFn.apply(this, arguments);

                                    }

                                };

                            }

                        } else if ($.isFunction(oldFn = arg[last = arg.length - 1])) {

                            arg[last] = function(event) {

                                if (op.disabledEvent === true) {
                                    return;
                                }

                                oldFn.apply(this, arguments);

                            };

                        }

                        arg = [eventStr].concat(arg);

                        $self.on.apply($self, arg);

                        !!oldFn && typeof(leoUiGuid = arg[arg.length - 1].guid) === 'number' && (oldFn.leoUiGuid = leoUiGuid);

                        $.inArray(self, this.offArr) === -1 && this.offArr.push(self);

                    }

                    return this;

                },

                _off: function() {

                    var arg = aslice.call(arguments, 2),

                        $self = $(arguments[0]),
                        emptyFn, last, leoUiGuid,

                        events = arguments[1],
                        eventStr = '',
                        This = this;

                    if (typeof events === 'string' && !!$self[0]) {

                        events.replace(leoToolsFn.rword, function(name) {

                            eventStr += name + '.' + This.nameSpace + ' ';

                        });

                        if ($.isFunction(arg[last = arg.length - 1]) && !!(leoUiGuid = arg[last].leoUiGuid)) {

                            emptyFn = $.noop;

                            emptyFn.guid = leoUiGuid;

                            arg[last] = emptyFn;

                            emptyFn = null;

                        }

                        arg = [eventStr].concat(arg);

                        $self.off.apply($self, arg);

                    } else {

                        arg = aslice.call(arguments, 1);

                        $self.off.apply($self, ['.' + This.nameSpace].concat(arg));

                    }

                    return this;

                },

                hasLeoPlugIn: function(el, name) {

                    return !!$(el).data(leoToolsFn.getExpando(name + '_dataId'));

                },

                _trigger: function(el, event, data) {

                    data = data || {};

                    if (typeof event === 'string') {

                        $(el).trigger(event + '.' + this.nameSpace, data);

                    } else if (typeof event === 'object') {

                        var type = event.type;

                        event.type = type + '.' + this.nameSpace;

                        $(el).trigger(event, data);

                    }

                    return this;

                },

                _targetTrigger: function(name, fn, context) {

                    if (!!name && !!fn && $.isFunction(fn)) {

                        !!context ? this._on(this.$target, name, $.proxy(fn, context)) : this._on(this.$target, name, fn);

                    } else if (!!name) {

                        this.$target.trigger(name + '.' + this.nameSpace, fn);

                    }

                    return this;

                },

                _addElemDisableClassName: function(el) {

                    var disableClassName = this.disableClassName,
                        $box = $(el);

                    !$box.hasClass(disableClassName) && ($box.addClass(disableClassName), this.disableIdArr.push($box[0]));

                    return this;

                },

                _removeElemDisableClassName: function(el) {

                    var disableClassName = this.disableClassName,
                        $box = $(el),

                        disableIdArr = this.disableIdArr;

                    $box.hasClass(disableClassName) && disableIdArr.length > 0 && (disableIdArr = $.grep(disableIdArr, function(val, index) {

                        return val !== $box[0];

                    }), $box.removeClass(disableClassName));

                    return this;

                },

                trigger: function() {

                    this._trigger.apply(this, arguments);

                },

                destroy: function() {

                    this._deletData();

                    this.dataId !== false && this.$target.removeData(this.dataId);

                    this._destroy();

                },

                widget: function() {

                    return this.$target || null;

                },

                _deletData: function() {

                    var disableClassName = this.disableClassName,

                        nameSpace = '.' + this.nameSpace,

                        disableIdArr = this.disableIdArr,
                        offArr = this.offArr;

                    !!disableIdArr && disableIdArr.length > 0 && $.each(disableIdArr, function(index, val) {

                        $(val).removeClass(disableClassName);

                    });

                    !!offArr && offArr.length > 0 && $.each(offArr, function(index, val) {

                        $(val).off(nameSpace);

                    });

                    delete this.disableIdArr;

                    delete this.offArr;

                    return this;

                },

                option: function(key, value) {

                    var options = key,
                        parts, curOption, i, oldKey;

                    if (arguments.length === 0) {

                        return leoToolsFn.extend({}, this.options);

                    }

                    if (typeof key === "string") {

                        options = {};

                        oldKey = key;

                        parts = key.split(".");

                        key = parts.shift();

                        if (parts.length) {

                            curOption = options[key] = leoToolsFn.extend({}, this.options[key]);

                            for (i = 0; i < parts.length - 1; i++) {

                                curOption[parts[i]] = curOption[parts[i]] || {};

                                curOption = curOption[parts[i]];

                            }

                            key = parts.pop();

                            if (arguments.length === 1) {

                                return curOption[key] === undefined ? null : curOption[key];

                            }

                            curOption[key] = value;

                            this.__setOption(oldKey, value, true);

                        } else {

                            if (arguments.length === 1) {

                                return this.options[key] === undefined ? null : this.options[key];

                            }

                            options[key] = value;

                            this.__setOptions(options);

                        }

                    } else {

                        this.__setOptions(options);

                    }

                },

                __setOptions: function(options) {

                    var key;

                    for (key in options) {

                        if (options.hasOwnProperty(key)) {

                            if (key.indexOf('.') !== -1) {

                                this.__setOption(key, options[key], true);

                            } else {

                                this.__setOption(key, options[key]);

                            }

                        }

                    }

                },

                __setOption: function(key, value, bParts) {

                    if (bParts) {

                        var parts = key.split(".");

                        (function f(options, parts, lastKey, value) {

                            var key, rKey = parts.shift();

                            if (rKey === lastKey) {

                                options[lastKey] = value;

                                return options[lastKey] !== undefined;

                            }

                            for (key in options) {

                                if (options.hasOwnProperty(key)) {

                                    if (key === rKey) {

                                        return f(options[key], parts, lastKey, value);

                                    }

                                }

                            }

                        })(this.options, parts, parts[parts.length - 1], value) && this._setOption(key, value);

                    } else {

                        this.options[key] = value;

                        this._setOption(key, value);

                    }

                }

            });

            if (!leoPlugIn.PlugInBasePrototypeKeys) {

                var key, val = PlugIn.prototype;

                leoPlugIn.PlugInBasePrototypeKeys = {};

                for (key in val) {

                    if (ohasOwn.call(val, key)) {

                        !!key && (key !== 'constructor') && (leoPlugIn.PlugInBasePrototypeKeys[key] = true);

                    }

                }

            }

            $.extend(PlugIn.prototype, li);

        }

        function setMethods(name, methods, fn) {

            var key, plugInPrototype = PlugIn.prototype,
                method;

            if (!methods) {
                return;
            }

            for (key in methods) {

                if (ohasOwn.call(methods, key)) {

                    method = methods[key];

                    if ($.type(method) === 'function') {

                        if (key.charAt(0) !== "_") {

                            setKeyFn(key, fn, plugInPrototype, method);

                        } else {

                            method.call(plugInPrototype, fn);

                        }

                    }

                }

            }

            function setKeyFn(key, fn, plugInPrototype, method) {

                fn[key] = function(PlugInPrototype, method) {

                    return function() {

                        var args = aslice.call(arguments);

                        args.push(fn);

                        return method.apply(PlugInPrototype, args);

                    };

                }(plugInPrototype, method);

            }

        }

        leoToolsFn.plugIn[li.name] = PlugIn;

        if (li.addJquery === true) {

            leoToolsFn.bridge(li.name);

            setMethods(li.name, methods, $[li.name]);

        }

        if (li.addJqueryFn === true) {

            leoToolsFn.bridge(li.name, true);

            setMethods(li.name, methods, $.fn[li.name]);

        }

    };

    $.fn.extend({

        leoUiTextSelection: function() {

            var start, end, t = this[0],
                val = this.val(),

                selection, re, selRange, range, stored_range, s, e;

            if (arguments.length === 0) {

                if (typeof t.selectionStart !== "undefined") {

                    s = t.selectionStart;

                    e = t.selectionEnd;

                } else {

                    try {

                        selection = document.selection;

                        if (t.tagName.toLowerCase() != "textarea") {

                            //this.focus();

                            range = selection.createRange().duplicate();

                            range.moveEnd("character", val.length);

                            s = (range.text === "" ? val.length : val.lastIndexOf(range.text));

                            range = selection.createRange().duplicate();

                            range.moveStart("character", -val.length);

                            e = range.text.length;

                        } else {

                            range = selection.createRange();

                            stored_range = range.duplicate();

                            stored_range.moveToElementText(t);

                            stored_range.setEndPoint('EndToEnd', range);

                            s = stored_range.text.length - range.text.length;

                            e = s + range.text.length;

                        }

                    } catch (e) {}

                }

                return {

                    start: s,
                    end: e,
                    text: val.substring(s, e),
                    replace: function(st) {

                        return val.substring(0, s) + st + val.substring(e, val.length);

                    }

                };

            } else if (arguments.length === 1) {

                if (typeof arguments[0] === "object" && typeof arguments[0].start === "number" && typeof arguments[0].end === "number") {

                    start = arguments[0].start;

                    end = arguments[0].end;

                } else if (typeof arguments[0] === "string") {

                    if ((start = val.indexOf(arguments[0])) > -1) {

                        end = start + arguments[0].length;

                    } else if (arguments[0] === 'last') {

                        end = start = val.length;

                    }

                } else if ($.type(arguments[0]) === "regexp") {

                    re = arguments[0].exec(val);

                    if (re != null) {

                        start = re.index;

                        end = start + re[0].length;

                    }

                }

            } else if (arguments.length === 2) {

                if (typeof arguments[0] === "number" && typeof arguments[1] === "number") {

                    start = arguments[0];

                    end = arguments[1];

                }

            }

            if (typeof start === "undefined") {

                start = 0;

                end = val.length;

            }

            if (typeof t.createTextRange !== "undefined") {

                selRange = t.createTextRange();

                selRange.collapse(true);

                selRange.moveStart('character', start);

                selRange.moveEnd('character', end - start);

                selRange.select();

            } else {

                t.selectionStart = start;

                t.selectionEnd = end;

            }

            return this;

        },

        leftBorderWidth: function(isMargin) {

            var element = this[0];

            return parseCss(element, 'borderLeftWidth') + parseCss(element, 'paddingLeft') + (!!isMargin ? parseCss(element, 'marginLeft') : 0);

        },

        rightBorderWidth: function(isMargin) {

            var element = this[0];

            return parseCss(element, 'borderRightWidth') + parseCss(element, 'paddingRight') + (!!isMargin ? parseCss(element, 'marginRight') : 0);

        },

        topBorderWidth: function(isMargin) {

            var element = this[0];

            return parseCss(element, 'borderTopWidth') + parseCss(element, 'paddingTop') + (!!isMargin ? parseCss(element, 'marginTop') : 0);

        },

        bottomBorderWidth: function(isMargin) {

            var element = this[0];

            return parseCss(element, 'borderBottomWidth') + parseCss(element, 'paddingBottom') + (!!isMargin ? parseCss(element, 'marginBottom') : 0);

        },

        borderSize: function(isMargin) {

            return {

                width: this.leftBorderWidth(isMargin) + this.rightBorderWidth(isMargin),

                height: this.topBorderWidth(isMargin) + this.bottomBorderWidth(isMargin)

            };

        },

        setOuterWidth: function(width, isMargin) {

            return this.width(width - this.leftBorderWidth(isMargin) - this.rightBorderWidth(isMargin));

        },

        setOuterHeight: function(height, isMargin) {

            return this.height(height - this.topBorderWidth(isMargin) - this.bottomBorderWidth(isMargin));

        },

        focus: (function(orig) {

            return function(delay, fn) {

                return typeof delay === "number" ? this.each(function() {
                        var elem = this;

                        setTimeout(function() {

                            $(elem).focus();

                            if (fn) {

                                fn.call(elem);

                            }

                        }, delay);

                    }) :

                    orig.apply(this, arguments);

            };

        })($.fn.focus),

        zIndex: function(zIndex) {

            if (zIndex !== undefined) {

                return this.css("zIndex", zIndex);

            }

            if (this.length) {

                var elem = $(this[0]),
                    position, value;

                while (elem.length && elem[0] !== document) {

                    // Ignore z-index if position is set to a value where z-index is ignored by the browser
                    // This makes behavior of this function consistent across browsers
                    // WebKit always returns auto if the element is positioned
                    position = elem.css("position");

                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        // IE returns 0 when zIndex is not specified
                        // other browsers return a string
                        // we ignore the case of nested elements with an explicit value of 0
                        // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt(elem.css("zIndex"), 10);

                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }

                    }

                    elem = elem.parent();

                }

            }

            return 0;
        }

    });

    $.leoTools.escapeRegex = function(value) {

        return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");

    };

    //https://github.com/LeaVerou/prefixfree/blob/gh-pages/prefixfree.js
    (function(leoTools) {

        if(!window.getComputedStyle){

            leoTools.getPrefixProperty = function(property) {

                return false;

            };

            return;

        }

        var prefixes = {}, properties = [],

            i, property, highest, prefix,

            uses, len, unprefixed, prop, Prefix, props,

            style = getComputedStyle(document.documentElement, null),

            dummy = document.createElement('div').style,

            iterate = function(property) {

                if (property.charAt(0) === '-') {

                    properties.push(property);

                    var parts = property.split('-'),
                        prefix = parts[1], shorthand;

                    prefixes[prefix] = ++prefixes[prefix] || 1;

                    while (parts.length > 3) {

                        parts.pop();

                        shorthand = parts.join('-');

                        if (supported(shorthand) && properties.indexOf(shorthand) === -1) {

                            properties.push(shorthand);

                        }

                    }

                }

            },

            camelCase = function(str) {

                return str.replace(/-([a-z])/g, function($0, $1) { return $1.toUpperCase(); }).replace('-','');

            },

            supported = function(property) {

                return camelCase(property) in dummy;

            },

            deCamelCase = function(str) {

                return str.replace(/[A-Z]/g, function($0) { return '-' + $0.toLowerCase() });

            };

        if (style.length > 0) {

            for (i = 0, len = style.length; i < len; i++) {

                iterate(style[i]);

            }

        } else {

            for (property in style) {

                iterate(deCamelCase(property));

            }

        }

        highest = {uses: 0};

        for (prefix in prefixes) {

            uses = prefixes[prefix];

            if (highest.uses < uses) {

                highest = {

                    prefix: prefix,

                    uses: uses

                };

            }

        }

        prefix = '-' + highest.prefix + '-';

        Prefix = camelCase(prefix);

        props = [];

        for (i = 0, len = properties.length; i < len; i++) {

            prop = properties[i];

            if (prop.indexOf(prefix) === 0) {

                unprefixed = prop.slice(prefix.length);


                if (!supported(unprefixed)) {

                    props.push(unprefixed);

                }

            }

        }

        if (Prefix == 'Ms' && !('transform' in dummy) && !('MsTransform' in dummy) && ('msTransform' in dummy)) {

            props.push('transform', 'transform-origin');

        }

        props.sort();

        leoTools.getPrefixProperty = function(property) {

            return (props.indexOf(property) >= 0 ? prefix : '') + property;

        };

    })($.leoTools || {});

    return $;

}));