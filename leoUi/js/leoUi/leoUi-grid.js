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
        define(["leoUi-tools","leoUi-droppable"], factory);

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

            disabledEvent:false,//如果设置为true禁用grid的全部事件

            tableModel:null,//grid格式见例子

            trIdKey:'trid',//trIdKey

            disabledCheck:false,//禁用选择

            evenClass:'ui-priority-secondary',//为表身的偶数行添加一个类名，以实现斑马线效果。

            activeClass:'ui-state-highlight',//选中效果

            tableModelDefault:{

                width:100,//宽

                align:'center',//对齐方式

                theadName:'',//对应的表头内容

                className:false,//加上的class

                resize:false,//是否可调整宽度

                sortable:false,//是否排序

                checked:false,//是否选择

                fixed:false,//是否固定

                cellLayout:5,//宽度以外的值

                minWidth:10,//最小宽度

                renderCell:null//为每一个单元格渲染内容

            },

            dataType:'ajax',//ajax,data

            gridData:null,//grid的数据

            ajax:{

                url:'leoui.com',

                type: "POST",

                dataType:'json',

                idKey:'id',

                offsetKey:'offset',

                lengthKey:'length',

                teamsCountKey:'teams_count',

                teamsKey:'teams',

                data:{}

            },

            rowNum:10,//每一页条数

            rowList:[10,20,30],//每一页可选条数

            currentPage:1,//当前选中的页面 (按照人们日常习惯,非计算机常识,是从1开始)

            height:500,//设置表格的高度(可用函数返回值)

            resizeHeight:false,//是否在改变尺寸时调节高度

            width:500,//设置表格的宽度(可用函数返回值)

            resizeWidth:false,//是否在改变尺寸时调节高度

            setTableWidthCallback:$.noop,//设置表格的宽度默认与父级宽高

            tableLoadCallback:$.noop,//table完成后回调

            clickTdCallback:$.noop//点击bodyTableTD回调

        },

        _init:function(){

            this._createGridBox();

        },

        _getSendAjaxPagerInfo:function( offset, length ){

            var op = this.options,ajax = $.extend( {}, op.ajax );

            ajax.data[ajax.lengthKey] = length || op.rowNum;

            ajax.data[ajax.offsetKey] = offset || op.currentPage;

            return ajax;

        },

        _getData:function(pagerInfo){

            var op = this.options,dataType = op.dataType,ajax,This = this;

            if(dataType === 'ajax'){

                ajax = this._getSendAjaxPagerInfo( pagerInfo.fristItems, pagerInfo.perPages );

                $.ajax(ajax).done(function(data){

                    This.totalItems = data[ajax.teamsCountKey];

                    This.teams = data[ajax.teamsKey];

                    This._changePager( This._getPagerInfo( pagerInfo.currentPage ) );

                    This._boxIsAllCheck();

                });

            }else if(dataType === 'data'){

                this._changePager(pagerInfo);

                this._boxIsAllCheck();

            }

        },

        _getPagerInfo:function( page, perPages, totalItems ){

            var op = this.options,totalItems = + this.totalItems || + totalItems || 0,

            index,currentPage,last,totalpages;

            this.perPages = + perPages || this.perPages || op.rowNum;

            this.perPages < 1 && ( this.perPages = 1 );

            perPages = this.perPages;

            totalpages = Math.ceil( totalItems/perPages );

            this.currentPage = this.currentPage || + op.currentPage;

            oldCurrentPage = this.currentPage;

            page = page || 0;

            switch(page){

                case 'now':

                    break;

                case 'first_page':

                    this.currentPage = 0;

                    break;

                case 'prev_page':

                    this.currentPage -= 1;

                    break;

                case 'next_page':

                    this.currentPage += 1;

                    break;

                case 'last_page':

                    this.currentPage = totalpages;

                    break;

                default:

                    this.currentPage = + page;


            }

            if( this.currentPage < 1 ){

                this.currentPage = 1;

            }else if( this.currentPage > totalpages ){

                this.currentPage = totalpages;

            }

            currentPage =  this.currentPage;

            currentPage > totalpages && ( currentPage = totalpages );

            index = perPages * ( currentPage - 1 );

            index < 0 && ( index = 0 );

            last = index + perPages - 1;

            last + 1 > totalItems && ( last = totalItems - 1 );

            return{

                isChange: oldCurrentPage !== currentPage,

                totalItems: totalItems,

                perPages: perPages,

                length: last + 1 -index,

                currentPage: currentPage,

                totalpages: totalpages,

                isFristPage: currentPage === 1,

                isLastPage: currentPage === totalpages,

                fristItems: index,

                lastItems: last

            }

        },

        _initData:function(){

            var op = this.options,pagerInfo,This = this;

            if( op.dataType === 'data' ){

                this.totalItems = op.gridData.length;

                this.teams = $.extend( [], op.gridData );

                pagerInfo = this._getPagerInfo( op.currentPage, op.rowNum );

                this._createBodyTable();

                this._initPager(pagerInfo);

                this._setTableWidth();

                this._addEvent();

                this.$target.empty().append( this.$gridBox );

                this._setTableHeight();

                this._tableWidthAuto();

                this.$gridBox.css( 'visibility', '' );

                this.options.tableLoadCallback.call( null, this.$bodyTable );

            }else if( op.dataType === 'ajax' ){

                ajax = this._getSendAjaxPagerInfo( op.currentPage, op.rowNum );

                $.ajax(ajax).done(function(data){

                    This.totalItems = data[ajax.teamsCountKey];

                    This.teams = data[ajax.teamsKey];

                    pagerInfo = This._getPagerInfo( op.currentPage, op.rowNum );

                    This._createBodyTable();

                    This._initPager(pagerInfo);

                    This._setTableWidth();

                    This._addEvent();

                    This.$target.empty().append( This.$gridBox );

                    This._setTableHeight();

                    This._tableWidthAuto();

                    This.$gridBox.css( 'visibility', '' );

                    This.options.tableLoadCallback.call( null, this.$bodyTable );

                });

            }

        },

        _setPager:function( page, perPages, mustChange, changeInput ){

            var pagerInfo = this._getPagerInfo( page, perPages );

            if( pagerInfo.isChange === false && !mustChange ){

                changeInput === true && this.$setPageInput.val( pagerInfo.currentPage );

                return;

            }

            this._getData(pagerInfo);

        },

        _changePager:function(pagerInfo){

            var fPageStyle,LPageStyle;

            pagerInfo.init === true && ( pagerInfo = this._getPagerInfo( pagerInfo.fristItems ) );

            pagerInfo.isFristPage === true ? fPageStyle = 'default' : fPageStyle = 'pointer';

            pagerInfo.isLastPage === true ? LPageStyle = 'default' : LPageStyle = 'pointer';

            this.$bodyTable.empty().append(this._bodyTableTbodyStr(pagerInfo));

            this.$firstPage.css( 'cursor', fPageStyle );

            this.$prevPage.css( 'cursor', fPageStyle );

            this.$nextPage.css( 'cursor', LPageStyle );

            this.$lastPage.css( 'cursor', LPageStyle );

            this.$setPageInput.val(pagerInfo.currentPage);

            this.$allPage.text(pagerInfo.totalpages);

            this.$pageRightInfo.html((pagerInfo.fristItems+1)+' - '+(pagerInfo.lastItems+1)+'&nbsp;&nbsp;共'+pagerInfo.totalItems+'条');

            this._setTableHeight(true);

            this._resizeTableWidth();

        },

        _initPager:function( pagerInfo, isHide ){

            var rowList = this.options.rowList,i = 0,length = rowList.length,child,

            pagerInfo = pagerInfo || this._getPagerInfo(),perPages = pagerInfo.perPages,

            fPageStyle = pagerInfo.isFristPage === true ? 'cursor: default;' : 'cursor: pointer;';

            LPageStyle = pagerInfo.isLastPage === true ? 'cursor: default;' : 'cursor: pointer;';

            str = '<div id="page" class="ui-state-default ui-jqgrid-pager ui-corner-bottom"><div class="ui-pager-control" id="pg_page"><table cellspacing="0" cellpadding="0" border="0" role="row" style="width:100%;table-layout:fixed;height:100%;" class="ui-pg-table"><tbody><tr><td align="left" id="page_left"></td><td align="center" style="white-space: pre; width: 276px;" id="page_center"><table cellspacing="0" cellpadding="0" border="0" class="ui-pg-table" style="table-layout:auto;" id="page_center_table"><tbody><tr><td class="ui-pg-button ui-corner-all ui-state-disabled" id="first_page" style="'+fPageStyle+'"><span class="ui-icon ui-icon-seek-first"></span></td><td class="ui-pg-button ui-corner-all ui-state-disabled" id="prev_page" style="'+fPageStyle+'"><span class="ui-icon ui-icon-seek-prev"></span></td><td style="width: 4px; cursor: default;" class="ui-pg-button ui-state-disabled"><span class="ui-separator"></span></td><td><input id="set_page_input" type="text" role="textbox" value="'+pagerInfo.currentPage+'" maxlength="7" size="2" class="ui-pg-input"><span style="margin:0 4px 0 8px">共</span><span id="sp_1_page">'+pagerInfo.totalpages+'</span><span style="margin:0 4px">页</span></td><td style="width:4px;" class="ui-pg-button ui-state-disabled"><span class="ui-separator"></span></td><td class="ui-pg-button ui-corner-all ui-state-disabled" id="next_page" style="'+LPageStyle+'"><span class="ui-icon ui-icon-seek-next"></span></td><td class="ui-pg-button ui-corner-all ui-state-disabled" id="last_page" style="'+LPageStyle+'"><span class="ui-icon ui-icon-seek-end"></span></td><td><select  id="get_perPages_select" class="ui-pg-selbox">';

            for( ; i < length; i++ ){

                child = rowList[i];

                child === perPages ? str += '<option selected="selected" value="'+child+'">'+child+'</option>' : str += '<option value="'+child+'">'+child+'</option>';

            }

            str += '</select></td></tr></tbody></table></td><td align="right" id="page_right"><div id="page_right_info" class="ui-paging-info" style="text-align:right">'+(pagerInfo.fristItems+1)+' - '+(pagerInfo.lastItems+1)+'&nbsp;&nbsp;共'+pagerInfo.totalItems+'条</div></td></tr></tbody></table></div></div>';

            this.$pager = $(str);

            this.$firstPage = this.$pager.find('#first_page');

            this.$prevPage = this.$pager.find('#prev_page');

            this.$nextPage = this.$pager.find('#next_page');

            this.$lastPage = this.$pager.find('#last_page');

            this.$allPage = this.$pager.find('#sp_1_page');

            this.$pageRightInfo = this.$pager.find('#page_right_info');

            this.$setPageInput = this.$pager.find('#set_page_input');

            this.$pager.appendTo(this.$gviewGrid);

        },

        _createGridBox:function(){

            this.$gridBox = $('<div id="leoUi_grid" class="ui-jqgrid ui-widget ui-widget-content ui-corner-all" style="visibility:hidden"><div id="lui_grid" class="ui-widget-overlay jqgrid-overlay"></div><div id="load_grid" class="loading ui-state-default ui-state-active">读取中...</div><div class="ui-jqgrid-view" id="gview_grid"><div class="ui-state-default ui-jqgrid-hdiv"><div class="ui-jqgrid-hbox"></div></div><div class="ui-jqgrid-bdiv"><div class="ui-jqgrid-hbox-inner" style="position:relative;"></div></div></div><div id="rs_mgrid" class="ui-jqgrid-resize-mark" ></div></div>');

            this.tableData = {};

            this.tableData.rowElArr = [];

            this.isChecked = true;

            this.leoGrid = $.leoTools.getId('Grid') + '_';

            this.$gviewGrid = this.$gridBox.find('#gview_grid');

            this.$uiJqgridHdiv = this.$gviewGrid.find('div.ui-jqgrid-hdiv');

            this.$uiJqgridBdiv = this.$gviewGrid.find('div.ui-jqgrid-bdiv');

        	this._createHeadTable();

            this._initData();

        },

        _setTableWidth:function(isRiseze){

            if( this.options.resizeWidth === false && isRiseze === true ){ return; }

            var tableWidth = this.options.width;

            $.isFunction( tableWidth ) === true && ( tableWidth = tableWidth(this.$target) + 0 );

            if( isNaN(tableWidth) ){ return; }

            this.$gridBox.width(tableWidth);

            this.$gviewGrid.width(tableWidth);

            this.$uiJqgridHdiv.width(tableWidth);

            this.$uiJqgridBdiv.width(tableWidth);

            this.$pager.width(tableWidth);

            this.tableOption.boxWidth = tableWidth;

        },

        _setTableHeight:function(isRiseze){

            if( this.options.resizeHeight === false && isRiseze === true ){ return; }

            var tableHeight = this.options.height;

            $.isFunction( tableHeight ) === true && ( tableHeight = tableHeight() + 0 );

            if( isNaN(tableHeight) ){ return; }

            this.$uiJqgridBdiv.height( tableHeight - this.$gridBox.outerHeight() + this.$uiJqgridBdiv.outerHeight() );

        },

        _tableWidthAuto:function(){

            var tableOption = this.tableOption,tableWidth = tableOption.tableWidth,

            tableModel = tableOption.tableModel,first = false;

            !this.$jqgThtrow && ( this.$jqgThtrow = this.$headTable.find('tr.ui-jqgrid-labels'), first = true );

            this._resizeTableWidth( first, tableWidth );

        },

        removeTableSelectRow:function(){

            var selectRowElArr = this.tableData.selectRowElArr,

            i = selectRowElArr && selectRowElArr.length || 0;

            if( i > 0 ){

                while( i-- ){

                    this.removeRow( selectRowElArr[0] );

                    this._removeSelectRowArr( selectRowElArr[0] );

                }

                this._boxIsAllCheck();

                this.renderTable();

                this._resizeTableWidth();

            }

        },

        removeRow:function( tr, resizeRender ){

            $(tr).remove();

            resizeRender === true && ( this._resizeTableWidth() );

        },

        _resizeTableWidth:function( first, firstTableWidth ){

            if( this.tableOption.tableFixed.fixedWidth === 0 ){

                first === true && ( this.$headTable.width(firstTableWidth), this.$bodyTable.width(firstTableWidth) );

                return;

            }

            var tableOption = this.tableOption,resizeGetWidth,jqgfirstrow,

            tableFixed = tableOption.tableFixed,i,width,prop,propArr = [];

            first === true && this._makeFixedPercent(tableFixed);

            resizeGetWidth = this._resizeGetWidth();

            this._resizeCountWidth( resizeGetWidth.difWidth, tableFixed.fixedProp, resizeGetWidth.tableWidth );

        },

        _resizeGetWidth:function(){

            var difWidth,scrollWidth = 18,boxWidth,tableOption = this.tableOption;

            boxWidth = this._resizeTableIsScroll() === true ? tableOption.boxWidth - scrollWidth : tableOption.boxWidth;

            difWidth = boxWidth - tableOption.fixed;

            return {

                difWidth: difWidth,

                tableWidth: boxWidth

            };

        },

        _resizeCountWidth:function( difWidth, fixedProp, tableWidth ){

            var i = fixedProp.length,oldWidth = 0,child,

            jqgfirstrow = this.$bodyTable.find('tr.jqgfirstrow'),width = 0;

            while( i-- ){

                child = fixedProp[i];

                if( i === 0 ){

                    width = difWidth - oldWidth;

                    child.minWidth >= width && ( tableWidth += child.minWidth - width, width = child.minWidth );

                    child.width = width;

                    this.$jqgThtrow.children('#' + child.id ).width(width)

                    jqgfirstrow.children('td[firstid="'+ child.id +'"]').width(width);

                }else{

                    oldWidth += width =  Math.round( child.fixedPercent * difWidth )

                    child.minWidth >= width && ( tableWidth += child.minWidth - width, width = child.minWidth );

                    child.width = width;

                    this.$jqgThtrow.children('#' + child.id ).width(width)

                    jqgfirstrow.children('td[firstid="'+ child.id +'"]').width(width);

                }

            }

            this.$headTable.width(tableWidth);

            this.$bodyTable.width(tableWidth);

            this.tableOption.tableWidth = tableWidth;

        },

        _resizeTableIsScroll:function(){

            return this.$uiJqgridBdiv.height() < this.$bodyTable.height();

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

                        This._setTableWidth(true);

                        This._setTableHeight(true);

                        This._resizeTableWidth();

                }, 16 );

            } );

            this._on( this.$uiJqgridBdiv, 'scroll', function(event){

                event.preventDefault();

                This.$uiJqgridHdiv.scrollLeft( $(this).scrollLeft() );

            } );

            this._on( this.$bodyTable, 'mouseenter', 'tr', function(event){

                event.preventDefault();

                if( $(this).hasClass('ui-state-hover') === true ){ return; }

                $(this).addClass('ui-state-hover');

            } );

            this._on( this.$bodyTable, 'mouseleave', 'tr', function(event){

                event.preventDefault();

                $(this).removeClass('ui-state-hover');

            } );

            this._on( this.$thCheck = this.$thCheck || this.$headTable.find( '#' + this.tableOption.checkBoxId ), 'click', function(event){

                This.options.disabledCheck === false && This._boxAllCheck(this);

            } );

            this._on( this.$bodyTable, 'click', 'tr', function(event){

                if( This.options.disabledCheck === false  ){

                    if( This.isChecked === true ){

                        var $el = $(this),activeClass = This.options.activeClass;

                        if( $el.hasClass(activeClass) === true ){

                            $el.removeClass(activeClass);

                            This._removeSelectRowArr(this);

                            This._boxCheckOff(this);

                        }else{

                            $el.addClass(activeClass);

                            This._addSelectRowArr(this);

                            This._boxCheckOn(this);

                        }

                    }

                    This.isChecked = true;

                }

            } );

            this._on( this.$bodyTable, 'click', 'td', function(event){

                This.options.clickTdCallback.call( this, event, this, This._publicEvent, This.$bodyTable[0] );

            } );

            this._on( this.$pager.find('#page_center_table'), 'click', 'td', function(event){

                event.preventDefault();

                if( this.id === 'first_page' ){

                    This._setPager('first_page');

                }else if( this.id === 'prev_page' ){

                    This._setPager('prev_page');

                }else if( this.id === 'next_page' ){

                    This._setPager('next_page');

                }else if( this.id === 'last_page' ){

                    This._setPager('last_page');

                }

            } );

            this._on( this.$pager.find('#get_perPages_select'), 'change', function(event){

                event.preventDefault();

                This._setPager( 'first_page', this.value, true );

            } );

            this._on( this.$setPageInput, 'keydown', function(event){

                event.keyCode === 13 && This._setPager( $(this).val(), false, false, true );

            } );

        },

        _boxCheckOn:function(tr){

            var checkBoxId = this.tableOption.checkBoxId,rowsLength,checkLength;

            if( !checkBoxId ){ return; }

            $(tr).find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', true );

            this._boxIsAllCheck();

        },

        _boxAllCheck:function(input){

            var checkBoxId = this.tableOption.checkBoxId,allChecked,This = this,

            activeClass = this.options.activeClass;

            if( !checkBoxId ){ return; }

            this.$bodyTable.find('tr').not('tr.jqgfirstrow').each(function(index, el) {

                var $el = $(this),$input = $el.find('input[checkid="'+ checkBoxId +'"]');

                if( input.checked ){

                    $el.addClass(activeClass);

                    $input.prop( 'checked', true );

                    This._addSelectRowArr(this);

                }else{

                    $el.removeClass(activeClass);

                    $input.prop( 'checked', false );

                    This._removeSelectRowArr(this);

                }

            });

        },

        _boxIsAllCheck:function(){

            var length = this.$bodyTable.find( 'tr.' + this.options.activeClass ).length;

            this.$thCheck = this.$thCheck || this.$headTable.find( '#' + this.tableOption.checkBoxId );

            if( length === 0 ){

                this.$thCheck.prop( {'indeterminate': false, 'checked': false } );

            }else if( length === this.$bodyTable[0].rows.length - 1 && length !== 0 ){


                this.$thCheck.prop( {'indeterminate': false, 'checked': true } );


            }else{

                this.$thCheck.prop( 'indeterminate', true );

            }

        },

        _boxCheckOff:function(tr){

            var checkBoxId = this.tableOption.checkBoxId;

            if( !checkBoxId ){ return; }

            $(tr).find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', false );

            this._boxIsAllCheck();

        },

        _addSelectRowArr:function(el){

            var selectRowElArr = this.tableData.selectRowElArr = this.tableData.selectRowElArr || [];

            $.inArray( el, selectRowElArr ) === -1 && this.tableData.selectRowElArr.push(el);

        },

        _removeSelectRowArr:function(el){

            var selectRowElArr = this.tableData.selectRowElArr = this.tableData.selectRowElArr || [],

            i = selectRowElArr.length;

            while( i-- ){

                if( selectRowElArr[i] === el ){

                    this.tableData.selectRowElArr.splice( i, 1 );

                }

            }

        },

        addRow:function(data){

            var $body = this.$bodyTable;

            $body.find('tbody').append( this._tableTbodyTrStr( data, this.tableOption.tableModel, $body[0].rows.length - 1 ) );

            this._boxIsAllCheck();

            this._resizeTableWidth();

        },

        editRow:function( tr, data ){

            var tableModel = this.tableOption.tableModel,i = tableModel.length,

            thId,child,val,$tr = $(tr);

            while( i-- ){

                child = tableModel[i];

                if( val = data[child.id] ){

                    $tr.find('td[thid="'+ this.leoGrid + child.id +'"]').text(val);

                }

            }

            this.isChecked = false;

        },

        renderTable:function(){

            this._setPager( 'now', false, true );

        },

        _createHeadTable:function(){

            this.$headTable = $( this._headTableStr() ).appendTo( this.$uiJqgridHdiv.find('div.ui-jqgrid-hbox') );

        },

        _createBodyTable:function(){

            var str = '<table class="ui-jqgrid-btable" cellspacing="0" cellpadding="0" border="0">';

            str += this._bodyTableTbodyStr();

            str += '</table>';

            this.$bodyTable = $(str).appendTo( this.$uiJqgridBdiv.find('div.ui-jqgrid-hbox-inner') );

        },

        _bodyTableTbodyStr:function( pagerInfo ){

            if( !this.teams ){ return ''; }

            var opModel = this.tableOption.tableModel,index,

            pagerInfo = pagerInfo || this._getPagerInfo(),i,

            length = pagerInfo.lastItems + 1,teams = this.teams,

            str = '<tbody>' + this._tableTbodyFirstTrStr( opModel, opModel.length );

            index = i = pagerInfo.fristItems;

            if( this.options.dataType === 'ajax' ){

                i = 0;

                length = pagerInfo.length;

            }

            for ( ; i < length; i++ ) {

                str += this._tableTbodyTrStr( teams[i], opModel, index );

                index++;

            };

            return str += '</tbody>';

        },

        _headTableStr:function(){

            var str = '',gridJsonTh,op = this.options,

            tableModel,i = 0,opModel,modelLength;

            !this.tableOption && ( this.tableOption = { tableWidth : 0, tableModel: [], tableFixed: { fixedWidth: 0, fixedProp: [] } } );

            tableModel = op.tableModel;

            modelLength = tableModel.length;

            str +='<table class="ui-jqgrid-htable" cellspacing="0" cellpadding="0" border="0"><thead><tr class="ui-jqgrid-labels">';

            for ( ; i < modelLength; i++ ) {

                str += this._tableThStr( tableModel[i] );

            };

            str += '</tr></thead></table>';

            return str;

        },

        _tableThStr:function(obj){

            var prop,tableOption = this.tableOption,serialNumber,checkBox,str = '';

            if( obj.id || ( !tableOption.serialNumberId && ( serialNumber = obj.boxType === 'serialNumber' ) ) || ( !tableOption.checkBoxId && ( checkBox = obj.boxType === 'checkBox' ) ) ){

                obj.thId = this.leoGrid + ( obj.id || obj.boxType );

                prop = $.extend( {}, this.options.tableModelDefault, obj );

                serialNumber === true && ( tableOption.serialNumberId = obj.thId );

                checkBox === true && ( tableOption.checkBoxId = obj.thId + '_input' );

                tableOption.tableModel.push(prop);

                tableOption.tableWidth += prop.width + prop.cellLayout;

                str += '<th id = "'+ prop.thId +'" class="ui-state-default ui-th-column ui-th-ltr" style="width:'+ prop.width +'px">';

                prop.resize === true && ( str += '<span class="ui-jqgrid-resize ui-jqgrid-resize-ltr" style="cursor: col-resize;"></span>' );

                prop.sortable === true ? str += '<div class="ui-jqgrid-sortable">' : str += '<div>';

                if( prop.type === 'check' ){

                    prop.checked === true ? str += '<input type="checkbox" checked>' : str += '<input type="checkbox">';

                }else if(checkBox){

                    str += '<input type="checkbox" id="'+ tableOption.checkBoxId +'">'

                }else{

                    str += prop.theadName + '';

                };

                prop.sortable === true && ( str += '<span class="s-ico" style="display:none"><span class="ui-grid-ico-sort ui-icon-asc ui-state-disabled ui-icon ui-icon-triangle-1-n ui-sort-ltr" sort="asc"></span><span class="ui-grid-ico-sort ui-icon-desc ui-state-disabled ui-icon ui-icon-triangle-1-s ui-sort-ltr" sort="desc"></span></span>' );

                prop.fixed === true && ( tableOption.tableFixed.fixedProp.push( { id: prop.thId, width: prop.width, minWidth: prop.minWidth } ), tableOption.tableFixed.fixedWidth += prop.width );

                str += '</div></th>';

            }

            return str;

        },

        _tableTbodyFirstTrStr:function( gridJsonTh, thLength ){

            var str = '<tr class="jqgfirstrow" style="height:auto">',width,i = 0;

            for ( ; i < thLength; i++ ) {

                th = gridJsonTh[i];

                str += '<td style="height:0px;width:'+ th.width +'px" firstid="' + th.thId + '"></td>';

            };

            return str += '</tr>';

        },

        _tableTbodyTrStr:function( gridJsonTb, gridJsonTh, trIndex ){

            var str = '',width,i = 0,length = gridJsonTh.length,th,

            trId = gridJsonTb[this.options.trIdKey],

            evenClass = this.options.evenClass;

            typeof evenClass !== 'string' ? str = '<tr class="ui-widget-content jqgrow ui-row-ltr" tabindex="-1" ' : trIndex % 2 === 1 ? str = '<tr class="ui-widget-content jqgrow ui-row-ltr ' + evenClass + '" tabindex="-1" ' : str = '<tr class="ui-widget-content jqgrow ui-row-ltr" tabindex="-1"';

            !trId ? str += '>' : str += 'trid="' + trId + '">';

            for ( ; i < length; i++ ) {

                th = gridJsonTh[i];

                str += this._tableTdStr( gridJsonTb[th.id], th, trIndex );

            };

            return str += '</tr>';

        },

        _tableTdStr:function( value, tableModel, trIndex ){

            if( !tableModel ){ return; }

            var className = tableModel.className,renderCell = tableModel.renderCell;

            str = '<td style="text-align:' + tableModel.align + '" thid="' + tableModel.thId + '"', value = value || '';

            className === false ? str += '>' : str += 'class="' + className + '">'

            if( typeof renderCell === 'function' && typeof ( renderCell = renderCell.call( null, value, trIndex ) ) === 'string' ){

                str += renderCell;

            }else if( tableModel.type === 'check' ){

                tableModel.checked === true ? str += '<input type="checkbox" checked>' : str += '<input type="checkbox">';

            }else if( tableModel.boxType === 'checkBox' ){

                str += '<input type="checkbox" checkid="'+ this.tableOption.checkBoxId +'">';

            }else if( tableModel.boxType === 'serialNumber' ){

                str += trIndex + 1;

            }else{

                str += value + '';

            };

            return str += '</div></th>';

        }

    });

	return $;

}));