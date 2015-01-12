/**
+-------------------------------------------------------------------
* jQuery leoUi--listMenu
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

            listMenuHtml:'<div class="leoListMenu"><div class="leoListMenu_menuContentIn"></div></div>',

            menuContentHtml:'<div class="leoListMenu_menuContent"></div>',

            menuItemHtmlFn:function(data, i){//data._disableItem = true不设置为menuItem

                return '<div tabindex="-1"><span>' + data.value + '</span></div>';

            },

            menuItemsClass:'leoListMenu_item',

            listMenuDisableClass:'leoListMenu_disable',

            listMenuFocusClass:'leoListMenu_focus',

            listMenuSelectClass:'leoListMenu_select',

            width: 100,

            position: {

                my: "left top",

                at: "left top",

                of: 'body',

                collision: "flip"

            },

            disabled:false,

            showAnimation: function(callBack) {

                this.show( { effect: "blind", duration: 200, complete: callBack} );

                // this.show();

                // callBack();

            },

            hideAnimation: function(callBack) {

                this.hide( { effect: "blind", duration: 200, complete: callBack} );

                // this.hide();

                // callBack();

            },

            blurCackBack:$.noop,

            beforeShow:$.noop

        },

        _init: function(){

            this.prefix = $.leoTools.getId('ListMenu') + '_';

            this._listMenuState = 'close';

            this.scrollbarWidth = this.scrollbarWidth || $.position.scrollbarWidth();

            this._setOpDisabled();

            this._createlistMenuHtml();

        },

        _setOption:function( key, value ){

            if( key === 'disabled' ){

                this._setOpDisabled();

            }else if( key === 'width' ){

                !!this.$target && this.$target.setOuterWidth(value);

            }else if( key === 'appendTo' ){

                !!this.$target && this.$target.appendTo(this._appentTo());

            }

        },

        _setOpDisabled:function(){

            var op = this.options;

            op.disabled === true ? op.disabledEvent = true: op.disabledEvent = false;

        },

        setIndex:function(index){

            this.$target.css('zIndex', index >> 0);

        },

        _createMenuItems:function(datas, value){

            var op = this.options,listDatas = datas || $.extend([], op.data),

            i = 0,data,prefix = this.prefix,itemData,menuData = [],

            listMenuData = {},menuItemHtmlFn = op.menuItemHtmlFn,id,

            $menuContent = this.$menuContent,prevId,firstId,lastId,

            listDatasLen = listDatas.length,last = listDatasLen - 1,$elem,

            menuItemsClass = op.menuItemsClass,selectElem,focusElem;

            for(; i < listDatasLen ; i++){

                data = listDatas[i];

                id = prefix + this.uid++;

                data._id = id;

                $elem = $(menuItemHtmlFn(data, i, value)).attr('id', id).addClass(menuItemsClass).appendTo($menuContent);

                itemData = listMenuData[id] = {};

                if(data._disableItem !== true){

                    if(!prevId){

                        firstId = listMenuData.firstId = id

                    }else{

                        itemData.prevId = prevId;

                        listMenuData[prevId].nextId = id;

                    }

                    prevId = lastId = id;

                    if(data._select === true){

                        selectElem = $elem[0];

                    }else if(data._focus === true){

                        focusElem = $elem[0];

                    }

                    delete data._select;

                    delete data._focus;

                }else{

                    $elem.addClass(op.listMenuDisableClass);

                    itemData._disableItem = true;

                    delete data._disableItem;

                }

                itemData.data = data;

                menuData.push(data);

            }

            if(lastId && firstId){

                listMenuData.lastId = lastId;

                listMenuData[lastId].nextId = firstId;

                listMenuData[firstId].prevId = lastId;

            }

            this.listMenuData = listMenuData;

            this.menuData = menuData;

            this._focus(focusElem);

            this._select(selectElem);

        },

        _createlistMenuHtml:function(){

            var op = this.options;

            this.$menuContent = $(op.menuContentHtml);

            this._createMenuItems();

            this._addEvent();

            op.isHide === true && this.$target.hide();

            this.$menuContentIn = this.$target.find('div.leoListMenu_menuContentIn').append(this.$menuContent);

            this.$target.appendTo(this._appentTo()).setOuterWidth(op.width);

        },

        _appentTo:function(){

            var element = this.options.appendTo;

            if ( element ) {

                element = element.jquery || element.nodeType ? $( element ) : this.document.find( element ).eq( 0 );
            }

            if ( !element.length ) {

                element = this.document[ 0 ].body;

            }

            return element;
        },

        refresh:function(datas, value){

            if( this.options.disabled === true ){ return; }

            this.$menuContent.empty();

            this.selectElem = null;

            this.focusElem = null;

            this._createMenuItems(datas, value);

        },

        _addEvent:function(){

            var This = this,op = this.options,

            $menuContent = this.$menuContent,

            menuItemsClass = '.' + op.menuItemsClass;

            this._on($menuContent, 'mouseenter', menuItemsClass, function(event){

                event.stopPropagation();

                This._focus(this);

            });

            this._on($menuContent, 'mouseleave', menuItemsClass, function(event){

                event.stopPropagation();

                This.blur();

            });

            this._on($menuContent, 'mousedown', menuItemsClass, function(event){

                This._select(this);

            });

        },

        _isItem:function(elem){

            return !!elem && !!this.listMenuData[elem.id] && this.listMenuData[elem.id]._disableItem !== true;

        },

        isFirstItem:function(){

            return !!this.focusElem && (this.listMenuData.firstId === this.focusElem.id);

        },

        isLastItem:function(){

            return !!this.focusElem && (this.listMenuData.lastId === this.focusElem.id);

        },

        focus:function(){

            if(this.focusElem){

                !!this._menuFocus && this._menuFocus(this.getItemData(this.focusElem.id));

            }

        },

        setFocusItem:function(value, valueKey){

            if(value === undefined){return;}

            var menuData = this.menuData,i = menuData.length,id;

            value = value + '';

            while(i--){

                menuData[i][valueKey] === value && (id = menuData[i]._id);

            }

            this._focus(this._getItemElem(id));

        },

        setSelectItem:function(value, valueKey){

            if(value === undefined){return;}

            var menuData = this.menuData,i = menuData.length,id;

            value = value + '';

            while(i--){

                menuData[i][valueKey] === value && (id = menuData[i]._id);

            }

            if(id){

                this._select(this._getItemElem(id));

                return value;

            }else{

                return null;

            }

        },

        _focus:function(elem){

            if( !elem || this._isAnimated() || this.options.disabled === true || !this._isItem(elem) ){ return; }

            var focusElem = this.focusElem,$elem = $(elem),

            listMenuFocusClass = this.options.listMenuFocusClass;

            !!focusElem && $(focusElem).removeClass(listMenuFocusClass);

            $elem.addClass(listMenuFocusClass);

            this.focusElem = elem;

            this._scrollIntoView($elem);

            this.focus();

        },

        _isAnimated: function(){

            return !!(this._listMenuState === 'opening' || this._listMenuState === 'closeing');

        },

        blur:function() {

            var focusElem = this.focusElem;

            if(!focusElem){return;}

            $(focusElem).removeClass(this.options.listMenuFocusClass);

            this.focusElem = null;

            this.options.blurCackBack.call(this.$target);

        },

        select:function(isFocusElem){

            var selectElem,id,op;

            if(isFocusElem && (selectElem = this.focusElem)){

                id = selectElem.id;

                op = this.options;

                $(this.selectElem).removeClass(op.listMenuSelectClass);

                $(this.selectElem = this._getItemElem(id)).removeClass(op.listMenuFocusClass).addClass(op.listMenuSelectClass);

                !!this._menuSelected && this._menuSelected(this.getItemData(id));

                this._scrollIntoView($(this.selectElem));

            }else if(selectElem = this.selectElem){

                id = selectElem.id;

                !!this._menuSelected && this._menuSelected(this.getItemData(id));

                this._scrollIntoView($(this._getItemElem(id)));

            }

        },

        _select:function(elem){

            if( !elem || this._isAnimated() || this.options.disabled === true || !this._isItem(elem) ){ return; }

            var selectElem = this.selectElem,$elem = $(elem),

            listMenuSelectClass = this.options.listMenuSelectClass,

            listMenuFocusClass = this.options.listMenuFocusClass;

            !!selectElem && $(selectElem).removeClass(listMenuSelectClass);

            $elem.removeClass(listMenuFocusClass).addClass(listMenuSelectClass);

            this.selectElem = elem;

            this.select();

        },

        getItemData:function(id){

            return (id && this.listMenuData[id] && this.listMenuData[id].data) || '';

        },

        _addMenuData:function(data, id, isBefore){

            var menuData = $.extend([], this.menuData),newMenuData = [],

            len = menuData.length,i = 0,itemData,aSush = [].push,flag = false;

            $.type(data) !== 'array' && (data = [data]);

            for(; i < len; i++){

                itemData = menuData[i];

                if(itemData._id === id){

                    if(!isBefore){

                        newMenuData.push(itemData);

                        aSush.apply(newMenuData, data);

                    }else{

                        aSush.apply(newMenuData, data);

                        newMenuData.push(itemData);

                    }

                    flag = true;

                }else{

                    newMenuData.push(itemData);

                }

            }

            flag === false && (newMenuData = false);

            return newMenuData;

        },

        addItem:function(data, item, isBefore){

            var newMenuData,menuData = this.menuData;

            if( this.options.disabled === true || !data || menuData.length === 0 ){ return; }

            !item && (item = 'last');

            switch(item){

                case 'first':

                    if((newMenuData = this._addMenuData(data, menuData[0]._id, true))){

                        this.refresh(newMenuData);

                    }

                    break;

                case 'last':

                    if((newMenuData = this._addMenuData(data, menuData[menuData.length - 1]._id, false))){

                        this.refresh(newMenuData);

                    }

                    break;

                default:

                    if((newMenuData = this._addMenuData(data, item.id || item, isBefore))){

                        this.refresh(newMenuData);

                    }

            }

        },

        _getItemElem:function(id){

            return this.document[0].getElementById(id);

        },

        _move: function( direction, filter ) {

            if( this.options.disabled === true ){ return; }

            var next,listMenuData = this.listMenuData,doc = this.document[0],

            focusElem = this.focusElem,selectElemData,id;

            if(focusElem){

                if (direction === "first" || direction === "last") {

                    next = doc.getElementById(id = listMenuData[ direction + "Id" ]);

                }else if((selectElemData = listMenuData[focusElem.id])){

                    next = doc.getElementById(id = selectElemData[ direction + "Id" ]);

                }

            }

            if (!next || !focusElem) {

                next = doc.getElementById(id = listMenuData[ filter + "Id" ]);

            }

            this._focus(next);

        },

        next:function() {

            this._move( "next", "first" );

        },

        previous:function() {

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

        show:function(callBack, notAnimation){

            if( this.options.disabled === true ){ return; }

            this.options.beforeShow.call( this.$target );

            !!this._beforeShow && this._beforeShow();

            this._setListMenuPosition();

            if(!notAnimation){

                this._showFn(callBack);

            }else{

                this.$target.show();

                this._listMenuState = 'open';

                !!callBack && callBack.call(this);

            }

        },

        hide:function(callBack, notAnimation){

            if( this.options.disabled === true ){ return; }

            if(!notAnimation){

                this._hideFn(callBack);

            }else{

                this.$target.hide();

                this._listMenuState = 'close';

                !!callBack && callBack.call(this);

            }

        },

        _hideFn:function(callBack){

            var This = this,op = this.options;

            this._listMenuState = 'closeing';

            op.hideAnimation.call( this.$target, function(){

                This._listMenuState = 'close';

                !!callBack && callBack.call(This);

            } );

        },

        _showFn:function(callBack){

            var This = this,op = this.options;

            this._listMenuState = 'opening';

            op.showAnimation.call( this.$target, function(){

                This._listMenuState = 'open';

                This._scrollIntoView($(This.selectElem || This.focusElem));

                !!callBack && callBack.call(This);

            } );

        },

        _hasHeightScroll: function(){

            return this.$menuContentIn.outerHeight() < this.$menuContentIn.prop( "scrollHeight" );

        },

        _hasWidthScroll: function(){

            return this.$menuContentIn.width() - this.scrollbarWidth < this.$menuContentIn.prop( "scrollWidth" );

        },

        _scrollIntoView: function( $item ) {

            var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight,

            $menuContentIn, parseCss, scrollbarWidth;

            if ( this._listMenuState !== 'close' && $item && $item[0] && this._hasHeightScroll() ) {

                $menuContentIn = this.$menuContentIn;

                parseCss = $.leoTools.parseCss;

                scrollbarWidth = this._hasWidthScroll() ? this.scrollbarWidth : 0;

                borderTop = parseCss($menuContentIn[0], "borderTopWidth");

                paddingTop = parseCss($menuContentIn[0], "paddingTop");

                offset = $item.offset().top - $menuContentIn.offset().top - borderTop - paddingTop;

                scroll = $menuContentIn.scrollTop();

                elementHeight = $menuContentIn.height();

                itemHeight = $item.outerHeight();

                if ( offset < 0 ) {

                    $menuContentIn.scrollTop( scroll + offset );

                } else if ( offset + itemHeight > elementHeight - scrollbarWidth ) {

                    $menuContentIn.scrollTop( scroll + offset - elementHeight + itemHeight + scrollbarWidth );

                }

            }

        }

    });

    return $;

}));