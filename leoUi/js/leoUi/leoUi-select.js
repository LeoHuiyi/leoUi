/**
+-------------------------------------------------------------------
* jQuery leoUi--select
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-position","leoUi-tools","leoUi-effects"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

	$.leoTools.plugIn({

        name:'leoSelect',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

        	selectHtml:'<div class="leoSelect"></div>',

        	selectTitHtml: '<div class="leoSelect_tit">'
            +                '<span class="leoSelect_tit_val">选项</span>'
            +				 '<i class="leoSelect_tit_icon"></i>'
            +            '</div>',

            selectItemsHtml: '<div class="leoSelect_items"></div>',

            width: 'auto',

            selectItemsHeight:'auto',

            selectItemsMaxHeight:200,

            selectItemsMinHeight:100,

            selectItemsZIndex:1,

            selectedClass:'selected',

            disabledClass:'disabled',

			position: {

                my: "left top",

                at: "left bottom",

                collision: "flip"

            },

            disabled:false,

            showAnimation: function(callBack) {

                this.show( { effect: "bounce", duration: "slow", complete: callBack } );

            },

            hideAnimation: function(callBack) {

                this.hide( { effect: "bounce", duration: "slow", complete: callBack } );

            },

            beforeShow:$.noop

        },

        _init: function(){

        	if( this.$target.is('select') !== true ){

        		console.log('目标元素必须是select标签');

        	}

        	this._createSelectHtml();

        	this._initSelectItemsState();

        	this._addEvent();

        },

        _createSelectHtml:function(){

        	var $target = this.$target,op = this.options,

        	selectTitStr = op.selectTitHtml,$el,opWidth = op.width,

        	selectItemsStr = op.selectItemsHtml,selectedClass = op.selectedClass,

            disabledClass = op.disabledClass,

        	ulStr = '<ul class="leoSelect_items_ul">';

        	$target.children('option').each(function(index, el) {

        		$el = $(el);

                if( $el.prop('selected') === true ){

                    ulStr += '<li class="selected';

                    $el.prop('disabled') === true ? ulStr += ' ' + disabledClass + '"' : ulStr += '"';

                }else{

                    $el.prop('disabled') === true ? ulStr += '<li class="'+ disabledClass +'"' : ulStr += '<li';

                }

        		ulStr += ' op-val="' + $el.attr('value') + '"';

        		ulStr += '>' + $el.text() +'</li>';

        	});

        	ulStr += '</ul>';

        	this.$select = $(op.selectHtml).prop('tabindex',$target.prop('tabindex'));

        	this.$selectTit = $(selectTitStr).find('span.leoSelect_tit_val').text( ( this.selectedLi = $target.children().eq($target[0].selectedIndex) ).text()).end().appendTo(this.$select);

        	this.$selectItems = $(selectItemsStr).css( { 'zIndex': op.selectItemsZIndex, 'max-height': op.selectItemsMaxHeight,  'min-height': op.selectItemsMinHeight, 'height': op.selectItemsHeight } ).hide().append(ulStr).appendTo(this.$select);

            this.$selectItemsUl = this.$selectItems.find('ul.leoSelect_items_ul');

        	this.$select.insertBefore($target);

            this._setSelectWidth();

        	this.$target.hide();

        },

        _setSelectWidth:function(){

            var opWidth = this.options.width,$cloneItems,width,cloneItemsOuterWidth;

            if( opWidth === 'auto' ){

                $cloneItems = this.$selectItems.clone().hide().appendTo('body');

                cloneItemsOuterWidth = $cloneItems.outerWidth();

                this.$select.width( width = ( cloneItemsOuterWidth + this.$selectTit.children('i.leoSelect_tit_icon').outerWidth() ) );

                this.$selectItems.width( width - cloneItemsOuterWidth + $cloneItems.width() );

                $cloneItems.remove();

            }else{

                this.$select.width(opWidth);

                this.$selectItems.width(opWidth);

            }

        },

        _initSelectItemsState:function(){

        	this.$selectItems.is(':hidden') ? this._selectItemsState = 'close' : this._selectItemsState = 'open';

        },

        _setItemsPosition:function(position){

        	var position = position || this.options.position,

        	$selectItems = this.$selectItems,

        	isVisible = $selectItems.is( ":visible" );

        	!isVisible && $selectItems.show();

        	position.of = this.$select;

        	$selectItems.position(position);

        	!isVisible && $selectItems.hide();

        },

        _addEvent:function(){

        	var This = this,$ul = this.$selectItemsUl,op = this.options,

            $val = this.$selectTit.find('span.leoSelect_tit_val'),

            disabledClass = op.disabledClass,selectedClass = op.selectedClass;

        	this._on( this.$select, 'click', 'div.leoSelect_tit', function(event){

        		event.stopPropagation();

        		if( This._selectItemsState === 'close' ){

                    This.selectedLi = $ul.children('li.'+selectedClass).removeClass(selectedClass).end().children('li').eq(This.$target[0].selectedIndex).addClass(selectedClass);

        			This.show();

        		}else if( This._selectItemsState === 'open' ){

        			This.hide();

        		}

        	} );

        	this._on( this.$selectItems, 'click', 'li', function(event){

                event.stopPropagation();

                var $li = $(this);

                if( $li.hasClass(disabledClass) ){ return; }

                This.hide();

        		$ul.children('li.'+selectedClass).removeClass(selectedClass);

        		$li.addClass(selectedClass);

                $val.text($li.text());

        		This.$target.find('option').eq($li.index()).prop('selected',true);

        	} );

            this._on( this.$selectItems, 'mouseenter', 'li', function(event){

                event.stopPropagation();

                var $li = $(this);

                if( This._selectItemsState === 'open' && !$li.hasClass(disabledClass) ){

                    $ul.children('li.'+selectedClass).removeClass(selectedClass);

                    $li.addClass(selectedClass);

                }

            } );

        	this._on( 'body', 'click', function(event){

        		This._selectItemsState === 'open' && !$(event.target).closest(This.$select)[0] === true && This.hide();

        	} );

        },

        _destroy:function() {

			this.$select.remove();

			this.$target.show();

        },

        getSelectItemsState:function(){

        	return this._selectItemsState;

        },

        show:function(){

            if( this.options.disabled === true ){ return; }

            this.options.beforeShow.call( this.$select );

            this._setItemsPosition();

            this._selectItemsShowFn();

        },

        hide:function(notSelectItemsHideFn){

            if( this.options.disabled === true ){ return; }

            if(!notSelectItemsHideFn){

                this._selectItemsHideFn();

            }else{

                this.$selectItems.hide();

                this._selectItemsState = 'close';

            }

        },

        _selectItemsHideFn:function(){

            var This = this;

            this._selectItemsState = 'closeing';

            this.options.hideAnimation.call( this.$selectItems, function(){

                This._selectItemsState = 'close';

            } );

        },

        _selectItemsShowFn:function(){

        	var This = this;

            this._selectItemsState = 'opening';

            this.options.showAnimation.call( this.$selectItems, function(){

                This._scrollSelectedToShow();

                This._selectItemsState = 'open';

            } );

        },

        _scrollSelectedToShow:function(){

            var $li = $(this.selectedLi),liWidth = $li.width(),

            $ul = this.$selectItemsUl,index = this.selectedLi.index(),

            scrollTop = $li.offset().top - $ul.offset().top - ( parseFloat($ul.css('paddingTop')) || 0 ) - ( parseFloat($ul.children('li').filter(":first").css('marginTop')) || 0 );

            this.$selectItems.animate({'scrollTop': scrollTop}, 200);

        }

    });

	return $;

}));