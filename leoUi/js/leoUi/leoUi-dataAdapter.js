/**
+-------------------------------------------------------------------
* jQuery leoUi--dataAdapter(数据适配器)
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;
(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["jquery"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    var leoTools = $.leoTools = $.leoTools || {},

        dataAdapter,

        DataWrapper,

        rnotwhite = (/\S+/g),

        setDataFns = {},

        methodFns = {},

        formatDateFns = {},

        validatorFns = {},

        collection = [],

        splice = Array.prototype.splice,

        dataAdapterSettings = {

            isPage: true,

            pageNum: 20, //每一页条数

            currentPage: 1,

            datatype: 'array',

            method: 'local', //local,ajax

            localData: [],

            mode: [],

            ajax: {

                url: 'leoui.com',

                type: "GET"

            },

            ajaxParam: function(ajax, currentPage) {},

            beforeAjax: function() {},

            afterAjax: function() {},

            getAjaxData: function(data) {

                return data;

            },

            loadComplete: function(data) {}

        };

    function addToFns(structure) {

        return function(dataTypes, func) {

            if (typeof dataTypes === "string" && $.isFunction(func)) {

                var dataType, i = 0;

                dataTypes = dataTypes.toLowerCase().match(rnotwhite) || [];

                while ((dataType = dataTypes[i++])) {

                    structure[dataType] = func;

                }

            }
        };

    };

    function getFns(prop, obj) {

        return obj[prop] || obj['*'] || $.noop;

    };

    dataAdapter = function(option) {

        this.option = $.extend({}, dataAdapterSettings, option);

        this._init();

    }

    $.extend(dataAdapter.prototype, {

        _init: function() {

            var option = this.option;

            if (option.isPage) {

                this.currentPage = option.currentPage;

            }

        },

        _beforeAjax: function(currentPage) {

            var ajax = $.extend({}, ajaxParam),

                option = this.option,

                ajaxParam = option.ajaxParam(ajax, currentPage);

            !ajaxParam && (ajaxParam = ajax);

            option.beforeAjax();

            return ajaxParam;

        },

        _afterAjax: function() {

            this.option.afterAjax();

        },

        _getCollection: function(clone) {

            return clone ? $.extend(true, [], collection) : collection;

        },

        _getLocalPagerInfo: function(page, collection) {

            var totalItems = collection.length,

                option = this.option,

                pageNum = option.pageNum,

                fristItem, fristItems,

                totalpages = Math.ceil(totalItems / pageNum);

            if (page >= 1 && page <= totalpages) {

                fristItem = pageNum * (page - 1);

                lastItem = fristItem + pageNum;

                return collection.slice(fristItem, lastItem);

            } else {

                return [];

            }

        },

        dataBind: function(page) {

            this._getData(page);

            return this;

        },

        _getData: function(page) {

            var option = this.option,

                methodFn = getFns(option.method, methodFns);

            methodFn.call(this, option, page || this.currentPage, this);

            return this;

        },

        _setCollection: function(data) {

            var i = 0,

                len, j, modeLen,

                option = this.option,

                mode = this.option.mode,

                modeLen = mode.length,

                datatype = option.datatype,

                setDataFn = getFns(datatype, setDataFns),

                collectionItem, dataItem, modeItem;

            data = data || option.localData;

            len = data.length;

            for (; i < len; i++) {

                dataItem = data[i];

                j = 0;

                collectionItem = [];

                for (; j < modeLen; j++) {

                    modeItem = mode[j];

                    collectionItem.push(this._setCollectionItem(modeItem.type, setDataFn(dataItem, modeItem), dataItem));

                }

                collection.push(collectionItem);

            }

        },

        _setCollectionItem: function(modeType, value, dataItem) {

            if (typeof modeType === 'string') {

                return getFns(modeType, formatDateFns)(value);

            } else if ($.isFunction(modeType)) {

                return modeType(value, dataItem);

            }

        },

        saveRow:function(data, index, isValidator){

            if(typeof data !== 'object')return;

            var option = this.option, i = 0, modeItem,

            mode = option.mode, saveInfo = { passed: true, info: []},

            len = mode.length;

            index = index || 0;

            for(; i < len; i++){

                modeItem = mode[i];

                this._validatorRow(data, modeItem, saveInfo);

            }


        },

        _validatorRow:function(data, mode, saveInfo){

            var validator = mode.validator, flag;

            if(typeof validator === 'string'){

                validator = validator.match(rnotwhite) || [];

            }else if($.isArray(validator)){



            }

        },

        _validator:function(val, name, validators){

            var i = 0, len = validators.length, validator,

            info = [], obj;

            for(; i < len; i++){

                if((validator = validators[i]){

                    if((typeof validator === 'string') && $.isFunction(validatorFns[validator])){

                        obj = validatorFns[validator](val);

                        obj.name = name;

                        info.push(obj);

                    }else if((typeof validator === 'object') && $.isFunction(validatorFns[validator[0]])){

                        obj = validatorFns[obj = validatorFns[validator](val, validator[1]);

                        obj.name = name;

                        info.push(obj);

                    }else if($.isFunction(validator)){

                        obj = validator(val);

                        obj.name = name;

                        info.push(obj);

                    }

                }

            }

            return info;

        }

    });

    $.extend(dataAdapter, {

        addMethodFn: addToFns(methodFns),

        addSetDataFn: addToFns(setDataFns),

        addFormatDateFn: addToFns(formatDateFns),

        addValidatorFn: addToFns(validatorFns)

    });

    dataAdapter.addValidatorFn('*', function(val) {

        return {

            passed: true,

            info: ''

        };

    });

    dataAdapter.addValidatorFn('required', function(val, info) {

        if(typeof val !== 'undefined'){

            return {

                passed: true,

                info: ''

            };

        }else{

            return {

                passed: true,

                info: info || '不能为空'

            };

        }

    });

    dataAdapter.addValidatorFn('number', function(val, info) {

        if(typeof val === 'number'){

            return {

                passed: true,

                info: ''

            };

        }else{

            return {

                passed: true,

                info: info || '不是数字'

            };

        }

    });

    dataAdapter.addValidatorFn('string', function(val) {

        if(typeof val === 'string'){

            return {

                passed: true,

                info: ''

            };

        }else{

            return {

                passed: true,

                info: info || '不是字符串'

            };

        }

    });

    dataAdapter.addMethodFn('local *', function(option, page, dataAdapter) {

        this._setCollection();

        if (option.isPage) {

            option.loadComplete(this._getLocalPagerInfo(page, this._getCollection(true)));

            this.currentPage = page;

        } else {

            option.loadComplete(this._getCollection(true));

        }

    });

    dataAdapter.addMethodFn('ajax', function(option, page, dataAdapter) {

        var This = this;

        $.ajax(this._beforeAjax(page)).done(function(data) {

            this._setCollection(option.getAjaxData(data));

            option.loadComplete(this._getCollection(true));

        }).fail(function(data) {

            option.loadComplete(data);

        }).always(function() {

            This._afterAjax();

        });

    });

    dataAdapter.addSetDataFn('array *', function(item, mode) {

        return item[mode.name];

    });

    dataAdapter.addFormatDateFn('string', function(value) {

        !value && (value = '');

        return value + '';

    });

    dataAdapter.addFormatDateFn('number', function(value) {

        return +value || 0;

    });

    dataAdapter.addFormatDateFn('bool', function(value) {

        return !!value;

    });

    dataAdapter.addFormatDateFn('*', function(value) {

        return value;

    });

    leoTools.dataAdapter = function(option) {

        return new dataAdapter(option);

    }

    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1,

        isArrayLike = function(collection) {

            var length = collection && collection.length;

            return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;

        };

    DataWrapper = $.leoTools.dataAdapter.DataWrapper = function(data) {

        this.setData(data);

    };

    DataWrapper.addMethodFn = function(names, fn) {

        if (typeof names === "string" && $.isFunction(fn)) {

            var name, i = 0;

            names = names.toLowerCase().match(rnotwhite) || [];

            while ((name = names[i++])) {

                DataWrapper.prototype[name] = fn;

            }

        }

    };

    $.extend(DataWrapper.prototype, {

        getRow: function(first, last) {

            this.data = this.data.slice(first, last);

            return this;

        },

        setData: function(data){

            if (isArrayLike(data)) {

                this.data = $.extend(true, [], data);

            } else {

                this.data = [];

            }

            return this;

        },

        getData: function() {

            return $.extend(true, [], this.data);

        },

        clone: function() {

            return new DataWrapper(this.getData());

        },

        splice: function() {

            splice.apply(this.data, arguments);

            return this;

        },

        findRow: function(predicate) {

            if ($.isFunction(predicate)) {

                this.data = $.grep(this.data, predicate);

            }

            return this;

        },

        map: function(predicate) {

            if ($.isFunction(predicate)) {

                this.data = $.map(this.data, predicate);

            }

            return this;

        },

        sortBy: function(iteratee) {

            if ($.isFunction(iteratee)) {

                this.data.sort(iteratee);

            }

            return this;

        }

    });

    return $;

}));
