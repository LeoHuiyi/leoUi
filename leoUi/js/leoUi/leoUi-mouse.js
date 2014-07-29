/**
+-------------------------------------------------------------------
* jQuery leoUi--mouse
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
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

        name:'leoMouse',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            cancel:'input,textarea,button,select,option',//防止在指定元素上开始拖动

            delay:0,//时间（以毫秒为单位），当鼠标按下后直到的互动（interactions）激活。此选项可用来阻止当点击一个元素时可能发生的非期望互动（interactions）行为。

            distance:0,//距离在像素的mousedown鼠标交互应该开始之前必须移动。

            isSetCapture:false,//鼠标扑捉

            selector:false//代理

        },

        _init: function(){

            var that = this;

            this.isSetCapture = this.options.isSetCapture ? 'setCapture' in this.document[0].documentElement : false;

            this._lockDrag = false;

            this._setMousedownEvent();

            this._on( this.$target, 'click', function(event) {

                if( true === $.data( event.target, that.dataId + ".preventClickEvent" ) ){

                    $.removeData( event.target, that.dataId + ".preventClickEvent" );

                    event.stopImmediatePropagation();

                    return false;

                }

            })

            this.started = false;

        },

        _setOption:function( key, value ){

            if( key === 'selector'){

                this._setMousedownEvent();

            }

        },

        _setMousedownEvent:function(){

            var that = this,selector = this.options.selector;

            if(  !this._$target ){

                this._$target = this.$target;

            }else{

                this.$target = this._$target;

            }

            this._off( this.$target, 'mousedown.mouse' );

            if( selector === false ){

                selector = '';

                delete this._$target;

            }

            this._on( this.$target, 'mousedown.mouse', selector, function(event) {

                event.stopPropagation();

                if( !that._lockDrag ){

                    !!selector && ( that.$target = $(this) );

                    return that._mouseDown(event);

                }

            })

        },

        _textselect:function(bool) {

            this[bool ? "_on" : "_off"]( this.document, 'selectstart.darg', false )

            this.document.css("-moz-user-select", bool ? "none" : "");

            this.document[0].unselectable = bool ? "off" : "on";

        },

        setLockDrag:function(flag){

            this._lockDrag = !!flag;

        },

        _destroy: function(){},

        _mouseDown: function(event){

            ( this._mouseStarted && this._mouseUp(event) );

            this._mouseDownEvent = event;

            var that = this,btnIsLeft = ( event.which === 1 ),

            elIsCancel = ( typeof this.options.cancel === "string" && event.target.nodeName ? $( event.target ).closest( this.options.cancel ).length : false );

            if( !btnIsLeft || elIsCancel || !this._mouseCapture(event) ){

                return true;

            }

            this.mouseDelayMet = !this.options.delay;

            if( !this.mouseDelayMet ){

                this._mouseDelayTimer = setTimeout(function() {

                    that.mouseDelayMet = true;

                }, this.options.delay);

            }

            if( this._mouseDistanceMet(event) && this._mouseDelayMet(event) ){

                this._mouseStarted = ( this._mouseStart(event) !== false);

                if ( !this._mouseStarted ) {

                    event.preventDefault();

                    return true;

                }

            }

            if( true === $.data( event.target, this.dataId + ".preventClickEvent" ) ){

                $.removeData( event.target, this.dataId + ".preventClickEvent" );

            }

            this._mouseMoveDelegate = function(event) {

                return that._mouseMove(event);

            };

            this._mouseUpDelegate = function(event) {

                return that._mouseUp(event);

            };

            this._on( this.document, 'mousemove', this._mouseMoveDelegate );

            this._on( this.document, 'mouseup', this._mouseUpDelegate );

            this._textselect(true);

            this.isSetCapture && this._mouseDownEvent.target.setCapture();

            event.preventDefault();

            return true;

        },

        _mouseMove: function(event) {

            if( $.leoTools.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button ){

                return this._mouseUp(event);

            }else if( !event.which ){

                return this._mouseUp( event );

            }

            if( this._mouseStarted ){

                this._mouseDrag(event);

                return event.preventDefault();

            }

            if( this._mouseDistanceMet(event) && this._mouseDelayMet(event) ){

                this._mouseStarted = (this._mouseStart(this._mouseDownEvent, event) !== false);

                ( this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event) );

            }

            return !this._mouseStarted;

        },

        _mouseUp: function(event) {

            this._off( this.document, 'mousemove', this._mouseMoveDelegate );

            this._off( this.document, 'mouseup', this._mouseUpDelegate );

            this._textselect(false);

            this.isSetCapture && this._mouseDownEvent.target.releaseCapture();

            if ( this._mouseStarted ) {

                this._mouseStarted = false;

                if ( event.target === this._mouseDownEvent.target ) {

                    $.data( event.target, this.dataId + ".preventClickEvent", true );

                }

                this._mouseStop(event);

            }

            return false;

        },

        _mouseDistanceMet: function(event) {

            return ( Math.max( Math.abs( this._mouseDownEvent.pageX - event.pageX), Math.abs( this._mouseDownEvent.pageY - event.pageY ) ) >= this.options.distance );

        },

        _mouseDelayMet: function(/* event */) {

            return this.mouseDelayMet;

        },

        _mouseStart: function(/* event */) {},

        _mouseDrag: function(/* event */) {},

        _mouseStop: function(/* event */) {},

        _mouseCapture: function(/* event */) { return true; }

    });

	return $;

}));