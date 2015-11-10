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

            accept:'*',//控制可拖动的元素被拖放接受。支持多种类型：Selector: Function: 函数将被调用页面上的每一个可拖动的（传递给函数的第一个参数）。该函数必须返回true，如果可拖动应该接受。

            tolerance:'intersect',//指定使用那种模式来测试一个拖动(draggable)元素"经过"一个放置（droppable）对象。 允许使用的值:"fit": 拖动(draggable)元素 完全重叠到放置（droppable）对象。"intersect": 拖动(draggable)元素 和放置（droppable）对象至少重叠50%。"pointer": 鼠标重叠到放置（droppable）对象上。"touch": 拖动(draggable)元素 和放置（droppable）对象的任意重叠

            scope:'all',//用来设置拖动（leoDraggle）元素和放置（leoDroppable）对象的集合, 除了leoDroppable中的accept属性必须和leoDroppable中的droppableScope属性一直才能被允许碰撞检测

            disabled:false,//当设置为true时停止leoDroppable

            checkFirst:true,//是否触发第一次的onDragEnter或者onDragLeave回调

            onDragEnter: false, //当可拖动元素被拖入目标容器的时候触发（ this: drop, arguments: event, proportions（drop的prop）, dragProp（drag的prop））

            onDragOver: false,//当可拖动元素被拖至某个元素之上的时候触发（ this: drop, arguments: event, proportions（drop的prop）, dragProp（drag的prop））

            onDragLeave: false,//当可拖动元素被拖离目标容器的时候触发（ this: drop, arguments: event, proportions（drop的prop）, dragProp（drag的prop））

            onDrop: false//当可拖动元素被拖入目标容器并放置的时候触发，当返回true就不会触发leoDraggable组件的onStopDrag回调（ this: drop, arguments: event, proportions（drop的prop）, dragProp（drag的prop））

        },

        _init:function(){

            this.entered = false;

            this.scope = this.options.scope;

            this._setArrays( this.scope );

            this._setAccepted();

        },

        _getDragSize:function(draggable){

            var $box = draggable.dragBox,top = draggable.dragBoxTop,

            left = draggable.dragBoxLeft,

            outerW = $box.outerWidth(),

            outerH = $box.outerHeight();

            return{

                box: draggable.box[0],

                dragBox: draggable.dragBox[0],

                width : outerW,

                height : outerH,

                top : top,

                left : left,

                bottom : top + outerH,

                right : left + outerW,

                pageX : draggable.pageX,

                pageY : draggable.pageY

            }

        },

        _intersect:function( draggable, droppable, toleranceMode ) {

            var pageX = draggable.pageX,pageY = draggable.pageY,

            x1 = draggable.left,y1 = draggable.top,

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

                return;

            }

            if( key === 'accept') {

                this._setAccepted();

                return;

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

                var arrays = _arrays[scope] ,i = arrays.length,

                element = this.$target[0];

                while(i--){

                    if(arrays[i].$target[0] === element){

                        arrays.splice( i, 1 );

                    }

                }

                if(arrays.length === 0){

                    delete _arrays[scope];

                }

            }

        },

        setDropsProp:function( scope, $draggable ){

            var i,m = this._getArrays(scope) || [],length = m.length,child;

            for ( i = 0; i < length; i++ ) {

                child = m[i];

                child.proportions = null;

                if ( child.options.disabled ||  !child._accept($draggable) || !( child.visible = ( child.$target.is( ":visible" ) ) ) ) {

                    continue;

                }

                child.proportions = this._getDropsSize( child.$target );

            }

        },

        checkPosition:function( event, draggable, first ){

            var dragProp = this._getDragSize(draggable),notFirst = !first;

            $.each( this._getArrays( draggable.scope ) || [], function() {

                var drop,op = this.options,proportions,intersected;

                if ( op.disabled || !( proportions = this.proportions ) ) {

                    return;

                }

                drop = this.$target[0];

                intersected = this._intersect( dragProp, proportions, op.tolerance );

                op.checkFirst === true && ( notFirst = true );

                if( intersected === true ){

                    if( this.entered === false ){

                        notFirst && !!op.onDragEnter && op.onDragEnter.call( drop, event, proportions, dragProp);

                        this.entered = true;

                    }

                    !!op.onDragOver && op.onDragOver.call( drop, event, proportions, dragProp);

                }else if( intersected === false && this.entered === true ){

                    notFirst && !!op.onDragLeave && op.onDragLeave.call( drop, event, proportions, dragProp);

                    this.entered = false;

                }

            });

        },

        drop:function( event, draggable ){

            var dragProp = this._getDragSize(draggable),droped;

            $.each( this._getArrays( draggable.scope ) || [], function() {

                var drop,op = this.options,proportions;

                if ( op.disabled || !( proportions = this.proportions ) ) {

                    return;

                }

                drop = this.$target[0];

                if( this._intersect( dragProp, proportions, op.tolerance ) === true ){

                    !!op.onDrop && ( droped = op.onDrop.call( drop, event, proportions, dragProp) );

                    this.entered = false;

                }

            });

            return !!droped;

        }

    });

    return $;

}));