/**
+-------------------------------------------------------------------
* jQuery leoUi--combobox
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

        name:'leoListMenu',

        version:'1.0',

        addJquery:true,

        addJqueryFn:false,

        defaultsTarget:'listMenuHtml',

        uid:0,

        selectElem:null,

        defaults:{

            appendTo:'body',

        	data:[],

            isHide:false,

        	listMenuHtml:'<div class="leoListMenu"></div>',

        	menuContentHtml:'<div class="leoListMenu_menuContent"></div>',

            menuItemHtmlFn:function(data){

                return '<div class="leoListMenu_item" tabindex="-1"><span>' + data.value + '</span></div>';

            },

            menuItemSelector:'>.leoListMenu_item',

            listMenuHoverClass:'leoListMenu_hover',

            listMenuSelectClass:'leoListMenu_select',

            width: 100,

            listMenuMinHeight:100,

			position: {

                my: "left top",

                at: "left top",

                of: 'body',

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

            this.prefix = $.leoTools.getId('ListMenu') + '_';

            this.scrollbarWidth = this.scrollbarWidth || $.position.scrollbarWidth();

            this._setOpDisabled();

        	this._createlistMenuHtml();

        },

        _setOption:function( key, value ){

            if( key === 'disabled' ){

                this._setOpDisabled();

            }

        },

        _setOpDisabled:function(){

            var op = this.options;

            op.disabled === true ? op.disabledEvent = true: op.disabledEvent = false;

        },

        _createMenuItems:function(datas){

        	var op = this.options,datas = datas || $.extend([], op.data),

            datasLen,i = 0,data,prefix = this.prefix,

            listMenuData = {},menuItemHtmlFn = op.menuItemHtmlFn,id,

        	$menuContent = this.$menuContent,prevId,firstId,lastId;

        	datasLen = datas.length,last = datasLen - 1;

        	for(; i < datasLen ; i++){

        		data = datas[i];

                id = prefix + this.uid++;

                listMenuData[id] = {};

                listMenuData[id].data = data;

                if(!prevId){

                    firstId = listMenuData.firstId = id

                }else{

                    listMenuData[id].prevId = prevId;

                    listMenuData[prevId].nextId = id;

                    i === last && (lastId = listMenuData.lastId = id);

                }

                $(menuItemHtmlFn(data)).attr('id', id).appendTo($menuContent);

                prevId = id;

        	}

            listMenuData[firstId].prevId = lastId;

            listMenuData[lastId].nextId = firstId;

            this.listMenuData = listMenuData;

        },

        _createlistMenuHtml:function(){

        	var op = this.options;

            this.$menuContent = $(op.menuContentHtml);

            this._createMenuItems();

            this._addEvent();

            op.isHide === true && this.$target.hide();

            this.$target.setOuterWidth(op.width).append(this.$menuContent).appendTo(op.appendTo);

            this.show();

        },

        refresh:function(datas){

            if( this.options.disabled === true ){ return; }

            this.$menuContent.empty();

            this.selectElem = null;

            this._createMenuItems(datas);

        },

        _addEvent:function(){

        	var This = this,op = this.options,$target = this.$target,

            listMenuHoverClass = op.listMenuHoverClass,

            menuItemSelector = op.menuItemSelector,

            $menuContent = this.$menuContent;

        	this._on($menuContent, 'mouseenter', menuItemSelector, function(event){

        		event.stopPropagation();

                $(this).addClass(listMenuHoverClass);

        	});

            this._on($menuContent, 'mouseleave', menuItemSelector, function(event){

                event.stopPropagation();

                $(this).removeClass(listMenuHoverClass);

            });

            this._on($menuContent, 'click', menuItemSelector, function(event){

                This._selectClass(this);

                console.log(This.getItemData(this.id));

            });

        },

        _selectClass:function(elem){

            if( this.options.disabled === true ){ return; }

            var selectElem = this.selectElem,$elem = $(elem),

            listMenuSelectClass = this.options.listMenuSelectClass;

            !!selectElem && $(selectElem).removeClass(listMenuSelectClass);

            $elem.addClass(listMenuSelectClass);

            this.selectElem = elem;

            this._scrollIntoView($elem);

        },

        getItemData:function(id){

            return (id && this.listMenuData[id].data) || '';

        },

        addItem:function(data, item, isBefore){

            if( this.options.disabled === true ){ return; }

            var op = this.options,data = $.extend({}, data),

            newItemId = this.prefix + this.uid++,itemData,

            id,newItemData,doc = this.document[0],

            menuItemHtmlFn = op.menuItemHtmlFn,firstId,lastId,

            listMenuData = this.listMenuData;

            if(!item){

                item = 'last'

            }else if(typeof item !== 'string'){

                id = item.id || item;

                if(listMenuData.lastId === id && !isBefore){

                    item = 'last'

                }else if(listMenuData.firstId === id && !!isBefore){

                    item = 'first';

                }

            }

            switch(item){

                case 'first':

                    if(itemData = listMenuData[firstId = listMenuData.firstId]){

                        item = doc.getElementById(firstId);

                        $(menuItemHtmlFn(data)).attr('id', newItemId).insertBefore(item);

                        newItemData = {};

                        newItemData.data = data;

                        newItemData.prevId = listMenuData.lastId;

                        newItemData.nextId = firstId;

                        itemData.prevId = newItemId;

                        listMenuData[newItemId] = newItemData;

                        listMenuData.firstId = newItemId;

                        listMenuData[listMenuData.lastId].nextId = newItemId;

                    }

                    break;

                case 'last':

                    if(itemData = listMenuData[lastId = listMenuData.lastId]){

                        item = doc.getElementById(lastId);

                        $(menuItemHtmlFn(data)).attr('id', newItemId).insertAfter(item);

                        newItemData = {};

                        newItemData.data = data;

                        newItemData.prevId = lastId;

                        newItemData.nextId = listMenuData.firstId;

                        itemData.nextId = newItemId;

                        listMenuData[newItemId] = newItemData;

                        listMenuData.lastId = newItemId;

                        listMenuData[listMenuData.firstId].prevId = newItemId;

                    }

                    break;

                default:

                    if(itemData = listMenuData[id]){

                        newItemData = {};

                        if(!isBefore){

                            $(menuItemHtmlFn(data)).attr('id', newItemId).insertAfter(item);

                            newItemData.data = data;

                            newItemData.prevId = id;

                            newItemData.nextId = itemData.nextId;

                            listMenuData[itemData.nextId].prevId = newItemId;

                            itemData.nextId = newItemId;


                        }else{

                            $(menuItemHtmlFn(data)).attr('id', newItemId).insertBefore(item);

                            newItemData.data = data;

                            newItemData.prevId = itemData.prevId;

                            newItemData.nextId = id;

                            listMenuData[itemData.prevId].nextId = newItemId;

                            itemData.prevId = newItemId;

                        }

                        listMenuData[newItemId] = newItemData;

                    }

            }

        },

        _move: function( direction, filter ) {

            if( this.options.disabled === true ){ return; }

            var next,listMenuData = this.listMenuData,doc = this.document[0],

            selectElem = this.selectElem,selectElemData;

            if(selectElem){

                if (direction === "first" || direction === "last") {

                    next = doc.getElementById(listMenuData[ direction + "Id" ]);

                }else if(selectElemData = listMenuData[selectElem.id]){

                    next = doc.getElementById(selectElemData[ direction + "Id" ]);

                }

            }

            if (!next || !selectElem) {

                next = doc.getElementById(listMenuData[ filter + "Id" ]);

            }

            this._selectClass(next);

        },

        next: function( event ) {

            this._move( "next", "first" );

        },

        previous: function( event ) {

            this._move( "prev", "last" );

        },

        _destroy:function() {

			this.$target.remove();

        },

        getListMenuState:function(){

        	return this._listMenuState;

        },

        _setListMenuPosition:function(){

            var $target = this.$target,

            isVisible = $target.is( ":visible" );

            !isVisible && $target.show();

            $target.position(this.options.position);

            !isVisible && $target.hide();

        },

        show:function(){

            if( this.options.disabled === true ){ return; }

            this.options.beforeShow.call( this.$target );

            this._setListMenuPosition();

            this._showFn();

        },

        hide:function(notSelectItemsHideFn){

            if( this.options.disabled === true ){ return; }

            if(!notSelectItemsHideFn){

                this._hideFn();

            }else{

                this.$target.hide();

                this._listMenuState = 'close';

            }

        },

        _hideFn:function(){

            var This = this;

            this._listMenuState = 'closeing';

            this.options.hideAnimation.call( this.$target, function(){

                This._listMenuState = 'close';

            } );

        },

        _showFn:function(){

        	var This = this;

            this._listMenuState = 'opening';

            this.options.showAnimation.call( this.$target, function(){

                // This._scrollIntoView();

                This._listMenuState = 'open';

            } );

        },

        _hasHeightScroll: function(){

            return this.$target.outerHeight() < this.$target.prop( "scrollHeight" );

        },

        _hasWidthScroll: function(){

            return this.$target.width() - this.scrollbarWidth < this.$target.prop( "scrollWidth" );

        },

        _scrollIntoView: function( $item ) {

            var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight,

            $target, parseCss, scrollbarWidth;

            if ( this._hasHeightScroll() ) {

                $target = this.$target;

                parseCss = $.leoTools.parseCss;

                scrollbarWidth = this._hasWidthScroll() ? this.scrollbarWidth : 0;

                borderTop = parseCss($target[0], "borderTopWidth");

                paddingTop = parseCss($target[0], "paddingTop");

                offset = $item.offset().top - $target.offset().top - borderTop - paddingTop;

                scroll = $target.scrollTop();

                elementHeight = $target.height();

                itemHeight = $item.outerHeight();

                if ( offset < 0 ) {

                    $target.scrollTop( scroll + offset );

                } else if ( offset + itemHeight > elementHeight - scrollbarWidth ) {

                    $target.scrollTop( scroll + offset - elementHeight + itemHeight + scrollbarWidth );

                }

            }

        }

    });

	return $;

}));