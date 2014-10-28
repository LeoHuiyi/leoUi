/**
+-------------------------------------------------------------------
* jQuery leoUi--draggable
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-mouse","jqueryMousewheel","leoUi-position"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoDraggable',

        version:'1.0',

        inherit:'leoMouse',

        relevanceFnName:{

            droppable:'leoDroppable'

        },//相关函数名

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            handle:false, //点击拖拽地区

            cursor:'move',//拖动时的CSS指针。

            bClone:true, //是否使用克隆拖拽

            bCloneAnimate:true, //克隆拖拽是否动画

            dragBoxReturnToTarget:false,//是否回到target位置

            refreshPositions:false,//dropBoxs是否时刻刷新（耗性能）

            duration:400,//动画时间

            stopMouseWheel:false, //拖拽时候是否关闭滚轮事件

            revert:false, //如果设置为true, 当拖动停止时元素将返回它的初始位置。

            revertAnimate:true, //还原是否动画

            axis:false,//可用值为'x'只能在x方向拖动，设置为y只能在Y方向拖动，为空没有限制

            cursorAt:false,//设置拖动帮手相对于鼠标光标的偏移量。坐标可被指定为一个散列 使用的组合中的一个或两个键：{ top, left, right, bottom } 。

            containment:false,  //可以限制draggable只能在指定的元素或区域的边界以内进行拖动。
                                // Selector: 可拖动元素将被置于由选择器指定的第一个元素的起界限作用的盒模型中。如果没有找到任何元素，则不会设置界限。
                                 // Element: 可拖动的元素将包含该元素的边界框。
                                // String:可选值: "parent", "document", "window".
                                // Array: 以 [ x1, y1, x2, y2 ] 数组形式定义一个限制区域

            scroll: true,//如果设置为true, 当拖动时，div盒模型将自动翻滚。

            scrollSensitivity: 20,//离开可视区域边缘多少距离开始滚动。距离是相对指针进行计算的，而不是被拖到元素本身。如果scroll 选项设置为false，则不滚动。

            scrollSpeed: 20,//当鼠标指针的值小于scrollSensitivity的值时，窗口滚动的速度。如果scroll选项设置为false，则该参数无效。

            useDroppable:false,//是否使用Droppable

            droppableScope:'all',//用来设置拖动（draggle）元素和放置（droppable）对象的集合

            disabled:false,//当设置为true时停止拖动。

            grid:false,//拖拽元素时，只能以指定大小的方格进行拖动。数组形式为[ x, y ]。

            iframeFix:false,//在拖动期间阻止iframe捕捉鼠标移过事件。与cursorAt选项搭配使用时或者当鼠标指针可能不在拖动助手元素之上时，该参数非常有用。

                            // 支持多种类型:

                            // Boolean: 当设置为true, 透明层将被放置于页面上的所有iframe之上。

                            // Selector: 任何由选择器匹配的iframe将被透明层覆盖。

            proxy:function(source) { //source

                return $(source).clone().removeAttr('id').css({'opacity': '0.5'}).insertAfter(source);

            },

            onBeforeDrag:$.noop, //source

            onStartDrag:$.noop, //source,event,dragBox

            onDrag:$.noop, //source,event,dragBox

            onBeforeStopDrag:$.noop, //source,event,dragBox

            onStopDrag:$.noop//source,event

        },

        _init:function(){

            this.$body = this.document.find('body');

            this.$target.css('position') === "static" && ( this.$target[0].style.position = "relative" );

            this.hasClone = false;

            this._getContainment(true);

            this._super();

        },

        _setOption:function( key, value ){

            if( key === 'handle' ){

                this.options.handle = value;

            }

            if( key === 'containment'){

                this._getContainment(true);

            }

            if( key === 'droppableScope' || key === 'useDroppable' ){

                this._getDroppableBoxs();

            }

            if( key === 'selector'){

                this._super( key,value );

            }

        },

        _getHandle:function(event) {

            return this.options.handle ? !!$( event.target ).closest( this.$target.find( this.options.handle ) ).length : true;

        },

        _blockFrames:function() {

            var iframeFix = this.options.iframeFix,drag = this.$dragBox[0];

            this.iframeBlocks = this.document.find( iframeFix === true ? "iframe" : iframeFix ).map( function() {

                var iframe = $( this );

                if( drag === this || iframe.is(':hidden') ){ return null; }

                return $( "<div>" ).css( { position: "absolute", width: iframe.outerWidth(), height: iframe.outerHeight(), opacity: 0,'backgroundColor':'#fff'} ).insertBefore( this ).offset( iframe.offset() )[0];

            });

        },

        _unblockFrames:function() {

            if ( this.iframeBlocks ) {

                this.iframeBlocks.remove();

                delete this.iframeBlocks;

            }

        },

        _mouseCapture:function(event){

            var op = this.options

            if( op.disabled === true || op.onBeforeDrag.call( this.$target[0] ) === false || this._getHandle(event) === false ){

                return false;

            }

            return true;

        },

        _getContainment:function(init){

            if( !( init === true || this.isDelegatSelector === true ) ){ return; }

            var op = this.options,oc = op.containment,el = this.$target,

            ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( oc === 'parent' ) ? el.parent().get( 0 ) : oc;

            if(!ce){

                this.dragMaxX = this.dragMaxY = 'max';

                this.dragMinX = this.dragMinY = 'min';

                op.containment = false;

                return;

            }

            this.$containment = $(ce);

            this.initMouseDownSelector = true;

        },

        _getContainmentInfo:function(){

            var oc = this.options.containment;

            if( oc === false ){

                this._setAxis();

                return;

            }

            if( oc.constructor === Array ){

                this.dragMinX = oc[0];

                this.dragMinY = oc[1];

                this.dragMaxX = oc[2] - this.dragBoxouterW;

                this.dragMaxY = oc[3] - this.dragBoxouterH;

                this._setAxis();

                return;

            }

            if( oc === 'document' ){

                this.$containment = this.document;

                this._getBorderWidths(true);

            }else if( oc === 'window' ){

                this.$containment = this.window;

                this._getBorderWidths(true);

            }else{

                this._getBorderWidths();

            }

        },

        _setAxis:function(){

            if( this.options.axis === 'x' ){

                this.dragMinY = this.dragMaxY = this.top;

            }else if( this.options.axis === 'y' ){

                this.dragMinX = this.dragMaxX = this.left;

            }

        },

        _getContainmentRange:function(){

            if( this.options.containment === false || this.options.containment.constructor === Array ){

                return;

            }

            var fnPosition = $.position,borderWidths = this.borderWidths,

            within = fnPosition.getWithinInfo( this.$containment[0] ),

            scrollInfo = fnPosition.getScrollInfo( within ),maxX,maxY,

            outerH = this.dragBoxouterH,outerW = this.dragBoxouterW,

            withinOffset = within.isDocument ? { left: 0, top: 0 } : within.isWindow ? { left: within.scrollLeft, top: within.scrollTop } : within.offset;

            this.dragMinY = withinOffset.top + borderWidths.top;

            this.dragMinX = withinOffset.left + borderWidths.left;

            this.dragMaxY = withinOffset.top + within.height - scrollInfo.height - borderWidths.bottom - outerH;

            this.dragMaxX = withinOffset.left + within.width - scrollInfo.width - borderWidths.right - outerW;

            this._setAxis();

        },

        _getBorderWidths:function(no) {

            if(no){

                this.borderWidths = {

                    left:0,

                    top:0,

                    right:0,

                    bottom:0

                }

            }else{

                this.borderWidths = {

                    left: $.leoTools.parseCss(  this.$containment[0] ,'borderLeftWidth' ),

                    top: $.leoTools.parseCss(  this.$containment[0] ,'borderTopWidth' ),

                    right: $.leoTools.parseCss(  this.$containment[0] ,'borderRightWidth' ),

                    bottom: $.leoTools.parseCss(  this.$containment[0] ,'borderBottomWidth' )

                };

            }

        },

        _stopOnMouseWheel:function(){

           !!this.options.stopMouseWheel && this._on( this.document,'mousewheel', false );

        },

        _stopOffMouseWheel:function(){

            !!this.options.stopMouseWheel && this._off( this.document,'mousewheel', false );

        },

        _mouseStart:function(event) {

            var offset,o = this.options,$target = this.$target;

            if( this.hasClone === true ){

                return;

            }

            this.$dragBox = $target;

            this.options.cursor !== false && ( this.oldCur = this.$body.css('cursor') );

            this.revertBoxTop = $.leoTools.parseCss($target[0],'top');

            this.revertBoxLeft = $.leoTools.parseCss($target[0],'left');

            offset = $target.offset();

            this.left = offset.left;

            this.top = offset.top;

            if ( o.bClone ) {

                !! o.bCloneAnimate && $target.stop(true, false);

                this.$dragBox = o.proxy.call( null, $target[0] ).offset( { left: this.left, top: this.top } );

                this.hasClone = true;

            }

            this.dragBoxouterH = this.$dragBox.outerHeight();

            this.dragBoxouterW = this.$dragBox.outerWidth();

            this.revertBoxTop = this.top;

            this.revertBoxLeft = this.left;

            !!o.mouseDownSelector && this._getContainment();

            this._getContainmentInfo();

            this._makecursorAt(event);

            this._stopOnMouseWheel();

            !!o.scroll && ( this.scrollParents = $.leoTools.scrollParents( this.$dragBox, true ) );

            this.startLeft = event.pageX - this.left;

            this.startTop  = event.pageY - this.top;

            this._blockFrames();

            o.onStartDrag.call( $target[0], event, this.$dragBox[0] );

            !!this.oldCur && this.$body.css( 'cursor', o.cursor );

            this.setDropsProp();

            this._checkPosition( event, this.top, this.left, true );

        },

        _makecursorAt:function(event){

            var obj = this.options.cursorAt;

            if( obj !== false ){

                if ( "left" in obj ) {

                    this.left = event.pageX + obj.left;

                }
                if ( "right" in obj ) {

                    this.left = event.pageX - ( this.dragBoxouterW + obj.right );

                }

                if ( "top" in obj ) {

                    this.top = event.pageY + obj.top;

                }

                if ( "bottom" in obj ) {

                    this.top = event.pageY - ( this.dragBoxouterH + obj.bottom );

                }

                this.$dragBox.offset( { left: this.left, top: this.top } );

            }

        },

        getScrollParents:function(){

            this.scrollParents = $.leoTools.scrollParents( this.$dragBox, true );

        },

        setDropsProp:function(){

            var fnFroppable = $.fn[this.relevanceFnName.droppable],op = this.options;

            if( op.useDroppable === false && !fnFroppable ){

                return;

            }

            fnFroppable.setDropsProp( op.droppableScope, this.$target );

        },

        _checkPosition:function( event, top, left, first ){

            var fnDroppable = $.fn[this.relevanceFnName.droppable],op = this.options;

            if( op.useDroppable === false && !fnDroppable  ){

                return;

            }

            fnDroppable.checkPosition( event, {

                scope: op.droppableScope,

                box: this.$target,

                dragBox: this.$dragBox,

                dragBoxTop: top,

                dragBoxLeft: left,

                pageX: event.pageX,

                pageY: event.pageY

            }, first );

        },

        _drop:function( event, top, left ){

            var fnDroppable = $.fn[this.relevanceFnName.droppable],op = this.options;

            if( op.useDroppable === false && !fnDroppable ){

                return;

            }

            return fnDroppable.drop( event, {

                scope: op.droppableScope,

                box: this.$target,

                dragBox: this.$dragBox,

                dragBoxTop: top,

                dragBoxLeft: left,

                pageX: event.pageX,

                pageY: event.pageY

            });

        },

        _scroll:function( event, scrollParent, o, $doc , $win ){

            var axis = o.axis,scrolled = false,pageX = event.pageX,pageY = event.pageY,

            overflowOffset,docScrollTop,docScrollTop;

            if ( scrollParent !== $doc[0] && scrollParent.tagName !== "HTML" ) {

                overflowOffset = $(scrollParent).offset();

                if ( !axis || axis !== "x" ) {

                    if ( ( overflowOffset.top + scrollParent.offsetHeight ) - pageY < o.scrollSensitivity ) {

                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;

                    } else if ( pageY - overflowOffset.top < o.scrollSensitivity ) {

                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;

                    }

                }

                if ( !axis || axis !== "y" ) {

                    if ( ( overflowOffset.left + scrollParent.offsetWidth) - pageX < o.scrollSensitivity ) {

                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;

                    } else if ( pageX - overflowOffset.left < o.scrollSensitivity ) {

                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;

                    }

                }

            } else {

                if ( !axis || axis !== "x" ) {

                    docScrollTop = $doc.scrollTop();

                    this.isWinScrollToplock = true;

                    if ( pageY - docScrollTop < o.scrollSensitivity ) {

                        scrolled = $doc.scrollTop( docScrollTop - o.scrollSpeed );

                    } else if ( this.winScrollToplock === true && $win.height() - ( pageY - docScrollTop ) < o.scrollSensitivity ) {

                        scrolled = $doc.scrollTop( docScrollTop + o.scrollSpeed );

                    }

                }

                if ( !axis || axis !== "y" ) {

                    docScrollLeft = $doc.scrollLeft();

                    this.isWinScrollLeftlock = true;

                    if ( pageX - docScrollLeft < o.scrollSensitivity ) {

                        scrolled = $doc.scrollLeft( docScrollLeft - o.scrollSpeed );

                    } else if ( this.winScrollLeftlock === true && $win.width() - ( pageX - docScrollLeft ) < o.scrollSensitivity ) {

                        scrolled = $doc.scrollLeft( docScrollLeft + o.scrollSpeed );

                    }

                }

            }

            scrolled !== false && this._checkPosition( event, this.top, this.left );

        },

        _dragScroll:function(event){

            if( this.options.scroll === false ){

                return

            }

            var scrollParents = this.scrollParents,i = scrollParents.length,

            $doc = this.document,$win = this.window,op = this.options;

            while( i-- ){

                this._scroll( event, scrollParents[i], op, $doc, $win );

            }

        },

        _setGrid:function(){

            var grid = this.options.grid;

            if( grid ){

                this.top = grid[1] ? Math.round( this.top / grid[1] ) * grid[1] : this.top;

                this.left = grid[0] ? Math.round( this.left / grid[1] ) * grid[1] : this.left;

            }

        },

        _mouseDrag:function(event) {

            var range = $.leoTools.range,op,$win = this.window,scroll,top,left;

            this._dragScroll(event);

            this._getContainmentRange();

            this.left = event.pageX - this.startLeft;

            this.top = event.pageY - this.startTop;

            this._setGrid();

            op = this.options;

            scroll = op.scroll;

            top = this.top;

            left = this.left;

            op.onDrag.call( this.$target[0], event, this.$dragBox[0] );

            if( this.dragMinX > this.dragMaxX ){

                left = range( -left, this.dragMaxX, this.dragMinX );

                if( scroll === true ){

                    if( this.isWinScrollLeftlock === true && event.pageX >= $win.width() - op.scrollSensitivity ){

                        left = this.dragMaxX;

                        this.winScrollLeftlock = true;

                    }else{

                        this.winScrollLeftlock = false;

                    }

                }

            }else{

                scroll === true && ( this.winScrollLeftlock = true );

                left = range( left, this.dragMinX, this.dragMaxX );

            }

            if( this.dragMinY > this.dragMaxY ){

                top = range( -top, this.dragMaxY, this.dragMinY );

                if( scroll === true ){

                    if( this.isWinScrollToplock === true && event.pageY >= $win.height() - op.scrollSensitivity - 3 ){

                        top = this.dragMaxY;

                        this.winScrollToplock = true;

                    }else{

                        this.winScrollToplock = false;

                    }

                }

            }else{

                scroll === true && ( this.winScrollToplock = true );

                top = range( top, this.dragMinY, this.dragMaxY );

            }

            this.$dragBox.offset( { left: this.left = left, top: this.top = top } );

            op.refreshPositions === true && this.setDropsProp();

            this._checkPosition( event, this.top, this.left );

        },

        _mouseStop:function(event) {

            var This = this,boxOffset,o = this.options,droped,

            $target = this.$target,$dragBox = this.$dragBox,onStopDrag = o.onStopDrag;

            !!this.oldCur && this.$body.css( 'cursor', this.oldCur );

            o.onBeforeStopDrag.call( $target[0], event, $dragBox[0] );

            this._stopOffMouseWheel();

            droped = this._drop( event, this.top, this.left );

            this._unblockFrames();

            if( droped === true ){

                if( o.bClone ){

                    $dragBox.remove();

                    this.hasClone = false;

                }

            }else{

                if( o.bClone ){

                    if( o.revert ){

                        if( o.revertAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                            $.offset.setOffset( $dragBox[0], { top: this.revertBoxTop, left: this.revertBoxLeft, using: function(prop){

                                $dragBox.animate( { left: prop.left, top: prop.top }, { duration: o.duration, complete:function(){

                                    $dragBox.remove();

                                    onStopDrag.call($target[0], event);

                                    This.hasClone = false;

                                }});

                            }})

                        }else{

                            $dragBox.remove();

                            this.hasClone = false;

                            onStopDrag.call( $target[0], event );

                        }

                    }else{

                        if( o.dragBoxReturnToTarget ){

                            boxOffset = $target.offset();

                            if( o.bCloneAnimate && this._isMove( boxOffset.left, boxOffset.top, this.left, this.top ) ){

                                $.offset.setOffset( $dragBox[0], { top: boxOffset.top, left: boxOffset.left, using: function(prop){

                                    $dragBox.animate( { left: prop.left, top: prop.top }, { duration: o.duration, complete:function(){

                                        $dragBox.remove();

                                        onStopDrag.call($target[0], event);

                                        This.hasClone = false;

                                    }});

                                }})

                            }else{

                                $dragBox.remove();

                                !o.bCloneAnimate && $target.offset( { left: boxOffset.left, top: boxOffset.top } );

                                this.hasClone = false;

                                onStopDrag.call( $target[0], event );

                            }

                        }else{

                            $dragBox.remove();

                            if( o.bCloneAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                                $.offset.setOffset( $target[0], { top: this.top,left: this.left, using: function(prop){

                                    $target.animate( { left: prop.left, top: prop.top}, { duration: o.duration, complete:function(){

                                        onStopDrag.call($target[0], event);

                                    }});

                                }})

                            }else{

                                !o.bCloneAnimate && $target.offset( { left: this.left, top: this.top } );

                                onStopDrag.call( $target[0], event );

                            }

                            this.hasClone = false;

                        }

                    }

                }else{

                    if( o.revert ){

                        if( o.revertAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                            $.offset.setOffset( $target[0], { top: this.revertBoxTop, left: this.revertBoxLeft, using: function(prop){

                                $target.animate( { left: prop.left, top: prop.top }, { duration: o.duration, complete:function(){

                                    onStopDrag.call($target[0], event);

                                }});

                            }})

                        }else{

                            onStopDrag.call( $target[0], event );

                        }

                    }else{

                        onStopDrag.call( $target[0], event );

                    }

                }

            }

        },

        _isMove:function( oldsLeft, oldTop, left, top ){

            return ( oldsLeft !== left || ( oldTop !== top ) );

        },

        _destroy:function(){

            !!this.oldCur && this.$body.css( 'cursor', this.oldCur );

        }

    });

	return $;

}));