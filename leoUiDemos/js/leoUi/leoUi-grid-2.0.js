/**
+-------------------------------------------------------------------
* jQuery leoUi--grid
+-------------------------------------------------------------------
* @version    2.0.0 beta
* @author     leo
* 把数据层抽出来
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($, template) {

    $.leoTools.plugIn({

    	name:'leoGrid',

        version:'2.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            disabled:false,//如果设置为true禁用grid

            tableModel:[],//grid格式见例子

            disabledCheck:false,//禁用选择

            disabledEvent:false,//是否禁用事件

            hoverClass:'leoUi-state-hover',//移入添加的类名称

            evenClass:'leoUi-priority-secondary',//为表身的偶数行添加一个类名，以实现斑马线效果。false 没有

            activeClass:'leoUi-state-highlight',//选中效果

            boxCheckType:'multiple',//radio单选，multiple多选,false无

            tableModelDefault:{

                width:100,//宽

                type:'text',//类型

                theadName:'',//对应的表头内容

                tdClass:false,//加上的class

                tdStyle:false,

                thStyle:false,

                thClass:false,

                editInit:false,

                resize:false,//是否可调整宽度

                sortable:false,//是否排序

                fixed:false,//是否固定

                cellLayout:5,//宽度以外的值

                minWidth:10,//最小宽度

                dragMinWidth:10,//拖动最小宽度

                renderCell:null,//为每一个单元格渲染内容

                edit:false,//是否可以编辑

                initEdit:false,

                beforeEdit:false,

                getSaveCellVal:false,

                saveCell:false,

                validator:false,

                sortableType:false//自定义列的本地排序取值的类型

            },

            getParam:'id',

            virtualScroll:false,//是否使用虚拟滚动（大数据时使用）

            virtualScrollAddRows:2,//虚拟滚动添加的条数

            sortAjax:false,//ajax排序

            searchAjax:false,//ajax搜索

            footerShow:true,//是否显示底边栏

            rowList:[20,30,50],//每一页可选条数

            cellEdit:false,//是否可编辑单元格

            beforeRowEdit:$.noop,

            height:500,//设置表格的高度(可用函数返回值)

            width:500,//设置表格的宽度(可用函数返回值)

            tableLoadCallback:$.noop,//table完成后回调

            clickTrCallback:$.noop,//点击bodyTableTR回调

            clickTdCallback:$.noop,//点击bodyTableTD回调

            scrollWidth:17

        },

        _init:function(){

            this._initVar();

            this._setGridIds();

            this._createGridBox();

        },

        _initVar:function(){

            this.tableOption = {};

            this.tableSize = {

                width:0,

                tableWidth:0,

                tableOuterWidth:0,

                tbaleHeight:0,

                lastIsScroll:'first',

                fixedOuterWidth:0,

                changeCellLen:0,

                cellSize:[]

            };

            this.leoGrid = $.leoTools.getId('Grid') + '_';

            this.records = [];

            this.pageInfo = {};

            this.tableCache = {};

            this.select = {};

            this.sort = {

                lastSpan: null,

                colsStatus: {},

                info: {},

                status: {

                    0: 'normal',

                    1: 'asc',

                    2: 'desc'

                }

            };

            this.searchInfo = {};

            this.resize = {

                isResize: false,

                dargLine: null,

                width: undefined

            };

            this.editCell = null;

            this.editRow = null;

            this.ajaxParam = {};

            this.virtualScroll = {};

            this.reloadSelectRow();

        },

        _createGridBox:function(){

            var tableCache = this.tableCache;

            tableCache.$gridBox = $(this._renderGrid());

            tableCache.$gridHeadDiv = tableCache.$gridBox.find('div.leoUi-jqgrid-hdiv');

            tableCache.$gridBodyDiv = tableCache.$gridBox.find('div.leoUi-jqgrid-bdiv');

            tableCache.$gridOverlay = tableCache.$gridBox.find('#' + this.gridIds.overlay_grid);

            tableCache.$gridLoad = tableCache.$gridBox.find('#' + this.gridIds.load_grid);

            tableCache.$gridStyle = tableCache.$gridBox.find('#' + this.gridIds.grid_style);

            this._getTableModels();

            this._renderGridHead();

            this._renderGridBody();

            this._storeInit();

            this._renderGridFooter();

            this._getChangeCellPercent();

            this._addEvent();

            tableCache.$gridBox.appendTo(this.$target);

            this.refreshTable();

            this._storeDataBind();

        },

        renderGridBody:function(data){

            this._setMultipleCheckBoxSelect();

            this.options.virtualScroll ? this._renderVSGridBodyTbody() : this._renderGridBodyTbody(data || this.records.getData());

            this.refreshTable();

            this._isAllCheckBoxSelected();

            this.options.tableLoadCallback();

        },

        _loadComplete:function(data, noChangePage){

            this.records = this.source.dataWrapper(data);

            this.renderGridBody();

            !noChangePage && this._setNoPageFooterRight();

            this.loadHide();

        },

        _loadPageComplete:function(data){

            this.records = this.source.dataWrapper(data.pageData);

            this.pageInfo = data.pageInfo || {};

            this._reloadMultipleSelectRowCurrentLen();

            this.renderGridBody();

            this._changeFooterCenter();

            this.loadHide();

        },

        _storeInit:function(){

            var This = this;

            this.source = this.options.source;

        },

        setDisabledEvent:function(flag){

            this.options.disabledEvent = !!flag;

        },

        setPage:function(page){

            var source = this.source, sourceOp = source.option;

            if(sourceOp.isPage){

                page = this._setPage(page);

                if(page !== false){

                    this.loadShow();

                    !!source.ajax && source.ajax.abort();

                    !this.options.sortAjax && (sourceOp.pageMethod ==='ajax') && this._restoreSort();

                    source.getPageData(page, this.ajaxParam).done($.proxy(this._loadPageComplete, this));

                }

            }

        },

        _setPage:function(page){

            var pageInfo = this.pageInfo,

            currentPage = this.source.currentPage;

            if(page === 'firstPage'){

                page = 1;

            }else if(page === 'lastPage'){

                page = pageInfo.lastPage;

            }else if(page === 'nextPage'){

                page = currentPage + 1;

            }else if(page === 'prevPage'){

                page = currentPage - 1;

            }else if(page === 'now'){

                page = currentPage;

            }else{

                page = page >> 0;

            }

            if(page >= 1 && (pageInfo.isLastPage === 'none' || page <= pageInfo.lastPage)){

                return page;

            }else{

                return false;

            }

        },

        loadShow:function(notOverlay){

            !notOverlay && this.tableCache.$gridOverlay.show();

            this.tableCache.$gridLoad.show();

        },

        loadHide:function(){

            this.tableCache.$gridOverlay.hide();

            this.tableCache.$gridLoad.hide();

        },

        _storeDataBind:function(page){

            var source = this.source, sourceOp = source.option,

            proxy = $.proxy;

            this.loadShow();

            if(sourceOp.isPage){

                if(sourceOp.pageMethod === 'ajax'){

                    source.getPageData(page, this.ajaxParam).done(proxy(this._loadPageComplete, this));

                }else if(sourceOp.pageMethod === 'local'){

                    source.getData(this.ajaxParam).then(function(){

                        source.setCurrentPage(page);

                        return source.getPageData();

                    }).done(proxy(this._loadPageComplete, this));

                }

            }else{

                source.getData(this.ajaxParam).done(proxy(this._loadComplete, this));

            }

        },

        _renderVSGridBodyTbody:function(){

            if(!this.options.virtualScroll){return;}

            var str = '', tableCache = this.tableCache,

            gridIds = this.gridIds;

            if(!tableCache.$gridBodyTableTbody){

                str += '<tbody>' + this._renderSizeCell('td', gridIds.sizeBodyRowid);

                str += '</tbody>';

                tableCache.$gridBodyTable.css({'position': 'absolute', 'top': '0', 'left': '0'}).html(tableCache.$gridBodyTableTbody = $(str));

                tableCache.$gridBodyResizeRow = tableCache.$gridBodyTable.find('#' + gridIds.sizeBodyRowid);

            }

            this._getVSInit();

        },

        _setMultipleCheckBoxSelect:function(){

            if(this.options.boxCheckType === 'multiple'){

                var select = this.select, data = this.records.data,

                i = data.length, trIdPostfix = this.gridIds.trIdPostfix,

                trId, selectTr = this.options.selectTr;

                while(i--){

                    trId = trIdPostfix + data[i].__id;

                    if(typeof select[trId] === 'undefined'){

                        if(selectTr === 'all' || selectTr === i || this._inArray(selectTr, i) || ($.isFunction(selectTr) && selectTr(data[i]))){

                            select[trId] = true;

                            select.currentLen += 1;

                        }else{

                            select[trId] = false;

                        }

                    }else if(select[trId] === true){

                        select.currentLen += 1;

                    }

                }

            }

        },

        _getVSGridBodyHtml:function(data){

            var i = 0, len = data.length, obj, trId, str = '',

            tableModels = this.tableOption.tableModels,

            gridIds = this.gridIds, trIdPostfix = gridIds.trIdPostfix,

            tableCache = this.tableCache,

            evenClass = this.options.evenClass, isSelectedTr,

            tdIdPostfix = gridIds.tdIdPostfix,

            activeClass = this.options.activeClass;

            for(; i < len; i++){

                obj = data[i];

                trId = trIdPostfix + obj.__id;

                isSelectedTr = this._isSelectedTr(i, obj, trId);

                str += '<tr id="'+ trId +'" class="leoUi-widget-content jqgrow leoUi-row-ltr ';

                if(evenClass && (i % 2 === 1)){

                    str += evenClass + ' ';

                }

                if(isSelectedTr && activeClass){

                    str += activeClass;

                }

                str += '" tabindex="-1">';

                str += this._renderGridBodyTd({

                    tableModels: tableModels,

                    data: obj,

                    trId: trId,

                    trIndex: i,

                    tdIdPostfix: tdIdPostfix

                }, isSelectedTr);

                str += '</tr>';

            }

            return str;

        },

        _renderVSGridBodyView:function(){

            var DifData = this._getVSDifData(), html,

            virtualScroll, tableCache;

            if(DifData.isChage){

                tableCache = this.tableCache;

                virtualScroll = this.virtualScroll

                html = this._getVSGridBodyHtml(DifData.difRecords);

                tableCache.$gridBodyTable.css({'visibility': 'visible', 'top': virtualScroll.tableScrollTop});

                if(virtualScroll.direction === 'down'){

                    tableCache.$gridBodyTableTbody.find('tr').not(tableCache.$gridBodyResizeRow).slice(DifData.difSlice[0], DifData.difSlice[1]).remove().end().end().end().append(html);


                }else{

                    tableCache.$gridBodyTableTbody.find('tr').not(tableCache.$gridBodyResizeRow).slice(DifData.difSlice[0]).remove().end().end().filter(tableCache.$gridBodyResizeRow).after(html);

                }

            }

        },

        _scrollVSEvent:function(){

            if(this.options.virtualScroll){

                var virtualScroll = this.virtualScroll,

                scrollTop = this.tableCache.$gridBodyDiv.scrollTop();

                if(scrollTop !== virtualScroll.scrollTop){

                    scrollTop > virtualScroll.scrollTop ? virtualScroll.direction = 'down' : virtualScroll.direction = 'up';

                    virtualScroll.scrollTop = scrollTop;

                    this._renderVSGridBodyView();

                }

            }

        },

        _setEmptyRow:function(){

            var $emptyRow = $('<tr id="'+ this.gridIds.emptyRow +'" class="leoUi-widget-content jqgrow leoUi-row-ltr" style="visibility: hidden"><td></td></tr>').appendTo(this.tableCache.$gridBodyTableTbody);

            this.virtualScroll.rowHeight = $emptyRow.outerHeight();

            $emptyRow.remove();

        },

        _getVSInit:function(){

            if(!this.options.virtualScroll || !this.tableCache.$gridBodyTableTbody)return;

            var virtualScroll = this.virtualScroll,

            tableCache = this.tableCache,

            records = this.records,

            virtualScrollAddRows = ~~this.options.virtualScrollAddRows;

            this._setEmptyRow();

            virtualScroll.vHeight = tableCache.$gridBodyDiv.height();

            virtualScroll.rows = records.length();

            virtualScroll.cHeight = virtualScroll.rows * virtualScroll.rowHeight;

            virtualScroll.direction = 'none';

            virtualScroll.vRows = Math.ceil(virtualScroll.vHeight / virtualScroll.rowHeight);

            virtualScrollAddRows < 1 && (virtualScrollAddRows = 1);

            virtualScroll.addRows = virtualScrollAddRows;

            tableCache.$gridBodyDivInner.height(virtualScroll.cHeight);

            tableCache.$gridBodyDiv.scrollTop(0);

            virtualScroll.scrollTop = 0;

            virtualScroll.tableScrollTop = 0;

            virtualScroll.maxScrollTop = virtualScroll.cHeight - virtualScroll.vHeight;

            this._renderVSGridBodyInitView();

        },

        _renderVSGridBodyInitView:function(){

            var virtualScroll = this.virtualScroll,

            fristItem = Math.floor(virtualScroll.scrollTop / virtualScroll.rowHeight),

            lastItem =  fristItem + virtualScroll.vRows + virtualScroll.addRows,

            tableCache = this.tableCache;

            tableCache.$gridBodyTableTbody.find('tr').not(tableCache.$gridBodyResizeRow).remove().end().end().append(this._getVSGridBodyHtml(this.records.getRows(fristItem, lastItem)));

            tableCache.$gridBodyTable.css({'visibility': 'visible', 'top': virtualScroll.tableScrollTop});

            virtualScroll.vRowsArr = [fristItem, lastItem - 1];

        },

        _getVSvRowsArr:function(){

            var virtualScroll = this.virtualScroll,

            vRows = virtualScroll.vRows, fristItem,

            addRows = virtualScroll.addRows, lastItem,

            maxlength = addRows + vRows, rows, difLen,

            rowHeight = virtualScroll.rowHeight;

            if(virtualScroll.direction === 'down'){

                fristItem = Math.floor(virtualScroll.scrollTop / rowHeight);

                lastItem = fristItem + maxlength - 1;

            }else{

                fristItem = Math.ceil(virtualScroll.scrollTop / rowHeight) - addRows;

                fristItem < 0 && (fristItem = 0);

                lastItem = fristItem + maxlength - 1;

            }

            rows = virtualScroll.rows - 1;

            if((difLen = lastItem - rows) > 0){

                fristItem -= difLen;

                lastItem = rows;

            }

            return [fristItem, lastItem];

        },

        _getVSDifData:function(){

            var virtualScroll = this.virtualScroll,

            difRecords, difSlice, scrollTop, difFristItem, difLastItem,

            oldVRowsArr = virtualScroll.vRowsArr,

            vRowsArr = this._getVSvRowsArr();

            if(vRowsArr[0] === oldVRowsArr[0] && vRowsArr[1] === oldVRowsArr[1]){

                return {isChage: false};

            }

            if(virtualScroll.direction === 'down'){

                if(vRowsArr[0] < oldVRowsArr[0] + virtualScroll.addRows && vRowsArr[1] !== virtualScroll.rows - 1){

                    return {isChage: false};

                }

                if(oldVRowsArr[1] < vRowsArr[0]){

                    difFristItem = vRowsArr[0];

                }else{

                    difFristItem = oldVRowsArr[1] + 1;

                }

                difRecords = this.records.getRows(difFristItem, vRowsArr[1] + 1);

                difSlice = [0, difRecords.length];

                scrollTop = (vRowsArr[1] - oldVRowsArr[1]) * virtualScroll.rowHeight;

                virtualScroll.tableScrollTop += scrollTop;

                virtualScroll.vRowsArr = vRowsArr;

            }else if(virtualScroll.direction === 'up'){

                if(vRowsArr[1] > oldVRowsArr[1] - virtualScroll.addRows && vRowsArr[0] !== 0){

                    return {isChage: false};

                }

                if(oldVRowsArr[0] > vRowsArr[1]){

                    difLastItem = vRowsArr[1] + 1;

                }else{

                    difLastItem = oldVRowsArr[0];

                }

                difRecords = this.records.getRows(vRowsArr[0], difLastItem);

                difSlice = [-difRecords.length];

                scrollTop = (vRowsArr[0] - oldVRowsArr[0]) * virtualScroll.rowHeight;

                virtualScroll.tableScrollTop += scrollTop;

                virtualScroll.vRowsArr = vRowsArr;

            }

            return {

                isChage: true,

                difSlice: difSlice,

                difRecords: difRecords

            };

        },

        _renderGridBodyTbody:function(data){

            var i = 0, len = data.length, obj, trId, str = '',

            tableModels = this.tableOption.tableModels,

            gridIds = this.gridIds, trIdPostfix = gridIds.trIdPostfix,

            tableCache = this.tableCache,

            evenClass = this.options.evenClass, isSelectedTr,

            tdIdPostfix = gridIds.tdIdPostfix,

            activeClass = this.options.activeClass;

            if(!tableCache.$gridBodyTableTbody){

                str += '<tbody>' + this._renderSizeCell('td', gridIds.sizeBodyRowid);

            }

            for(; i < len; i++){

                obj = data[i];

                trId = trIdPostfix + obj.__id;

                isSelectedTr = this._isSelectedTr(i, obj, trId);

                str += '<tr id="'+ trId +'" class="leoUi-widget-content jqgrow leoUi-row-ltr ';

                if(evenClass && (i % 2 === 1)){

                    str += evenClass + ' ';

                }

                if(isSelectedTr && activeClass){

                    str += activeClass;

                }

                str += '" tabindex="-1">';

                str += this._renderGridBodyTd({

                    tableModels: tableModels,

                    data: obj,

                    trId: trId,

                    trIndex: i,

                    tdIdPostfix: tdIdPostfix

                }, isSelectedTr);

                str += '</tr>';

            }

            if(!tableCache.$gridBodyTableTbody){

                str += '</tbody>';

                tableCache.$gridBodyTable.html(tableCache.$gridBodyTableTbody = $(str));

                tableCache.$gridBodyResizeRow = tableCache.$gridBodyTable.find('#' + gridIds.sizeBodyRowid);

            }else{

                tableCache.$gridBodyTableTbody.find('tr').not(tableCache.$gridBodyResizeRow).remove().end().end().append(str);

            }

        },

        _htmlEncode:function(value){

            return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        },

        _renderGridBodyTd:function(tdData, isSelectedTr){

            var tableModels = tdData.tableModels, i = 0, str = '',

            data = tdData.data, trId = tdData.trId, tableModel,

            tdIdPostfix = tdData.tdIdPostfix, len = tableModels.length,

            htmlEncode = this._htmlEncode, value, title;

            for (; i < len; i++) {

                tableModel = tableModels[i];

                title = undefined;

                value = undefined;

                if(typeof tableModel.renderCell === 'function'){

                    value = tableModel.renderCell(data[tableModel.dataKey]);

                    if(typeof value === 'object'){

                        if(typeof value.title === 'string'){

                            title = value.title;

                        }

                        value = value.html || '';

                    }

                }else if(!tableModel.isCheckBox){

                    value = htmlEncode(data[tableModel.dataKey]);

                    title = value;

                }

                str += '<td id="' + trId + tdIdPostfix + i +'" ';

                if(tableModel.tdStyle){

                    str += 'style="' + tableModel.tdStyle + ';" ';

                }

                if(tableModel.tdClass){

                    str += 'class="' + tableModel.tdClass + ';"';

                }

                if(typeof title !== 'undefined'){

                    str += ' title =' + title;

                }

                str += '>';

                if(tableModel.isCheckBox){

                    str += this._renderCheckBoxTd(tdData, tableModel, isSelectedTr);

                }else{

                    str += value;

                }

                str += '</td>';

            }

            return str;

        },

        _isSelectedTr:function(trIndex, tdData, trId){

            var select, selectTr,

            boxCheckType = this.options.boxCheckType;

            if(!boxCheckType)return false;

            selectTr = this.options.selectTr;

            if(boxCheckType === 'multiple'){

                select = this.select;

                if(select[trId]){

                    return true;

                }else{

                    return false;

                }


            }else if(boxCheckType === 'radio'){

                if(typeof this.select === 'undefined'){

                    if(selectTr === trIndex || ($.isFunction(selectTr) && selectTr(tdData))){

                        this.select = trId;

                        return true;

                    }else{

                        return false;

                    }

                }else if(this.select === trId){

                    return true;

                }else{

                    return false;

                }

            }

            return false;

        },

        _renderCheckBoxTd:function(tdData, tableModel ,isSelectedTr){

            var trCheckBoxIdPostfix = this.gridIds.trCheckBoxIdPostfix,

            trId = tdData.trId,

            str = '<input type="checkbox" id="' + trId + trCheckBoxIdPostfix + '" ',

            selectTr = tableModel.selectTr;

            if(isSelectedTr){

                str += 'checked';

            }

            str += '/>';

            return str;

        },

        _trBoxCheckOn:function(trId, notCheck){

            if(!this.tableOption.boxCheckType || !trId)return;

            $('#' + trId + this.gridIds.trCheckBoxIdPostfix).prop('checked', true );

            !notCheck && this._isAllCheckBoxSelected();

        },

        _trBoxCheckOff:function(trId, notCheck){

            if(!this.tableOption.boxCheckType || !trId)return;

            $('#' + trId + this.gridIds.trCheckBoxIdPostfix).prop('checked', false);

            !notCheck && this._isAllCheckBoxSelected();

        },

        _multipleCheckBoxAllSelect:function(isAllChecked){

            if(this.options.boxCheckType === 'multiple'){

                var select = this.select, data = this.records.data,

                i = data.length, trIdPostfix = this.gridIds.trIdPostfix;

                while(i--){

                    isAllChecked ? select[trIdPostfix + data[i].__id] = true : select[trIdPostfix + data[i].__id] = false;

                }

                isAllChecked ? select.currentLen = data.length : select.currentLen = 0;

            }

        },

        multipleCheckBoxAllSelect:function(isAllChecked, isAllCheckBoxSelected){

            if(this.options.boxCheckType !== 'multiple')return;

            var activeClass = this.options.activeClass, This = this;

            this.multipleSelectFlag;

            this.tableCache.$gridBodyTable.find('tr').not('#' + this.gridIds.sizeBodyRowid).each(function(index, el) {

                var $tr = $(this), trId = this.id;

                if(isAllChecked){

                    if(!This._inMultipleSelectRowArr(trId)){

                        !!activeClass && $tr.addClass(activeClass);

                        This._trBoxCheckOn(trId, true);

                    }

                }else{

                    if(This._inMultipleSelectRowArr(trId)){

                        !!activeClass && $tr.removeClass(activeClass);

                        This._trBoxCheckOff(trId, true);

                    }

                }

            });

            this._multipleCheckBoxAllSelect(isAllChecked);

            isAllCheckBoxSelected && this._isAllCheckBoxSelected();

        },

        getCheckBoxFlag:function(){

            var currentLen = this.select.currentLen;

            if(currentLen === 0){

                return 'none';

            }else if(currentLen === this.records.length()){

                return 'all';

            }else{

                return 'half';

            }

        },

        _isAllCheckBoxSelected:function(){

            if(this.tableOption.boxCheckType === 'multiple'){

                var flag = this.getCheckBoxFlag(),

                $multipleCheckBox = this.tableCache.$multipleCheckBox;

                if(flag === 'none'){

                    $multipleCheckBox.prop({'indeterminate': false, 'checked': false } );

                }else if(flag === 'all'){

                    $multipleCheckBox.prop({'indeterminate': false, 'checked': true });

                }else{

                    $multipleCheckBox.prop({'indeterminate': true, 'checked': false });

                }

            }

        },

        _inArray:function(arr, index){

            if($.isArray(arr)){

                var i = arr.length;

                if(i === 0)return false;

                while(i--){

                    if(arr[i] === index)return true;

                }

            }

            return false;

        },

        _renderGridHead:function(){

            this.tableCache.$gridHeadTable = $('<table class="leoUi-jqgrid-htable" cellspacing="0" cellpadding="0" border="0"><thead>' + this._renderGridHeadTr() + '</thead></table>').appendTo(this.tableCache.$gridHeadDiv.find('div.leoUi-jqgrid-hbox'));

            this._setMultipleCheckBoxCache();

        },

        _setMultipleCheckBoxCache:function(){

            this.tableOption.boxCheckType === 'multiple' && (this.tableCache.$multipleCheckBox = this.tableCache.$gridHeadTable.find('#' + this.gridIds.multipleThCheckBoxId));

        },

        reloadSelectRow:function(){

            if(this.options.boxCheckType === 'multiple'){

                this.select = {

                    currentLen: 0

                };

            }else if(this.options.boxCheckType === 'radio'){

                this.select = undefined;

            }

        },

        _reloadMultipleSelectRowCurrentLen:function(){

            if(this.options.boxCheckType === 'multiple'){

                this.select.currentLen = 0;

            }

        },

        _addMultipleSelectRowArr:function(trid){

            if(this.options.boxCheckType === 'multiple' && trid){

                this.select[trid] = true;

                this.select.currentLen += 1;

            }

        },

        getSelectRowsTrParam:function(){

            var arr, select, prop, trParam,

            boxCheckType = this.options.boxCheckType;

            if(boxCheckType){

                select = this.select;

                if(boxCheckType === 'multiple'){

                    arr = [];

                    for(prop in select){

                        if(select[prop] === true){

                            (trParam = this._getTrParam(prop)) && arr.push(trParam);

                        }

                    }

                    return arr;

                }else if(boxCheckType === 'radio'){

                    return this._getTrParam(select);

                }

            }

        },

        _getTrParam:function(trId){

            var getParam = this.options.getParam,

            trIdIndex = this._getTrIdIndex(trId),

            data = this.source._getRecord(trIdIndex);

            if($.isFunction(getParam)){

                return getParam(data, trIdIndex);

            }else{

                return (data && data[getParam]) || trIdIndex;

            }

        },

        _getTrIdIndex:function(trId){

            return +trId.slice(this.gridIds.trIdPostfix.length);

        },

        _inMultipleSelectRowArr:function(trid){

            if(this.options.boxCheckType === 'multiple' && trid){

                if(this.select[trid])return true;

            }

            return false;

        },

        _removeMultipleSelectRowArr:function(trid){

            if(this.options.boxCheckType === 'multiple' && trid){

                this.select[trid] = false;

                this.select.currentLen -= 1;

            }

        },

        _renderGridBody:function(){

            this.tableCache.$gridBodyTable = $('<table class="leoUi-jqgrid-btable" cellspacing="0" cellpadding="0" border="0"></table>').appendTo(this.tableCache.$gridBodyDivInner = this.tableCache.$gridBodyDiv.find('div.leoUi-jqgrid-hbox-inner'));

        },

        _setGridFooterIds:function(){

            var leoGrid = this.leoGrid;

            this.gridIds = this.gridIds || {};

            $.extend(this.gridIds, {

                footerIds:{

                    footer: leoGrid + 'footer',

                    footer_left: leoGrid + 'footer_left',

                    footer_center: leoGrid + 'footer_center',

                    footer_right: leoGrid + 'footer_right',

                    first_page: leoGrid + 'first_page',

                    prev_page: leoGrid + 'prev_page',

                    set_page_input: leoGrid + 'set_page_input',

                    now_page: leoGrid + 'now_page',

                    next_page: leoGrid + 'next_page',

                    last_page: leoGrid + 'last_page',

                    get_perPages_select: leoGrid + 'get_perPages_select',

                    page_right_info: leoGrid + 'page_right_info'

                }


            });

        },

        _renderGridFooter:function(){

            if(!this.options.footerShow)return;

            this._setGridFooterIds();

            var footerIds = this.gridIds.footerIds,

            tableCache = this.tableCache;

            tableCache.$footer = $('<div id="' + footerIds.footer + '" class="leoUi-state-default leoUi-jqgrid-pager leoUi-corner-bottom"><div class="leoUi-pager-control"><table cellspacing="0" cellpadding="0" border="0" role="row" style="width:100%;table-layout:fixed;height:100%;" class="leoUi-pg-table"><tbody><tr><td align="left" id="' + footerIds.footer_left + '"></td><td align="center" style="white-space: pre; width: 276px;" id="' + footerIds.footer_center + '"></td><td align="right" id="'+ footerIds.footer_right + '"></td></td></tr></tbody></table></div></div>').appendTo(tableCache.$gridBox.find('#' + this.gridIds.gview_grid));

            tableCache.$pageLeft = tableCache.$footer.find('#' + footerIds.footer_left);

            tableCache.$pageCenter= tableCache.$footer.find('#' + footerIds.footer_center);

            tableCache.$pageRight = tableCache.$footer.find('#' + footerIds.footer_right);

            this._renderGridFooterCenter();

            this._renderGridFooterRight();

        },

        _renderGridFooterCenter:function(){

            if(!this.options.footerShow || !this.source.option.isPage)return;

            var tableCache = this.tableCache, centerStr,

            rowList = this.options.rowList, i = 0,

            footerIds = this.gridIds.footerIds,

            length = rowList.length, $pageCenter = tableCache.$pageCenter;

            centerStr = '<table cellspacing="0" cellpadding="0" border="0" class="leoUi-pg-table" style="table-layout:auto;"><tbody><tr><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ footerIds.first_page +'"><span class="leoUi-icon leoUi-icon-seek-first"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ footerIds.prev_page +'"><span class="leoUi-icon leoUi-icon-seek-prev"></span></td><td style="width: 4px; cursor: default;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td><input id="'+ footerIds.set_page_input +'" type="text" role="textbox" value="1" maxlength="7" size="2" class="leoUi-pg-input"><span style="margin:0 4px 0 8px">共</span><span id="'+ footerIds.now_page +'">1</span><span style="margin:0 4px">页</span></td><td style="width: 4px; cursor: default;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ footerIds.next_page +'"><span class="leoUi-icon leoUi-icon-seek-next"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ footerIds.last_page +'"><span class="leoUi-icon leoUi-icon-seek-end"></span></td><td><select  id="'+ footerIds.get_perPages_select +'" class="leoUi-pg-selbox">';

            for( ; i < length; i++ ){

                centerStr += '<option value="'+rowList[i]+'">'+rowList[i]+'</option>';

            }

            centerStr += '</select></td></tr></tbody></table>';

            tableCache.$pageCenterTable = $(centerStr).hide().appendTo($pageCenter);

            tableCache.$firstPage = $pageCenter.find('#' + footerIds.first_page);

            tableCache.$prevPage = $pageCenter.find('#' + footerIds.prev_page);

            tableCache.$nextPage = $pageCenter.find('#' + footerIds.next_page);

            tableCache.$lastPage = $pageCenter.find('#' + footerIds.last_page);

            tableCache.$allPage = $pageCenter.find('#' + footerIds.now_page);

            tableCache.$setPageInput = $pageCenter.find('#' + footerIds.set_page_input);

            this._initFooterCenterEvent();

        },

        _renderGridFooterRight:function(){

            if(!this.options.footerShow)return;

            this.tableCache.$pageRightInfo = $('<div id="'+ this.gridIds.footerIds.page_right_info +'" class="leoUi-paging-info" style="text-align:right">无数据显示</div>').appendTo(this.tableCache.$pageRight);

        },

        _setNoPageFooterRight:function(){

            var data = this.records.data;

            this._changeFooterRight(1, data.length, data.length);

        },

        _changeFooterRight:function(fristItemShow, lastItemShow, currentItems){

            if(this.tableCache.$pageRightInfo){

                var html;

                if(currentItems === 0){

                    html = '无数据显示';

                }else{

                    html = fristItemShow + ' - ' + lastItemShow + '&nbsp;&nbsp;共' + currentItems + '条';

                }

                this.tableCache.$pageRightInfo.html(html);

            }

        },

        _changeFooterCenter:function(){

            if(!this.options.footerShow || !this.source.option.isPage)return;

            var fPageStyle, LPageStyle, tableCache = this.tableCache,

            pageInfo = this.pageInfo;

            pageInfo.isFristPage === true ? fPageStyle = 'default' : fPageStyle = 'pointer';

            pageInfo.isLastPage === true ? LPageStyle = 'default' : LPageStyle = 'pointer';

            tableCache.$prevPage.css('cursor', fPageStyle);

            tableCache.$firstPage.css('cursor', fPageStyle);

            tableCache.$nextPage.css('cursor', LPageStyle);

            tableCache.$lastPage.css('cursor', LPageStyle);

            tableCache.$allPage.text(pageInfo.totalpages || 0);

            tableCache.$setPageInput.val(pageInfo.currentPage || 0);

            tableCache.$pageCenterTable.show();

            this._changeFooterRight(pageInfo.fristItemShow, pageInfo.lastItemShow, pageInfo.currentItems || 0);

        },

        _initFooterCenterEvent:function(){

            var This = this, tableCache = this.tableCache,

            footerIds = this.gridIds.footerIds,

            source = this.source;

            this._on(tableCache.$pageCenter, 'click', 'td', function(event){

                event.preventDefault();

                if($(this).css('cursor') === 'default'){

                    return;

                }

                if(this.id === footerIds.first_page){

                    This.setPage('firstPage');

                }else if(this.id === footerIds.prev_page){

                    This.setPage('prevPage');

                }else if(this.id === footerIds.next_page){

                    This.setPage('nextPage');

                }else if(this.id === footerIds.last_page){

                    This.setPage('lastPage');

                }

            })._on(tableCache.$pageCenter.find('#' + footerIds.get_perPages_select), 'change', function(event){

                event.preventDefault();

                source.setOption({pageSize: $(this).val()});

                This.setPage('firstPage');

            })._on(tableCache.$setPageInput, 'keydown', function(event){

                event.keyCode === 13 && This.setPage($(this).val());

            });

        },

        _renderGridHeadTr:function(){

            var str = this._renderSizeCell('th', this.gridIds.sizeHeadRowid);

            str += '<tr class="leoUi-jqgrid-labels">' + this._renderGridHeadTh() + '</tr>';

            return str;

        },

        _renderGridHeadTh:function(){

            var tableModels = this.tableOption.tableModels,

            i = 0, len = tableModels.length, tableModel, str = '',

            boxCheckType = this.options.boxCheckType;

            for(; i < len; i++){

                tableModel = tableModels[i];

                str += '<th id = "' + tableModel.thId + '" class="leoUi-state-default leoUi-th-column leoUi-th-ltr';

                if(tableModel.thClass){

                    str += ' ' + tableModel.thClass;

                }

                str += '"';

                if(tableModel.thStyle){

                    str += ' style = "' + tableModel.thStyle + ';"';

                }

                str += '>';

                if(tableModel.resize){

                    str += '<span class="leoUi-jqgrid-resize leoUi-jqgrid-resize-ltr">&nbsp;</span>';

                }

                if(tableModel.sortable){

                    str += '<div class="leoUi-jqgrid-sortable">';

                }else{

                    str +='<div>';

                }

                if(tableModel.isCheckBox){

                    if(boxCheckType === 'multiple'){

                        str += '<input type="checkbox" id="' + this.gridIds.multipleThCheckBoxId + '" />';

                        this.tableOption.boxCheckType = 'multiple';


                    }else if(boxCheckType === 'radio'){

                        this.tableOption.boxCheckType = 'radio';

                    }

                }

                if(typeof tableModel.renderThCell === 'function'){

                    str += tableModel.renderThCell(tableModel.theadName);

                }else{

                    str += tableModel.theadName;

                }

                if(tableModel.sortable){

                    str += '<span class="leoUi-sort-ndb leoUi-sort"><span class="leoUi-sort-top"></span><span class="leoUi-sort-bottom"></span></span>';

                }else{

                    str += '</div>';

                }

                str += '</th>';

            }

            return str;

        },

        _getTableModels:function(){

            var tableOption = this.tableOption, i = 0,

            tableModels = tableOption.tableModels = [],

            op = this.options, opTableModels = op.tableModel,

            opTableModelsLen = opTableModels.length;

            for (; i < opTableModelsLen; i++) {

                tableModels.push(this._setTableModel(opTableModels[i], i));

            };

        },

        _setTableSize:function(id, width){

            var tableSize = this.tableSize,

            cellSizes = tableSize.cellSize,

            len = cellSizes.length, i = 0, cellSize, cellOuterWidth;

            tableSize.width = 0;

            tableSize.fixedOuterWidth = 0;

            for(; i < len; i++){

                cellSize = cellSizes[i];

                if(cellSize.id === id){

                    cellSize.cellOuterWidth = cellSize.cellLayout + width;

                    cellSize.fixed = true;

                }

                cellSize.fixed && (tableSize.fixedOuterWidth += cellSize.cellOuterWidth)

                tableSize.width += cellSize.cellOuterWidth;

            }

        },

        _setTableModel:function(opModel, index){

            var thIdPostfix = this.gridIds.thIdPostfix,

            sizeCellPostfix = this.gridIds.sizeCellPostfix,

            model = $.extend({}, this.options.tableModelDefault, opModel, {

                thId: thIdPostfix + index,

                sizeCellName: sizeCellPostfix + index

            }), cellOuterWidth = model.width + model.cellLayout,

            tableSize = this.tableSize;

            opModel.boxType === "checkBox" && (model.isCheckBox = true);

            opModel.sortable && (this.tableOption.isSort = true);

            opModel.resize && (this.tableOption.isResize = true);

            if(model.fixed){

                tableSize.fixedOuterWidth += cellOuterWidth;

                tableSize.cellSize.push({sizeCellName: model.sizeCellName, id: model.thId, minWidth: model.minWidth, cellOuterWidth: cellOuterWidth, fixed: true, cellLayout: model.cellLayout});

            }else{

                tableSize.changeCellLen += 1;

                tableSize.cellSize.push({sizeCellName: model.sizeCellName, id: model.thId, minWidth: model.minWidth, cellOuterWidth: cellOuterWidth, fixed: false, cellLayout: model.cellLayout});

            }

            tableSize.width += cellOuterWidth;

            model.width && $.isNumeric(model.width) && (model.width = opModel.width + 'px');

            return model;

        },

        _renderGrid:function(){

            var gridIds = this.gridIds;

            return '<div id="' + gridIds.leoUi_grid + '" class="leoUi-jqgrid leoUi-widget leoUi-widget-content leoUi-corner-all"><style type="text/css" id="' + gridIds.grid_style + '"></style><div id="' + gridIds.overlay_grid + '" class="leoUi-widget-overlay jqgrid-overlay"></div><div id="' + gridIds.load_grid + '" class="loading leoUi-state-default leoUi-state-active">读取中...</div><div class="leoUi-jqgrid-view" id="' + gridIds.gview_grid + '"><div class="leoUi-state-default leoUi-jqgrid-hdiv"><div class="leoUi-jqgrid-hbox"></div></div><div class="leoUi-jqgrid-bdiv"><div class="leoUi-jqgrid-hbox-inner" style="position:relative;"></div></div></div><div id="' + gridIds.rs_mgrid + '" class="leoUi-jqgrid-resize-mark" ></div></div>';

        },

        _renderSizeCell:function(nodeName, trId){

            var tableModels = this.tableOption.tableModels,

            len = tableModels.length, tableModel, i = 0,

            str = '<tr id="' + trId + '" style="height:0">';

            for (; i < len; i++) {

                str += '<' + nodeName + ' class="' + tableModels[i].sizeCellName +'" style="height:0;padding:0;border-width:0;"></td>'

            }

            return str;

        },

        _setGridIds:function(){

            var  leoGrid = this.leoGrid;

            return this.gridIds = {

                leoUi_grid: leoGrid + 'leoUi_grid',

                overlay_grid: leoGrid + 'overlay_grid',

                load_grid: leoGrid + 'load_grid',

                gview_grid: leoGrid + 'gview_grid',

                grid_style: leoGrid + 'grid_style',

                thIdPostfix: leoGrid + 'th_',

                emptyRow: leoGrid + 'emptyRow',

                trIdPostfix: leoGrid + 'tr_',

                rs_mgrid: leoGrid + 'rs_mgrid',

                sizeHeadRowid: leoGrid + 'sizeHeadRowid',

                sizeBodyRowid: leoGrid + 'sizeBodyRowid',

                sizeCellPostfix: leoGrid + 'sizeCell_',

                sizeRowTdIdPostfix: '_sizeRowTd',

                tdIdPostfix: '_leoUiTd_',

                trCheckBoxIdPostfix: '_leoUiTrCheckBox',

                multipleThCheckBoxId: leoGrid + 'multipleThCheckBoxId'

            }

        },

        _getChangeCellPercent:function(){

            if(this.tableSize.changeCellLen === 0)return;

            var tableSize = this.tableSize, cellSizeObj,

            cellSize = tableSize.cellSize;

            i = cellSize.length, changeWidth = tableSize.width - tableSize.fixedOuterWidth;

            while(i--){

                cellSizeObj = cellSize[i];

                !cellSizeObj.fixed && (cellSizeObj.changePercent = cellSizeObj.cellOuterWidth / changeWidth);

            }

        },

        refreshTable:function(widthChange){

            if(this.resize.isResize)return;

            this._setTableHeight();

            this._setTableWidth(widthChange);

        },

        _setTableWidth:function(change){

            var newTableWidth = this.options.width, scrollWidth = 0,

            tableOuterWidth, isChange = false, tableSize = this.tableSize,

            scrollChange;

            if(newTableWidth === false){return;}

            $.isFunction(newTableWidth) && (newTableWidth = newTableWidth(this.$target));

            if(tableSize.tableWidth !== newTableWidth || change){

                tableOuterWidth = this.tableCache.$gridBox.setOuterWidth(newTableWidth).width();

                tableSize.tableWidth = newTableWidth;

                tableSize.tableOuterWidth = tableOuterWidth;

                isChange = true;

            }else{

                tableOuterWidth = tableSize.tableOuterWidth;

            };

            scrollChange = this._isScrollChange();

            if(isChange || scrollChange.isScrollChange){

                scrollChange.isScroll && (scrollWidth = -this.options.scrollWidth);

                tableOuterWidth = tableOuterWidth + scrollWidth;

                isChange = true;

            }

            if(isChange){

                tableSize.width = tableOuterWidth;

                this._resizeCountWidth();

            }

        },

        _resizeTableIsScroll:function(){

            return this.tableCache.$gridBodyDiv.height() < this.tableCache.$gridBodyDivInner.height();

        },

        _isScrollChange:function(){

            var tableSize = this.tableSize, isScroll;

            if(tableSize.changeCellLen === 0)return;

            isScroll = this._resizeTableIsScroll();

            if(tableSize.lastIsScroll === 'first'){

                tableSize.lastIsScroll = isScroll;

                return {

                    isScrollChange: true,

                    isScroll: isScroll

                };

            }

            if(tableSize.lastIsScroll === isScroll){

                return {

                    isScrollChange: false,

                    isScroll: isScroll

                };

            }else{

                tableSize.lastIsScroll = isScroll;

                return {

                    isScrollChange: true,

                    isScroll: isScroll

                };

            }

        },

        _setTableHeight:function(){

            var tableHeight = this.options.height;

            if(tableHeight === false){return;}

            $.isFunction(tableHeight) && (tableHeight = tableHeight(this.$target));

            if(this.tableSize.tableHeight !== tableHeight){

                this.tableCache.$gridBodyDiv.height(this.tableCache.$gridBox.setOuterHeight(tableHeight).height() - this._getHdivAndPagerHeight());

                this.tableSize.tableHeight = tableHeight;

                this._getVSInit();

            }

        },

        _getHdivAndPagerHeight:function(){

            return this.tableCache.$gridHeadDiv.outerHeight() + (this.tableCache.$footer && this.tableCache.$footer.outerHeight() || 0);

        },

        _setGridStyle:function(cssText){

            var $gridStyle = this.tableCache.$gridStyle;

            if ($gridStyle[0].styleSheet) {

                $gridStyle[0].styleSheet.cssText = cssText;

            } else {

                $gridStyle.html(cssText);

            }

        },

        _getGridStyle:function(){

            var $gridStyle = this.tableCache.$gridStyle, cssText;

            if ($gridStyle[0].styleSheet) {

                return $gridStyle[0].styleSheet.cssText;

            } else {

                return $gridStyle.text();

            }

        },

        _resizeCountWidth:function(){

            if(this.tableSize.changeCellLen === 0)return;

            var tableSize = this.tableSize,

            cellSize = tableSize.cellSize,

            i = cellSize.length, cellSizeObj,

            tableCache = this.tableCache,

            changeCellLen = tableSize.changeCellLen,

            oldCellOuterWidth = 0, cellOuterWidth = 0, cssText = '',

            tableWidth = tableSize.width,

            changeWidth = tableWidth - tableSize.fixedOuterWidth;

            while(i--){

                cellSizeObj = cellSize[i];

                if(cellSizeObj.fixed === false){

                    if(changeCellLen === 1){

                        cellOuterWidth = changeWidth - oldCellOuterWidth;

                        cellSizeObj.minWidth > (cellOuterWidth - cellSizeObj.cellLayout) && (tableWidth += cellSizeObj.minWidth - cellOuterWidth + cellSizeObj.cellLayout, cellOuterWidth = cellSizeObj.minWidth + cellSizeObj.cellLayout);

                        cellSizeObj.cellOuterWidth = cellOuterWidth;

                        cssText += '.' + cellSizeObj.sizeCellName + '{width:' + cellOuterWidth + 'px;} ';

                    }else{

                        oldCellOuterWidth += cellOuterWidth = Math.round( cellSizeObj.changePercent * changeWidth);

                        cellSizeObj.minWidth > (cellOuterWidth - cellSizeObj.cellLayout) && (tableWidth += cellSizeObj.minWidth - cellOuterWidth + cellSizeObj.cellLayout, cellOuterWidth = cellSizeObj.minWidth + cellSizeObj.cellLayout);

                        cellSizeObj.cellOuterWidth = cellOuterWidth;

                        cssText += '.' + cellSizeObj.sizeCellName + '{width:' + cellOuterWidth + 'px;} ';

                    }

                    changeCellLen --;

                }else{

                    cssText += '.' + cellSizeObj.sizeCellName + '{width:' + cellSizeObj.cellOuterWidth + 'px;} ';

                }

            }

            this._setGridStyle(cssText);

            tableCache.$gridBodyTable.width(tableWidth);

            tableCache.$gridHeadTable.width(tableWidth);

            tableSize.width = tableWidth;

        },

        _addEvent:function(){

            var time, This = this, options = this.options,

            $gridHeadDiv = this.tableCache.$gridHeadDiv,

            $gridBodyTable = this.tableCache.$gridBodyTable,

            lastGridHeadDivLeft = $gridHeadDiv.scrollLeft();

            this._createBoxCheckFn();

            this._on(this.window, 'resize', function(event){

                event.preventDefault();

                !!time && clearTimeout(time);

                time = setTimeout(function(){

                    This.refreshTable(This._restoreResize());

                    time = null;

                }, 50);

            })._on(this.tableCache.$gridBodyDiv, 'scroll', function(event){

                event.preventDefault();

                var left = $(this).scrollLeft();

                if(left !== lastGridHeadDivLeft){

                    $gridHeadDiv.scrollLeft(left);

                    lastGridHeadDivLeft = left;

                }

                This._scrollVSEvent();

            })._on($gridBodyTable, 'click.check', 'tr', function(event){

                options.clickTrCallback.call(this, event, this) !== false && !!This._boxCheck && This._boxCheck(this);

            })._on($gridBodyTable, 'click', 'td', function(event){

                options.clickTdCallback.call(this, event, this);

                if(options.cellEdit && This.cellEdit(this)){

                    event.stopPropagation();

                }

            })._on($gridBodyTable, 'keydown', 'td', function(event){

                if (event.which === 13) {

                    This.saveCell(this);

                    return false;

                }

            });

            this._addMouseHover();

            this._createSortTb();

            this._createResizeTh();

        },

        _addMouseHover:function(){

            var hoverClass = this.options.hoverClass;

            if(typeof hoverClass === 'string'){

                this._on(this.tableCache.$gridBodyTable, 'mouseenter', 'tr', function(event){

                    event.preventDefault();

                    $(this).addClass(hoverClass);

                })._on(this.tableCache.$gridBodyTable, 'mouseleave', 'tr', function(event){

                    event.preventDefault();

                    $(this).removeClass(hoverClass);

                });

            }

        },

        _createBoxCheckFn:function(){

            var boxCheckType = this.options.boxCheckType, This;

            if(boxCheckType === 'radio'){

                this._boxCheck = function(tr){

                    if(this.options.disabledCheck === false){

                        var select = this.select,

                        activeClass = this.options.activeClass,

                        trId = tr.id;

                        if(select){

                            !!activeClass && $("#" + select).removeClass(activeClass);

                            this._trBoxCheckOff(select);

                        }

                        !!activeClass && $(tr).addClass(activeClass);

                        this._trBoxCheckOn(trId);

                        this.select = trId;

                    }

                };

            }else if(boxCheckType === 'multiple'){

                this._boxCheck = function(tr){

                    if(this.options.disabledCheck === false){

                        var $tr = $(tr), trId = tr.id,

                        activeClass = this.options.activeClass;

                        if(this._inMultipleSelectRowArr(trId)){

                            !!activeClass && $tr.removeClass(activeClass);

                            this._removeMultipleSelectRowArr(trId);

                            this._trBoxCheckOff(trId);

                        }else{

                            !!activeClass && $tr.addClass(activeClass);

                            this._addMultipleSelectRowArr(trId);

                            this._trBoxCheckOn(trId);

                        }

                    }

                };

                if(this.tableOption.boxCheckType === 'multiple' && this.tableCache.$multipleCheckBox){

                    This = this;

                    this._on(this.tableCache.$multipleCheckBox, 'change', function(event){

                        This.multipleCheckBoxAllSelect($(this).prop('checked'));

                    });

                }

            }

        },

        _createSortTb:function(){

            if(this.tableOption.isSort){

                this._sortTbEvent();

            }

        },

        _sortTbEvent:function(){

            var This = this;

            this._on(this.tableCache.$gridHeadTable, 'click.sort', 'div.leoUi-jqgrid-sortable', function(event){

                This._sortTb(event, this.parentNode);

            });

        },

        _getThIdIndex:function(thId){

            return thId.slice(this.gridIds.thIdPostfix.length);

        },

        _getTableModel:function(index){

            return this.tableOption.tableModels[index];

        },

        _sortTb:function(event, th){

            var $th = $(th), thId = th.id, status, sort = this.sort;

            sort.colsStatus[thId] === undefined && (sort.colsStatus[thId] = 1);

            status = sort.status[(sort.colsStatus[thId]++ % 3)];

            this._sortby(status, this._getTableModel(this._getThIdIndex(thId)));

            this._setSortClass($th.find('span.leoUi-sort'), status);

        },

        _setAjaxParam:function(ajaxParam){

            $.extend(this.ajaxParam, ajaxParam);

        },

        _sortby:function(status, tableModel){

            var source = this.source, sort = this.sort;

            if(this.options.sortAjax){

                status !== 'reload' && (sort.info = {status: status, dataKey: tableModel.dataKey, sortableType: tableModel.sortableType, sortAjax: true});

                this._setAjaxParam({sortInfo: sort.info});

                this._storeDataBind(1);

            }else{

                status !== 'reload' && (sort.info = {status: status, dataKey: tableModel.dataKey, sortableType: tableModel.sortableType, sortAjax: false});

                this._setAjaxParam({sortInfo: sort.info});

                source.localSortby(status, sort.info.dataKey, sort.info.sortableType);

                if(source.option.isPage && source.option.pageMethod === 'local'){

                    source.getPageData(1, sort.info).done($.proxy(this._loadPageComplete, this));

                }else{

                    this._loadComplete(source._getCollection(true), !source.option.isPage);

                }

            }

        },

        _setSortClass:function($span, status){

            var lastSpan = this.sort.lastSpan;

            $span.removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb');

            if(status === 'asc'){

                $span.addClass('leoUi-sort-asc');

            }else if(status === 'desc'){

                $span.addClass('leoUi-sort-desc');

            }else if(status === 'normal'){

                $span.addClass('leoUi-sort-ndb');

            }

            if(!!lastSpan && lastSpan !== $span[0]){

                $(lastSpan).removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb').addClass('leoUi-sort-ndb');

            }

            this.sort.lastSpan = $span[0];

        },

        _restoreSort:function(){

            if(!this.tableOption.isSort || !this.sort.lastSpan){return;}

            var lastSpan = this.sort.lastSpan, sort = this.sort;

            !!lastSpan && $(lastSpan).removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb').addClass('leoUi-sort-ndb');

            sort.colsStatus = {};

            sort.info = {};

            sort.lastSpan = null;

        },

        _createResizeTh:function(){

            if(this.tableOption.isResize === true){

                this._resizeThEvent();

                this.tableCache.$rsLine = this.tableCache.$rsLine || this.tableCache.$gridBox.find('#' + this.gridIds.rs_mgrid);

            }

        },

        _textselect:function(bool) {

            this[bool ? "_on" : "_off"](this.document, 'selectstart.darg', false);

            this.document.css("-moz-user-select", bool ? "none" : "");

            this.document[0].unselectable = bool ? "off" : "on";

        },

        _resizeThEvent:function(){

            var This = this;

            this._on(this.tableCache.$gridHeadTable, 'mousedown.dargLine', 'span.leoUi-jqgrid-resize', function(event){

                This._resizeLineDragStart(event, this.parentNode);

            });

        },

        _resizeLineDragStart:function(event,th){

            var $th = $(th), This = this, firstLeft, baseLeft,

            thId = th.id, dargLine, tableCache = this.tableCache,

            lineHeight = tableCache.$gridHeadDiv.outerHeight() + tableCache.$gridBodyDiv.outerHeight();

            dargLine = this.resize.dargLine = {};

            dargLine.width = $th.width();

            dargLine.thId = thId;

            dargLine.tableModel = this._getTableModel(this._getThIdIndex(thId));

            tableCache.$rsLine.css({top: 0, left: firstLeft = (event.pageX - (dargLine.startLeft = tableCache.$gridBox.offset().left))}).height(lineHeight).show();

            baseLeft = dargLine.baseLeft = firstLeft - dargLine.width;

            dargLine.minLeft = baseLeft + dargLine.tableModel.dragMinWidth;

            this._textselect(true);

            this._on(tableCache.$gridHeadDiv, 'mousemove.dargLine', function(event){

                This._resizeLineDragMove(event);

            });

            this._on(this.document, 'mouseup.dargLine', function(event){

                This._resizeLineDragStop(event);

            });

            event.preventDefault();

            return true;

        },

        _resizeLineDragMove:function(event){

            var dargLine = this.resize.dargLine,

            minLeft = dargLine.minLeft,left = event.pageX - dargLine.startLeft;

            minLeft > left && (left = minLeft);

            dargLine.left = left;

            this.tableCache.$rsLine.css({top:0,left:left});

            event.preventDefault();

            return false;

        },

        _resizeLineDragStop:function(event){

            var dargLine = this.resize.dargLine;

            this._off(this.tableCache.$gridHeadDiv, 'mousemove.dargLine');

            this._off(this.document, 'mouseup.dargLine');

            this.tableCache.$rsLine.hide();

            this._setTdWidth(dargLine.left - dargLine.baseLeft, dargLine);

            this._textselect(false);

            this.resize.dargLine = null;

            this.resize.isResize = true;

            return false;

        },

        _setCssText:function(cssText, sizeCellName, width){

            cssText = cssText.replace(/[\s\uFEFF\xA0]/g, '').replace(new RegExp(sizeCellName + '\{[^\}]*'), function(name){

                return sizeCellName + '{width:' + width + 'px';

            });

            return cssText;

        },

        _setTdWidth:function(newTdWidth, dargLine){

            var difWidth = newTdWidth - dargLine.width - dargLine.tableModel.cellLayout,

            tableOption = this.tableOption,

            tableWidth = (this.resize.width || this.tableSize.width) + difWidth;

            this._setGridStyle(this._setCssText(this._getGridStyle(), dargLine.tableModel.sizeCellName, newTdWidth));

            this.tableCache.$gridBodyTable.width(tableWidth);

            this.tableCache.$gridHeadTable.width(tableWidth);

            this.resize.width = tableWidth;

        },

        _restoreResize:function(){

            var returnVal = (this.resize.isResize === true);

            this.resize.width = undefined;

            this.resize.isResize = false;

            return returnVal;

        },

        _getCellData:function(tdId){

            var split = tdId.split(this.gridIds.tdIdPostfix),

            tableModel = this._getTableModel(split[1]),

            dataKey = tableModel.dataKey,

            trIndex = this._getTrIdIndex(split[0]),

            cellData = this._getRecord(trIndex)[dataKey];

            return {

                trIndex: trIndex,

                tableModel: tableModel,

                data: cellData

            }

        },

        _cellBeforeEdit:function(td){

            if(this.editCell && this.editCell.td === td)return true;

            var cellData = this._getCellData(td.id),

            tableModel = cellData.tableModel,

            initEdit, beforeEdit, afterEdit;

            if(tableModel.edit){

                if($.isFunction(initEdit = tableModel.initEdit) && !initEdit.__init){

                    initEdit(td, tableModel, cellData.data);

                    initEdit.__init = true;

                }

                if($.isFunction(beforeEdit = tableModel.beforeEdit)){

                    beforeEdit(td, tableModel, cellData.data);

                }

                this.editCell = {cellData: cellData, td: td};

                return true;

            }

        },

        _getCellHtml:function(renderCell, data){

            var value;

            if($.isFunction(renderCell)){

                value = renderCell(data);

                if(typeof value === 'object'){

                    value = value.html || '';

                }

            }else{

                value = this._htmlEncode(data);

            }

            return value;

        },

        _cancelCellEdit:function(){

            if(this.editCell){

                var cellData = this.editCell.cellData,

                tableModel = cellData.tableModel,

                data = cellData.data;

                $(this.editCell.td).html(this._getCellHtml(tableModel.renderCell, data));

            }

        },

        _cellAfterEdit:function(td){

            if(this.editCell && this.editCell.td !== td){

                this._cancelCellEdit();

                this.editCell = null;

            }

        },

        cellEdit:function(td){

            if(!td)return;

            this._cellAfterEdit(td);

            return this._cellBeforeEdit(td);

        },

        _saveCell:function(td, cellData, val){

            var tableModel = cellData.tableModel,

            source = this.source, validator, saveCell;

            if(tableModel.validator === false){

                validator = {passed: true};

            }else if(tableModel.validator === true){

                validator = source.validatorCell(val, tableModel.dataKey, cellData.trIndex);

            }else if($.isFunction(tableModel.validator)){

                validator = tableModel.validator(td, $.proxy(source.validatorCell, source), val, cellData);

            }

            if($.isFunction(saveCell = tableModel.saveCell)){

                saveCell(td, validator, val, tableModel, cellData.data, $.proxy(this._getCellHtml, this));

            }else{

                if(validator.passed){

                    $(td).html(this._getCellHtml(tableModel.renderCell, val));

                }else{

                    this._cancelCellEdit();

                    this.editCell = null;

                }

            }

            if(validator.passed){

                this.editCell = null;

                source.updateCell(val, tableModel.dataKey, cellData.trIndex, true);

                this.records = this.source.dataWrapper();

            }

        },

        saveCell:function(td){

            if(this.editCell && this.editCell.td === td){

                var cellData = this.editCell.cellData,

                tableModel = cellData.tableModel, getSaveCellVal, value;

                if(tableModel.edit){

                    if($.isFunction(getSaveCellVal = tableModel.getSaveCellVal)){

                        value = getSaveCellVal(td, tableModel, cellData.data);

                        this._saveCell(this.editCell.td, cellData, value);

                    }

                }

            }

        },

        rowEdit:function(tr){

            if(!tr || this.editRow)return false;

            var rowData = this._getEditRowData(tr.id), editRow;

            editRow = this.editRow = {rowData: rowData, tr: tr};

            this.options.beforeRowEdit(editRow);

        },

        saveRow:function(data, validatorFn){

            if(!data || !this.editRow)return;

            var source = this.source, rowData = this.editRow.rowData,

            validator = {};

            if(validatorFn === false){

                validator.passed = true;

            }else if($.isFunction(validatorFn)){

                validator = validatorFn($.proxy(source.validatorRow, source), this.editRow);

            }

            if(typeof validator.passed === 'undefined'){

                validator = source.validatorRow(data, rowData.trIndex)

            }

            if(validator.passed){

                source.updateRow(data, rowData.trIndex, true);

                this._saveRow(data, rowData);

                this.editRow = null;
            }

        },

        _saveRow:function(data, rowData){

            var rowEditDatas = rowData.rowEditData, rowEditData,

            len = rowEditDatas.length, i = 0;

            for(; i < len; i++){

                rowEditData = rowEditDatas[i];

                $('#' + rowEditData.cellId).html(this._getCellHtml(rowEditData.cellModel.renderCell, data[rowEditData.cellModel.dataKey]));

            }

        },

        cancelRowEdit:function(){

            if(this.editRow){

                var rowData = this.editRow.rowData, tr = this.editRow.tr,

                rowEditDatas = rowData.rowEditData, rowEditData,

                len = rowEditDatas.length, i = 0;

                for(; i < len; i++){

                    rowEditData = rowEditDatas[i];

                    $('#' + rowEditData.cellId).html(this._getCellHtml(rowEditData.cellModel.renderCell, rowEditData.cellVall));

                }

                this.editRow = null;

            }

        },

        getCurrentPage:function(){

            return this.source.getCurrentPage();

        },

        getRecords:function(){

            return this.source.dataWrapper();

        },

        _getRecord:function(trIndex){

            if(trIndex >= 0){

                return this.records.findRow(function(data){

                    return (data.__id == trIndex);

                });

            }

        },

        _getEditRowData:function(trId){

            var tableModels = this.tableOption.tableModels,

            i = 0, len = tableModels.length, tableModel,

            trIndex = this._getTrIdIndex(trId),

            tdIdPostfix = this.gridIds.tdIdPostfix,

            rowRecord = this._getRecord(trIndex),

            rowDatas = [], rowEditData;

            for(; i < len; i++){

                tableModel = tableModels[i];

                if(tableModel.edit){

                    rowEditData = {};

                    rowEditData.cellModel = tableModel;

                    rowEditData.cellId = trId + tdIdPostfix + i;

                    rowEditData.cellVal = rowRecord[tableModel.dataKey];

                    rowDatas.push(rowEditData);

                }

            }

            return {

                rowEditData: rowDatas,

                rowRecord: $.extend(true, {}, rowRecord),

                trIndex: trIndex

            }

        },

        search:function(val, fn){

            var source = this.source, sourceOp = source.option;

            if(this.options.searchAjax){

                this.searchInfo = {val: val, option: sourceOp.search,searchAjax: true, type: 'search'};

                this._setAjaxParam({searchInfo: this.searchInfo});

                this.reloadSelectRow();

                this._storeDataBind(1);

            }else{

                this.searchInfo = {val: val, option: sourceOp.search, searchAjax: false, type: 'search'};

                this._setAjaxParam({searchInfo: this.searchInfo});

                source.localSearch(val, fn);

                this.reloadSelectRow();

                if(sourceOp.isPage && sourceOp.pageMethod === 'local'){

                    source.getPageData(1).done($.proxy(this._loadPageComplete, this));

                }else{

                    this._loadComplete(source._getCollection(true), false);

                }

            }

        },

        searchReset:function(){

            var source = this.source, sourceOp = source.option;

            if(this.options.searchAjax){

                this.searchInfo = {option: sourceOp.search, searchAjax: true, type: 'reset'};

                this._setAjaxParam({searchInfo: this.searchInfo});

                this.reloadSelectRow();

                this._storeDataBind(1);

            }else{

                this.searchInfo = {option: sourceOp.search, searchAjax: false, type: 'reset'};

                this._setAjaxParam({searchInfo: this.searchInfo});

                source.localSearchReset();

                this._sortby('reload');

                this.reloadSelectRow();

                if(sourceOp.isPage && sourceOp.pageMethod === 'local'){

                    source.getPageData(1).done($.proxy(this._loadPageComplete, this));

                }else{

                    this._loadComplete(source._getCollection(true), false);

                }

            }

        }

    });

    return $;

}));