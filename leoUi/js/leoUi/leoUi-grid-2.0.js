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

            onlyInit:false,//只是初始化

            trIdKey:'trid',//trIdKey

            disabledCheck:false,//禁用选择

            disabledEvent:false,//是否禁用事件

            isHover:true,//是否移入变色

            hoverClass:'leoUi-state-hover',//移入添加的类名称

            evenClass:'leoUi-priority-secondary',//为表身的偶数行添加一个类名，以实现斑马线效果。false 没有

            activeClass:'leoUi-state-highlight',//选中效果

            boxCheckType:'multiple',//radio单选，multiple多选,false无

            tableModelDefault:{

                width:100,//宽

                type:'text',//类型

                align:'center',//对齐方式

                checkBoxId:'',//checkBoxId

                radioBoxId:'',//radioBoxId

                theadName:'',//对应的表头内容

                className:false,//加上的class

                resize:false,//是否可调整宽度

                sortable:false,//是否排序

                checked:false,//是否选择

                fixed:false,//是否固定

                cellLayout:5,//宽度以外的值

                minWidth:10,//最小宽度

                dragMinWidth:10,//拖动最小宽度

                renderCell:null,//为每一个单元格渲染内容

                edit:false,//是否可以编辑

                selectValId:false,//select类型的Id

                localSort:false,//自定义列的本地排序规则

                formatSort:false,//自定义列的本地排序格式化值的规则

                getSortVal:false,//自定义列的本地排序取值的规则

                sortableType:'string'//自定义列的本地排序取值的类型

            },

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

            scrollWidth:20

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

            tableCache.$gridBox.appendTo(this.$target);

            this._setTableHeight();

            this._addEvent();

            this._storeDataBind();

        },

        renderGridBody:function(data){

            this._renderGridBodyTbody(data || this.records.getData());

            this.refreshTable();

        },

        _loadComplete:function(data){

            this.records = this.source.dataWrapper(data);

            this.renderGridBody();

            this.loadHide();

        },

        _loadPageComplete:function(data){

            this.records = this.source.dataWrapper(data.pageData);

            this.pageInfo = data.pageInfo || {};

            this.renderGridBody();

            this._changeFooterCenter();

            this.loadHide();

        },

        _storeInit:function(){

            var This = this;

            this.source = this.options.source;

        },

        setPage:function(page){

            var source = this.source, sourceOp = source.option;

            if(sourceOp.isPage){

                page = this._setPage(page);

                if(page !== false){

                    this.loadShow();

                    !!source.ajax && source.ajax.abort();

                    source.getPageData(page).done($.proxy(this._loadPageComplete, this));

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

        _storeDataBind:function(){

            var source = this.source, sourceOp = source.option,

            proxy = $.proxy;

            this.loadShow();

            if(sourceOp.isPage){

                if(sourceOp.pageMethod === 'ajax'){

                    source.getPageData().done(proxy(this._loadPageComplete, this));

                }else if(sourceOp.pageMethod === 'local'){

                    source.getData().then(function(){

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

            tableCache = this.tableCache,

            leoGrid = this.leoGrid, tdIdPostfix = this.gridIds.tdIdPostfix;

            if(!tableCache.$gridBodyTableTbody){

                str += '<tbody>' + this.gridBodySizeTrHtml;

            }

            for(; i < len; i++){

                obj = data[i];

                trId = trIdPostfix + i;

                str += '<tr id="'+ trId +'" class="leoUi-widget-content jqgrow leoUi-row-ltr" tabindex="-1">';

                str += this._renderGridBodyTd({

                    tableModels: tableModels,

                    data: obj,

                    trId: trId,

                    tdIdPostfix: tdIdPostfix

                });

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

        _renderGridBodyTd:function(tdData){

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

                }else if(!tableModel.checkBoxId){

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

                if(tableModel.checkBoxId){

                    str += '<input type="checkbox" ';

                    if(data[tableModel.dataKey]){

                        str += 'checked';

                    }

                    str += '/>';

                }else{

                    str += value;

                }

                str += '</td>';

            }

            return str;

        },

        _renderGridHead:function(){

            this.tableCache.$gridHeadTable = $('<table class="leoUi-jqgrid-htable" cellspacing="0" cellpadding="0" border="0"><thead><tr class="leoUi-jqgrid-labels"></tr></thead></table>').find('tr').html(this._renderGridHeadTh()).end().appendTo(this.tableCache.$gridHeadDiv.find('div.leoUi-jqgrid-hbox'));

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

        _changeFooterRight:function(){

            !!this.tableCache.$pageRightInfo && this.tableCache.$pageRightInfo.html(this.pageInfo.fristItemShow + ' - ' + this.pageInfo.lastItemShow + '&nbsp;&nbsp;共' + this.pageInfo.currentItems + '条')

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

            this._changeFooterRight();

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

            i = 0, len = tableModels.length, tableModel, str = '';

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

                if(tableModel.checkBoxId){

                    str += '<input type="checkbox" id="' + tableModel.checkBoxId + '"';

                    if(tableModel.isCheck){

                        str += ' checked'

                    }

                    str += '/>';

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

                tableModels.push(this._getTableModel(opTableModels[i], i));

            };

        },

        _getTableModel:function(opModel, index){

            var thIdPostfix = this.gridIds.thIdPostfix,

            model = $.extend({}, this.options.tableModelDefault, opModel, {

                thId: thIdPostfix + index

            }), cellOuterWidth = model.width + model.cellLayout,

            tableSize = this.tableSize;

            opModel.boxType === "checkBox" && ( model.checkBoxId = model.thId + '_input' );

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

            var gridIds = this.gridIds, str = '';

            return str += '<div id="' + gridIds.leoUi_grid + '" class="leoUi-jqgrid leoUi-widget leoUi-widget-content leoUi-corner-all"><div id="' + gridIds.overlay_grid + '" class="leoUi-widget-overlay jqgrid-overlay"></div><div id="' + gridIds.load_grid + '" class="loading leoUi-state-default leoUi-state-active">读取中...</div><div class="leoUi-jqgrid-view" id="' + gridIds.gview_grid + '"><div class="leoUi-state-default leoUi-jqgrid-hdiv"><div class="leoUi-jqgrid-hbox"></div></div><div class="leoUi-jqgrid-bdiv"><div class="leoUi-jqgrid-hbox-inner" style="position:relative;"></div></div></div><div id="' + gridIds.rs_mgrid + '" class="leoUi-jqgrid-resize-mark" ></div></div>';

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

                tdIdPostfix: '_leoUiTd_'

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

                        oldCellOuterWidth += cellOuterWidth =  Math.round( cellSizeObj.changePercent * changeWidth );

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

            var time,This = this,

            $gridHeadDiv = this.tableCache.$gridHeadDiv,

            lastGridHeadDivLeft = $gridHeadDiv.scrollLeft();

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

            });

        }

    });

    return $;

}));