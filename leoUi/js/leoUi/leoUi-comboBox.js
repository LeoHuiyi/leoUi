/**
+-------------------------------------------------------------------
* jQuery leoUi--comboBox
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-autocomplete"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoComboBox',

        version:'1.0',

        inherit:'leoAutocomplete',

        addJquery:false,

        addJqueryFn:true,

        requestIndex: 0,

        pending: 0,

        index:0,

        defaults:{

            delay:300,

            loadingClass:'leoUi_loading',

            labelKey: 'label',

            valueKey: 'value',

            autoFocus: false,

            width:200,

            comboboxWropHtml:'<span class="leoComboBox_wrop"><div class="leoComboBox leoUi_clearfix"></div></span>',

            buttonHtml:'<span class="leoComboBox_button"></span>',

            minLength: 0,

            comboboxHoverClass:'leoComboBox_hover',

            comboboxFocusClass:'leoComboBox_focus',

            minzIndex:1,

            position: {

                my: "left bottom",

                at: "left top+1",

                collision: "flip",

                within: this.window

            },

            source: null,

            beforeCreateCombobox:$.noop,

            change: $.noop,

            close: $.noop,

            focus: $.noop,

            open: $.noop,

            response: $.noop,

            search: $.noop,

            select: $.noop

        },

        _init: function(){

            this._super();

            this._createCombo();

        },

        _createCombo:function(){

            var op = this.options,$input = this.$input;

            this.oldInputWidth = $input.width();

            this.$comboboxWrop = $(op.comboboxWropHtml).insertAfter($input);

            this.$combobox = this.$comboboxWrop.children('div.leoComboBox').append($input.addClass('leoComboBox_input')).append(this.$button = $(op.buttonHtml));

            this._setComboboxWidth();

            this.$target.appendTo(this.$comboboxWrop);

            op.beforeCreateCombobox(this.$input);

            this._addComBoxEvent();

        },

        _setComboboxWidth:function(){

            var op = this.options;

            this.$combobox.setOuterWidth(op.width);

            this.$input.setOuterWidth(this.$combobox.width() - this.$button.outerWidth());

            this.$target.setOuterWidth(this.$combobox.outerWidth());

        },

        _setOption:function( key, value ){

            if( key === 'width' ){

                this._setComboboxWidth();

                return;

            }else if( key === 'appendTo' ){

                return;

            }

            this._super(key, value);

        },

        _addComBoxEvent:function(){

            var This = this,

            comboboxHoverClass = this.options.comboboxHoverClass;

            this._on( this.$button, 'mousedown', function(){

                This.cancelBlur = true;

                This._delay(function() {

                    delete this.cancelBlur;

                });

            });

            this._on( this.$button, 'mouseup', function(){

                This.toggle();

            });

            this._on( this.$combobox, 'mouseenter', function(){

                $(this).addClass(comboboxHoverClass);

            });

            this._on( this.$combobox, 'mouseleave', function(){

                $(this).removeClass(comboboxHoverClass);

            });

        },

        getSeleteLabel:function(){

            var selectedItemVal = this.selectedItemVal,

            normalizeSource = this.normalizeSource,i,label = '';

            if(normalizeSource && selectedItemVal){

                i = normalizeSource.length;

                while(i--){

                    if(normalizeSource[i].value === selectedItemVal){

                        label = normalizeSource[i].label;

                        break;

                    }

                }

                return label;

            }else{

                return label;

            }

        },

        _setPosition:function(){

            $.extend(this.options.position, {of: this.$combobox});

        },

        open:function(){

            if ( this._listMenuState === 'close' ) {

                this._search('');

                this.$combobox.addClass(this.options.comboboxFocusClass);

            }

        },

        _inputFocus:function(){

            this.$combobox.addClass(this.options.comboboxFocusClass);

        },

        _afterBlur:function(){

            this.$combobox.removeClass(this.options.comboboxFocusClass).removeClass(this.options.comboboxHoverClass);

        },

        _beforeShow:function(){

            this.setIndex(this.options.minzIndex + $.leoTools.getUuid());

        },

        toggle:function(){

            if(this._listMenuState === 'close'){

                this.open();

            }else if(this._listMenuState === 'open'){

                this.$input.blur();

            }

        },

        _destroy:function(){

            this.$input.width(this.oldInputWidth).removeClass('leoComboBox_input').insertBefore(this.$comboboxWrop);

            this.$comboboxWrop.remove();

            this._super();

        }

    });

    return $;

}));