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

        formatDataFns = {},

        validatorFns = {},

        sortDataFns = {},

        searchDataFns = {},

        splice = Array.prototype.splice,

        dataAdapterSettings = {

            datatype: 'object',//object,array

            method: 'local', //local,ajax

            pageMethod:'local', //local,ajax

            localData: [],

            mode: [],

            ajax: {

                url: 'leUi.com',

                type: "GET"

            },

            search: {

                rword: /[^, ]+/g,

                keys: 'all',

                searchDataFnName: 'in',

                valsLogic: 'or'//and, or

            },

            isPage: true,

            pageSize: 20,

            currentPage: 1,

            ajaxParam: function(ajax, data) {},

            loadPageComplete:function(data){},

            beforeAjax: function() {},

            afterAjax: function() {},

            filterData: null,//data

            loadComplete: function(data) {},

            setAjaxPageInfo: null//data, page

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

        this._setCollection = function(data, noBackup) {

            !noBackup && (this.backupCollection = data);

            return collection = data;

        }

        this.setOption(option);

        this.sort = {

            status: 'normal'//asc, desc, normal

        }

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

        setCurrentPage:function(page){

            if(page >= 0){

                this.currentPage = page;

            }

        },

        getCurrentPage:function(){

            return this.currentPage || 0;

        },

        _getRecord:function(id){

            if(id >= 0){

                var collection = this._getCollection();

                i = collection.length;

                while(i--){

                    if(collection[i].__id == id){

                        return $.extend({}, collection[i]);

                    }

                }

            }

        },

        getPageData:function(page, param){

            var option = this.option, pageInfo, data = {}, This = this;

            if(option.isPage){

                typeof page === 'undefined' && (page = this.currentPage);

                page = page >> 0;

                if(option.pageMethod === 'local'){

                    pageInfo = this._getLocalPageInfo(page);

                    if(pageInfo.isPageInfo){

                        data.pageData = this._getLocalPageData(pageInfo);

                        data.pageInfo = pageInfo;

                    }

                    this.currentPage = page;

                    return $.Deferred().resolve(this._loadPageComplete(data, page));

                }else if(option.pageMethod === 'ajax'){

                    return this._getData($.extend({page: page}, param), 'ajax').then(function(data){

                        return This._loadPageComplete(This._getAjaxPageInfo(data, page), page);

                    });

                }

            }

        },

        localSortby:function(status, key, sortType){

            var sort = this.sort;

            if(key && sort.status !== status){

                if(status === 'reload'){

                    status = sort.status;

                }

                !sortType && (sortType = this._getMode(key).type);

                if(status === 'asc' || status === 'desc'){

                    this._sortby(this._getCollection(), key, sortType, status);

                }else if(status === 'normal'){

                    this._restoreSortCollection();

                }

                sort.status = status;

            }

            return this;

        },

        _restoreSortCollection:function(collection){

            var collection = this._getCollection();

            collection.sort(function(a, b){

                return a.__id - b.__id;

            });

        },

        _setId:function(collection){

            var i = 0, len = collection.length;

            for(; i < len; i++){

                collection[i].__id = i;

            }

        },

        _sortby:function(collection, key, sortType, status){

            var sortFn;

            if($.isFunction(sortType)){

                collection.sort(function(a, b){

                    return sortType(a, b, status);

                });

            }else{

                sortFn = getFns(sortType, sortDataFns);

                collection.sort(function(a, b){

                    if(status === 'asc'){

                        return sortFn(a[key], b[key]);

                    }else if(status === 'desc'){

                        return sortFn(b[key], a[key]);

                    }

                });

            }

        },

        _getAjaxPageInfo:function(data, page){

            var pageObj, option = this.option, collection;

            collection = this._getCollection(true);

            if(option.setAjaxPageInfo){

                pageInfo = option.setAjaxPageInfo(data);

            }

            if(pageInfo.currentPage < 0 || typeof pageInfo.fristItemShow === 'undefined'){

                $.error('pageInfo不完整');

            }

            this.currentPage = pageInfo.currentPage;

            this._dataToCollection(data, pageInfo);

            pageObj = {

                pageData: this._getCollection(true),

                pageInfo: pageInfo

            }

            return pageObj;

        },

        _loadPageComplete:function(data, page){

            this.option.loadPageComplete.call(this, data);

            return data;

        },

        _loadComplete:function(data){

            var collection;

            this._dataToCollection(data);

            collection = this._getCollection(true);

            this.option.loadComplete.call(this, collection);

            return collection;

        },

        getLocalPageInfo:function(){

            return _getLocalPageInfo();

        },

        _getLocalPageInfo: function(page, collection) {

            if(!this.option.isPage)return;

            var totalItems = (typeof collection === 'undefined' ? this._getCollection() : collection).length,

            op = this.option, pageSize = op.pageSize, remainder,

            fristItem, isLastPage, lastItem, pageInfo, totalpages;

            if(totalItems === 0 || page < 1 || page > (totalpages = Math.ceil(totalItems / pageSize))){

                return {}

            }else{

                fristItem = pageSize * (page - 1);

                isLastPage = totalpages === page;

                lastItem = fristItem + (+(isLastPage ? (remainder = totalItems % pageSize) === 0 ? pageSize : remainder : pageSize));

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

        getData: function(data) {

            var This = this;

            return this._getData(data).then(function(data){

                return This._loadComplete(data);

            });

        },

        _getData: function(data, method) {

            var option = this.option,

            methodFn = getFns(method || option.method, methodFns);

            return methodFn.call(this, option, data || {}, this) || this;

        },

        _dataToCollection: function(data, pageInfo) {

            var i = 0, len, j, modeLen, collection = [],

            option = this.option,

            filterData = option.filterData,

            mode = option.mode,

            id = pageInfo ? pageInfo.fristItemShow - 1 : 0,

            modeLen = mode.length,

            datatype = option.datatype,

            setDataFn = getFns(datatype, setDataFns),

            collectionItem, dataItem, modeItem;

            data = data || option.localData;

            !!filterData && (data = filterData(data, option) || []);

            len = data.length;

            for (; i < len; i++) {

                dataItem = data[i];

                j = 0;

                collectionItem = {};

                for (; j < modeLen; j++) {

                    modeItem = mode[j];

                    collectionItem[modeItem.name] = this._setCollectionItem(modeItem.type, setDataFn(dataItem, modeItem), dataItem);

                }

                collectionItem.__id = id ++;

                collection.push(collectionItem);

            }

            this._setCollection(collection);

        },

        _setCollectionItem: function(modeType, value) {

            if (typeof modeType === 'string') {

                return getFns(modeType, formatDataFns)(value);

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

                i = mode.length;

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

            var collection = this._getCollection();

            collection.splice(rowIndex, 0, data);

            this._setId(collection);

        },

        _appendRow:function(data, rowIndex){

            var collection = this._getCollection();

            collection.splice(rowIndex + 1, 0, data);

            this._setId(collection);

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

            var collection = this._getCollection();

            collection.splice(rowIndex, 1, data);

            this._setId(collection);

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

            return new DataWrapper(data || this._getCollection());

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

        },

        _getModeNames:function(type){

            var mode = this.option.mode, arr,

            i = 0, len = mode.length;

            type === 'object' ? arr = {} : arr = [];

            for(; i < len; i++){

                if(type === 'object'){

                    arr[mode[i].name] = true;

                }else{

                    arr.push(mode[i].name);

                }

            }

            return arr;

        },

        _getSearchValsArr:function(vals, rword){

            var arr = [], reObj = {};

            vals.replace(rword, function(name){

                if(!reObj[name]){

                    arr.push(name);

                    reObj[name] = true;

                }

            });

            return arr;

        },

        _getSearchKeysArr:function(keys){

            var modeNames, rword, key, arr, reObj;

            if(keys === 'all'){

                return this._getModeNames();

            }

            if(keys.length === 0)return [];

            if(typeof keys === 'string'){

                keys = keys.split(/(?:,| )/);

            }

            modeNames = this._getModeNames('object');

            i = keys.length;

            arr = [];

            reObj = {};

            while(i--){

                key = keys[i];

                if(modeNames[key] && !reObj[key]){

                    arr.push(key);

                    reObj[key] = true;

                }


            }

            return arr;

        },

        localSearchReset:function(){

            this._setCollection(this.backupCollection, true);

            return this;

        },

        localSearch:function(val, fn){

            var collection = this._getCollection(), row,

            i = 0, len = collection.length, searchCollection = [],

            search = this.option.search,

            vals = this._getSearchValsArr(val, search.rword),

            keys = this._getSearchKeysArr(search.keys),

            searchDataFn = this._getSearchDataFns(search.searchDataFnName);

            if($.isFunction(fn)){

                searchCollection = fn(vals, keys, collection, searchDataFn, option);

            }else{

                for(; i < len; i++){

                    row = collection[i];

                    this._searchKey(vals, keys, row, searchDataFn) && searchCollection.push(row);

                }

            }

            this._setCollection(searchCollection, true);

            return this;

        },

        _searchKey:function(vals, keys, row, searchDataFn){

            var i, search = this.option.search,

            valsLogic = search.valsLogic,

            searchVals = vals, searchValsLen = vals.length,

            flag = false, searchDataVal;

            i = keys.length;

            while(i--){

                searchVals = this._searchData(searchVals, row[keys[i]], searchDataFn, valsLogic);

                if(valsLogic === 'or'){

                    if(searchValsLen > searchVals.length){

                        return true;

                    }

                }else if(valsLogic === 'and'){

                    if(searchVals.length === 0){

                        return true;

                    }

                }

            }

            return flag;

        },

        _searchData:function(vals, data, searchDataFn, valsLogic){

            var i = vals.length, arr = [];

            while(i--){

                !searchDataFn(vals[i], data) && arr.push(vals[i]);

            }

            return arr;

        },

        _getSearchDataFns:function(method){

            return getFns(method, searchDataFns);

        }

    });

    leoToosDataAdapt = leoTools.dataAdapter = function(option) {

        return new dataAdapter(option);

    }

    $.extend(leoToosDataAdapt, {

        addMethodFn: addToFns(methodFns),

        addSetDataFn: addToFns(setDataFns),

        addFormatDataFn: addToFns(formatDataFns),

        addValidatorFn: addToFns(validatorFns),

        addSortData: addToFns(sortDataFns),

        addSearchData: addToFns(searchDataFns)

    });

    leoToosDataAdapt.addSearchData('equal *', function(val, data) {

        return val === data;

    });

    leoToosDataAdapt.addSearchData('in', function(val, data) {

        return String(data).indexOf(val) > -1;

    });

    leoToosDataAdapt.addSortData('string', function(a, b) {

        return a.localeCompare(b);

    });

    leoToosDataAdapt.addSortData('number', function(a, b) {

        return a - b;

    });

    leoToosDataAdapt.addSortData('bool', function(a, b) {

        return !!value;

    });

    leoToosDataAdapt.addSortData('date', function(a, b) {

        return Date.parse(a.replace(/\-/g,'/')) - Date.parse(b.replace(/\-/g,'/'));

    });

    leoToosDataAdapt.addSortData('*', function(a, b) {

        return true;

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

    leoToosDataAdapt.addMethodFn('local *', function(option, arg, dataAdapter) {

        return $.Deferred().resolve();

    });

    leoToosDataAdapt.addMethodFn('ajax', function(option, arg, dataAdapter) {

        var ajaxParam = option.ajaxParam(option, arg) || option.ajax;

        option.beforeAjax();

        return dataAdapter.ajax = $.ajax(ajaxParam).always(function(data){

            option.afterAjax(data);

        });

    });

    leoToosDataAdapt.addSetDataFn('object *', function(item, mode) {

        return item[mode.name];

    });

    leoToosDataAdapt.addFormatDataFn('string', function(value) {

        !value && (value = '');

        return value + '';

    });

    leoToosDataAdapt.addFormatDataFn('number', function(value) {

        return +value || 0;

    });

    leoToosDataAdapt.addFormatDataFn('bool', function(value) {

        return !!value;

    });

    leoToosDataAdapt.addFormatDataFn('*', function(value) {

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

            while((name = names[i++])){

                DataWrapper.prototype[name] = fn;

            }

        }

    };

    $.extend(DataWrapper.prototype, {

        length: function(){

            return this.data.length;

        },

        getRow: function(index) {

            return this.data[index];

        },

        getRows: function(first, last) {

            return this.data.slice(first, last) || [];

        },

        setData: function(data){

            if(isArrayLike(data)){

                this.data = $.extend(true, [], data);

            }else{

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

            return splice.apply($.extend(true, [], this.data), arguments);

        },

        findRow: function(predicate){

            if($.isFunction(predicate)){

                var data = this.data,

                i = 0, len = data.length;

                for(; i < len; i++){

                    if(predicate(data[i])){

                        return data[i];

                    }

                }

            }

            return {};

        },

        map: function(predicate){

            if($.isFunction(predicate)){

                return $.map(this.data, predicate);

            }

        },

        sortBy: function(iteratee){

            if($.isFunction(iteratee)){

                return $.extend(true, [], this.data).sort(iteratee);

            }

        }

    });

    return $;

}));
