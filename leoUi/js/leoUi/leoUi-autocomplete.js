/**
+-------------------------------------------------------------------
* jQuery leoUi--autocomplete
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-listMenu"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoAutocomplete',

        version:'1.0',

        inherit:'leoListMenu',

        addJquery:false,

        addJqueryFn:true,

        requestIndex: 0,

        pending: 0,

        menuHtml:'listMenuHtml',

        defaults:{

            delay:300,

            loadingClass:'leoUi_loading',

            labelKey: '',

            valueKey: '',

            autoFocus: false,

            minLength: 1,

            position: {

                my: "left bottom",

                at: "left top+1",

                collision: "flip",

                within: this.window

            },

            source: null,

            change: $.noop,

            close: $.noop,

            focus: $.noop,

            open: $.noop,

            response: $.noop,

            search: $.noop,

            select: $.noop

        },

        _init: function(){

            var op = this.options;

            this.$input = this.$target;

            this.$target = $(op[this.menuHtml]);

            op.isHide = true;

            op.data = [];

            this._super();

            this._addAutocompleteEvent();

        },

        _setOption:function( key, value ){

            if( key === 'isHide' ){

                return;

            }else if ( key === "data" ) {

                return;

            }else if ( key === "source" ) {

                this._initSource();

            }else if ( key === "disabled" && value && this.xhr ) {

                this.xhr.abort();

            }

            this._super(key, value);

        },

        _destroy: function() {

            clearTimeout( this.searching );

            this.$input.removeAttr( "autocomplete" );

            this._super();

        },

        open:function(){

            if ( this._listMenuState === 'close' ) {

                this._search('');

            }

        },

        addItem:function(data, item, isBefore){

            var newMenuData,menuData = this.menuData,op = this.options;

            if( op.disabled === true || !data || menuData.length === 0 ){ return; }

            !item && (item = 'last');

            switch(item){

                case 'first':

                    if((newMenuData = this._addMenuData(data, menuData[0]._id, true))){

                        newMenuData = this.normalize(newMenuData, true);

                        this.refresh(newMenuData);

                        this._initSource();

                    }

                    break;

                case 'last':

                    if((newMenuData = this._addMenuData(data, menuData[menuData.length - 1]._id, false))){

                        newMenuData = this.normalize(newMenuData, true);

                        this.refresh(newMenuData);

                        this._initSource(newMenuData);

                    }

                    break;

                default:

                    if((newMenuData = this._addMenuData(data, item.id || item, isBefore))){

                        newMenuData = this.normalize(newMenuData, true);

                        this.refresh(newMenuData);

                        this._initSource(newMenuData);

                    }

            }

        },

        setInputVal:function(val){

            if(val){

                this.$input.val(val);

                this.term = val;

                this.selectedItemVal = val;

            }else if((val = this.$input.val())){

                this.term = val;

                this.selectedItemVal = val;

            }

        },

        _setPosition:function(){

            this.options.position = $.extend({of: this.$input}, this.options.position);

        },

        _addAutocompleteEvent:function(){

            var suppressKeyPress, suppressKeyPressRepeat, suppressInput,

            This = this, $input = this.$input, $target = this.$target,

            nodeName = $input[ 0 ].nodeName.toLowerCase(),

            isTextarea = nodeName === "textarea",

            isInput = nodeName === "input";

            this.isMultiLine = isTextarea ? true : isInput ? false : $input.prop( "isContentEditable" );

            this.valueMethod = $input[ isTextarea || isInput ? "val" : "text" ];

            this.setInputVal();

            $input.attr( "autocomplete", "off" );

            this._on( $input, 'keydown', function( event ) {

                if ( $input.prop( "readOnly" ) ) {

                    suppressKeyPress = true;

                    suppressInput = true;

                    suppressKeyPressRepeat = true;

                    return;

                }

                suppressKeyPress = false;

                suppressInput = false;

                suppressKeyPressRepeat = false;

                var keyCode = $.leoTools.keyCode;

                switch ( event.keyCode ) {

                    case keyCode.UP:

                        suppressKeyPress = true;

                        This._keyEvent( "previous", event );

                        break;

                    case keyCode.DOWN:

                        suppressKeyPress = true;

                        This._keyEvent( "next", event );

                        break;

                    case keyCode.ENTER:

                        suppressKeyPress = true;

                        event.preventDefault();

                        This.select(true);

                        break;

                    case keyCode.TAB:

                        This.select(true);

                    break;

                    case keyCode.ESCAPE:

                        if ( This._listMenuState === 'open' ) {

                            if ( !This.isMultiLine ) {

                                This._value( This.term );

                            }

                            clearTimeout( This.searching );

                            This.close();

                            event.preventDefault();

                        }

                        break;

                    default:

                        suppressKeyPressRepeat = true;

                        This._searchTimeout( event );

                        break;

                }

            });

            this._on( $input, 'keypress', function( event ) {

                if ( suppressKeyPress ) {

                    suppressKeyPress = false;

                    if ( !This.isMultiLine || This._listMenuState === 'open' ) {

                        event.preventDefault();

                    }

                    return;

                }

                if ( suppressKeyPressRepeat ) {

                    return;

                }

                var keyCode = $.leoTools.keyCode;

                switch ( event.keyCode ) {

                case keyCode.UP:

                    This._keyEvent( "previous", event );

                    break;

                case keyCode.DOWN:

                    This._keyEvent( "next", event );

                    break;

                }

            });

            this._on( $input, 'input', function( event ) {

                if ( suppressInput ) {

                    suppressInput = false;

                    event.preventDefault();

                    return;

                }

                This._searchTimeout( event );

            });

            this._on( $input, 'focus', function() {

                This.previousVal = This._value();

                !!This._inputFocus && This._inputFocus();

            });

            this._on( $input, 'blur', function( event ) {

                if ( This.cancelBlur ) {

                    delete This.cancelBlur;

                    return;

                }

                clearTimeout( This.searching );

                This._value( This.term );

                This.close();

                !!This._afterBlur && This._afterBlur();

                This._change( event );

            });

            this._on( $target, 'mousedown', function( event ) {

                This.cancelBlur = true;

                This._delay(function() {

                    delete this.cancelBlur;

                });

            });

            this._initSource();

            this._on( this.window, 'beforeunload', function() {

                $input.removeAttr( "autocomplete" );

            });

        },

        _menuFocus:function(item){

            if ( false !== this.options.focus.call(this.$target, { item: item }) ) {

                this._value( item.value );

            }

        },

        _menuSelected:function(item){

            var $target = this.$target;

            if ( false !== this.options.select.call($target, { item: item }) ) {

                this._value( item.value );

            }

            this.term = this._value();

            this.isMenuSelected = true;

            this.selectedItemVal = item.value;

            this.close();

        },

        _initSource: function(normalizeSource) {

            var array, url, This = this, source = normalizeSource || this.options.source;

            if ( $.isArray( source ) ) {

                this.normalizeSource = array = this.normalize(source, !normalizeSource);

                this.source = function( request, response ) {

                    response( $.fn.leoAutocomplete.filter( array, request.term ) );

                };

            } else if ( typeof source === "string" ) {

                url = source;

                this.source = function( request, response ) {

                    if ( This.xhr ) {

                        This.xhr.abort();

                    }

                    This.xhr = $.ajax({

                        url: url,

                        data: request,

                        dataType: "json",

                        success: function( data ) {

                            response( data );

                        },

                        error: function() {

                            response([]);

                        }

                    });

                };

            } else {

                this.source = source;

            }

        },

        _searchTimeout: function( event ) {

            var This = this;

            clearTimeout( this.searching );

            this.searching = this._delay(function() {

                var equalValues = This.term === This._value(),

                    menuVisible = This._listMenuState === 'open',

                    modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

                if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {

                    This.selectedItemVal = null;

                    This.search( null, event );

                }

            }, this.options.delay );

        },

        search: function( value, event ) {

            value = value != null ? value : this._value();

            this.term = this._value();

            if ( value.length < this.options.minLength ) {

                return this.close();

            }

            if ( this.options.search.call(this.$input[0], event) === false ) {

                return;

            }

            return this._search(value);

        },

        _search: function(value) {

            this.pending++;

            this.$input.addClass(this.options.loadingClass);

            this.cancelSearch = false;

            !!this.source && this.source( { term: value }, this._response() );

        },

        _response: function() {

            var index = ++this.requestIndex;

            return $.proxy(function( content ) {

                if ( index === this.requestIndex ) {

                    this.__response( content );

                }

                this.pending--;

                if ( !this.pending ) {

                    this.$input.removeClass(this.options.loadingClass);

                }

            }, this );

        },

        __response: function( content ) {

            var op = this.options,$input = this.$input;

            if ( content ) {

                content = this.normalize( content );

            }

            op.response.call($input, { content: content });

            if ( !op.disabled && content && content.length && !this.cancelSearch ) {

                this._suggest( content, function(){

                    $input.focus().leoUiTextSelection('last');

                    op.open.call($input);

                } );

            } else {

                this._close();

            }

        },

        close: function() {

            if (this._listMenuState === 'open') {

                this.cancelSearch = true;

                this._close();

            }

        },

        inputFocus:function(){

            if(this.$input[0]){

                this.$input.focus().leoUiTextSelection('last');

            }

        },

        _close: function() {

            this.hide(function(){

                if ( this.isMenuSelected && this.$target[ 0 ] !== this.document[ 0 ].activeElement ) {

                    var previousVal = this.previousVal,

                    selectedItemVal = this.selectedItemVal;

                    this.previousVal = previousVal;

                    this._delay(function() {

                        this.previousVal = previousVal;

                        this.selectedItemVal = selectedItemVal;

                        this.$input.focus().leoUiTextSelection('last');

                        delete this.isMenuSelected;

                    });

                }

                this.$target.blur();

                this.options.close.call(this.$input);

            });

        },

        _change: function(event) {

            if ( this.previousVal !== this._value() ) {

                this.options.change.call(this.$input, event, { item: this.selectedItemVal });

            }

        },

        normalize: function( items, must ) {

            var labelKey = this.options.labelKey,valueKey = this.options.valueKey;

            if((items.length && items[ 0 ].label && items[ 0 ].value) && !must) {

                return items;

            }

            return $.map( items, function( item ) {

                if ( typeof item === "string" ) {

                    return {

                        label: item,

                        value: item

                    };

                }

                return $.extend( {}, item, {

                    label: item[labelKey] || item[valueKey],

                    value: item[valueKey] || item[labelKey]

                });

            });

        },

        _suggest: function( items, callBack ) {

            var value = this._value();

            this.refresh(items, value);

            this.setFocusItem(value, 'value');

            this.selectedItemVal = this.setSelectItem(this.selectedItemVal, 'value');

            delete this.isMenuSelected;

            this._setPosition();

            this.show(callBack);

            if ( this.options.autoFocus ) {

                this._autoMove('next');

            }

        },

        _autoMove: function(direction, event) {

            if ( this._listMenuState === 'close' ) {

                this.search('', event);

                return;

            }

            if ( this.isFirstItem() && /^previous/.test( direction ) ||
                    this.isLastItem() && /^next/.test( direction ) ) {

                if ( !this.isMultiLine ) {

                    this._value( this.term );

                }

                this.blur();

                return;
            }

            this[ direction ]();

        },

        _keyEvent: function( keyEvent, event ) {

            if ( !this.isMultiLine || this._listMenuState === 'open' ) {

                this._autoMove( keyEvent, event );

                event.preventDefault();

            }

        },

        _value: function() {

            return this.valueMethod.apply( this.$input, arguments );

        }


    },{

        filter: function(array, term) {

            var matcher = new RegExp($.leoTools.escapeRegex(term), "i");

            return $.grep(array, function(value){

                return matcher.test(value.value || value.label || value);

            });

        }

    });

    return $;

}));