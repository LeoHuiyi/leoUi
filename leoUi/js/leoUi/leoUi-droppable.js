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

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            accept:'*',//决定哪个可拖动元素将会被接收。

            toleranceType:'intersect',//fit,intersect,pointer,touch

            scope:'all',//用来设置拖动（draggle）元素和放置（droppable）对象的集合

            disabled:false,//当设置为true时停止。

            checkFirst:true,//是否检查第一次。

            onDragEnter: false, //drop,e,dropprop,dragBoxprop 当可拖动元素被拖入目标容器的时候触发，参数source是被拖动的DOM元素。

            onDragOver: false,//drop,e,dropprop,dragBoxprop 当可拖动元素被拖至某个元素之上的时候触发，参数source是被拖动的DOM元素。

            onDragLeave: false,//drop,e,dropprop,dragBoxprop 当可拖动元素被拖离目标容器的时候触发，参数source是被拖动的DOM元素。

            onDrop: false//drop,e,dropprop,dragBoxprop  当可拖动元素被拖入目标容器并放置的时候触发，参数source是被拖动的DOM元素。

        },

        _init:function(){

            this.entered = false;

            this.scope = this.options.scope;

            this._setArrays( this.scope );

            this._setAccepted();

        },

        _getDragSize:function(draggable){

            var $box = draggable.dragBox,top = draggable.dragBoxTop,

            left = draggable.dragBoxLeft;

            outerW = $box.outerWidth();

            outerH = $box.outerHeight();

            return{

                box:draggable.box[0],

                dragBox:draggable.dragBox[0],

                width : outerW,

                height : outerH,

                top : top,

                left : left,

                bottom : top + outerH,

                right : left + outerW,

                pageX :draggable.pageX,

                pageY : draggable.pageY

            }

        },

        _intersect:function( draggable, droppable, toleranceMode ) {

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

        },

        _getDropsSize:function($box){

            var outerW,outerH,top,left,offset;

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

        },

        _setAccepted:function(){

            var accept = this.options.accept;

            accept === '*' ? this.accepts = '*' : this.accepts = $.isFunction( accept )? accept : function( d ) {

                return d.is( accept );

            };

        },

        _accept:function($dargBox){

            return this.accepts === '*' ? true : this.accepts.call( this.$target[0], $dargBox );

        },

        _setOption:function( key, value ){

            if( key === 'scope') {

                this._deletArrays( this.scope );

                this._setArrays(value);

                this.scope = value;

            }

            if( key === 'accept') {

                this._setAccepted();

            }

        },

        _destroy:function(){

            this._deletArrays( this.scope );

        }

    },{

        _privateArray:function(fn){

            var _arrays = {};

            this._getArrays = function(scope){

                return _arrays[scope] || [];

            }

            this._setArrays = function(scope){

                _arrays[scope] = _arrays[scope] || [];

                _arrays[scope].push( this );

            }

            this._deletArrays = function(scope){

                if( _arrays[scope] === undefined ){

                    return;

                }

                var arrays = _arrays[scope] ,length = arrays.length,arrays = this.$target[0];

                for (var i = 0; i < length; i++) {

                    if(arrays[i] === this){

                        elements.splice( i, 1 );

                    }

                };

            }

        },

        setDropsProp:function( scope, $target ){

            var i,m = this._getArrays(scope) || [],length = m.length;

            for ( i = 0; i < length; i++ ) {

                m[ i ].proportions = null;

                if ( m[ i ].options.disabled ||  !m[ i ]._accept($target) || !( m[ i ].visible = ( m[ i ].$target.is( ":visible" ) ) ) ) {

                    continue;

                }

                m[ i ].proportions = this._getDropsSize( m[ i ].$target );

            }

        },

        checkPosition:function( event, draggable, first ){

            var dragProp = this._getDragSize(draggable),

            proportions,intersected,drop,notFirst = !first;

            $.each( this._getArrays( draggable.scope ) || [], function() {

                if ( this.options.disabled || !( proportions = this.proportions ) ) {

                    return;

                }

                drop = this.$target[0];

                intersected = this._intersect( dragProp, proportions, this.options.toleranceType  );

                this.options.checkFirst === true && ( notFirst = true );

                if( intersected === true ){

                    if( this.entered === false ){

                        notFirst && !!this.options.onDragEnter && this.options.onDragEnter.call( drop, event, proportions, dragProp);

                        this.entered = true;

                    }

                    !!this.options.onDragOver && this.options.onDragOver.call( drop, event, proportions, dragProp);

                }else if(  intersected === false  && this.entered === true ){

                    notFirst && !!this.options.onDragLeave && this.options.onDragLeave.call( drop, event, proportions, dragProp);

                    this.entered = false;

                }

            });

        },

        drop:function( event, draggable ){

            var dragProp = this._getDragSize(draggable),

            proportions,drop,droped;

            $.each( this._getArrays( draggable.scope ) || [], function() {

                if ( this.options.disabled || !( proportions = this.proportions ) ) {

                    return;

                }

                drop = this.$target[0];

                if( this._intersect( dragProp, proportions, this.options.toleranceType  ) === true ){

                    !!this.options.onDrop && ( droped = this.options.onDrop.call( drop, event, proportions, dragProp) );

                    this.entered = false;

                }

            });

            return !!droped;

        }

    });

	return $;

}));