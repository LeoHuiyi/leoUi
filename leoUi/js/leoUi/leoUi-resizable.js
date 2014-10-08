/**
+-------------------------------------------------------------------
* jQuery leoUi--resizable
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

        name:'leoResizable',

        version:'1.0',

        inherit:'leoMouse',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            disabled:false,//如果设置为true将禁止缩放。

            bClone:true,//克隆对象

            bCloneAnimate:true, //克隆拖拽是否动画

            duration:400,//动画时间

            containment:false,//使用指定的元素强制性限制大小调整的界限.

            stopMouseWheel: false, //拖拽时候是否关闭滚轮事件

            handles:'all',//n, e, s, w, ne, se, sw, nw, all

            edge:4,//mouse的cursor的变化宽度

            grid:false,//拖拽元素时，只能以指定大小的方格进行拖动。数组形式为[ x, y ]。

            iframeFix:false,//在拖动期间阻止iframe捕捉鼠标移过事件。与cursorAt选项搭配使用时或者当鼠标指针可能不在拖动助手元素之上时，该参数非常有用。

                            // 支持多种类型:

                            // Boolean: 当设置为true, 透明层将被放置于页面上的所有iframe之上。

                            // Selector: 任何由选择器匹配的iframe将被透明层覆盖。

            aspectRatio:false,//等比例缩放,为长与高之比

            minWidth:0,

            minHeight:0,

            maxWidth:'max',

            maxHeight:'max',

            proxy:function(source){//source

                return $(source).clone().removeAttr('id').css({'opacity': '0.5'}).insertAfter(source);

            },

            initCallback: $.noop, //source

            mouseMoveCurIn:$.noop,

            mouseMoveCurOut:$.noop,

            onStartResize: $.noop, //source,event

            onResize: $.noop, //source,event

            onStopResize: $.noop,//source,event

            onStopAnimateResize:$.noop

        },

        _init:function(){

            this.$body = this.document.find('body');

            this._handleInit();

            this.$target.css('position') === "static" && ( this.$target[0].style.position = "relative" );

            this._dragArea();

            this._getContainment(true);

            this.bClone = false;

            this.cur = '';

            !! this.options.initCallback && this.options.initCallback.call(this.$target[0]);

            this._super();

            this._boxEventBind();

        },

        _handleInit:function(){

            var This = this;

            if(typeof this.options.handles ==='string'){

                if( $.trim( this.options.handles ).toUpperCase() === 'ALL'){

                    this.handles = true;

                }else{

                    this.handles = {};

                    this.options.handles.replace($.leoTools.rword, function(name) {

                        This.handles[name.toUpperCase()] = true;

                    });

                }

            }else{

                this.handles = true;

            }

        },

        _dragArea:function(){

            this.opMaxWidth = this.options.maxWidth;

            this.opMaxHeight = this.options.maxHeight;

            this.opMinWidth = $.leoTools.range( this.options.minWidth, 0, this.opMaxWidth )

            this.opMinHeight = $.leoTools.range( this.options.minHeight, 0, this.opMaxHeight );

        },

        _mouseCur:function( event, node ){

            if( this._getCursorChange() === true && this.options.disabled === false ){

                event.preventDefault();

                var $this = $(node),offset = $this.offset(),top = offset.top,left = offset.left,

                outerW = $this.outerWidth(),outerH = $this.outerHeight();

                if( event.pageY <= top + this.options.edge ){

                    this.flag_NS = 'N';

                }else if( event.pageY >= top+outerH - this.options.edge ){

                    this.flag_NS = 'S';

                }else{

                    this.flag_NS = '';

                };

                if( event.pageX >= left+outerW - this.options.edge ){

                    this.flag_EW = 'E';

                }else if( event.pageX <= left + this.options.edge ){

                    this.flag_EW = 'W';

                }else{

                    this.flag_EW = '';

                }

                this.oldCur = this.cur;

                this.cur = this.flag_NS + this.flag_EW;

                this.handles !== true && ( this.handles[this.cur] !== true ) && ( this.cur = '' );

                if( this.oldCur !== this.cur ){

                    if(!this.cur){

                        this.cursor = this.boxCur;

                        !!this.options.mouseMoveCurOut && this.options.mouseMoveCurOut.call( $this, this.cursor );

                    }else{

                        this.cursor = this.cur+'-resize';

                        !!this.options.mouseMoveCurIn && this.options.mouseMoveCurIn.call( $this, this.cursor );

                    }

                    $this.css('cursor',this.cursor);

                }

            }

        },

        _blockFrames:function(){

            var iframeFix = this.options.iframeFix,drag = this.$dragBox[0];

            this.iframeBlocks = this.document.find( iframeFix === true ? "iframe" : iframeFix ).map( function() {

                var iframe = $( this );

                if( drag === this || $.contains( drag, this ) ){ return null; }

                return $( "<div>" ).css( { position: "absolute", width: iframe.outerWidth(), height: iframe.outerHeight(), opacity: 0,'backgroundColor':'#fff'} ).insertBefore( this ).offset( iframe.offset() )[0];

            });

        },

        _unblockFrames:function(){

            if ( this.iframeBlocks ) {

                this.iframeBlocks.remove();

                delete this.iframeBlocks;

            }

        },

        _boxEventBind:function(){

            var This = this,$box = this.$target,boxCur = this.$target.css('cursor'),

            selector = this.options.mouseDownSelector,$selector;

            this.boxCur = boxCur;

            selector === false && ( selector = '' );

            this._off( $box,'mouseenter.resize' );

            this._off( $box,'mousemove.resize' );

            this._off( $box,'mouseleave.resize' );

            this._on( $box,'mouseenter.resize', selector, function(event){

                This._mouseCur( event, this );

            })

            this._on( $box,'mousemove.resize', selector, function(event){

                This._mouseCur( event, this );

            });

            this._on( $box,'mouseleave.resize', selector, function(event){

                if( This._getCursorChange() === true && This.options.disabled === false ){

                    event.preventDefault();

                    !!This.options.mouseMoveCurOut && This.options.mouseMoveCurOut.call( $selector = $(this), boxCur );

                    $selector.css('cursor',boxCur);

                    This.cur = '';

                }

            });

        },

        _mouseCapture:function(event){

            if( event.which!==1 || !this.cur || this.options.disabled === true ){

                return false;

            }

            return true;

        },

        _getContainment:function(init){

            if( !( init === true || this.isDelegatSelector === true ) ){ return; }

            var oc = this.options.containment,el = this.$target,

            ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( oc === 'parent' ) ? el.parent().get( 0 ) : oc;

            if(!ce){

                this.SEMaxWidth = this.NWMaxWidth =  this.opMaxWidth;

                this.SEMaxHeight = this.NWMaxHeight =  this.opMaxHeight;

                this.SEMinWidth = this.NWMinWidth =  this.opMinWidth;

                this.SEMinHeight = this.NWMinHeight =  this.opMinHeight;

                this.options.containment = false;

                return;

            }

            this.$containment = $(ce);

        },

        _getContainmentInfo:function(){

            var oc = this.options.containment

            if( oc === false ){

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

            this.reW = this.$dragBox.outerWidth() - this.startWidth;

            this.reH = this.$dragBox.outerHeight() - this.startHeight;

        },

        _getContainmentRange:function(){

            if( this.options.containment === false ){

                return;

            }

            var within = $.position.getWithinInfo( this.$containment[0] ),

            scrollInfo = $.position.getScrollInfo( within ),

            difT,difL,dragBoxOffset = this.$dragBox.offset(),cur = this.cur,

            withinOffset = within.isDocument ? { left: 0, top: 0 } : within.isWindow ? { left: within.scrollLeft, top: within.scrollTop } : within.offset,

            containmentDifT,containmentDifL,containmentDifB,containmentDifR;

            difT = dragBoxOffset.top - withinOffset.top;

            difL = dragBoxOffset.left - withinOffset.left;

            containmentDifB = within.height - scrollInfo.height - this.reH - difT - this.borderWidths.bottom;

            containmentDifR = within.width - scrollInfo.width - this.reW - difL - this.borderWidths.right;

            containmentDifT = difT + this.height - this.borderWidths.top;

            containmentDifL = difL + this.width - this.borderWidths.left;

            this.SEMaxWidth = this.opMaxWidth === 'max' ? containmentDifR : $.leoTools.range( this.opMaxWidth, 0, containmentDifR );

            this.SEMinWidth = Math.min( this.SEMaxWidth, this.opMinWidth );

            this.SEMaxHeight = this.opMaxHeight === 'max' ? containmentDifB : $.leoTools.range( this.opMaxHeight, 0, containmentDifB );

            this.SEMinHeight = Math.min( this.SEMaxHeight, this.opMinHeight );

            this.NWMaxWidth = this.opMaxWidth === 'max' ? containmentDifL : containmentDifL > 0 ? $.leoTools.range( this.opMaxWidth, 0, containmentDifL ) : 0;

            this.NWMinWidth = Math.min( this.NWMaxWidth, this.opMinWidth );

            this.NWMaxHeight = this.opMaxHeight === 'max' ? containmentDifT : containmentDifT > 0 ? $.leoTools.range( this.opMaxHeight, 0, containmentDifT ) : 0;

            this.NWMinHeight = Math.min( this.NWMaxHeight, this.opMinHeight );

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

            var offset,o = this.options;

            this.$dragBox = this.$target;

            isFixed = this.$dragBox.position();

            offset = this.$target.offset();

            if ( o.bClone ) {

                this.$dragBox = o.proxy.call( null, this.$target[0] ).offset({ left: offset.left,top: offset.top});

                this.bClone = true;

            }

            this.isFixed = this.$dragBox.css('position') === 'fixed';

            !o.stopMouseWheel && ( this.scrollParents = $.leoTools.scrollParents( this.$dragBox ) );

            this._stopOnMouseWheel();

            this.startLeft = this.left = $.leoTools.parseCss( this.$dragBox[0],'left' );

            this.startTop = this.top = $.leoTools.parseCss( this.$dragBox[0],'top' );

            this.startWidth = this.width = this.$target.width();

            this.startHeight = this.height = this.$target.height();

            this._getContainment();

            this._getContainmentInfo();

            this._getContainmentRange();

            this.startX =  this.isFixed ? event.clientX : event.pageX;

            this.startY = !o.stopMouseWheel ? event.clientY + $.leoTools.getScrollParentsTop( this.scrollParents ) : this.isFixed ? event.clientY : event.pageY;

            this.$body.css( 'cursor',this.cursor );

            this._blockFrames();

            !! o.onStartResize && o.onStartResize.call(this.$target[0],event,this.$dragBox,this.startWidth,this.startHeight);

            this._setCursorChange(false);

        },

        _getAspectRatio:function( moveX, moveY ){

            var width,height,cur = this.cur,aspectRatio = this.options.aspectRatio,

            SEMinScaleWH =  this.SEMinWidth / this.SEMinHeight,

            SNMinScaleWH =  this.SEMinWidth / this.NWMinHeight,

            NSMinScaleWH =  this.NWMinWidth / this.SEMinHeight,

            NWMinScaleWH =  this.NWMinWidth / this.NWMinHeight;

            SEMaxScaleWH =  this.SEMaxWidth / this.SEMaxHeight,

            SNMaxScaleWH =  this.SEMaxWidth / this.NWMaxHeight,

            NSMaxScaleWH =  this.NWMaxWidth / this.SEMaxHeight,

            NWMaxScaleWH =  this.NWMaxWidth / this.NWMaxHeight;

            if( cur === 'E' ){

                width = this.startWidth + moveX;

                height = width / aspectRatio;

                if( width >= this.SEMaxWidth || height >= this.SEMaxHeight ){

                    if( SEMaxScaleWH < aspectRatio ){

                        this.width = this.SEMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.SEMinWidth || height <= this.SEMinHeight ){

                    if( SEMinScaleWH > aspectRatio ){

                        this.width = this.SEMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

            }

            if( cur === 'S'  || cur === 'SE' ){

                height = this.startHeight + moveY;

                width = height * aspectRatio;

                if( width >= this.SEMaxWidth || height >= this.SEMaxHeight ){

                    if( SEMaxScaleWH < aspectRatio ){

                        this.width = this.SEMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.SEMinWidth || height <= this.SEMinHeight ){

                    if( SEMinScaleWH > aspectRatio ){

                        this.width = this.SEMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

            }

            if( cur === 'N' ||  cur === 'NE' ){

                moveY >= this.startHeight && ( moveY = this.startHeight );

                height = this.startHeight - moveY;

                width = height * aspectRatio;

                if( width >= this.SEMaxWidth || height >= this.NWMaxHeight ){

                    if( SNMaxScaleWH < aspectRatio ){

                        this.width = this.SEMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.SEMinWidth || height <= this.NWMinHeight ){

                    if( SNMinScaleWH > aspectRatio ){

                        this.width = this.SEMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

                this.top = this.startTop + this.startHeight - this.height;

            }

            if( cur === 'W' ||  cur === 'SW' ){

                moveX >= this.startWidth && ( moveX = this.startWidth );

                width = this.startWidth - moveX;

                height = width / aspectRatio;

                if( width >= this.NWMaxWidth || height >= this.SEMaxHeight ){

                    if( NSMaxScaleWH < aspectRatio ){

                        this.width = this.NWMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.NWMinWidth || height <= this.SEMinHeight ){

                    if( NSMinScaleWH > aspectRatio ){

                        this.width = this.NWMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

                this.left = this.startLeft + this.startWidth - this.width;

            }

            if( cur === 'NW'  ){

                moveY >= this.startHeight && ( moveY = this.startHeight );

                height = this.startHeight - moveY;

                width = height * aspectRatio;

                if( width >= this.NWMaxWidth || height >= this.NWMaxHeight ){

                    if( NWMaxScaleWH < aspectRatio ){

                        this.width = this.NWMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.NWMinWidth || height <= this.NWMinHeight ){

                    if( NWMinScaleWH > aspectRatio ){

                        this.width = this.NWMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

                this.left = this.startLeft + this.startWidth - this.width;

                this.top = this.startTop + this.startHeight - this.height;

            }

        },

        _setGrid:function( moveX, moveY ){

            var o = this.options;

            if( o.grid ){

                moveY = o.grid[1] ? Math.round( moveY / o.grid[1] ) * o.grid[1] : moveY;

                moveX = o.grid[0] ? Math.round( moveX / o.grid[0] ) * o.grid[0] : moveX;

            }

            return { moveX: moveX, moveY: moveY};

        },

        _mouseDrag:function(event) {

            var cur = this.cur,moveX = ( this.isFixed ? event.clientX : event.pageX ) - this.startX,moveY = !this.options.stopMouseWheel ? event.clientY - this.startY + $.leoTools.getScrollParentsTop( this.scrollParents ) : ( this.isFixed ? event.clientY : event.pageY ) - this.startY,grid = this._setGrid( moveX, moveY );

            this._getContainmentRange();

            moveX = grid.moveX;

            moveY = grid.moveY;

            if( !!this.options.aspectRatio ){

                this._getAspectRatio( moveX, moveY );

            }else{

                if ( cur.indexOf("E") !== -1 ) {

                    this.width = $.leoTools.range( ( this.startWidth + moveX ), this.SEMinWidth, this.SEMaxWidth );

                }

                if ( cur.indexOf("S") !== -1 ) {

                    this.height = $.leoTools.range( ( this.startHeight + moveY ), this.SEMinHeight, this.SEMaxHeight );

                }

                if ( cur.indexOf("W") !== -1 ) {

                    moveX >= this.startWidth && ( moveX = this.startWidth );

                    this.width = this.startWidth - moveX;

                    this.left = this.startLeft + moveX;

                    if( this.NWMaxWidth <= this.width ){

                        this.width = this.NWMaxWidth;

                        this.left = this.startLeft + this.startWidth - this.width;

                    }else if( this.NWMinWidth >= this.width ){

                        this.width = this.NWMinWidth;

                        this.left = this.startLeft + this.startWidth - this.width;

                    }

                }

                if ( cur.indexOf("N") !== -1 ) {

                    moveY >= this.startHeight && ( moveY = this.startHeight );

                    this.height = this.startHeight - moveY;

                    this.top = this.startTop + moveY;

                    if( this.NWMaxHeight <= this.height ){

                        this.height = this.NWMaxHeight;

                        this.top = this.startTop + this.startHeight - this.height;

                    }else if( this.NWMinHeight >= this.height ){

                        this.height = this.NWMinHeight;

                        this.top = this.startTop + this.startHeight - this.height;

                    }

                }

            }

            this.options.onResize.call( this.$target[0], event, this.$dragBox, this.width, this.height );

            this.$dragBox.css( { height: this.height,width: this.width,top: this.top,left: this.left } );

        },

        _mouseStop:function(event) {

            var dragBoxOffset = this.$dragBox.offset(),o = this.options,This = this;

            this._stopOffMouseWheel();

            if( this.bClone ){

                $.offset.setOffset( this.$target[0], { top: dragBoxOffset.top,left: dragBoxOffset.left, using: function(prop){

                    if( !o.bCloneAnimate ){

                        This.$target.css( { height: This.height, width: This.width, top: prop.top, left: prop.left } );

                    }else{

                        This.$target.animate( { height: This.height, width: This.width, top: prop.top, left: prop.left}, { duration: o.duration, complete:function(){

                            !! o.onStopAnimateResize && o.onStopAnimateResize.call( This.$target[0], event, This.$dragBox, This.width, This.height );

                        }});

                    }

                }})

                this.$dragBox.remove()

            }

            !! o.onStopResize && o.onStopResize.call( this.$target[0], event, this.width, this.height );

            this.$body.css('cursor','');

            this._unblockFrames();

            this.bClone = false;

            this._setCursorChange(true);

        },

        _setOption:function( key,value ){

            if( key === 'handles'){

                this._handleInit();

            }

            if( key === 'containment'){

                this._getContainment(true);

            }

            if( key === 'maxWidth' || key === 'maxHeight' || key === 'minWidth' || key === 'minHeight'){

                this._dragArea();

            }

            if( key === 'selector'){

                this._super( key,value );

                this._boxEventBind();

            }

        },

        _destroy:function(){

            this.$target.css('cursor',this.boxCur);

        }

    },{

        _initElements:function(fn){

            var _cursorChange = true;

            fn.getCursorChange = this._getCursorChange = function(){

                return _cursorChange;

            }

            fn.setCursorChange = this._setCursorChange = function(flag){

                _cursorChange = !!flag;

            }

        }

    });

	return $;

}));