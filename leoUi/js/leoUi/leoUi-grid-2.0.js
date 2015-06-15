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

            resizeHeight:false,//是否在改变尺寸时调节高度

            width:500,//设置表格的宽度(可用函数返回值)

            resizeWidth:false,//是否在改变尺寸时调节宽度

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

                isScroll:false,

                fixedOuterWidth:0,

                changeCellLen:0,

                cellSize:[]

            };

            this.leoGrid = $.leoTools.getId('Grid') + '_';

            this.records = [];

            this.pageInfo = {};

        },

        _createGridBox:function(){

            this.$gridBox = $(this._renderGrid());

            this.$gridHeadDiv = this.$gridBox.find('div.leoUi-jqgrid-hdiv');

            this.$gridBodyDiv = this.$gridBox.find('div.leoUi-jqgrid-bdiv');

            this._renderGridHead();

            this._renderGridBody();

            this._renderGridFooter();

            this._getChangeCellPercent();

            this.$gridBox.appendTo(this.$target);

            this._storeInit();

            this._addEvent();

        },

        renderGridBody:function(data){

            this._renderGridBodyTbody(data || this.records.getData());

            this._setTableHeight();

            this._setTableWidth();

            this._resizeCountWidth();

        },

        _loadComplete:function(data){

            this.records = this.source.dataWrapper(data);

            this.renderGridBody();

        },

        _loadPageComplete:function(data){

            this.records = this.source.dataWrapper(data.pageData);

            this.pageInfo = data.pageInfo || {};

            this.renderGridBody();

        },

        _storeInit:function(){

            var This = this;

            this.source = this.options.source;

            this._storeDataBind();

        },

        setPage:function(page){

            var source = this.source, sourceOp = source.option;

            if(sourceOp.isPage){

                if(sourceOp.pageMethod === 'ajax'){

                    source.getPageData(page);

                }else if(sourceOp.pageMethod === 'local'){

                    page = this._setLocalPage(page);

                    page !== false && source.getPageData(page).done($.proxy(this._loadPageComplete, this));

                }

            }

        },

        _setLocalPage:function(page){

            var pageInfo = this.pageInfo;

            page = page >> 0;

            if(page >= pageInfo.fristPage && page <= pageInfo.lastPage){

                return page;

            }else{

                return false;

            }

        },

        _storeDataBind:function(){

            var source = this.source, sourceOp = source.option,

            proxy = $.proxy;

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

            var i = 0, len = data.length, obj, trId,

            str = '<tbody>' + this.gridBodySizeTrHtml,

            tableModels = this.tableOption.tableModels,

            trIdPostfix = this.gridIds.trIdPostfix,

            leoGrid = this.leoGrid, tdIdPostfix = this.gridIds.tdIdPostfix;

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

            str += '</tbody>';

            this.$gridBodyTable.html(str);

        },

        _htmlEncode:function(value){

            return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        },

        _renderGridBodyTd:function(tdData){

            var tableModels = tdData.tableModels, i = 0, str = '',

            data = tdData.data, trId = tdData.trId, tableModel,

            tdIdPostfix = tdData.tdIdPostfix, len = tableModels.length,

            htmlEncode = this._htmlEncode;

            for (; i < len; i++) {

                tableModel = tableModels[i];

                str += '<td id="' + trId + tdIdPostfix + i +'" ';

                if(tableModel.tdStyle){

                    str += 'style="' + tableModel.tdStyle + ';" ';

                }

                if(tableModel.tdClass){

                    str += 'class="' + tableModel.tdClass + ';"';

                }

                str += '>';

                if(typeof tableModel.renderCell === 'function'){

                    str += tableModel.renderCell(data[tableModel.dataKey]);

                }else if(tableModel.checkBoxId){

                    str += '<input type="checkbox" ';

                    if(data[tableModel.dataKey]){

                        str += 'checked';

                    }

                    str += '/>';

                }else{

                    str += htmlEncode(data[tableModel.dataKey]);

                }

                str += '</td>';

            }

            return str;

        },

        _renderGridHead:function(){

            this.$gridHeadTable = $('<table class="leoUi-jqgrid-htable" cellspacing="0" cellpadding="0" border="0"><thead><tr class="leoUi-jqgrid-labels"></tr></thead></table>').find('tr').html(this._renderGridHeadTh()).end().appendTo(this.$gridHeadDiv.find('div.leoUi-jqgrid-hbox'));

        },

        _renderGridBody:function(){

            this._renderBodySizeTr();

            this.$gridBodyTable = $('<table class="leoUi-jqgrid-btable" cellspacing="0" cellpadding="0" border="0"></table>').appendTo(this.$gridBodyDiv.find('div.leoUi-jqgrid-hbox-inner'));

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

            var footerIds = this.gridIds.footerIds;

            this.$footer = $('<div id="' + footerIds.footer + '" class="leoUi-state-default leoUi-jqgrid-pager leoUi-corner-bottom"><div class="leoUi-pager-control"><table cellspacing="0" cellpadding="0" border="0" role="row" style="width:100%;table-layout:fixed;height:100%;" class="leoUi-pg-table"><tbody><tr><td align="left" id="' + footerIds.footer_left + '"></td><td align="center" style="white-space: pre; width: 276px;" id="' + footerIds.footer_center + '"></td><td align="right" id="'+ footerIds.footer_right + '"></td></td></tr></tbody></table></div></div>').appendTo(this.$gridBox.find('#' + this.gridIds.gview_grid));

        },

        _renderGridFooterLeft:function(){

            var gridFooter, first_page, prev_page, set_page_input,

            now_page, next_page, last_page, get_perPages_select

            '<table cellspacing="0" cellpadding="0" border="0" class="leoUi-pg-table" style="table-layout:auto;" id="'+ leoGrid +'page_center_table"><tbody><tr><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'first_page" style="'+fPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-first"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'prev_page" style="'+fPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-prev"></span></td><td style="width: 4px; cursor: default;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td><input id="'+ leoGrid +'set_page_input" type="text" role="textbox" value="1" maxlength="7" size="2" class="leoUi-pg-input"><span style="margin:0 4px 0 8px">共</span><span id="'+ leoGrid +'sp_1_page">0</span><span style="margin:0 4px">页</span></td><td style="width: 4px; cursor: default;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'next_page" style="'+LPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-next"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'last_page" style="'+LPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-end"></span></td><td><select  id="'+ leoGrid +'get_perPages_select" class="leoUi-pg-selbox">';


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

            return str += '<div id="' + gridIds.leoUi_grid + '" class="leoUi-jqgrid leoUi-widget leoUi-widget-content leoUi-corner-all"><div id="' + gridIds.lui_grid + '" class="leoUi-widget-overlay jqgrid-overlay"></div><div id="' + gridIds.load_grid + '" class="loading leoUi-state-default leoUi-state-active">读取中...</div><div class="leoUi-jqgrid-view" id="' + gridIds.gview_grid + '"><div class="leoUi-state-default leoUi-jqgrid-hdiv"><div class="leoUi-jqgrid-hbox"></div></div><div class="leoUi-jqgrid-bdiv"><div class="leoUi-jqgrid-hbox-inner" style="position:relative;"></div></div></div><div id="' + gridIds.rs_mgrid + '" class="leoUi-jqgrid-resize-mark" ></div></div>';

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

                lui_grid: leoGrid + 'lui_grid',

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

        _setTableWidth:function(){

            var tableWidth = this.options.width, scrollWidth = 0;

            if(tableWidth === false){return;}

            $.isFunction( tableWidth ) === true && ( tableWidth = tableWidth(this.$target));

            tableWidth = tableWidth + '';

            this._resizeTableIsScroll() && (scrollWidth = this.options.scrollWidth);

            if(tableWidth.indexOf('%') === -1){

                this.tableSize.width = this.$gridBox.setOuterWidth(tableWidth).width() - scrollWidth;

            }else{

                this.tableSize.width = this.$gridBox.width(tableWidth).width() - scrollWidth;

            }

        },

        _resizeTableIsScroll:function(){

            return this.$gridBodyDiv.height() < this.$gridBodyTable.outerHeight();

        },

        _isScrollChange:function(){

            if(this.tableSize.changeCellLen === 0)return;

            var isScroll = this._resizeTableIsScroll();

            if(this.tableSize.isScroll === isScroll){

                return false;

            }else{

                this.tableSize.isScroll = isScroll;

                return true;

            }

        },

        _setTableHeight:function(){

            var tableHeight = this.options.height;

            if(tableHeight === false){return;}

            $.isFunction(tableHeight) === true && (tableHeight = tableHeight());

            tableHeight = tableHeight + '';

            if(tableHeight.indexOf('%') === -1){

                this.$gridBodyDiv.height(this.$gridBox.setOuterHeight(num).height() - this._getHdivAndPagerHeight());

            }else{

                this.$gridBodyDiv.height(this.$gridBox.height(tableHeight).height() - this._getHdivAndPagerHeight());

            }

        },

        _getHdivAndPagerHeight:function(){

            return this.$gridHeadDiv.outerHeight() + (this.$footer && this.$footer.outerHeight() || 0);

        },

        _resizeCountWidth:function(){

            if(this.tableSize.changeCellLen === 0)return;

            var tableSize = this.tableSize,

            cellSize = tableSize.cellSize,

            i = cellSize.length, cellSizeObj,

            gridIds = this.gridIds, sizeRowid = gridIds.sizeRowid,

            changeCellLen = tableSize.changeCellLen,

            sizeRowTdIdPostfix = gridIds.sizeRowTdIdPostfix,

            oldCellOuterWidth = 0, cellOuterWidth = 0,

            $gridBodyResizeRow = this.$gridBodyTable.find('#' + sizeRowid),

            $gridHeadResizeRow = this.$gridHeadResizeRow || this.$gridHeadTable.find('tr.leoUi-jqgrid-labels'),

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

            this.$gridBodyTable.width(tableWidth);

            this.$gridHeadTable.width(tableWidth);

            tableSize.width = tableWidth;

        },

        _addEvent:function(){

            var time,This = this;

            this._on(this.window, 'resize', function(event){

                event.preventDefault();

                !!time && clearTimeout(time);

                time = setTimeout(function(){

                    This._setTableHeight();

                    This._setTableWidth();

                    This._resizeCountWidth();

                }, 50);

            })._on(this.$gridBodyDiv, 'scroll', function(event){

                event.preventDefault();

                This.$gridHeadDiv.scrollLeft($(this).scrollLeft());

            });

        }

    });

    return $;

}));