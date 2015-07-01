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

                align:'center',//对齐方式

                theadName:'',//对应的表头内容

                tdClass:false,//加上的class

                tdStyle:false,

                thStyle:false,

                thClass:false,

                resize:false,//是否可调整宽度

                sortable:false,//是否排序

                fixed:false,//是否固定

                cellLayout:5,//宽度以外的值

                minWidth:10,//最小宽度

                renderCell:null,//为每一个单元格渲染内容

                edit:false,//是否可以编辑

                selectValId:false,//select类型的Id

                localSort:false,//自定义列的本地排序规则

                formatSort:false,//自定义列的本地排序格式化值的规则

                getSortVal:false,//自定义列的本地排序取值的规则

                sortableType:false//自定义列的本地排序取值的类型

            },

            getParam: 'id',

            sortAjax: false,//ajax排序

            rowDataKeys:false,

            footerShow:true,

            rowList:[20,30,50],//每一页可选条数

            cellEdit:false,//是否可编辑单元格

            minRow:0,//至少一条数据

            defaulTrId: 0,//默认trid

            height:500,//设置表格的高度(可用函数返回值)

            width:500,//设置表格的宽度(可用函数返回值)

            beforeAjaxMegCallback:$.noop,//ajax之前信息回调(init, changePager, getEditRowInfo, getEditTypeOption, getEditCellInfo)

            afterGetData:false,//等到data之后回调

            ajaxMegCallback:$.noop,//ajax信息回调

            beforeSaveCell:false,//保存之前回调

            afterSaveCell:$.noop,//保存后回调

            beforeCellEdit:false,//编辑之前回调

            afterCellEdit:$.noop,//编辑后回调

            setTableWidthCallback:$.noop,//设置表格的宽度默认与父级宽高

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

            this.tableData = {};

            this.sort = {

                lastSpan: null,

                colsStatus: {},

                info:{},

                status: {

                    0: 'normal',

                    1: 'asc',

                    2: 'desc'

                }

            };

            this.dargLine = {};

            this._reloadSelectRow();

        },

        _createGridBox:function(){

            var tableCache = this.tableCache;

            tableCache.$gridBox = $(this._renderGrid());

            tableCache.$gridHeadDiv = tableCache.$gridBox.find('div.leoUi-jqgrid-hdiv');

            tableCache.$gridBodyDiv = tableCache.$gridBox.find('div.leoUi-jqgrid-bdiv');

            tableCache.$gridOverlay = tableCache.$gridBox.find('#' + this.gridIds.overlay_grid);

            tableCache.$gridLoad = tableCache.$gridBox.find('#' + this.gridIds.load_grid);

            this._renderGridHead();

            this._renderGridBody();

            this._storeInit();

            this._renderGridFooter();

            this._getChangeCellPercent();

            this._addEvent();

            tableCache.$gridBox.appendTo(this.$target);

            this._setTableHeight();

            this._storeDataBind();

        },

        renderGridBody:function(data){

            this._renderGridBodyTbody(data || this.records.getData());

            this.refreshTable();

            this._isAllCheckBoxSelected();

        },

        _loadComplete:function(data){

            this.records = this.source.dataWrapper(data);

            this._reloadSelectRow();

            this.renderGridBody();

            this._setNoPageFooterRight();

            this.loadHide();

        },

        _loadPageComplete:function(data){

            this.records = this.source.dataWrapper(data.pageData);

            this.pageInfo = data.pageInfo || {};

            this._reloadSelectRow();

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

                    source.getPageData(page, this.sort.info).done($.proxy(this._loadPageComplete, this));

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

                    source.getPageData(page, this.sort.info).done(proxy(this._loadPageComplete, this));

                }else if(sourceOp.pageMethod === 'local'){

                    source.getData(this.sort.info).then(function(){

                        return source.getPageData();

                    }).done(proxy(this._loadPageComplete, this));

                }

            }else{

                source.getData().done(proxy(this._loadComplete, this));

            }

        },

        _renderGridBodyTbody:function(data){

            var i = 0, len = data.length, obj, trId, str = '',

            tableModels = this.tableOption.tableModels,

            trIdPostfix = this.gridIds.trIdPostfix,

            tableCache = this.tableCache, leoGrid = this.leoGrid,

            evenClass = this.options.evenClass, isSelectedTr,

            tdIdPostfix = this.gridIds.tdIdPostfix,

            activeClass = this.options.activeClass;

            if(!tableCache.$gridBodyTableTbody){

                str += '<tbody>' + this.gridBodySizeTrHtml;

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

                tableCache.$gridBodyResizeRow = tableCache.$gridBodyTable.find('#' + this.gridIds.sizeRowid);

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

            if(!this.options.boxCheckType)return false;

            var selectTr = this.options.selectTr;

            if(selectTr === 'all'){

                return true;

            }else if(selectTr === trIndex && this._initBoxCheckTrId(trId)){

                return true;

            }else if(this._inArray(selectTr, trIndex) && this._initBoxCheckTrId(trId)){

                return true;

            }else if($.isFunction(selectTr) && selectTr(tdData) && this._initBoxCheckTrId(trId)){

                return true;

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

        _initBoxCheckTrId:function(trId){

            var tableData = this.tableData,

            boxCheckType = this.options.boxCheckType;

            if(boxCheckType === 'multiple'){

                tableData.selectRow.push(trId);

                return true;

            }else if(boxCheckType === 'radio'){

                if(typeof tableData.selectRow === 'undefined'){

                    tableData.selectRow = trId;

                    return true;

                }else{

                    return false;

                }

            }

            return true;

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

        multipleCheckBoxAllSelect:function(isAllChecked, isAllCheckBoxSelected){

            if(this.options.boxCheckType !== 'multiple')return;

            var activeClass = this.options.activeClass, This = this;

            this.multipleSelectFlag;

            this.tableCache.$gridBodyTable.find('tr').not('#' + this.gridIds.sizeRowid).each(function(index, el) {

                var $tr = $(this), trId = this.id;

                if(isAllChecked){

                    if(!This._inMultipleSelectRowArr(trId)){

                        !!activeClass && $tr.addClass(activeClass);

                        This._trBoxCheckOn(trId, true);

                        This._addMultipleSelectRowArr(trId);

                    }

                }else{

                    if(This._inMultipleSelectRowArr(trId)){

                        !!activeClass && $tr.removeClass(activeClass);

                        This._trBoxCheckOff(trId, true);

                        This._removeMultipleSelectRowArr(trId);

                    }

                }

            });

            isAllCheckBoxSelected && this._isAllCheckBoxSelected();

        },

        getCheckBoxFlag:function(){

            var length = this.tableData.selectRow.length;

            if(length === 0){

                return 'none';

            }else if(length === this.records.length()){

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

                while(i--){

                    if(arr[i] === index)return true;

                }

            }

            return false;

        },

        _renderGridHead:function(){

            this.tableCache.$gridHeadTable = $('<table class="leoUi-jqgrid-htable" cellspacing="0" cellpadding="0" border="0"><thead><tr class="leoUi-jqgrid-labels"></tr></thead></table>').find('tr').html(this._renderGridHeadTh()).end().appendTo(this.tableCache.$gridHeadDiv.find('div.leoUi-jqgrid-hbox'));

            this._setMultipleCheckBoxCache();

        },

        _setMultipleCheckBoxCache:function(){

            this.tableOption.boxCheckType === 'multiple' && (this.tableCache.$multipleCheckBox = this.tableCache.$gridHeadTable.find('#' + this.gridIds.multipleThCheckBoxId));

        },

        _reloadSelectRow:function(){

            if(this.options.boxCheckType === 'multiple'){

                this.tableData.selectRow = [];

            }else if(this.options.boxCheckType === 'radio'){

                this.tableData.selectRow = undefined;

            }

        },

        _addMultipleSelectRowArr:function(trid){

            if(this.options.boxCheckType === 'multiple' && trid){

                var selectRow = this.tableData.selectRow;

                !this._inArray(selectRow, trid) && selectRow.push(trid);

            }

        },

        getSelectRowsTrParam:function(){

            var arr = [], selectRow, i;

            if(this.options.boxCheckType){

                selectRow = this.tableData.selectRow;

                !$.isArray(selectRow) && (selectRow = [selectRow]);

                i = selectRow.length;

                while(i--){

                    arr.push(this._getTrParam(selectRow[i]))

                }

            }

            return arr;

        },

        _getTrParam:function(trid){

            var getParam = this.options.getParam,

            data = this.records.getData()[this._getTrIdIndex(trid)];

            if($.isFunction(getParam)){

                return getParam(data);

            }else{

                return data[getParam];

            }

        },

        _getTrIdIndex:function(trId){

            return trId.slice(this.gridIds.trIdPostfix.length);

        },

        _inMultipleSelectRowArr:function(trid){

            if(this.options.boxCheckType === 'multiple' && trid){

                if(this._inArray(this.tableData.selectRow, trid))return true;

            }

            return false;

        },

        _removeMultipleSelectRowArr:function(trid){

            if(this.options.boxCheckType === 'multiple' && trid){

                var selectRow = this.tableData.selectRow,

                i = selectRow.length;

                while(i--){

                    if(selectRow[i] === trid){

                        selectRow.splice(i, 1);

                        break;

                    }

                }

            }

        },

        _renderGridBody:function(){

            this._renderBodySizeTr();

            this.tableCache.$gridBodyTable = $('<table class="leoUi-jqgrid-btable" cellspacing="0" cellpadding="0" border="0"></table>').appendTo(this.tableCache.$gridBodyDiv.find('div.leoUi-jqgrid-hbox-inner'));

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

            tableCache.$allPage.text(pageInfo.totalpages);

            tableCache.$setPageInput.val(pageInfo.currentPage);

            tableCache.$pageCenterTable.show();

            this._changeFooterRight(pageInfo.fristItemShow, pageInfo.lastItemShow, pageInfo.currentItems);

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

        _renderGridHeadTh:function(){

            this._getTableModels();

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

                    str += ' style = "' + tableModel.thStyle + ';';

                    if(tableModel.width){

                        str += ' width:' + tableModel.width;

                    }

                }else if(tableModel.width){


                    str += ' style = "width:' + tableModel.width + ';';

                }

                str += '">';

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

            for(; i < len; i++){

                cellSize = cellSizes[i];

                if(cellSize.id === id){

                    cellSize.cellOuterWidth = cellSize.cellLayout + width;

                }

                tableSize.width += cellSize.cellOuterWidth;

            }

        },

        _setTableModel:function(opModel, index){

            var thIdPostfix = this.gridIds.thIdPostfix,

            model = $.extend({}, this.options.tableModelDefault, opModel, {

                thId: thIdPostfix + index

            }), cellOuterWidth = model.width + model.cellLayout,

            tableSize = this.tableSize;

            opModel.boxType === "checkBox" && (model.isCheckBox = true);

            opModel.sortable && (this.tableOption.isSort = true);

            opModel.resize && (this.tableOption.isResize = true);

            if(model.fixed){

                tableSize.fixedOuterWidth += cellOuterWidth;

                tableSize.cellSize.push({id: model.thId, minWidth: model.minWidth, cellOuterWidth: cellOuterWidth, fixed: true, cellLayout: model.cellLayout});

            }else{

                tableSize.changeCellLen += 1;

                tableSize.cellSize.push({id: model.thId, minWidth: model.minWidth, cellOuterWidth: cellOuterWidth, fixed: false, cellLayout: model.cellLayout});

            }

            tableSize.width += cellOuterWidth;

            model.width && $.isNumeric(model.width) && (model.width = opModel.width + 'px');

            return model;

        },

        _renderGrid:function(){

            var gridIds = this.gridIds;

            return '<div id="' + gridIds.leoUi_grid + '" class="leoUi-jqgrid leoUi-widget leoUi-widget-content leoUi-corner-all"><div id="' + gridIds.overlay_grid + '" class="leoUi-widget-overlay jqgrid-overlay"></div><div id="' + gridIds.load_grid + '" class="loading leoUi-state-default leoUi-state-active">读取中...</div><div class="leoUi-jqgrid-view" id="' + gridIds.gview_grid + '"><div class="leoUi-state-default leoUi-jqgrid-hdiv"><div class="leoUi-jqgrid-hbox"></div></div><div class="leoUi-jqgrid-bdiv"><div class="leoUi-jqgrid-hbox-inner" style="position:relative;"></div></div></div><div id="' + gridIds.rs_mgrid + '" class="leoUi-jqgrid-resize-mark" ></div></div>';

        },

        _renderBodySizeTr:function(){

            var tableModels = this.tableOption.tableModels,

            sizeRowTdIdPostfix = this.gridIds.sizeRowTdIdPostfix,

            len = tableModels.length, tableModel, i = 0,

            str = '<tr id="' + this.gridIds.sizeRowid + '" style="height:0">';

            for (; i < len; i++) {

                str += '<td id="' + tableModels[i].thId + sizeRowTdIdPostfix + '" style="height:0;width:0"></td>'

            }

            this.gridBodySizeTrHtml = str;

        },

        _setGridIds:function(){

            var  leoGrid = this.leoGrid;

            return this.gridIds = {

                leoUi_grid: leoGrid + 'leoUi_grid',

                overlay_grid: leoGrid + 'overlay_grid',

                load_grid: leoGrid + 'load_grid',

                gview_grid: leoGrid + 'gview_grid',

                thIdPostfix: leoGrid + 'th_',

                trIdPostfix: leoGrid + 'tr_',

                rs_mgrid: leoGrid + 'rs_mgrid',

                sizeRowid: leoGrid + 'sizeRowid',

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

        refreshTable:function(){

            this._setTableHeight();

            this._setTableWidth();

        },

        _setTableWidth:function(){

            var newTableWidth = this.options.width, scrollWidth = 0,

            tableOuterWidth, isChange = false, tableSize = this.tableSize,

            scrollChange;

            if(newTableWidth === false){return;}

            $.isFunction(newTableWidth) && (newTableWidth = newTableWidth(this.$target));

            if(tableSize.tableWidth !== newTableWidth){

                tableOuterWidth = this.tableCache.$gridBox.setOuterWidth(newTableWidth).width();

                tableSize.tableWidth = newTableWidth;

                tableSize.tableOuterWidth = tableOuterWidth;

                isChange = true;

            }else{

                tableOuterWidth = tableSize.tableOuterWidth;

            };

            scrollChange = this._isScrollChange();

            if(isChange || scrollChange.isScrollChange){

                scrollChange.isScroll && (scrollWidth = this.options.scrollWidth);

                tableOuterWidth = tableOuterWidth - scrollWidth;

                isChange = true;

            }

            if(isChange){

                tableSize.width = tableOuterWidth;

                this._resizeCountWidth();

            }

        },

        _resizeTableIsScroll:function(){

            return this.tableCache.$gridBodyDiv.height() < this.tableCache.$gridBodyTable.outerHeight();

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

            }

        },

        _getHdivAndPagerHeight:function(){

            return this.tableCache.$gridHeadDiv.outerHeight() + (this.tableCache.$footer && this.tableCache.$footer.outerHeight() || 0);

        },

        _resizeCountWidth:function(){

            if(this.tableSize.changeCellLen === 0)return;

            var tableSize = this.tableSize,

            cellSize = tableSize.cellSize,

            i = cellSize.length, cellSizeObj,

            tableCache = this.tableCache,

            gridIds = this.gridIds, sizeRowid = gridIds.sizeRowid,

            changeCellLen = tableSize.changeCellLen,

            sizeRowTdIdPostfix = gridIds.sizeRowTdIdPostfix,

            oldCellOuterWidth = 0, cellOuterWidth = 0,

            $gridBodyResizeRow = tableCache.$gridBodyResizeRow || tableCache.$gridBodyTable.find('#' + sizeRowid),

            $gridHeadResizeRow = tableCache.$gridHeadResizeRow || tableCache.$gridHeadTable.find('tr.leoUi-jqgrid-labels'),

            tableWidth = tableSize.width,

            changeWidth = tableWidth - tableSize.fixedOuterWidth;

            while(i--){

                cellSizeObj = cellSize[i];

                if(cellSizeObj.fixed === false){

                    if(changeCellLen === 1){

                        cellOuterWidth = changeWidth - oldCellOuterWidth;

                        cellSizeObj.minWidth > (cellOuterWidth - cellSizeObj.cellLayout) && (tableWidth += cellSizeObj.minWidth - cellOuterWidth + cellSizeObj.cellLayout, cellOuterWidth = cellSizeObj.minWidth + cellSizeObj.cellLayout);

                        cellSizeObj.cellOuterWidth = cellOuterWidth;

                        $gridHeadResizeRow.children('#' + cellSizeObj.id).setOuterWidth(cellOuterWidth);

                        $gridBodyResizeRow.children('#' + cellSizeObj.id + sizeRowTdIdPostfix).width(cellOuterWidth);

                    }else{

                        oldCellOuterWidth += cellOuterWidth = Math.round( cellSizeObj.changePercent * changeWidth);

                        cellSizeObj.minWidth > (cellOuterWidth - cellSizeObj.cellLayout) && (tableWidth += cellSizeObj.minWidth - cellOuterWidth + cellSizeObj.cellLayout, cellOuterWidth = cellSizeObj.minWidth + cellSizeObj.cellLayout);

                        cellSizeObj.cellOuterWidth = cellOuterWidth;

                        $gridHeadResizeRow.children('#' + cellSizeObj.id).setOuterWidth(cellOuterWidth);

                        $gridBodyResizeRow.children('#' + cellSizeObj.id + sizeRowTdIdPostfix).width(cellOuterWidth);

                    }

                    changeCellLen --;

                }else{

                    $gridHeadResizeRow.children('#' + cellSizeObj.id).setOuterWidth(cellSizeObj.cellOuterWidth);

                    $gridBodyResizeRow.children('#' + cellSizeObj.id + sizeRowTdIdPostfix).width(cellSizeObj.cellOuterWidth);

                }

            }

            tableCache.$gridBodyTable.width(tableWidth);

            tableCache.$gridHeadTable.width(tableWidth);

            tableSize.width = tableWidth;

        },

        _addEvent:function(){

            var time, This = this, options = this.options,

            $gridHeadDiv = this.tableCache.$gridHeadDiv,

            lastGridHeadDivLeft = $gridHeadDiv.scrollLeft();

            this._createBoxCheckFn();

            this._on(this.window, 'resize', function(event){

                event.preventDefault();

                !!time && clearTimeout(time);

                time = setTimeout(function(){

                    This.refreshTable();

                }, 50);

            })._on(this.tableCache.$gridBodyDiv, 'scroll', function(event){

                event.preventDefault();

                var left = $(this).scrollLeft();

                if(left !== lastGridHeadDivLeft){

                    $gridHeadDiv.scrollLeft(left);

                    lastGridHeadDivLeft = left;

                }

            })._on(this.tableCache.$gridBodyTable, 'click.check', 'tr', function(event){

                options.clickTrCallback.call(this, event, this) !== false && !!This._boxCheck && This._boxCheck(this);

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

                        var selectRow = this.tableData.selectRow,

                        activeClass = this.options.activeClass,

                        trId = tr.id;

                        if(selectRow){

                            !!activeClass && $("#" + selectRow).removeClass(activeClass);

                            this._trBoxCheckOff(selectRow);

                        }

                        !!activeClass && $(tr).addClass(activeClass);

                        this._trBoxCheckOn(trId);

                        this.tableData.selectRow = trId;

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

        _getTableModel:function(thId){

            return this.tableOption.tableModels[this._getThIdIndex(thId)];

        },

        _sortTb:function(event, th){

            var $th = $(th), thId = th.id, status, sort = this.sort;

            sort.colsStatus[thId] === undefined && (sort.colsStatus[thId] = 1);

            status = sort.status[(sort.colsStatus[thId]++ % 3)];

            this._sortby(status, this._getTableModel(thId));

            this._setSortClass($th.find('span.leoUi-sort'), status);

        },

        _sortby:function(status, tableModel){

            var source = this.source;

            if(this.options.sortAjax){

                this.sort.info = {status: status, dataKey: tableModel.dataKey, sortableType: tableModel.sortableType, sortAjax: true};

                this._storeDataBind(1);

            }else{

                this.sort.info = {status: status, dataKey: tableModel.dataKey, sortableType: tableModel.sortableType, sortAjax: false};

                source.localSortby(status, tableModel.dataKey, tableModel.sortableType);

                if(source.option.isPage){

                    this.setPage(1);

                }else{

                    this._loadComplete(source._getCollection(true));

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

            if(!this.tableOption.isSort){return;}

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

            dargLine = this.dargLine = {};

            dargLine.width = $th.width();

            dargLine.thId = thId;

            dargLine.tableModel = this._getTableModel(thId);

            tableCache.$rsLine.css({top: 0, left: firstLeft = (event.pageX - (this.dargLine.startLeft = tableCache.$gridBox.offset().left))}).height(lineHeight).show();

            baseLeft = dargLine.baseLeft = firstLeft - dargLine.width;

            dargLine.minLeft = baseLeft + dargLine.tableModel.minWidth;

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

            var dargLine = this.dargLine,

            minLeft = dargLine.minLeft,left = event.pageX - dargLine.startLeft;

            minLeft > left && (left = minLeft);

            dargLine.left = left;

            this.tableCache.$rsLine.css({top:0,left:left});

            event.preventDefault();

            return false;

        },

        _resizeLineDragStop:function(event){

            var dargLine = this.dargLine;

            this._off(this.tableCache.$gridHeadDiv, 'mousemove.dargLine');

            this._off(this.document, 'mouseup.dargLine');

            this.tableCache.$rsLine.hide();

            this._setTdWidth(dargLine.left - dargLine.baseLeft, dargLine);

            this._textselect(false);

            this.dargLine = null;

            this._getChangeCellPercent();

            this._resizeCountWidth();

            return false;

        },

        _setTdWidth:function(newTdWidth, dargLine){

            this._setTableSize(dargLine.thId, newTdWidth);

        }

    });

    return $;

}));