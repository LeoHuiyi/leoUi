/**
+-------------------------------------------------------------------
* jQuery leoUi--droppable
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-draggable"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoDroppable',

        version:'1.0',

        dependsFnName:{

            draggable:'leoDraggable'

        },//依赖函数名

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            accept:'*',//决定哪个可拖动元素将会被接收。

            toleranceType:'intersect',//fit,intersect,pointer,touch

            scope:'all',//用来设置拖动（draggle）元素和放置（droppable）对象的集合

            disabled:false,//当设置为true时停止。

            onDragEnter: $.noop, //e,source,dragBox ,dragBox - offset 当可拖动元素被拖入目标容器的时候触发，参数source是被拖动的DOM元素。

            onDragOver: $.noop,//e,source,dragBox,dragBox - offset  当可拖动元素被拖至某个元素之上的时候触发，参数source是被拖动的DOM元素。

            onDragLeave: $.noop,//e,source,dragBox,dragBox - offset  当可拖动元素被拖离目标容器的时候触发，参数source是被拖动的DOM元素。

            onDrop: null//e,source,dragBox,dragBox - offset   当可拖动元素被拖入目标容器并放置的时候触发，参数source是被拖动的DOM元素。

        },

        _init:function(){

            var entered = false,This = this;

            this.scope = this.options.scope;

            this._setElements( this.scope );

            this.options.accept === '*' ? this.accepts = '*' : this.accepts = $( this.options.accept );

            this._trigger( 'leoDroppableStar', function( event, draggable ){

                if( This.options.disabled ){

                    return;

                }

                This.source = draggable.box[0];

                if( This.accepted = This._accept() ){

                    var dragBox = draggable.dragBox[0],

                    intersected = dragBox !== this && intersect( boxSize( draggable.dragBox, draggable.dragBoxLeft, draggable.dragBoxTop, draggable.pageX, draggable.pageY ),boxSize( $(this) ), This.options.toleranceType );

                    if( intersected && !entered ){

                        entered = true;

                    }else if( !intersected && !!entered ){

                        entered = false;

                    }else if(intersected){

                        This.options.onDragOver.call( this, event, This.source, dragBox, {

                            left : draggable.dragBoxLeft,

                            top : draggable.dragBoxTop

                        })

                    }

                }

            })

            this._trigger('leoDroppableOver',function( event, draggable ){

                This.source !== draggable.box[0] && This._reAccepted( draggable.box[0] );

                if( This.accepted && This.options.disabled !== true ){

                    var dragBox = draggable.dragBox[0],

                    intersected = dragBox !== this && intersect( boxSize( draggable.dragBox, draggable.dragBoxLeft, draggable.dragBoxTop, draggable.pageX, draggable.pageY), boxSize( $(this) ), This.options.toleranceType);

                    if( intersected && !entered ){

                        This.options.onDragEnter.call( this,event, This.source, dragBox, {

                            left : draggable.dragBoxLeft,

                            top : draggable.dragBoxTop

                        })

                        entered = true;

                    }else if( !intersected && !!entered ){

                        This.options.onDragLeave.call( this, event, This.source, dragBox, {

                            left : draggable.dragBoxLeft,

                            top : draggable.dragBoxTop

                        })

                        entered = false;

                    }else if(intersected){

                        This.options.onDragOver.call( this, event, This.source, dragBox, {

                            left : draggable.dragBoxLeft,

                            top : draggable.dragBoxTop

                        })

                    }

                }

            })

            this._trigger('leoDroppableEnd',function( event, draggable ){

                This.source !== draggable.box[0] && This._reAccepted( draggable.box[0] );

                if( This.options.onDrop !== null && This.accepted && This.options.disabled !== true ){

                    if( draggable.dragBox[0] !== this && intersect( boxSize( draggable.dragBox, draggable.dragBoxLeft, draggable.dragBoxTop, draggable.pageX, draggable.pageY ),boxSize( $(this) ), This.options.toleranceType )){

                        draggable.box[This.dependsFnName.draggable]( 'setDragEndStop', This.options.onDrop.call( this,event, draggable.box[0], draggable.dragBox[0], {

                            left : draggable.dragBoxLeft,

                            top : draggable.dragBoxTop

                        }) === false );

                        entered = false;

                    }

                }

            });

            function boxSize( $box, left, top, pageX, pageY ){

                var outerW,outerH,top,left,offset;

                if( !!left && !!top && !!pageX && !!pageY ){

                    outerW = $box.outerWidth();

                    outerH = $box.outerHeight();

                    return{

                        width : outerW,

                        height : outerH,

                        top : top,

                        left : left,

                        bottom : top + outerH,

                        right : left + outerW,

                        pageX :pageX,

                        pageY : pageY

                    }

                }else{

                    offset = $box.offset();

                    top = offset.top;

                    left = offset.left;

                    outerW = $box.outerWidth();

                    outerH = $box.outerHeight();

                    return{

                        width : outerW,

                        height : outerH,

                        top : top,

                        left : left,

                        bottom : top + outerH,

                        right : left + outerW

                    }

                }

            }

            function intersect( draggable, droppable, toleranceMode ) {

                var pageX = draggable.pageX,pageY = draggable.pageY,

                x1 = draggable.left,y1 =draggable.top,

                x2 = draggable.right,y2 = draggable.bottom,

                l = droppable.left,t = droppable.top,

                r = droppable.right,b = droppable.bottom;

                switch (toleranceMode) {

                    case "fit":

                        return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);

                    case "intersect":

                        return (l <= x1 + (draggable.width / 2) &&
                            x2 - (draggable.width / 2) <= r &&
                            t <= y1 + (draggable.height / 2) &&
                            y2 - (draggable.height / 2) <= b );

                    case "pointer":

                        return  (l <= pageX && pageX <= r && t <= pageY && pageY <= b);

                    case "touch":

                        return (
                            (y1 >= t && y1 <= b) ||
                            (y2 >= t && y2 <= b) ||
                            (y1 < t && y2 > b)
                        ) && (
                            (x1 >= l && x1 <= r) ||
                            (x2 >= l && x2 <= r) ||
                            (x1 < l && x2 > r)
                        );

                    default:

                        return false;

                    }

            };

        },

        _reAccepted:function(source){

            !!source && ( this.source = source );

            this.accepted = this._accept();

        },

        _accept:function(){

            return this.accepts === '*' ? true : $( this.source ).is( this.accepts );

        },

        _setOption:function( key, value ){

            if( key === 'scope') {

                this._deletElements( this.scope );

                this._setElements(value);

                this.scope = value;

            }

            if( key === 'accept') {

                value === '*' ? this.accepts = '*' : this.accepts = $( value );

                this._reAccepted();

            }

        },

        _destroy:function(){

            this._deletElements( this.scope );

        }

    },{

        _initElements:function(fn){

            var _elements = {};

            fn.getElements = this._getElements = function(scope){

                return _elements[scope] || [];

            }

            this._setElements = function(scope){

                _elements[scope] = _elements[scope] || [];

                _elements[scope].push( this.$target[0] );

            }

            this._deletElements = function(scope){

                if( _elements[scope] === undefined ){

                    return;

                }

                var elements = _elements[scope] ,length = elements.length,element = this.$target[0];

                for (var i = 0; i < length; i++) {

                    if(elements[i] === element){

                        elements.splice(i,1);

                    }

                };

            }

        }

    });

	return $;

}));