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

        leoToosDataAdapt,

        rnotwhite = (/\S+/g),

        setDataFns = {},

        methodFns = {},

        formatDateFns = {},

        validatorFns = {},

        splice = Array.prototype.splice,

        dataAdapterSettings = {

            datatype: 'object',//object,array

            method: 'local', //local,ajax

            pageMethod:'local', //local,ajax

            localData: [],

            mode: [],

            ajax: {

                url: 'leoui.com',

                type: "GET"

            },

            isPage: true,

            pageSize: 20,

            firstPage: 1,

            ajaxParam: function(ajax, data) {},

            beforeAjax: function() {},

            afterAjax: function() {},

            filterData: null,//data

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

        var collection = [];

        this._getCollection = function(clone) {

            return clone ? $.extend(true, [], collection) : collection;

        }

        this._setCollection = function(data) {

            return collection = data;

        }

        this.setOption(option);

        this.option.isPage && (this.currentPage = this.option.currentPage || 1);

        this._init();

    }

    $.extend(dataAdapter.prototype, {

        _init: function() {

            var option = this.option;

            if(!$.isArray(option.mode) || option.mode.length === 0){

                return $.error('mode不规范！');

            }

        },

        getOption:function(){

            return $.extend({}, this.option);

        },

        getCurrentPage:function(){

            return this.currentPage || 0;

        },

        getPageData:function(page){

            var option = this.option, pageInfo, data = {};

            if(option.isPage){

                typeof page === 'undefined' && (page = this.currentPage);

                page = page >> 0;

                if(option.pageMethod === 'local'){

                    pageInfo = this._getLocalPageInfo(page);

                    if(pageInfo.isPageInfo){

                        data.pageData = this._getLocalPageData(pageInfo);

                        data.pageInfo = pageInfo;

                        this.currentPage = page;

                    }

                }else if(option.pageMethod === 'ajax'){

                    this._getData({page: page});

                }


            }

            return data;

        },

        getLocalPageInfo:function(){

            return _getLocalPageInfo();

        },

        _getLocalPageInfo: function(page, collection) {

            if(!this.option.isPage)return;

            var totalItems = (collection ? collection : this._getCollection()).length,

            op = this.option, pageSize = op.pageSize, remainder,

            fristItem, isLastPage, lastItem, pageInfo, totalpages;

            if(totalItems === 0 || page < 1 || page > (totalpages = Math.ceil(totalItems / pageSize))){

                return {}

            }else{

                fristItem = pageSize * (page - 1);

                isLastPage = totalpages === page;

                lastItem = fristItem + (isLastPage ? (remainder = totalItems % pageSize) === 0 ? pageSize : remainder : pageSize);

                return {

                    isPageInfo: true,

                    fristPage: 1,

                    isFristPage: page === 1,

                    lastPage: totalpages,

                    isLastPage: isLastPage,

                    totalpages: totalpages,

                    currentPage: page,

                    fristItem: fristItem,

                    lastItem: lastItem,

                    fristItemShow: fristItem + 1,

                    lastItemShow: lastItem,

                    currentItems: lastItem - fristItem

                }

            }

        },

        _getLocalPageData:function(pageInfo, collection){

            if(!this.option.isPage)return;

            if(pageInfo && pageInfo.isPageInfo){

                !collection && (collection = this._getCollection());

                return collection.slice(pageInfo.fristItem, pageInfo.lastItem);

            }else{

                return [];

            }

        },

        setOption:function(option){

            if(!$.isPlainObject(option))return;

            this.option = $.extend({}, dataAdapterSettings, this.option || {}, option);

            return this;

        },

        dataBind: function() {

            this._getData();

            return this;

        },

        _getData: function(data) {

            var option = this.option,

                methodFn = getFns(option.method, methodFns);

            methodFn.call(this, option, data || {}, this);

            return this;

        },

        _dataToCollection: function(data) {

            var i = 0, len, j, modeLen, collection = [],

            option = this.option,

            filterData = option.filterData,

            mode = option.mode,

            modeLen = mode.length,

            datatype = option.datatype,

            setDataFn = getFns(datatype, setDataFns),

            collectionItem, dataItem, modeItem;

            data = data || option.localData;

            !!filterData && (data = filterData(data));

            len = data.length;

            for (; i < len; i++) {

                dataItem = data[i];

                j = 0;

                collectionItem = {};

                for (; j < modeLen; j++) {

                    modeItem = mode[j];

                    collectionItem[modeItem.name] = this._setCollectionItem(modeItem.type, setDataFn(dataItem, modeItem), dataItem);

                }

                collection.push(collectionItem);

            }

            this._setCollection(collection);

        },

        _setCollectionItem: function(modeType, value) {

            if (typeof modeType === 'string') {

                return getFns(modeType, formatDateFns)(value);

            }

        },

        updateCell:function(val, cellIndex, rowIndex, notValidator){

            var saveInfo = this.validatorCell(val, cellIndex, rowIndex, notValidator);

            if(saveInfo.passed === true){

                this._updateCell(saveInfo.item, saveInfo.cellName, saveInfo.rowIndex);

            }

            return saveInfo;

        },

        _getMode:function(name){

            var mode = this.option.mode, i;

            if(typeof name === 'string'){

                i = mode.length

                while(i--){

                    if(name === mode[i].name){

                        return mode[i];

                    }

                }

            }

            if(typeof +name === 'number' && mode[name]){

                return mode[name];

            }

        },

        validatorCell:function(val, cellIndex, rowIndex, notValidator){

            var cellMode, name, validatorVal, saveInfo;

            if(typeof val === 'undefined')return false;

            if(typeof rowIndex === 'undefined'){

                rowIndex = 0

            }else if(!this._isCollectionRowIndex(rowIndex)){

                return false;

            }

            if(typeof cellIndex === 'undefined'){

                cellIndex = 0

            }

            if(!(cellMode = this._getMode(cellIndex))){

                return false;

            }

            name = cellMode.name;

            saveInfo = {passed: true, validatorInfo:{}};

            validatorVal = this._validatorCell(val, cellMode.validator, notValidator);

            if(validatorVal === true){

                saveInfo.item = this._setCollectionItem(cellMode.type, val), cellIndex, rowIndex;

            }else{

                saveInfo.passed = false;

            }

            saveInfo.cellName = name;

            saveInfo.validatorInfo[name] = validatorVal;

            saveInfo.rowIndex = rowIndex;

            return saveInfo;

        },

        _isCollectionRowIndex:function(rowIndex){

            return 0 <= rowIndex && rowIndex < this._getCollection().length;

        },

        _updateCell:function(val, cellName, rowIndex){

            this._getCollection()[rowIndex][cellName] = val;

        },

        _changeRow:function(data, rowIndex, method, notValidator){

            var saveInfo = this.validatorRow(data, rowIndex, notValidator);

            if(saveInfo.passed === true){

                !!this[method] && this[method](saveInfo.collectionItem, saveInfo.rowIndex);

            }

            return saveInfo;

        },

        updateRow:function(data, rowIndex, notValidator){

            return this._changeRow(data, rowIndex, "_updateRow", notValidator);

        },

        appendRow:function(data, rowIndex, notValidator){

            return this._changeRow(data, rowIndex, "_appendRow", notValidator);

        },

        prependRow:function(data, rowIndex, notValidator){

            return this._changeRow(data, rowIndex, "_prependRow", notValidator);

        },

        _prependRow:function(data, rowIndex){

            this._getCollection().splice(rowIndex, 0, data);

        },

        _appendRow:function(data, rowIndex){

            this._getCollection().splice(rowIndex + 1, 0, data);

        },

        validatorRow:function(data, rowIndex, notValidator){

            if(typeof data !== 'object')return false;

            if(typeof rowIndex === 'undefined'){

                rowIndex = 0

            }else if(!this._isCollectionRowIndex(rowIndex)){

                return false;

            }

            var option = this.option, i = 0, modeItem,

            mode = option.mode, saveInfo = { passed: true, validatorInfo: {}, collectionItem: {}},

            len = mode.length, validatorVal, name, val;

            for(; i < len; i++){

                modeItem = mode[i];

                name = modeItem.name;

                val = data[name];

                validatorVal = this._validatorCell(val, modeItem.validator, notValidator);

                if(validatorVal === true){

                    saveInfo.collectionItem[name] = this._setCollectionItem(modeItem.type, val);

                }else{

                    saveInfo.passed = false;

                }

                saveInfo.validatorInfo[name] = validatorVal;

            }

            saveInfo.passed === false && (saveInfo.collectionItem = {});

            saveInfo.rowIndex = rowIndex;

            return saveInfo;

        },

        deleteRow:function(rowIndex){

            if(typeof rowIndex === 'undefined'){

                rowIndex = 0

            }else if(!this._isCollectionRowIndex(rowIndex)){

                return false;

            }

            this._getCollection().splice(rowIndex, 1);

            return true;

        },

        _updateRow:function(data, rowIndex){

            this._getCollection().splice(rowIndex, 1, data);

        },

        _validatorCell:function(val, validator, notValidator){

            if(notValidator){

                return true;

            }else if(typeof validator === 'string'){

                validator = validator.match(rnotwhite) || [];

                return this._validator(val, validator);

            }else if($.isArray(validator)){

                return this._validator(val, validator);

            }else if($.isFunction(validator)){

                return validator(val);

            }else {

                return true;

            }

        },

        dataWrapper:function(data){

            return new DataWrapper(data);

        },

        _validator:function(val, validators){

            var i = 0, len = validators.length, validator,

            validatorVal;

            for(; i < len; i++){

                if((validator = validators[i])){

                    if((typeof validator === 'string') && $.isFunction(validatorFns[validator])){

                        validatorVal = validatorFns[validator](val);

                        if(validatorVal !== true){

                            return validatorVal;

                        }

                    }else if((typeof validator === 'object') && $.isFunction(validatorFns[validator[0]])){

                        validatorVal = validatorFns[validator[0]](val, validator[1]);

                        if(validatorVal !== true){

                            return validatorVal;

                        }

                    }else if($.isFunction(validator)){

                        validatorVal = validator(val);

                        if(validatorVal !== true){

                            return validatorVal;

                        }

                    }

                }

            }

            return true;

        }

    });

    leoToosDataAdapt = leoTools.dataAdapter = function(option) {

        return new dataAdapter(option);

    }

    $.extend(leoToosDataAdapt, {

        addMethodFn: addToFns(methodFns),

        addSetDataFn: addToFns(setDataFns),

        addFormatDateFn: addToFns(formatDateFns),

        addValidatorFn: addToFns(validatorFns)

    });

    leoToosDataAdapt.addValidatorFn('*', function(val) {

        return true;

    });

    leoToosDataAdapt.addValidatorFn('required', function(val, info) {

        if(typeof val !== 'undefined'){

            return true

        }else{

            return info || '必填字段';

        }

    });

    leoToosDataAdapt.addValidatorFn('number', function(val, info) {

        if(typeof val === 'number'){

            return true;

        }else{

            return info || '不是数字';

        }

    });

    leoToosDataAdapt.addValidatorFn('string', function(val, info) {

        if(typeof val === 'string'){

            return true;

        }else{

            return info || '不是字符串';

        }

    });

    leoToosDataAdapt.addMethodFn('local *', function(option, data, dataAdapter) {

        this._dataToCollection();

        option.loadComplete.call(this, this._getCollection(true));

    });

    leoToosDataAdapt.addMethodFn('ajax', function(option, arg, dataAdapter) {

        var ajaxParam = option.ajaxParam(option, arg) || ajaxParam;

        option.beforeAjax();

        $.ajax(ajaxParam).done(function(data) {

            this._dataToCollection(data);

            option.loadComplete.call(this, this._getCollection(true));

            if(option.isPage && option.pageMethod === 'ajax'){

                dataAdapter.currentPage = arg.page;

            }

        }).fail(function(data) {

            $.error("ajax error");

        }).always(function() {

            option.afterAjax();

        });

    });

    leoToosDataAdapt.addSetDataFn('object *', function(item, mode) {

        return item[mode.name];

    });

    leoToosDataAdapt.addFormatDateFn('string', function(value) {

        !value && (value = '');

        return value + '';

    });

    leoToosDataAdapt.addFormatDateFn('number', function(value) {

        return +value || 0;

    });

    leoToosDataAdapt.addFormatDateFn('bool', function(value) {

        return !!value;

    });

    leoToosDataAdapt.addFormatDateFn('*', function(value) {

        return value;

    });

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

        getData: function(clone) {

            return !clone ? this.data : $.extend(true, [], this.data);

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
