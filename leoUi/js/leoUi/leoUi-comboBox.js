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

        defaults:{

            delay:300,

            loadingClass:'leoUi_loading',

            labelKey: 'label',

            valueKey: 'value',

            autoFocus: false,

            comboWropHtml:'<div class="leoAutocomplete leoUi_clearfix"></div>',

            buttonHtml:'<span class="leoAutocomplete_button"></span>',

            minLength: 0,

            width:210,

            position: {

                my: "left bottom",

                at: "left-1 top+1",

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

            this._super();

            this._createCombo();

        },

        _createCombo:function(){

            var op = this.options;

            this.$button = $(op.buttonHtml);

            $input = this.$input;

            this.$comboWrop = $(op.comboWropHtml).insertAfter($input).append($input.addClass('leoAutocomplete_input')).append(this.$button).width(op.width);

            $input.setOuterWidth(op.width - this.$button.outerWidth());

            this._addComBoxEvent();

        },

        _setOption:function( key, value ){

            if( key === 'width' ){

                return;

            }

            this._super(key, value);

        },

        _addComBoxEvent:function(){

        	var This = this;

            this._on( this.$button, 'click', function(){

                This.toggle();

            });

        },

        _setPosition:function(){

            $.extend(this.options.position, {of: this.$comboWrop});

        },

        toggle:function(){

        	if(this._listMenuState === 'close'){

        		this.open();

        	}else if(this._listMenuState === 'open'){

        		this.close();

        	}

        },

        _destroy: function() {


            this._super();

        }

    });

	return $;

}));