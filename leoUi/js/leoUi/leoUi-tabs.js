/**
+-------------------------------------------------------------------
* jQuery leoUi--tabs
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
*
* 每次创建li的长度都不一样，li选中后的长度和之前的也不一样
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-droppable", "jqueryMousewheel"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoTabs',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            append:'body',//添加到哪里

            limitLen:10,//tabname长度

            ellipsisStr:'...',//tabname后缀

            initCallback:$.noop,

            createTabCallback:$.noop,

            tabRefreshCallback:false

        },

        _init: function(){

            this.id = 0;

            this.currentTid = null;

            this._initTabs();

        },

        _initTabs:function(){

            var op = this.options;

            this.$tab = $('<div class="leoTabs leoUi_clearfix"><div class="leoTabs_nav"><ul><div class="leoTabs_nav_wrap"></div></ul><div class="leoTabs_nav_leftBtn" style="display:none"><i></i></div><div class="leoTabs_nav_rightBtn" style="display:none"><i></i></div></div><div class="leoTabs_content"></div><div class="leoTabs_menu"  style="display:none"><div class="leoTabs_menu_yline"></div><div class="leoTabs_menu_over"><div class="leoTabs_menu_over_l"></div><div class="leoTabs_menu_over_r"></div></div><div class="leoTabs_menu_inner"><div leoUi-menuId="close" class="leoTabs_menu_item" leoUi-disable="false" ><div class="leoTabs_menu_item_text">关闭当前页</div></div><div leoUi-menuId="closeOther" leoUi-disable="false" class="leoTabs_menu_item"><div class="leoTabs_menu_item_text">关闭其他</div></div><div leoUi-menuId="closeAll" leoUi-disable="false" class="leoTabs_menu_item"><div class="leoTabs_menu_item_text">关闭所有</div></div><div leoUi-menuId="reload" leoUi-disable="false" class="leoTabs_menu_item"><div class="leoTabs_menu_item_text">刷新</div></div></div></div></div>');

            this.$nav = this.$tab.find('.leoTabs_nav');

            this.$ul = this.$nav.find('ul');

            this.$wrap = this.$ul.find('.leoTabs_nav_wrap');

            this.$leftBtn = this.$nav.find('.leoTabs_nav_leftBtn');

            this.$rightBtn = this.$nav.find('.leoTabs_nav_rightBtn');

            this.$content = this.$tab.find('.leoTabs_content');

            this.$menu = this.$tab.find('.leoTabs_menu');

            this.$tab.appendTo(op.append);

            this._slide = this._slideCreate();

            this._addEvent();

            op.initCallback(this.$target);

        },

        _addEvent:function(){

            var This = this, $menu = this.$menu,

            $menuClickLi = null, $menuOver = $menu.find('.leoTabs_menu_over'), $tab = this.$tab;

            this._on(this.$ul, 'mousedown', 'li', function(event){

                event.which === 2 && event.preventDefault();

            })._on(this.$ul, 'mouseup', 'li', function(event){

                var $this = $(this);

                if(event.which === 1){

                    $(event.target).is('.leoTabs_nav_close') ? This._tabClose($this) : This._tabChage($this);

                }else if(event.which === 2 && $this.attr('leoui-remove') === "true"){

                    This._tabClose($this);

                }

            })._on(this.$ul, 'contextmenu', 'li', function(event) {

                event.preventDefault();

                $menuClickLi = $(this);

                if($menuClickLi.attr('leoui-remove') === "false"){

                    $menu.find('div[leoUi-menuId = "close"]').addClass('leoTabs_menu_item_disable').attr('leoUi-disable', 'true');

                }else{

                    $menu.find('div[leoUi-menuId = "close"]').removeClass('leoTabs_menu_item_disable').attr('leoUi-disable', 'false');

                }

                $menu.show().offset( { left: event.pageX, top: event.pageY} );

            })._on($menu, 'mouseenter', 'div[leoui-disable="false"]', function(event) {

                event.preventDefault();

                $menuOver.css( 'top', $(this).position().top );

            })._on($menu, 'mouseleave', 'div[leoui-disable="false"]', function(event) {

                event.preventDefault();

                $menuOver.css( 'top', -30 );

            })._on($menu, 'mouseup', 'div[leoui-disable="false"]', function(event) {

                event.preventDefault();

                var menuId = $(this).attr( 'leoUi-menuId' );

                if( menuId === 'close'){

                    This._tabClose($menuClickLi);

                }else if( menuId === 'closeOther' ){

                    This._tabCloseOther($menuClickLi);

                }else if( menuId === 'closeAll' ){

                    This._tabCloseAll();

                }else if( menuId === 'reload' ){

                    This._tabChage($menuClickLi);

                    This._tabRefresh($menuClickLi);

                }

                $menu.hide();

                $menuClickLi = null;

            })._on(this.document, 'mouseup', function(event){

                $menu.hide();

            });

            this.$nav.leoDraggable({

                mouseDownSelector:'li',

                cancel:'.leoTabs_nav_close',

                distance:4,

                droppableScope:'tab',

                bClone: true,

                revert: false,

                revertAnimate: true,

                bCloneAnimate: true,

                dragBoxReturnToTarget: true,

                useLeoDroppable: true,

                stopMouseWheel: false,

                containment:this.$nav,

                iframeFix:true,

                axis:'x',

                proxy: function(source) {

                    var $source = $(source),className;

                    $source.attr('class') === 'leoTabs_nav_selected' ? className = 'leoTabs_nav_dragSelected' : className = 'leoTabs_nav_dragSelecte';

                    return $('<div><a>'+ $source.find('a').text() +'</a></div>').css({
                        'z-index': 1000,
                        width: $source.width(),
                        position: 'absolute'
                    }).addClass(className).appendTo($tab);

                }

            });

        },

        openTab:function(option){

            var li;

            option = this._setNavLiOp(option);

            if((li = this._hasTab(option.tid))){

                this._tabChage($(li), option.tid);

            }else{

                this._createTab(option);

            }

        },

        _tabRefresh:function($li){

            var tabRefreshCallback = this.options.tabRefreshCallback;

            if(typeof tabRefreshCallback === 'function'){

                tabRefreshCallback($li, this.$content.find("div[leoUi-tid ='"+this.currentTid+"']"));

            }

        },

        _tabCloseOther:function($li){

            var $content = this._tabActive({$li: $li, returnContent: true}) || this.$content.find("div[leoUi-tid ='" + this.currentTid + "']");

            this.$ul.find("li[leoUi-remove ='true']").not($li).leoDroppable('destroy').remove();

            this.$content.find("div[leoUi-remove ='true']").not($content).remove();

            this._slide.slideHide();

        },

        _tabCloseAll:function(){

            var el, $removeLi = this.$ul.find("li[leoUi-remove ='true']");

            if(!$removeLi[0])return;

            if((el = this.$ul.find("li[leoUi-remove ='false']")[0])){

                this._tabActive({$li: $(el)});

            }else{

                this.currentTid = null;

            }

            $removeLi.leoDroppable('destroy').remove();

            this.$content.find("div[leoUi-remove ='true']").remove();

            this._slide.slideHide();

        },

        _hasTab:function(tid){

            return this.$ul.find("li[leoUi-tid ='" + tid + "']")[0];

        },

        _tabChage:function($li, tid){

            this._tabActive({$li: $li, tid: tid, isAlignRightFun: true});

            this._slide.activeTab( $li, true );

        },

        _tabClose:function($li, tid){

            var $prevLi, el;

            tid = tid || $li.attr('leoui-tid');

            if(this.currentTid ===  tid){

                $prevLi = $li.prev();

                if($prevLi[0]){

                    this._tabActive({$li: $prevLi, notHide: true});

                }else if((el = this.$ul.find("li[leoUi-remove ='false']")[0])){

                    this._tabActive({$li: $(el), notHide: true});

                }else{

                    this.currentTid = null;

                }

            }

            this._tabRemove(tid, $li);

            this._slide.slideHide();

        },

        _tabRemove:function(tid, $li){

            ($li || this.$ul.find("li[leoUi-tid ='" + tid + "']")).leoDroppable('destroy').remove();

            this.$content.find("div[leoUi-tid ='" + tid + "']").remove();

        },

        _tabActive:function(option){

            var oldTid, tid = option.tid, $li = option.$li,

            $content;

            if(!tid && tid !== 0){

                tid = $li.attr('leoUi-tid');

                if(typeof tid === 'undefined')return;

            }

            if(tid !== (oldTid = this.currentTid)){

                $li = ($li || this.$ul.find("li[leoUi-tid ='" + tid + "']"));

                !!option.isAlignRightFun && this._slide.isAlignRightFun($li.index() === this.$ul.find('li').length - 1);

                this.$ul.find("li[leoUi-tid ='" + oldTid + "']").removeClass('leoTabs_nav_selected');

                this.$content.find("div[leoUi-tid ='" + oldTid + "']").hide();

                $li.addClass('leoTabs_nav_selected');

                $content = (option.$content || this.$content.find("div[leoUi-tid ='" + tid + "']")).show();

                this.currentTid = tid;

                if(option.returnContent)return $content;

            }

        },

        _createTab:function(option){

            var $li, $content = $(this._creatContentItemHtml(option)).appendTo(this.$content), $nav = this.$nav;

            $li = $(this._creatNavLiHtml(option)).leoDroppable({

                scope:'tab',

                checkFirst:false,

                onDragEnter: function(e, drop, dargBox) {

                    var source = dargBox.box,$drag,$drop;

                    if (source !== this) {

                        $drag = $(source);

                        $drop = $(this);

                        if($drop.index() < $drag.index()){

                            $drag.insertBefore(this);

                        }else{

                            $drag.insertAfter(this);

                        }

                        $nav.leoDraggable('setDropsProp');

                    }

                }

            }).appendTo(this.$wrap);

            this._tabActive({tid: option.tid, $li: $li, $content: $content});

            this._slide.slideShow();

            this.options.createTabCallback($li, $content);

        },

        _creatNavLiHtml:function(option){

            var str = '';

            if(option.remove){

                str += '<li leoUi-remove="true" leoUi-tid="'+option.tid+'"><a title="'+option.title+'">'+option.name+'</a><div class="leoTabs_nav_close"></div></li>';

            }else{

                str += '<li leoUi-remove="false" leoUi-tid="'+option.tid+'"><a title="'+option.title+'">'+option.name+'</a></li>';

            }

            return str;

        },

        _creatContentItemHtml:function(option){

            var str = '';

            if(option.remove){

                str = '<div class="leoTabs_content_item" leoUi-tid="'+option.tid+'" leoUi-remove="true">'+option.contentHtml+'</div>';

            }else{

                str = '<div class="leoTabs_content_item" leoUi-tid="'+option.tid+'" leoUi-remove="false">'+option.contentHtml+'</div>';

            }

            return str;

        },

        _setNavLiOp:function(option){

            var name;

            option = typeof option === 'object' ? option : {};

            return option = {

                name: this._textOverflow(name = (option.name || 'newTab' + ++this.id)),

                tid: option.tid || this._getTid(),

                title: option.title || name,

                contentHtml: option.contentHtml || '',

                remove: typeof option.remove === 'undefined' ? true : option.remove

            };

        },

        _getTid:function(){

            return $.leoTools.getId('tab');

        },

        _textOverflow:function(text, limitLen, ellipsisStr){

            var op = this.options;

            limitLen = limitLen >> 0 || op.limitLen || 5;

            ellipsisStr = ellipsisStr || op.ellipsisStr  || '…';

            if(text.length > limitLen){

                text = text.slice(0, limitLen - ellipsisStr.length) + ellipsisStr;

            }

            return text;

        },

        _destroy:function(){

            this.$wrap.find('li').leoDroppable('destroy');

            this.$nav.leoDraggable('destroy');

            this.$tab.remove();

        },

        _slideCreate:function(){

            function Slide(option){

                this.$ul = option.$ul;

                this.$nav = option.$nav;

                this.$wrap = option.$wrap;

                this.$leftBtn = option.$leftBtn;

                this.$rightBtn = option.$rightBtn;

                this.selectedClass = option.selectedClass;

                this.leftBtnWidth = this.$leftBtn.outerWidth();

                this.rightBtnWidth = this.$rightBtn.outerWidth();

                this.slideIsShow = false;

                this.init(option.leoUi);

            }

            Slide.prototype = {

                constructor: Slide,

                init:function(leoUi){

                    var This = this, time;

                    this.getlinksLR();

                    this.getTabLinksWidth();

                    leoUi._on(this.$leftBtn, 'mousedown', function(event) {

                        event.preventDefault();

                        This.slideLeft();

                    })._on(this.$leftBtn, 'mouseup', function(event) {

                        event.preventDefault();

                        This.sildeAnimateStop('left');

                    })._on(this.$rightBtn, 'mousedown', function(event) {

                        event.preventDefault();

                        This.slideRight();

                    })._on(this.$rightBtn, 'mouseup', function(event) {

                        event.preventDefault();

                        This.sildeAnimateStop('right');

                    })._on(this.$wrap, 'mousewheel', function(event, delta) {

                        event.preventDefault();

                        if(This.slideIsShow === false)return;

                        This.slideIsShow === true && delta === 1 ? This.slideLeftWheel() : This.slideRightWheel();

                    })._on(leoUi.window, 'resize', function(event) {

                        event.preventDefault();

                        !!time && clearTimeout(time);

                        time = setTimeout( function(){

                            This.sildeChange();

                        }, 16 );

                    });

                },

                getTabLinksWidth:function(){

                    this.tabLinksWidth = this.$nav.width();

                },

                sildeAnimate:function( prop, speed, fun ){

                    !fun ? this.$ul.stop( true, false ).animate( { left : prop || 0 }, speed || 200 ) : this.$ul.stop( true, false ).animate( { left : prop || 0 }, speed || 200, fun );

                },

                sildeAnimateStop:function(flag){

                    flag === 'left' && ( this.leftFlag = false );

                    flag === 'right' && ( this.rightFlag = false );

                    this.$ul.stop( true, true );

                },

                activeTab:function($li, notAnimate){

                    if( this.slideIsShow === false ){ return }

                    var linksLR = this.linksLR, left, right,

                    offsetLeft, alignRightW;

                    $li = $li || this.$ul.find(this.selectedClass),

                    offsetLeft = $li.offset().left;

                    if( ( left = linksLR.left - offsetLeft ) > 0 ){

                        if((alignRightW = this.linksLR.right - left - this.$wrap.offset().left - this.$wrap.outerWidth()) > 0){

                            this.sildeAnimate( '+=' + (alignRightW += left), 200 );

                        }else{

                            this.sildeAnimate( '+=' + left, 200 );

                        }

                    }else if( ( right = offsetLeft + $li.outerWidth() - linksLR.right ) > 0 ){

                        this.isAlignRight === true ? this.$ul.css( 'left', '-=' + right ) : this.sildeAnimate( '-=' + right, 200 );

                    }else{

                        this.alignRight( notAnimate );

                    }

                },

                isAlignRightFun:function(flag){

                    if( this.slideIsShow === false ){ return }

                    if( flag === false ){

                        this.isAlignRight = false;

                        return;

                    }

                    if( ( this.linksLR.right - this.$wrap.offset().left - this.$wrap.outerWidth() ) >= -1 ){

                        this.isAlignRight = true;

                    }else{

                        this.isAlignRight = false;

                    }

                },

                alignRight:function( notAnimate ){

                    var left = this.linksLR.right - this.$wrap.offset().left - this.$wrap.outerWidth();

                    if( left > 0 ){

                        notAnimate === true ? this.$ul.css( 'left', '+=' + left ) : this.sildeAnimate( '+=' + left, 200 );

                    }

                },

                slideLeft:function(){

                    var This = this,left;

                    this.leftFlag = true;

                    if( ( left = this.sildeDetectionLeft() ) === false ){

                        return;

                    }

                    this.sildeAnimate( left, 200, function(){

                        if( This.leftFlag === false ){ return; }

                        This.slideLeft();

                    } );

                },

                slideRight:function(){

                    var This = this,right;

                    this.rightFlag = true;

                    if( ( right = this.sildeDetectionRight() ) === false ){

                        return;

                    }

                    this.sildeAnimate( right, 200, function(){

                        if( This.rightFlag === false ){ return; }

                        This.slideRight();

                    } );

                },

                slideLeftWheel:function(){

                    this.$ul.stop(true, true);

                    var left = this.sildeDetectionLeft();

                    left !== false && this.sildeAnimate(left, 200);

                },

                slideRightWheel:function(){

                    this.$ul.stop(true, true);

                    var right = this.sildeDetectionRight();

                    right !== false && this.sildeAnimate(right, 200);

                },

                sildeDetectionLeft:function(){

                    var $li = this.$ul.find('li'),

                    linksLR = this.linksLR, i = 0, left, li;

                    this.lastDistance = 0;

                    while((li = $li[i])){

                        left = this.getLeftRight($(li), 'left') - linksLR.left;

                        if(left >= -1){

                            if(i === 0){

                                return false;

                            }else{

                                return  '-=' + this.lastDistance;

                            }

                        }else{

                            this.lastDistance = left;

                        }

                        i++;

                    }

                    return false;

                },

                sildeDetectionRight:function(){

                    var $li = this.$ul.find('li'),

                    linksLR = this.linksLR,

                    right, li, i = $li.length - 1, last = i;

                    this.lastDistance = 0;

                    while((li = $li[i])){

                        right = this.getLeftRight($(li), 'right') - linksLR.right;

                        if(right <= 1){

                            if(i === last){

                                return false;

                            }else{

                                return  '-=' + this.lastDistance;

                            }

                        }else{

                            this.lastDistance = right;

                        }

                        i--;

                    }

                    return false;

                },

                getlinksLR:function(){

                    var $nav = this.$nav, elLeft = $nav.offset().left;

                    this.linksLR = {

                        left: elLeft + this.leftBtnWidth,

                        right: elLeft + $nav.outerWidth() - this.rightBtnWidth

                    };

                },

                getLeftRight:function($el, direction){

                    if(direction === 'left'){

                        return $el.offset().left;

                    }

                    if(direction === 'right'){

                        return $el.offset().left + $el.outerWidth();

                    }

                },

                sildeChange:function(){

                    this.getTabLinksWidth();

                    this.getlinksLR();

                    this.slideIsShow === false ? this.slideShow() : this.slideHide();

                },

                slideShow:function(){

                    var WrapWidth;

                    if( this.slideIsShow === false ){

                        WrapWidth = this.$wrap.width();

                        if( WrapWidth > this.tabLinksWidth ){

                            this.$leftBtn.show();

                            this.$rightBtn.show();

                            this.slideIsShow = true;

                            this.isAlignRight = false;

                            this.activeTab();

                        }

                    }else{

                        this.isAlignRight = false;

                        this.activeTab();

                    }

                },

                slideHide:function(){

                    if( this.slideIsShow === true ){

                        if( this.$wrap.width() < this.tabLinksWidth ){

                            this.$leftBtn.hide();

                            this.$rightBtn.hide();

                            this.slideIsShow = false;

                            this.sildeAnimate(0);

                        }else{

                            this.activeTab();

                        }

                    }

                }

            };

            return new Slide({

                $ul: this.$ul,

                $nav: this.$nav,

                $wrap: this.$wrap,

                $leftBtn: this.$leftBtn,

                $rightBtn: this.$rightBtn,

                selectedClass: '.leoTabs_nav_selected',

                leoUi: this

            });

        }

    });

    return $;

}));