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

        setDataFns = {},

        formatDateFns = {},

        validatorFns = {},

        dataAdapterSettings = {

            isPage: true,

            pageNum: 20, //每一页条数

            currentPage: 1,

            datatype: 'array',

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

        return function(dataType, func) {

            if (typeof dataType === "string" && $.isFunction(func)) {

                structure[dataType] = func;

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

            if (option.localData) {

                this.collection = this._setCollection();

            } else {

                this.collection = [];

            }

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

                This = this;

            page = page || this.currentPage;

            if (option.localData) {

                if (option.isPage) {

                    option.loadComplete(this._getLocalPagerInfo(page, this.collection));

                    this.currentPage = page;

                } else {

                    option.loadComplete(this.collection);

                }

            } else {

                $.ajax(this._beforeAjax(page)).done(function(data) {

                    option.loadComplete(This.collection = setCollection(option, option.getAjaxData(data)));

                }).fail(function(data) {

                    option.getCollection(data);

                }).always(function() {

                    This._afterAjax();

                });

            }

        },

        _setCollection: function(data) {

            var i = 0,

                collection = [],

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

            return collection;

        },

        _setCollectionItem: function(modeType, value, dataItem) {

            if(typeof modeType === 'string'){

                return getFns(modeType, formatDateFns)(value);

            }else if ($.isFunction(modeType)) {

                return modeType(value, dataItem);

            }

        }

    });

    $.extend(dataAdapter, {

        addSetDataFn: addToFns(setDataFns),

        addFormatDateFn: addToFns(formatDateFns),

        addValidatorFn: addToFns(validatorFns)

    });

    dataAdapter.addSetDataFn('array', function(item, mode){

        return item[mode.name];

    });

    dataAdapter.addSetDataFn('*', function(item, mode){

        return item[mode.name];

    });

    dataAdapter.addFormatDateFn('string', function(value){

        !value && (value = '');

        return value + '';

    });

    dataAdapter.addFormatDateFn('number', function(value){

        return +value || 0;

    });

    dataAdapter.addFormatDateFn('bool', function(value){

        return !!value;

    });

    dataAdapter.addFormatDateFn('*', function(value){

        return value;

    });

    leoTools.dataAdapter = function(option){

        return new dataAdapter(option);

    }

    return $;

}));