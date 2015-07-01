/**
+-------------------------------------------------------------------
* jQuery leoUi--grid
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
*
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

}(function($) {

    $.leoTools.plugIn({

        name:'leoGrid',

        version:'1.0',

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

            dataType:'ajax',//ajax,data

            gridData:[],//grid的数据

            ajax:{

                url:'leoui.com',

                type: "POST",

                dataType:'json',

                offsetKey:'offset',//分页offsetkey

                lengthKey:'length',//分页长度key

                teamsCountKey:'teams_count',//数据总条数

                teamsKey:'teams',//总数据(为false时直接用data)

                data:{}

            },

            rowDataKeys:false,

            isFooter:true,

            cellEdit:false,//是否可编辑单元格

            minRow:0,//至少一条数据

            defaulTrId: 0,//默认trid

            isPage:true,//是否要分页功能

            rowNum:20,//每一页条数

            rowList:[20,30,50],//每一页可选条数

            currentPage:1,//当前选中的页面 (按照人们日常习惯,非计算机常识,是从1开始)

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

            clickTdCallback:$.noop//点击bodyTableTD回调

        },

        _init:function(){

            this._createGridBox();

        },

        _getSendAjaxPagerInfo:function( offset, length, isCurrentPage ){

            var op = this.options,ajax = $.extend( {}, op.ajax );

            ajax.data[ajax.lengthKey] = length;

            ajax.data[ajax.offsetKey] = isCurrentPage === true ? ( offset - 1 ) * length : offset;

            return ajax;

        },

        _getData:function(pagerInfo){

            var op = this.options,dataType = op.dataType,ajax,

            This = this,teamsKey,pagerCurrentPage,afterGetData = op.afterGetData;

            if(dataType === 'ajax'){

                this._loading(true);

                teamsKey = op.ajax.teamsKey;

                if(op.isPage === true){

                    if(pagerInfo === 'init'){

                        ajax = this._getSendAjaxPagerInfo( op.currentPage, op.rowNum, true );

                        pagerCurrentPage = op.currentPage;

                        op.beforeAjaxMegCallback('init');

                    }else{

                        ajax = this._getSendAjaxPagerInfo( pagerInfo.fristItems, pagerInfo.perPages );

                        pagerCurrentPage = pagerInfo.currentPage;

                        op.beforeAjaxMegCallback('changePager');

                    }

                }else{

                    ajax = op.ajax;

                }

                $.ajax(ajax).done(function(data){

                    This._loading();

                    console.log(data);

                    op.ajaxMegCallback(data, "done");

                    teamsKey === false ? This.teamsData = data : This.teamsData = data[teamsKey];

                    afterGetData && (This.teamsData = afterGetData(This.teamsData));

                    This._clearTableData();

                    if(op.isPage === true){

                        This.totalItems = data[ajax.teamsCountKey];

                        This._changePager( This._getPagerInfo( pagerCurrentPage) );

                    }else{

                        This.totalItems = data[ajax.teamsCountKey] || (This.teamsData && This.teamsData.length) || 0;

                        This._bodyTableAppendContent();

                        This._changeRightInfo();

                        This._setTableHeight(true);

                        This._resizeTableWidth();

                    }

                    This._boxIsAllCheck();

                    This._restoreSortClass();

                    op.tableLoadCallback( This.$bodyTable[0] );

                }).fail(function(data){

                    This._loading();

                    op.ajaxMegCallback(data, "fail");

                });

            }else if(dataType === 'data'){

                if(pagerInfo === 'init'){

                    this.teamsData = op.gridData;

                    afterGetData && (this.teamsData = afterGetData(this.teamsData));

                    this.totalItems = (this.teamsData && this.teamsData.length) || 0;

                    op.isPage === true && (pagerInfo = this._getPagerInfo( op.currentPage, op.rowNum ));

                }

                this._clearTableData();

                if(op.isPage === true){

                    this._changePager(pagerInfo);

                }else{

                    this._bodyTableAppendContent();

                    this._changeRightInfo();

                    this._setTableHeight(true);

                    this._resizeTableWidth();

                }

                this._boxIsAllCheck();

                this._restoreSortClass();

                op.tableLoadCallback( This.$bodyTable[0] );

            }

        },

        _getPagerInfo:function( page, perPages, totalItems ){

            var op = this.options,index,currentPage,

            last,totalpages,oldCurrentPage,isChange,

            isAjax = this.options.dataType === 'ajax';

            totalItems = $.isNumeric(+totalItems) ? +totalItems : this.totalItems >> 0;

            this.perPages = perPages = perPages >> 0 || this.perPages >> 0 || op.rowNum >> 0;

            totalpages = Math.ceil( totalItems/perPages );

            totalpages < 1 && ( totalpages = 1 );

            oldCurrentPage = currentPage = this.currentPage || + op.currentPage;

            switch(page){

                case 'now':

                    break;

                case 'first_page':

                    currentPage = 0;

                    break;

                case 'prev_page':

                    currentPage -= 1;

                    break;

                case 'next_page':

                    currentPage += 1;

                    break;

                case 'last_page':

                    currentPage = totalpages;

                    break;

                default:

                    if($.isNumeric(+page)){

                        currentPage = +page;

                    }

            }

            ;(isAjax || currentPage === oldCurrentPage) && (isChange = true);

            if( currentPage < 1 ){

                currentPage = 1;

            }else if( currentPage > totalpages ){

                currentPage = totalpages;

            }

            page !== 'now' && (this.currentPage =  currentPage);

            index = perPages * ( currentPage - 1 );

            index < 0 && ( index = 0 );

            last = index + perPages - 1;

            last + 1 > totalItems && ( last = totalItems - 1 );

            return{

                isChange: !isChange ? oldCurrentPage !== currentPage : isChange,

                totalItems: totalItems,

                perPages: perPages,

                length: last + 1 - index,

                currentPage: this.currentPage,

                totalpages: totalpages,

                isFristPage: isAjax ? false : this.currentPage <= 1,

                isLastPage: isAjax ? false : this.currentPage >= totalpages,

                fristItems: index,

                lastItems: last

            };

        },

        changeData:function(url){

            !!url && (this.options.ajax.url = url);

            this.$gridBox.show();

            this._setTableWidth(true);

            this._setTableHeight(true);

            this._tableWidthAuto();

            this._getData('init');

        },

        _setPager:function( page, perPages, mustChange, changeInput ){

            if(this.options.isPage === false){return;}

            var pagerInfo = this._getPagerInfo( page, perPages );

            if( pagerInfo.isChange === false && !mustChange ){

                changeInput === true && this.$setPageInput.val( pagerInfo.currentPage );

                return;

            }

            this._getData(pagerInfo);

        },

        _bodyTableAppendContent:function(pagerInfo){

            this.$bodyTable.empty().append(this._bodyTableTbodyStr(pagerInfo));

        },

        _changePager:function( pagerInfo, notAddBodyTable ){

            if(this.options.isPage === false){return;}

            var fPageStyle,LPageStyle;

            this.$pager.show();

            !pagerInfo && ( pagerInfo = this._getPagerInfo( 'now' ) );

            pagerInfo.isFristPage === true ? fPageStyle = 'default' : fPageStyle = 'pointer';

            pagerInfo.isLastPage === true ? LPageStyle = 'default' : LPageStyle = 'pointer';

            !notAddBodyTable && this._bodyTableAppendContent(pagerInfo);

            this.$firstPage.css( 'cursor', fPageStyle );

            this.$nextPage.css( 'cursor', LPageStyle );

            this.$lastPage.css( 'cursor', LPageStyle );

            this.$allPage.text(pagerInfo.totalpages);

            this.$prevPage.css( 'cursor', fPageStyle );

            this.$setPageInput.val(pagerInfo.currentPage);

            this._changeRightInfo(pagerInfo.fristItems+1);

            this._setTableHeight(true);

            this._resizeTableWidth();

        },

        _initPager:function(){

            if(this.options.isPage === false){return;}

            var rowList = this.options.rowList,i = 0,

            length = rowList.length,child,centerStr,

            $pageCenter = this.$pageCenter,fPageStyle,LPageStyle,

            perPages = this.options.rowNum,leoGrid = this.leoGrid;

            LPageStyle = fPageStyle = 'cursor: default;';

            centerStr = '<table cellspacing="0" cellpadding="0" border="0" class="leoUi-pg-table" style="table-layout:auto;" id="'+ leoGrid +'page_center_table"><tbody><tr><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'first_page" style="'+fPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-first"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'prev_page" style="'+fPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-prev"></span></td><td style="width: 4px; cursor: default;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td><input id="'+ leoGrid +'set_page_input" type="text" role="textbox" value="1" maxlength="7" size="2" class="leoUi-pg-input"><span style="margin:0 4px 0 8px">共</span><span id="'+ leoGrid +'sp_1_page">0</span><span style="margin:0 4px">页</span></td><td style="width: 4px; cursor: default;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'next_page" style="'+LPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-next"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'last_page" style="'+LPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-end"></span></td><td><select  id="'+ leoGrid +'get_perPages_select" class="leoUi-pg-selbox">';

            for( ; i < length; i++ ){

                child = rowList[i];

                child === perPages ? centerStr += '<option selected="selected" value="'+child+'">'+child+'</option>' : centerStr += '<option value="'+child+'">'+child+'</option>';

            }

            centerStr += '</select></td></tr></tbody></table>';

            this.$pager = $(centerStr).hide().appendTo($pageCenter);

            this.$firstPage = $pageCenter.find('#' + leoGrid + 'first_page');

            this.$prevPage = $pageCenter.find('#' + leoGrid + 'prev_page');

            this.$nextPage = $pageCenter.find('#' + leoGrid + 'next_page');

            this.$lastPage = $pageCenter.find('#' + leoGrid + 'last_page');

            this.$allPage = $pageCenter.find('#' + leoGrid + 'sp_1_page');

            this.$setPageInput = $pageCenter.find('#' + leoGrid + 'set_page_input');

            this.currentPage = 1;

            this._initPagerEvent();

        },

        _initRightInfo:function(){

            if(this.options.isFooter === false){

                return;

            }

            this.$pageRightInfo = $('<div id="'+ this.leoGrid +'page_right_info" class="leoUi-paging-info" style="text-align:right">无数据显示</div>').appendTo(this.$pageRight);

        },

        _changeRightInfo:function(fristItems){

            if(this.options.isFooter === false){

                return;

            }

            var totalItems = (this.totalItems >> 0) + (+this.nullItemsLen),

            lastItems,pagerLen = this.$bodyTable[0].rows.length - 1;

            fristItems = $.isNumeric(+fristItems) ? +fristItems : 1;

            if(totalItems === 0){

                this.$pageRightInfo.text('无数据显示');

            }else{

                if(pagerLen === 0){

                    fristItems = 0;

                    lastItems = 0;

                }else{

                    lastItems = fristItems + pagerLen - 1;

                }

                this.$pageRightInfo.html(fristItems + ' - ' + lastItems + '&nbsp;&nbsp;共' + totalItems + '条');

            }

        },

        _createFooter:function(){

            if(this.options.isFooter === false){

                this.options.isPage = false;

                return;

            }

            var leoGrid = this.leoGrid;

            this.$footer = $('<div id="'+ leoGrid +'page" class="leoUi-state-default leoUi-jqgrid-pager leoUi-corner-bottom"><div class="leoUi-pager-control" id="'+ leoGrid +'pg_page"><table cellspacing="0" cellpadding="0" border="0" role="row" style="width:100%;table-layout:fixed;height:100%;" class="leoUi-pg-table"><tbody><tr><td align="left" id="'+ leoGrid +'page_left"></td><td align="center" style="white-space: pre; width: 276px;" id="'+ leoGrid +'page_center"></td><td align="right" id="'+ leoGrid +'page_right"></td></td></tr></tbody></table></div></div>');

            this.$pageLeft = this.$footer.find('#' + leoGrid + 'page_left');

            this.$pageCenter= this.$footer.find('#' + leoGrid + 'page_center');

            this.$pageRight = this.$footer.find('#' + leoGrid + 'page_right');

            this._initPager();

            this._initRightInfo();

            this.$footer.appendTo(this.$gviewGrid);

        },

        _initPagerEvent:function(){

            var This = this,leoGrid = this.leoGrid;

            this._on( this.$pageCenter, 'click', 'td', function(event){

                event.preventDefault();

                if($(this).css('cursor') === 'default'){

                    return;

                }

                if( this.id === leoGrid + 'first_page' ){

                    This._setPager('first_page');

                }else if( this.id === leoGrid + 'prev_page' ){

                    This._setPager('prev_page');

                }else if( this.id === leoGrid + 'next_page' ){

                    This._setPager('next_page');

                }else if( this.id === leoGrid + 'last_page' ){

                    This._setPager('last_page');

                }

            } );

            this._on( this.$footer.find('#' + leoGrid + 'get_perPages_select'), 'change', function(event){

                event.preventDefault();

                This._setPager( 'first_page', this.value, true );

            } );

            this._on( this.$setPageInput, 'keydown', function(event){

                event.keyCode === 13 && This._setPager( $(this).val(), false, false, true );

            } );

        },

        _createGridBox:function(){

            var leoGrid = this.leoGrid = $.leoTools.getId('Grid') + '_';

            this.$gridBox = $('<div id="'+ leoGrid +'leoUi_grid" class="leoUi-jqgrid leoUi-widget leoUi-widget-content leoUi-corner-all" style="visibility:hidden"><div id="'+ leoGrid +'lui_grid" class="leoUi-widget-overlay jqgrid-overlay"></div><div id="'+ leoGrid +'load_grid" class="loading leoUi-state-default leoUi-state-active">读取中...</div><div class="leoUi-jqgrid-view" id="'+ leoGrid +'gview_grid"><div class="leoUi-state-default leoUi-jqgrid-hdiv"><div class="leoUi-jqgrid-hbox"></div></div><div class="leoUi-jqgrid-bdiv"><div class="leoUi-jqgrid-hbox-inner" style="position:relative;"></div></div></div><div id="'+ leoGrid +'rs_mgrid" class="leoUi-jqgrid-resize-mark" ></div></div>');

            this.tableData = {};

            this.tableData.rowArr = [];

            this.tableData.selectRowArr = [];

            this.leoGridTrId = 0;

            this.totalItems = 0;

            this.nullItemsLen = 0;

            this.$gviewGrid = this.$gridBox.find('#' + leoGrid + 'gview_grid');

            this.$uiJqgridHdiv = this.$gviewGrid.find('div.leoUi-jqgrid-hdiv');

            this.$uiJqgridBdiv = this.$gviewGrid.find('div.leoUi-jqgrid-bdiv');

            this._createHeadTable();

            this._createBoxCheckFn();

            this._createResizeTh();

            this._createSortTb();

            this._createBodyTable('init');

            this._createFooter();

            this.$target.empty().append( this.$gridBox );

            this._addEvent();

            if(this.options.onlyInit){

                this.$gridBox.hide().css( 'visibility', '' );

            }else{

                this._setTableWidth();

                this._setTableHeight();

                this._tableWidthAuto();

                this.$gridBox.css( 'visibility', '' );

                this._getData('init');

            }

        },

        _clearTableData:function(){

            this.tableData = {};

            this.tableData.rowArr = [];

            this.tableData.selectRowArr = [];

        },

        _loading:function(show){

            !this.$loading && ( this.$loading = this.$gridBox.find('#' + this.leoGrid + 'load_grid') );

            show === true ? this.$loading.show() : this.$loading.hide();

        },

        setDisabledEvent:function(flag){

            this.options.disabledEvent = !!flag;

        },

        _setTableWidth:function(isRiseze){

            if( this.options.resizeWidth === false && isRiseze === true || this.$target.is(':hidden') ){ return; }

            var tableWidth = this.options.width, width, num;

            if(tableWidth === false){return;}

            $.isFunction( tableWidth ) === true && ( tableWidth = tableWidth(this.$target) );

            num = +tableWidth;

            if(num === num){

                width = this.$gridBox.setOuterWidth(num).width();

                this.tableOption.boxWidth = width;

            }else{

                this.$gridBox.width(tableWidth);

                tableWidth = this.tableOption.boxWidth = this.$gridBox.width();

            }

        },

        setTableWidthOrHeight:function(tableWidth, tableHeight){

            var flag = false, width, num;

            if(typeof tableWidth === 'number' || typeof tableWidth === 'string'){

                num = +tableWidth;

                if(num === num){

                    width = this.$gridBox.setOuterWidth(tableWidth).width();

                    this.tableOption.boxWidth = width;

                    flag = true;

                }else{

                    this.$gridBox.width(tableWidth);

                    tableWidth = this.tableOption.boxWidth = this.$gridBox.width();

                    this.$gviewGrid.width(tableWidth);

                    this.$uiJqgridHdiv.width(tableWidth);

                    this.$uiJqgridBdiv.width(tableWidth);

                    !!this.$footer && this.$footer.width(tableWidth);

                    flag = true;

                }

            }

            if(typeof tableHeight === 'number' || typeof tableHeight === 'string'){

                num = +tableHeight;

                if(num === num){

                    this.$gridBox.setOuterHeight(tableHeight);

                    tableHeight = this.$gridBox.height();

                    this.$uiJqgridBdiv.height( tableHeight - this._getHdivAndPagerHeight() );

                    flag = true;

                }else{

                    this.$gridBox.height(tableHeight);

                    tableHeight = this.$gridBox.height();

                    this.$uiJqgridBdiv.height( tableHeight - this._getHdivAndPagerHeight() );

                    flag = true;

                }

            }

            flag === true && this._resizeTableWidth();

        },

        _setTableHeight:function(isRiseze){

            if( this.options.resizeHeight === false && isRiseze === true || this.$target.is(':hidden')){ return; }

            var tableHeight = this.options.height, num;

            if(tableHeight === false){return;}

            $.isFunction( tableHeight ) === true && ( tableHeight = tableHeight() );

            num = +tableHeight;

            if(num === num){

                this.$gridBox.setOuterHeight(num);

                tableHeight = this.$gridBox.height();

                this.$uiJqgridBdiv.height( tableHeight - this._getHdivAndPagerHeight() );

            }else{

                this.$gridBox.height(tableHeight);

                tableHeight = this.$gridBox.height();

                this.$uiJqgridBdiv.height( tableHeight - this._getHdivAndPagerHeight() );

            }

        },

        _getHdivAndPagerHeight:function(){

            return this.$uiJqgridHdiv.outerHeight() + (this.$footer && this.$footer.outerHeight() || 0);

        },

        _tableWidthAuto:function(){

            var tableOption = this.tableOption,tableWidth = tableOption.tableWidth,first = false;

            if( !this.$jqgThtrow ){

                this.$jqgThtrow = this.$headTable.find('tr.leoUi-jqgrid-labels');

                first = true;

                tableOption.firstTableWidth = tableWidth;

            }

            this._resizeTableWidth( first, tableWidth );

        },

        removeTableSelectRow:function(){

            var selectRowArr = this.tableData.selectRowArr,

            i = selectRowArr.length,trid;

            if( i > 0 ){

                this.totalItems -= i;

                while( i-- ){

                    trid = selectRowArr[i];

                    $("#" + trid).remove();

                    this._removeTableDataRow(trid);

                }

                this._removeSelectAllRowArr();

                this._refreshPager();

                this._boxIsAllCheck();

                this._refreshEvenClass();

            }

        },

        _refreshPager:function(){

            if(this.options.isPage === false){

                this._changeRightInfo(1);

            }else{

                this._changePager( false, true );

            }

        },

        _refreshEvenClass:function(){

            var evenClass = this.options.evenClass;

            if( typeof evenClass !== 'string' ){ return; }

            this.$bodyTable.find('tr.jqgrow').each(function(index, el) {

                $(el).removeClass(evenClass);

                index % 2 === 1 && $(el).addClass(evenClass);

            });

        },

        getSelectRowsTrId:function(){

            var arr = [],selectRowArr = this.tableData.selectRowArr,

            i = selectRowArr.length;

            while( i-- ){

                arr.push( this.getTrId(selectRowArr[i]) );

            }

            return arr;

        },

        getTrId:function(trid){

            typeof trid !== 'string' && (trid = trid.id);

            if(trid){

                trid = this._getTableDataRow(trid)[this.options.trIdKey];

            }

            return trid;

        },

        getEditRowInfo: function( tr, typeOptionDoneCallBack, typeOptionFailCallBack ){

            var tableModel = this.tableOption.tableModel,length = tableModel.length,

            child,prop,arr = [],tableData = this._getTableDataRow(tr.id),

            fnArr = [],This = this,i = 0,dfd,op = this.options,

            edit,trIdKey = op.trIdKey,data = {};

            data[trIdKey] = tableData[trIdKey];

            data.rowDatas = tableData.rowDatas;

            for( ;i < length; i++ ){

                child = tableModel[i];

                prop = {};

                edit = child.edit;

                if( edit !== false ){

                    if( edit.type === 'text' ){

                        prop.theadName = child.theadName;

                        prop.id = child.id;

                        prop.val = tableData[child.thId].val;

                    }else if( edit.type === 'select' ){

                        prop.theadName = child.theadName;

                        prop.id = child.id;

                        prop.val = tableData[child.thId].val;

                        prop.selectKeyId = edit.selectKeyId;

                        prop.selectKey = tableData[child.thId].selectKey;

                    }

                    prop.edit = $.extend( {}, edit );

                    if( typeof edit.typeOption === 'function' ){

                        if( edit.typeOptionFnAsyn === true ){

                            dfd = $.Deferred();

                            edit.typeOption( dfd, prop.edit, 'typeOption' );

                            fnArr.push(dfd);

                        }else{

                            prop.edit.typeOption = edit.typeOption();

                        }

                    }

                    arr.push(prop);

                }

            }

            if( fnArr.length === 0 ){

                data.teams = arr;

                typeOptionDoneCallBack && typeOptionDoneCallBack(data);

                return data;

            }else{

                this._loading(true);

                op.beforeAjaxMegCallback('getEditRowInfo');

                $.when.apply(null,fnArr).done(function(doneData){

                    This._loading();

                    op.ajaxMegCallback(doneData, 'done');

                    data.teams = arr;

                    typeOptionDoneCallBack && typeOptionDoneCallBack(data);

                }).fail(function(failData){

                    This._loading();

                    op.ajaxMegCallback(data, 'fail');

                    typeOptionFailCallBack && typeOptionFailCallBack(failData);

                });

            }

        },

        _getEditTypeOption:function(edit, doneCallBack, failCallBack){

            var dfd,prop,op,This;

            if( typeof edit.typeOption === 'function' ){

                if( edit.typeOptionFnAsyn === true ){

                    op = this.options;

                    This = this;

                    this._loading(true);

                    op.beforeAjaxMegCallback('getEditTypeOption');

                    prop = {};

                    edit.typeOption( dfd = $.Deferred(), prop, 'typeOption' );

                    dfd.done(function(data){

                        This._loading();

                        op.ajaxMegCallback(data, 'fail');

                        doneCallBack && doneCallBack(prop.typeOption);

                    }).fail(function(data){

                        This._loading();

                        op.ajaxMegCallback(data, 'fail');

                        failCallBack && failCallBack(prop.typeOption);

                    });

                }else{

                    doneCallBack && doneCallBack(edit.typeOption());

                }

            }else{

                doneCallBack && doneCallBack(edit.typeOption);

            }

        },

        getEditCellInfo: function( td, typeOptionDoneCallBack, typeOptionFailCallBack ){

            if(!td){return;}

            var This = this,thid = $(td).attr('thid'),op = this.options,

            trIdKey = op.trIdKey,

            tableData = this._getTableDataRow(td.parentNode.id),data = { thid: thid },

            dfd, tdModel = $.extend({}, this._getTableModel(thid)),

            edit = tdModel.edit,celldatas = data.celldatas = {};

            data.rowDatas = $.extend({}, tableData.rowDatas);

            data[trIdKey] = tableData[trIdKey];

            if( edit !== false ){

                if( edit.type === 'text' ){

                    celldatas.theadName = tdModel.theadName;

                    celldatas.id = tdModel.id;

                    celldatas.val = tableData[tdModel.thId].val;

                }else if( edit.type === 'select' ){

                    celldatas.theadName = tdModel.theadName;

                    celldatas.id = tdModel.id;

                    celldatas.val = tableData[tdModel.thId].val;

                    celldatas.selectKeyId = edit.selectKeyId;

                    celldatas.selectKey = tableData[tdModel.thId].selectKey;

                }

                data.edit = $.extend( {}, edit );

                if( typeof edit.typeOption === 'function' ){

                    if( edit.typeOptionFnAsyn === true ){

                        dfd = $.Deferred();

                        edit.typeOption( dfd, data.edit, 'typeOption' );

                    }

                }

            }

            if(dfd){

                this._loading(true);

                op.beforeAjaxMegCallback('getEditCellInfo');

                dfd.done(function(doneData){

                    This._loading();

                    op.ajaxMegCallback(doneData, 'done');

                    typeOptionDoneCallBack && typeOptionDoneCallBack(data, 'done');

                }).fail(function(failData){

                    This._loading();

                    op.ajaxMegCallback(data, 'fail');

                    typeOptionFailCallBack && typeOptionFailCallBack(failData, 'fail');

                });

            }else{

                typeOptionDoneCallBack && typeOptionDoneCallBack(data);

                return data;

            }

        },

        removeRow:function(tr){

            var tableData,trId = tr.id;

            if(trId && (tableData = this._getTableDataRow(trId))){

                $(tr).remove();

                !tableData._nullItem ? this.totalItems-- : this.nullItemsLen--;

                this._refreshPager();

                this._removeSelectRowArr(tr);

                this._removeTableDataRow(trId);

                this._refreshEvenClass();

                this._boxIsAllCheck();

            }

        },

        _resizeTableWidth:function( first, firstTableWidth ){

            if(first !== true && this.$target.is(':hidden')){return;}

            var tableOption = this.tableOption,resizeGetWidth,

            tableFixed = tableOption.tableFixed;

            if( tableOption.isFixed === true ){

                first === true && this._makeFixedPercent(tableFixed);

                resizeGetWidth = this._resizeGetWidth();

                this._resizeCountWidth( resizeGetWidth.difWidth, tableFixed.fixedProp, resizeGetWidth.tableWidth, tableOption );

            }else if( first === true ){

                this.$headTable.width(firstTableWidth);

                this.$bodyTable.width(firstTableWidth);

            }else if( tableOption.isResize === true ){

                this._resizeSetHeadTable(tableOption);

            }

        },

        _resizeSetHeadTable:function(tableOption){

            var tableModels = tableOption.tableModel,i = tableModels.length,

            tableModel,$jqgThtrow = this.$jqgThtrow,

            firstTableWidth = tableOption.firstTableWidth,

            $jqgfirstrow = this.$bodyTable.find('tr.jqgfirstrow');

            while( i-- ){

                tableModel = tableModels[i];

                $jqgThtrow.children('#' + tableModel.thId ).width(tableModel.width);

                $jqgfirstrow.children('td[firstid="'+ tableModel.thId +'"]').width(tableModel.width);

            }

            this.$headTable.width(firstTableWidth);

            this.$bodyTable.width(firstTableWidth);

        },

        _resizeGetWidth:function(){

            var difWidth,scrollWidth = 18,boxWidth,tableOption = this.tableOption,

            opBoxWidth = tableOption.boxWidth;

            !opBoxWidth && (opBoxWidth = this.$gridBox.width());

            boxWidth = this._resizeTableIsScroll() === true ? opBoxWidth - scrollWidth : opBoxWidth;

            difWidth = boxWidth - tableOption.fixed;

            return {

                difWidth: difWidth,

                tableWidth: boxWidth

            };

        },

        _resizeCountWidth:function( difWidth, fixedProp, tableWidth, tableOption ){

            var tableModels = tableOption.tableModel,i = tableModels.length,

            oldWidth = 0,child,j = fixedProp.length,

            $jqgfirstrow = this.$bodyTable.find('tr.jqgfirstrow'),width = 0,tableModel,

            $jqgThtrow = this.$jqgThtrow;

            while( i-- ){

                tableModel = tableModels[i];

                if( tableModel.fixed === true ){

                    child = fixedProp[--j];

                    if( j === 0 ){

                        width = difWidth - oldWidth;

                        child.minWidth >= width && ( tableWidth += child.minWidth - width, width = child.minWidth );

                        child.width = width;

                        $jqgThtrow.children('#' + child.id ).width(width);

                        $jqgfirstrow.children('td[firstid="'+ child.id +'"]').width(width);

                    }else{

                        oldWidth += width =  Math.round( child.fixedPercent * difWidth );

                        child.minWidth >= width && ( tableWidth += child.minWidth - width, width = child.minWidth );

                        child.width = width;

                        $jqgThtrow.children('#' + child.id ).width(width);

                        $jqgfirstrow.children('td[firstid="'+ child.id +'"]').width(width);

                    }

                }else if( tableOption.isResize === true ){

                    $jqgThtrow.children('#' + tableModel.thId ).width(tableModel.width);

                    $jqgfirstrow.children('td[firstid="'+ tableModel.thId +'"]').width(tableModel.width);

                }

            }

            this.$headTable.width(tableWidth);

            this.$bodyTable.width(tableWidth);

            this.tableOption.tableWidth = tableWidth;

        },

        _resizeTableIsScroll:function(){

            return this.$uiJqgridBdiv.height() < this.$bodyTable.outerHeight();

        },

        _makeFixedPercent:function(tableFixed){

            var fixedWidth = tableFixed.fixedWidth,fixedProp = tableFixed.fixedProp,

            i = fixedProp.length;

            this.tableOption.fixed = this.tableOption.tableWidth - fixedWidth;

            while( i-- ){

                fixedProp[i].fixedPercent = fixedProp[i].width / fixedWidth;

            }

        },

        _addEvent:function(){

            var time,This = this;

            this._on( this.window, 'resize', function(event){

                event.preventDefault();

                !!time && clearTimeout(time);

                time = setTimeout( function(){

                    This._setTableHeight(true);

                    This._setTableWidth(true);

                    This._resizeTableWidth();

                }, 16 );

            } );

            this._on( this.$uiJqgridBdiv, 'scroll', function(event){

                event.preventDefault();

                This.$uiJqgridHdiv.scrollLeft( $(this).scrollLeft() );

            } );

            this._on( this.$bodyTable, 'click', 'tr', function(event){

                This.options.clickTrCallback.call( this, event, this, This.$bodyTable[0] ) !== false && !!This._boxCheck && This._boxCheck(this);

            } );

            this._on( this.$bodyTable, 'click', 'td', function(event){

                This.options.clickTdCallback.call( this, event, this, This.$bodyTable[0] );

                This.cellEdit(this);

            } );

            this._addMouseHover();

        },

        _addMouseHover:function(){

            var op = this.options,hoverClass = op.hoverClass;

            if(op.isHover){

                this._on( this.$bodyTable, 'mouseenter', 'tr', function(event){

                    event.preventDefault();

                    $(this).addClass(hoverClass);

                } );

                this._on( this.$bodyTable, 'mouseleave', 'tr', function(event){

                    event.preventDefault();

                    $(this).removeClass(hoverClass);

                } );


            }

        },

        saveCell: function(){

            var $edit = this.$bodyTable.find('#' + this.editId || ''),td,trid,

            $td,thid,tableModel,tdData,val,edit,selectKey,op,tableModelId;

            if(!$edit[0]){return;}

            op = this.options;

            $td = $edit.parent('td');

            td = $td[0];

            trid = td.parentNode.id;

            thid = $td.attr('thid');

            tableModel = this._getTableModel(thid);

            tdData = this._getTableDataRow(trid)[thid];

            tableModelId = tdData.tableModelId;

            edit = tableModel.edit;

            switch(edit.type){

                case 'text':

                    this._editKeyDownOff($edit);

                    val = $edit.val();

                    op.beforeSaveCell !== false && (val = op.beforeSaveCell(td, val, tableModelId));

                    this.editCell(td, val);

                    op.afterSaveCell(td, val, tableModelId);

                    break;

                case 'select':

                    this._editKeyDownOff($edit);

                    selectKey = $edit.val();

                    op.beforeSaveCell !== false && (selectKey = op.beforeSaveCell(td, selectKey, tableModelId));

                    this.editCell(td, selectKey);

                    op.afterSaveCell(td, selectKey, tableModelId);

                    break;

                default:

            }

        },

        cellEdit: function(td){

            if(this.options.cellEdit === false && !$.contains( td, this.$bodyTable[0] )){return;}

            var trData,$td = $(td),tdData,id,

            thid = $td.attr('thid'),tdId,

            tableModel = this._getTableModel(thid),edit = tableModel.edit;

            if(edit){

                trData = this._getTableDataRow(tdId = td.parentNode.id);

                tdData = trData[thid];

                id = tdId + tableModel.id;

                if($td.find('#' + id)[0]){return;}

                this.saveCell();

                switch(edit.type){

                    case 'text':

                        this._editCellText(td, tdData, id);

                        break;

                    case 'select':

                        this._editCellSelect(id, td, edit, tdData);

                        break;

                    default:

                }

            }

        },

        _editCellText:function(td, tdData, id){

            var op = this.options,val = tdData.val,

            tableModelId = tdData.tableModelId;

            op.beforeCellEdit !== false && (val = op.beforeCellEdit(td, val, tableModelId));

            this._editKeyDownOn($('<input id="'+ id +'" class="textbox" type="text" style="width: 100%;">').val(val).appendTo($(td).empty()).select());

            this.editId = id;

            op.afterCellEdit(td, val, tableModelId);

        },

        _editCellSelect:function(id, td, edit, tdData){

            var This = this,op = this.options;

            this._getEditTypeOption(edit, function(typeOption){

                var str = '<select id="'+ id +'" size="1">',prop,

                selectKey = tdData.selectKey,

                tableModelId = tdData.tableModelId;

                for(prop in typeOption){

                    if(typeOption.hasOwnProperty(prop)){

                        str += '<option value="'+ prop +'">'+ typeOption[prop] +'</option>';

                    }

                }

                str += '</select>';

                op.beforeCellEdit !== false && (selectKey = op.beforeCellEdit(td, selectKey, tableModelId));

                This._editKeyDownOn($(str).val(selectKey).appendTo($(td).empty()).focus());

                This.editId = id;

                op.afterCellEdit(td, selectKey, tableModelId);

            });

        },

        _editKeyDownOn: function($el){

            var This = this;

            this._on($el, 'keydown', function(event) {

                if (event.which === 13) {

                    This.saveCell();

                    return false;

                }

            });

        },

        getEditTableData: function(cellCallBack, rowCallBack, tableCallBack){

            var tableData = this._copyTableDataRow(),callBackData,

            prop,arr = [],row,rowObj,cell,isEmpty,val,tableModelId,

            trIdKey = this.options.trIdKey,value,i = 0,length = tableData.length;

            for(; i < length; i++){

                row = tableData[i];

                rowObj = {};

                isEmpty = true;

                for(prop in row){

                    if(row.hasOwnProperty(prop)){

                        cell = row[prop];

                        if(prop === trIdKey){

                            rowObj[prop] = cell;

                        }else if((tableModelId = cell.tableModelId)){

                            value = cell.selectKey === undefined ? cell.val: cell.selectKey;

                            !!cellCallBack ? val = cellCallBack(tableModelId, value) : val = value;

                            rowObj[tableModelId] = val;

                            val !== '' && (cell.isMust === true) && (isEmpty = false);

                        }

                    }

                }

                if(rowCallBack && (callBackData = rowCallBack(rowObj, isEmpty, row)) !== false){

                    arr.push(callBackData);

                }else{

                    isEmpty === false && arr.push(rowObj);

                }

            }

            !!tableCallBack && (arr = tableCallBack(arr) || arr);

            return arr;

        },

        _editKeyDownOff: function($el){

            this._off($el, 'keydown');

        },

        _createBoxCheckFn:function(){

            var boxCheckType = this.options.boxCheckType;

            if( boxCheckType === 'radio' ){

                this._boxCheck = function(tr){

                    var radioBoxRow = this.tableData.radioBoxRow,

                    activeClass = this.options.activeClass,

                    $tr = $(tr),radioBoxId = this.tableOption.radioBoxId;

                    if( this.options.disabledCheck === false  ){

                        if(radioBoxRow){

                            $("#" + radioBoxRow).removeClass(activeClass).find('input[checkid="'+ radioBoxId +'"]').prop( 'checked', false );

                        }

                        !radioBoxId ? $tr.addClass(activeClass) : $tr.addClass(activeClass).find('input[checkid="'+ radioBoxId +'"]').prop( 'checked', true );

                        this.tableData.radioBoxRow = tr.id;

                    }

                };

            }else if( boxCheckType === 'multiple' ){

                var This = this;

                this._boxCheck = function(tr){

                    if( this.options.disabledCheck === false  ){

                        var $tr = $(tr),activeClass = this.options.activeClass;

                        if( $tr.hasClass(activeClass) === true ){

                            $tr.removeClass(activeClass);

                            this._removeSelectRowArr(tr);

                            this._boxCheckOff(tr);

                        }else{

                            $tr.addClass(activeClass);

                            this._addSelectRowArr(tr);

                            this._boxCheckOn(tr);

                        }

                    }

                };

                this._on( this.$thCheck = this.$thCheck || this.$headTable.find( '#' + this.tableOption.checkBoxId ), 'click.checkBox', function(event){

                    This.boxAllCheck( event, this, true );

                } );

            }

        },

        _boxCheckOn:function(tr){

            var checkBoxId = this.tableOption.checkBoxId;

            if( !checkBoxId ){ return; }

            $(tr).find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', true );

            this._boxIsAllCheck();

        },

        boxAllCheck:function( event, input, notSetCheck ){

            if( this.options.disabledCheck === true ){ return; }

            var checkBoxId = this.tableOption.checkBoxId,This = this,

            activeClass = this.options.activeClass,$input = $(input),

            isAllChecked = this._getSelectRowArrLength() === this.$bodyTable[0].rows.length - 1;

            if( checkBoxId ){

                this.$thCheck = this.$thCheck || this.$headTable.find( '#' + checkBoxId );

                if( !notSetCheck ){

                    isAllChecked === true ? this.$thCheck.prop( 'checked', false ) : this.$thCheck.prop( 'checked', true );

                }

            }

            this.$bodyTable.find('tr.jqgrow ').each(function(index, el) {

                var $el = $(this);

                if( isAllChecked === false ){

                    $el.addClass(activeClass);

                    !!checkBoxId && $el.find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', true );

                    This._addSelectRowArr(this);

                }else{

                    $el.removeClass(activeClass);

                    !!checkBoxId && $el.find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', false );

                    This._removeSelectRowArr(this);

                }

            });

            isAllChecked === false ? $input.prop( 'checked', true ) : $input.prop( 'checked', false );

            !notSetCheck && this._boxIsAllCheck();

        },

        _boxIsAllCheck:function(){

            var checkBoxId = this.tableOption.checkBoxId,length;

            if( !checkBoxId ){ return; }

            length = this._getSelectRowArrLength();

            this.$thCheck = this.$thCheck || this.$headTable.find( '#' + this.tableOption.checkBoxId );

            if( length === 0 ){

                this.$thCheck.prop( {'indeterminate': false, 'checked': false } );

            }else if( length === this.$bodyTable[0].rows.length - 1 && length !== 0 ){

                this.$thCheck.prop( {'indeterminate': false, 'checked': true } );

            }else{

                this.$thCheck.prop( {'indeterminate': true, 'checked': false } );

            }

        },

        _boxCheckOff:function(tr){

            var checkBoxId = this.tableOption.checkBoxId;

            if( !checkBoxId ){ return; }

            $(tr).find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', false );

            this._boxIsAllCheck();

        },

        _addSelectRowArr:function(trid){

            var selectRowArr = this.tableData.selectRowArr;

            typeof trid !== 'string' && (trid = trid.id);

            trid && $.inArray( trid, selectRowArr ) === -1 && this.tableData.selectRowArr.push(trid);

        },

        _getSelectRowArrLength:function(){

            return !!this.tableData.selectRowArr && this.tableData.selectRowArr.length || 0;

        },

        _removeSelectAllRowArr:function(){

            this.tableData.selectRowArr = [];

        },

        _removeSelectRowArr:function(trid){

            var selectRowArr = this.tableData.selectRowArr,

            i = selectRowArr.length;

            typeof trid !== 'string' && (trid = trid.id);

            if(trid){

                while( i-- ){

                    if( selectRowArr[i] === trid ){

                        selectRowArr.splice( i, 1 );

                    }

                }

            }

        },

        addRow:function(data){

            var $body = this.$bodyTable,rowLength = $body[0].rows.length - 1,

            length,i = 0,totalItems = +this.totalItems;

            $.type(data) !== 'array' && (data = [data]);

            length = data.length;

            for ( ; i < length; i++ ) {

                $body.find('tbody').append( this._tableTbodyTrStr( data[i], this.tableOption.tableModel, rowLength++ ) );

            }

            this.totalItems = totalItems + length;

            this._refreshPager();

            this._boxIsAllCheck();

        },

        getRowCell: function(modelId, tr){

            if(modelId && tr){

                var thid = this.leoGrid + modelId;

                return $(tr).find('td[thid="'+ thid +'"]')[0];

            }

        },

        getRowCellData: function(modelId, tr){

            if(modelId && tr){

                var rowData = this._getTableDataRow(tr.id);

                if(rowData){

                    return $.extend(true, {}, rowData[this.leoGrid + modelId]);

                }

            }

        },

        editCell:function(td, val){

            if(!td && (val === undefined)){return;}

            var $td = $(td),thId = $td.attr('thid'),typeOption,

            trId = td.parentNode.id,tableModel = this._getTableModel(thId),

            rowData = this._getTableDataRow(trId),selectKey,

            cellData = rowData[thId],edit = tableModel.edit,

            trIndex = rowData.trIndex;

            if(edit){

                if(edit.type === 'select'){

                    if(edit.selectKeyId && (selectKey = val) !== undefined){

                        cellData.selectKey = selectKey;

                    }else if(typeof (typeOption = edit.typeOption) === 'object'){

                        selectKey = val;

                        val = typeOption[selectKey];

                        cellData.selectKey = selectKey;

                    }

                }

                if( typeof tableModel.renderCell === 'function' ){

                    $td.html(tableModel.renderCell(val, trIndex, selectKey, rowData));

                }else{

                    $td.text(val);

                }

                cellData.val = val;

            }

        },

        editRow:function( tr, data ){

            if(!tr && (data === undefined)){return;}

            var tableModel = this.tableOption.tableModel,i = tableModel.length,

            child,val,$tr = $(tr),edit,tdData,selectKey,thid,typeOption,

            trId = tr.id,$td,tableData = this._getTableDataRow(trId),

            rowData = this._getTableDataRow(trId),

            trIndex = tableData.trIndex;

            if( !$tr[0] ){

                $tr = this.$bodyTable.find('#' + trId);

                if( !$tr[0] ){ return; }

            }

            while( i-- ){

                child = tableModel[i];

                edit = child.edit;

                if( (val = data[child.id]) !== undefined ){

                    thid = this.leoGrid + child.id;

                    tdData = tableData[thid];

                    $td = $tr.find('td[thid="'+ thid +'"]');

                    if(edit.type === 'select'){

                        if(edit.selectKeyId && (selectKey = data[edit.selectKeyId]) !== undefined){

                            tdData && (tdData.selectKey = selectKey);

                        }else if(typeof (typeOption = edit.typeOption) === 'object'){

                            selectKey = val;

                            val = typeOption[selectKey];

                            tdData && (tdData.selectKey = selectKey);

                        }

                    }

                    if( typeof child.renderCell === 'function' ){

                        $td.html(child.renderCell(val, trIndex, selectKey, rowData));

                    }else{

                        $td.text(val);

                    }

                    tdData && (tdData.val = val);

                }

            }

        },

        renderTable:function(){

            this.options.isPage === true ? this._setPager( 'now', false, true ) : this._getData();

        },

        _createResizeTh:function(){

            if( this.tableOption.isResize === true ){

                this._resizeThEvent();

                this.$rsLine = this.$rsLine || this.$gridBox.find('#' + this.leoGrid + 'rs_mgrid');

            }

        },

        _createSortTb:function(){

            if( this.tableOption.isSort === true ){

                this._sortTbEvent();

                this.colsStatus = this.colsStatus || {};

            }

        },

        _sortTbEvent:function(){

            var This = this;

            this._on( this.$headTable, 'click.sort', 'div.leoUi-jqgrid-sortable', function(event){

                This._sortTb( event, this.parentNode );

            } );

        },

        _sortTb:function( event, th ){

            var $th = $(th),thId = th.id,status,

            tableModel = this._getTableModel(thId),

            localSort = tableModel.localSort,sortby = this._sortby,

            formatSort = tableModel.formatSort || this._formatSort,

            getSortVal = tableModel.getSortVal || this._getSortVal,

            $bodyTable = this.$bodyTable,

            sortableType = $.trim( tableModel.sortableType ).toLowerCase();

            this.sortRows = $bodyTable.find('tr.jqgrow').get();

            status = this.colsStatus[thId] = ( this.colsStatus[thId] === undefined ) ? 1 : this.colsStatus[thId] * -1;

            if( $.isFunction(localSort) ){

                this.sortRows.sort(function( row1, row2 ){

                    return localSort( row1, row2, formatSort, getSortVal, status, thId, sortableType );

                });

            }else{

                this.sortRows.sort(function( row1, row2 ){

                    return sortby( row1, row2, formatSort, getSortVal, status, thId, sortableType );

                });

            }

            $bodyTable.append(this.sortRows);

            this._refreshEvenClass();

            this._setSortClass( $th.find('span.leoUi-sort'), status );

        },

        _setSortClass:function( $span, status ){

            var lastSpan = this.colsStatus.lastSpan;

            $span.removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb');

            if( status === 1 ){

                $span.addClass('leoUi-sort-asc');

            }else if( status === -1 ){

                $span.addClass('leoUi-sort-desc');

            }

            if( !!lastSpan && lastSpan !== $span[0] ){

                $(lastSpan).removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb').addClass('leoUi-sort-ndb');

            }

            this.colsStatus.lastSpan = $span[0];

        },

        _restoreSortClass:function(){

            if(!this.tableOption.isSort){return;}

            var lastSpan = this.colsStatus.lastSpan;

            !!lastSpan && $(lastSpan).removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb').addClass('leoUi-sort-ndb');

            this.colsStatus = {};

        },

        _sortby:function( row1, row2, formatSort, getSortVal, status, thId, sortableType ){

            var val1 = formatSort( getSortVal( row1, thId ), sortableType ),

            val2 = formatSort( getSortVal( row2, thId ), sortableType ),

            result = 0;

            switch(typeof val1){

                case "string":

                    result = val1.localeCompare(val2);

                    break;

                case "number" :

                    result = val1 - val2;

                    break;

            }

            result *= status;

            return result;

        },

        _getSortVal:function( tr, thId ){

            return $(tr).children('td[thid="'+ thId +'"]').text() || '';

        },

        _formatSort:function( s, sortableType ){

            var result;

            switch(sortableType){

                case "string":

                    result = s.toUpperCase();

                    break;

                case "number" :

                    if(/\%$/.test(s)){

                        result = Number(s.replace("%",""));

                    }else{

                        result = parseFloat(s,10);

                    }

                    break;

                case "date" :

                    !s ? result = 0 : result = Date.parse(s.replace(/\-/g,'/'));

                    !result && (result = 0);

                    break;

            }

            return result;

        },

        _textselect:function(bool) {

            this[bool ? "_on" : "_off"](this.document, 'selectstart.darg', false);

            this.document.css("-moz-user-select", bool ? "none" : "");

            this.document[0].unselectable = bool ? "off" : "on";

        },

        _resizeThEvent:function(){

            var This = this;

            this._on( this.$headTable, 'mousedown.dargLine', 'span.leoUi-jqgrid-resize-ltr', function(event){

                This._resizeLineDragStart(event,this.parentNode);

            } );

        },

        _getTableModel:function(thid){

            var tableModels = this.tableOption.tableModel,

            i = tableModels.length,tableModel;

            while(i--){

                tableModel = tableModels[i];

                if( tableModel.thId === thid ){

                    return tableModel;

                }

            }

        },

        _resizeLineDragStart:function(event,th){

            var $th = $(th),This = this,firstLeft,baseLeft,thId = th.id,dargLine,

            lineHeight = this.$uiJqgridHdiv.outerHeight() + this.$uiJqgridBdiv.outerHeight();

            dargLine = this.dargLine = {};

            dargLine.width = $th.width();

            dargLine.thId = thId;

            dargLine.dragMinWidth = this._getTableModel(thId).dragMinWidth;

            this.$rsLine.css({top:0,left:firstLeft = ( event.pageX - (this.dargLine.startLeft=this.$gridBox.offset().left))}).height(lineHeight).show();

            baseLeft = dargLine.baseLeft = firstLeft - dargLine.width;

            dargLine.minLeft = baseLeft + dargLine.dragMinWidth;

            this._textselect(true);

            this._on( this.$uiJqgridHdiv, 'mousemove.dargLine', function(event){

                This._resizeLineDragMove(event);

            } );

            this._on( this.document, 'mouseup.dargLine', function(event){

                This._resizeLineDragStop(event);

            } );

            event.preventDefault();

            return true;

        },

        _resizeLineDragMove:function(event){

            var dargLine = this.dargLine,

            minLeft = dargLine.minLeft,left = event.pageX - dargLine.startLeft;

            minLeft > left && ( left = minLeft );

            dargLine.left = left;

            this.$rsLine.css({top:0,left:left});

            event.preventDefault();

            return false;

        },

        _resizeLineDragStop:function(event){

            var dargLine = this.dargLine;

            this._off( this.$uiJqgridHdiv, 'mousemove.dargLine' );

            this._off( this.document, 'mouseup.dargLine' );

            this.$rsLine.hide();

            this._setTdWidth( dargLine.left - dargLine.baseLeft, dargLine );

            this._textselect(false);

            this.dargLine = null;

            return false;

        },

        _setTdWidth:function( newTdWidth, dargLine ){

            var difWidth = newTdWidth - dargLine.width,

            tableOption = this.tableOption,id = dargLine.thId,

            tableWidth = tableOption.tableWidth + difWidth;

            this.$jqgThtrow.children('#' + id ).width(newTdWidth);

            this.$bodyTable.find('tr.jqgfirstrow').children('td[firstid="'+ id +'"]').width(newTdWidth);

            this.$headTable.width(tableWidth);

            this.$bodyTable.width(tableWidth);

            tableOption.isFixed === true && ( tableOption.tableWidth = tableWidth );

        },

        _createHeadTable:function(){

            this.$headTable = $( this._headTableStr() ).appendTo( this.$uiJqgridHdiv.find('div.leoUi-jqgrid-hbox') );

        },

        _createBodyTable:function(pagerInfo){

            var str = '<table class="leoUi-jqgrid-btable" cellspacing="0" cellpadding="0" border="0">';

            pagerInfo !== 'init' && (str += this._bodyTableTbodyStr(pagerInfo));

            str += '</table>';

            this.$bodyTable = $(str).appendTo( this.$uiJqgridBdiv.find('div.leoUi-jqgrid-hbox-inner') );

        },

        _getTeams:function(){

            var rowArr = this.tableData.rowArr;

            if(!rowArr._init){

                rowArr._init = true;

                return $.extend(true, [], this.teamsData);

            }else{

                return rowArr;

            }

        },

        _bodyTableTbodyStr:function( pagerInfo ){

            if( !this.teamsData ){ return ''; }

            var opModel = this.tableOption.tableModel,op = this.options,

            i = 0,length,teams,index,

            str = '<tbody>' + this._tableTbodyFirstTrStr( opModel, opModel.length );

            if(op.isPage === true){

                pagerInfo = pagerInfo || this._getPagerInfo();

                index = pagerInfo.fristItems;

                if( op.dataType === 'ajax' ){

                    i = 0;

                    teams = this._getTeams();

                }else{

                    teams = this._getTeams().slice(pagerInfo.fristItems, pagerInfo.lastItems + 1);

                }

                teams = this.teams = this.createEmptyArray(teams);

                length = teams.length;

                for ( ; i < length; i++ ) {

                    str += this._tableTbodyTrStr( teams[i], opModel, index++ );

                }

            }else{

                teams = this.teams = this.createEmptyArray(this._getTeams().slice());

                length = teams.length;

                for ( i = 0; i < length; i++ ) {

                    str += this._tableTbodyTrStr( teams[i], opModel, i );

                }

            }

            return str += '</tbody>';

        },

        createEmptyArray:function(teams){

            var minLength,op = this.options,minRow = op.minRow,

            tableModel = op.tableModel,i,obj,

            length = teams.length;

            if((minLength = minRow - length) > 0 && tableModel){

                i = tableModel.length;

                obj = {_nullItem:true};

                obj[op.trIdKey] = op.defaulTrId;

                while(i--){

                    obj[tableModel[i].id] = "";

                }

                while(minLength--){

                    teams.push($.extend({}, obj));

                    this.nullItemsLen++;

                }

                return teams;

            }else{

                return teams;

            }

        },

        _headTableStr:function(){

            var str = '',op = this.options,tableModel,i = 0,modelLength;

            !this.tableOption && ( this.tableOption = { tableWidth : 0, tableModel: [], tableFixed: { fixedWidth: 0, fixedProp: [] } } );

            tableModel = op.tableModel;

            modelLength = tableModel.length;

            str +='<table class="leoUi-jqgrid-htable" cellspacing="0" cellpadding="0" border="0"><thead><tr class="leoUi-jqgrid-labels">';

            for ( ; i < modelLength; i++ ) {

                str += this._tableThStr( tableModel[i] );

            }

            str += '</tr></thead></table>';

            return str;

        },

        _tableThStr:function(obj){

            var prop,tableOption = this.tableOption,serialNumber,checkBox,radioBox,str = '';

            if( obj.id || ( !tableOption.serialNumberId && ( serialNumber = obj.boxType === 'serialNumber' ) ) || ( !tableOption.checkBoxId && ( checkBox = obj.boxType === 'checkBox' ) ) || ( !tableOption.radioBoxId && ( radioBox = obj.boxType === 'radioBox' ) ) ){

                obj.thId = this.leoGrid + ( obj.id || obj.boxType );

                prop = $.extend( {}, this.options.tableModelDefault, obj );

                serialNumber === true && ( tableOption.serialNumberId = prop.thId );

                radioBox === true && ( tableOption.radioBoxId = prop.thId + '_input' );

                checkBox === true && ( tableOption.checkBoxId = prop.thId + '_input' );

                tableOption.tableModel.push(prop);

                tableOption.tableWidth += prop.width + prop.cellLayout;

                str += '<th id = "'+ prop.thId +'" class="leoUi-state-default leoUi-th-column leoUi-th-ltr" style="width:'+ prop.width +'px">';

                prop.resize === true && ( str += '<span class="leoUi-jqgrid-resize leoUi-jqgrid-resize-ltr" style="cursor: col-resize;">&nbsp;</span>', tableOption.isResize = true );

                prop.sortable === true ? str += '<div class="leoUi-jqgrid-sortable">' : str += '<div>';

                if( prop.type === 'check' ){

                    prop.checked === true ? str += '<input type="checkbox" checked>' : str += '<input type="checkbox">';

                }else if(checkBox){

                    str += '<input type="checkbox" id="'+ tableOption.checkBoxId +'">';

                }else{

                    str += prop.theadName + '';

                }

                prop.sortable === true && ( str += '<span class="leoUi-sort-ndb leoUi-sort"><span class="leoUi-sort-top"></span><span class="leoUi-sort-bottom"></span></span>', tableOption.isSort = true );

                if( prop.fixed === true ){

                    tableOption.tableFixed.fixedProp.push( { id: prop.thId, width: prop.width, minWidth: prop.minWidth } );

                    tableOption.tableFixed.fixedWidth += prop.width;

                    tableOption.isFixed = true;

                }

                str += '</div></th>';

            }

            return str;

        },

        _tableTbodyFirstTrStr:function( gridJsonTh, thLength ){

            var str = '<tr class="jqgfirstrow" style="height:auto">',i = 0,th;

            for ( ; i < thLength; i++ ) {

                th = gridJsonTh[i];

                str += '<td style="height:0px;width:'+ th.width +'px" firstid="' + th.thId + '"></td>';

            }

            return str += '</tr>';

        },

        _copyTableDataRow:function(){

            return $.extend(true, [], this.tableData.rowArr);

        },

        _removeTableDataRow:function(trid){

            var rowArr = this.tableData.rowArr,i,row;

            if((i = rowArr.length)){

                while(i--){

                    row = rowArr[i];

                    if( row._trid === trid ){

                        rowArr.splice(i, 1);

                        break;

                    }

                }

            }

        },

        _getTableDataRow:function(trid){

            var rowArr = this.tableData.rowArr,i,row;

            if((i = rowArr.length)){

                while(i--){

                    row = rowArr[i];

                    if( row._trid === trid ){

                        return row;

                    }

                }

            }

        },

        _tableTbodyTrStr:function( gridJsonTr, gridJsonTh, trIndex ){

            var str = '',i = 0,length = gridJsonTh.length,th,op = this.options,

            trId = gridJsonTr && gridJsonTr[op.trIdKey],

            rowArr = this.tableData.rowArr,

            evenClass = op.evenClass,tdStr = '',

            leoGrid = this.leoGrid,rowData = {},rowDatas,

            id = leoGrid + this.leoGridTrId++,

            _isCheck = id+'_isCheck',

            rowDataKeys = op.rowDataKeys,value;

            typeof evenClass !== 'string' ? str = '<tr id="' + id + '"   tabindex="-1" class="leoUi-widget-content jqgrow leoUi-row-ltr' : trIndex % 2 === 1 ? str = '<tr id="' + id + '" tabindex="-1"  class="leoUi-widget-content jqgrow leoUi-row-ltr ' + evenClass : str = '<tr id="' + id + '"  tabindex="-1" class="leoUi-widget-content jqgrow leoUi-row-ltr';

            rowData._trid = id;

            rowData._nullItem = gridJsonTr._nullItem;

            rowDatas = rowData.rowDatas = {};

            !!rowDataKeys && rowDataKeys.replace(/[^, ]+/g,function(key){

                rowDatas[key] = gridJsonTr[key];

            });

            !!~trId && (rowData[op.trIdKey] = trId);

            rowData.trIndex = trIndex;

            for ( ; i < length; i++ ) {

                th = gridJsonTh[i];

                value = gridJsonTr && gridJsonTr[th.id];

                tdStr += this._tableTdStr( value, th, trIndex, gridJsonTr, rowData );

            }

            if(rowData[_isCheck]){

                str += ' ' + op.activeClass + '">';

                delete rowData[_isCheck];

            }else{

                str += '">';

            }

            rowArr.push(rowData);

            return str += tdStr + '</tr>';

        },

        _tableTdStr:function( value, tableModel, trIndex, gridJsonTr, rowData ){

            if( !tableModel ){ return; }

            var className = tableModel.className,renderCell = tableModel.renderCell,

            typeOption,selectKey,edit = tableModel.edit,

            thId = tableModel.thId, tdData,

            str = '<td style="text-align:' + tableModel.align + '" thid="' + thId + '"';

            className !== false && ( str += ' class="' + className + '"' );

            !!edit && (tdData = rowData[thId] = {});

            if(edit.type === 'select'){

                if(edit.selectKeyId && (selectKey = gridJsonTr[edit.selectKeyId]) !== undefined){

                    !!tdData && (tdData.selectKey = selectKey);

                }else if(typeof (typeOption = edit.typeOption) === 'object'){

                    selectKey = value;

                    value = typeOption[selectKey];

                    !!tdData && (tdData.selectKey = selectKey);

                }

            }

            str += '>';

            if( typeof renderCell === 'function' && typeof ( renderCell = renderCell( value, trIndex, selectKey, rowData ) ) === 'string' ){

                str += renderCell;

            }else if( tableModel.boxType === 'checkBox' ){

                if(!gridJsonTr[tableModel.checkBoxId]){

                    str += '<input type="checkbox" checkid="'+ this.tableOption.checkBoxId +'">';

                }else{

                    str += '<input type="checkbox" checkid="'+ this.tableOption.checkBoxId +'" checked>';

                    this._addSelectRowArr(rowData._trid);

                    rowData[rowData._trid+'_isCheck'] = true;

                }

            }else if( tableModel.boxType === 'radioBox' ){

                if(!gridJsonTr[tableModel.radioBoxId]){

                    str += '<input type="checkbox" checkid="'+ this.tableOption.radioBoxId +'">';

                }else{

                    str += '<input type="checkbox" checkid="'+ this.tableOption.radioBoxId +'" checked>';

                    this.tableData.radioBoxRow = rowData._trid;

                    rowData[rowData._trid+'_isCheck'] = true;

                }

            }else if( tableModel.boxType === 'serialNumber' ){

                str += trIndex + 1;

            }else{

                str += $.leoTools.htmlEncode(value);

            }

            if(tdData){

                tdData.val = value;

                tdData.tableModelId = tableModel.id;

                edit.isMust === false ? tdData.isMust = false : tdData.isMust = true;

            }

            return str += '</td>';

        }

    });

    return $;

}));