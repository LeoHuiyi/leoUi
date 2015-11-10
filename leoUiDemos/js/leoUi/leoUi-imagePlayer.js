/**
 +-------------------------------------------------------------------
 * jQuery leoUi--imagePlayer
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

        name:'leoImagePlayer',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            carouselSrc:'src',//img属性上的大图地址

            rollBoxSrc:'src',//img属性上的缩略图地址

            imgSelector:'img',

            carouselLoadingSrc:'../../img/loading32.gif',

            rollLoadingSrc:'../../img/loading.gif',

            bgOpacity:'0.7',

            boxScale:0.6,// h/w

            winScale:0.95,//box/win

            topScale:0.5,//画布Top居中

            leftScale:0.5,//画布Left居中

            rollBoxLength:11,//缩略图显示的个数

            playTime:3000

        },

        _init:function(){

            this.urlArr = [];

            this.isShow = false;

            this._getData()._createHtml()._createBox()._rollBoxinit()._playBoxInit()._addEvent();

        },

        resetBox:function(){

            this.urlArr = [];

            this._getData()._rollBoxinit();

        },

        _addEvent:function(){

            var This = this,op = this.options, lastTimer;

            this._on(this.$target, 'click', op.imgSelector, function(event){

                event.preventDefault();

                This._getIndex(this).show();

            })._on(this.bg, 'click', function(event){

                event.currentTarget === event.target && This.hide();

            })._on(this.window, 'resize', function(){

                if(This.isShow === false)return;

                if(lastTimer)clearTimeout(lastTimer);

                lastTimer = setTimeout(function(){

                    This._clearTime()._boxSize();

                }, 200);

            })._on(this.window, 'dragstart', function(){

                if(This.isShow === false)return;

                return false;

            });

            this._addBoxEvent();

            return this;

        },

        _createHtml:function(){

            this.bg = $('<div class="leoImagePlayerBg"></div>').css('opacity', this.options.bgOpacity).appendTo('body');

            return this;

        },

        _createBox:function(){

            this.box = $('<div class="leoImagePlayer"><div class="leo_imagePlayer_loading"><img src="'+this.options.carouselLoadingSrc+'"></div><div class="pic"><img></div><a class="prev control" href="###"><span><</span></a><a class="next control" href="###"><span>></span></a><div class="leo_imagePlayer_roll"><div class="roll_inner"><div class="roll_bg"></div><a class="roll_prev roll_control default" href="###"><span><</span></a><a class="roll_next roll_control default" href="###"><span>></span></a><div class="roll_list"><ul class="leoUi_clearfix"></ul></div></div></div><div class="leo_imagePlayer_play"><div class="playBox"><div class="pause"><span class="pause_left"></span><span class="pause_right"></span></div><span class="play"></span></div></div></div>').appendTo('body');

            this.img = this.box.find('.pic>img');

            this.control = this.box.find('a.control');

            return this;

        },

        _getIndex:function(elem){

            var urlArr = this.urlArr, i = 0, len = urlArr.length;

            for(; i < len; i++){

                if(urlArr[i].el === elem){

                    this.index = i;

                    break;

                }

            }

            return this;

        },

        _getData:function(){

            var This = this, op = this.options;

            this.$target.find(op.imgSelector).each(function(index, el) {

                var $el = $(el), carouselSrc = $el.attr(op.carouselSrc), rollBoxSrc = $el.attr(op.rollBoxSrc);

                !!carouselSrc && (This.urlArr[This.urlArr.length] = {

                    el:el,

                    carouselSrc: carouselSrc,

                    rollBoxSrc: rollBoxSrc

                });

            });

            this.urlArrLength = this.urlArr.length-1;

            return this;

        },

        show:function(){

            this._boxSize();

            this.bg.show();

            this.box.show();

            this.isShow = true;

            return this;

        },

        _addBoxEvent:function(){

            var This = this, $box = this.box;

            this.appear = true;

            this.playBarAppear = true;

            this.controlAppear = true;

            this.lastTimer;

            this.playBarTime;

            this.controlTime;

            this._on($box, 'mouseleave', function(){

                This.controlAppear = false;

                This.appear === true&&(This.lastTimer = setTimeout(function(){This.rollInner.stop(true,false).animate({top:0}, 100);}, 3000));

                This.appear = false;

                This.playBarAppear === true&&(This.playBarTime = setTimeout(function(){This.playBar.stop(true,false).animate({top:-This.playBarHeight}, 1000);}, 3000));

                This.playBarAppear = false;

            })._on($box, 'mousemove', function(e){

                if(This.controlAppear === true){

                    !!This.controlTime&&clearTimeout(This.controlTime);

                    This.controlTime = setTimeout(function(){

                        This.controlAppear = false;

                        This.playImg === true&&This.box.css('cursor','none');

                        This.control.filter('.prev').stop(true,false).animate({left:'-15%'}, 400).end().filter('.next').stop(true,false).animate({right:'-15%'}, 400,function(){

                            This.playImg === true&&This.box.css('cursor','none');

                        });

                    }, 3000);

                }else{

                    This.playImg === true&&This.box.css('cursor','auto');

                    This.controlAppear = true;

                    This.controlAppear ===  true&&This.control.filter('.prev').stop(true,false).animate({left:0}, 400).end().filter('.next').stop(true,false).animate({right:0}, 400);

                }

                if(e.clientY<This.rollBoxbottom){

                    This.appear === true&&(This.lastTimer = setTimeout(function(){This.rollInner.stop(true,false).animate({top:0}, 100);}, 3000));

                    This.appear = false;

                }else{

                    !!This.lastTimer&&clearTimeout(This.lastTimer);

                    This.appear === false&&This.rollInner.stop(true,false).delay(200).animate({top:-This.liWidth}, 400);

                    This.appear = true;

                }

                if(e.clientY>This.playBarTop){

                    This.playBarAppear === true&&(This.playBarTime = setTimeout(function(){This.playBar.stop(true,false).animate({top:-This.playBarHeight}, 1000);}, 3000));

                    This.playBarAppear = false;

                }else{

                    !!This.playBarTime&&clearTimeout(This.playBarTime);

                    This.playBarAppear === false&&This.playBar.stop(true,false).delay(200).animate({top:0}, 400);

                    This.playBarAppear = true;

                }

            })._on($box, 'click', '.prev', function(e){

                e.preventDefault();

                !!This.controlTime && clearTimeout(This.controlTime);

                This.prev();

            })._on($box, 'click', '.next', function(e){

                e.preventDefault();

                !!This.controlTime&&clearTimeout(This.controlTime);

                This.next();

            })._on($box, 'click', '.roll_li', function(e){

                e.preventDefault();

                This._rollBoxClick($(this));

            })._on($box, 'click', '.roll_prev:not(a.default)', function(e){

                e.preventDefault();

                This._rollBoxPrev();

            })._on($box, 'click', '.roll_next:not(a.default)', function(e){

                e.preventDefault();

                This._rollBoxNext();

            })._on($box, 'click', '.playBox', function(e){

                e.preventDefault();

                This._playBoxClick();

            });

            return this;

        },

        _playBoxInit:function(){

            this.playBar = this.box.find('.leo_imagePlayer_play');

            this.playBox = this.playBar.find('div.playBox');

            this.playPause = this.playBox.find('div.pause');

            this.playPlay  = this.playBox.find('span.play');

            this.playImg = false;

            return this;

        },

        _playBoxSize:function(){

            var playBoxWidth = this.boxHeight*0.1;

            this.playBarHeight = this.boxHeight*0.2;

            this.playBar.css('top',-this.playBarHeight).find('div.playBox').css({height:playBoxWidth,width:playBoxWidth,marginTop:-playBoxWidth*0.5}).find('span.play').css({borderRightWidth:0,borderLeftWidth:playBoxWidth*0.8,borderTopWidth:playBoxWidth*0.5,borderBottomWidth:playBoxWidth*0.5,marginTop:-playBoxWidth*0.5,marginLeft:-playBoxWidth*0.4});

            this._playBoxStop();

            this.playBarTop =  this.boxHeight*0.2+this.boxTop;

            return this;

        },

        _playBoxClick:function(){

            this.playImg === false ? this._playBoxGo() : this._playBoxStop();

        },

        _playBoxGo:function(){

            var This = this;

            this._clearTime();

            this.playImg = true;

            this.playBarAppear = true;

            this.appear = true;

            this.bg.stop(true,false).animate({opacity:1}, 1000);

            this.playBar.stop(true,false).animate({top:-this.playBarHeight}, 1000, function(){

                !!This.controlTime&&clearTimeout(This.controlTime);

                This.controlAppear = false;

                This.box.css('cursor','none');

            });

            this.rollInner.stop(true,false).animate({top:0}, 1000);

            This.control.filter('.prev').stop(true,false).animate({left:'-15%'}, 400).end().filter('.next').stop(true,false).animate({right:'-15%'}, 400);

            this.playBoxTime = setInterval(function(){

                This.next();

            },this.options.playTime);

            this.playPlay.css('display','none');

            this.playPause.css('display','block');

        },

        _playBoxStop:function(){

            this.playImg = false;

            this.playBarAppear = true;

            this.box.css('cursor','auto');

            this.bg.stop(true,false).animate({opacity: this.options.bgOpacity}, 400);

            this.playBar.stop(true,false).delay(300).animate({top:0}, 400);

            !!this.playBoxTime&&clearInterval(this.playBoxTime);

            this.playPlay.css('display','block');

            this.playPause.css('display','none');

            return this;

        },

        _rollBoxinit:function(){

            this.rollInner =this.box.find('div.roll_inner');

            this.rollUl = this.rollInner.find('div.roll_list>ul');

            this.roll_prev = this.rollInner.find('a.roll_prev');

            this.roll_next = this.rollInner.find('a.roll_next');

            this.load = this.box.find('.leo_imagePlayer_loading');

            this.rollBoxLength =  this.options.rollBoxLength;

            this._createRollBox();

            return this;

        },

        _createRollBox:function(){

            var This = this, i = 0, liStr = '' ,len = this.urlArrLength + 1, rollLoadingSrc = this.options.rollLoadingSrc;

            for(;i < len; i++){

                liStr += '<li class="roll_li" style="float:left"><a href="javascript:;"><img src="'+rollLoadingSrc+'"></a></li>';

            }

            $(liStr).each(function(index, el) {

                This._rollBoxImgLoad(This.urlArr[index].rollBoxSrc,$(el).find('img'));

            }).appendTo(this.rollInner.find('ul').empty());

            return this;

        },

        _rollBox:function(){

            var len = this.urlArrLength + 1;

            this.length = this.urlArrLength + 1;

            this.liWidth = Math.floor(this.boxWidth*0.96/this.rollBoxLength);

            this.rollListWidth = this.liWidth*this.rollBoxLength;

            this.rollUlWidth = this.liWidth*len;

            this.maxUlLeft = -(this.rollUlWidth-this.rollListWidth);

            this.rollBoxbottom = this.boxHeight -this.liWidth+this.boxTop;

            this.rollInner.stop(true,true).css({height:this.liWidth,top:-this.liWidth}).find('a.roll_control').css({'fontSize':this.rollListWidth*0.02}).find('span').css('marginTop',-this.rollListWidth*0.01).end().end().find('div.roll_list').css({width:this.rollListWidth}).find('ul').css('width',this.rollUlWidth).find('li').css({height:this.liWidth,width:this.liWidth}).find('a').css('broderWidth',this.rollListWidth*0.4);

            this.appear = true;

            this._rollBoxCount(len)._rollBoxGo()._imgLoad(this.urlArr[this.index].carouselSrc);

            return this;

        },

        _rollBoxCount:function(len){

            var f = Math.floor(this.rollBoxLength/2),l = len - f,i = 0;

            this.rollBoxMove = [];

            for(;i < len; i++){

                if(f > i){

                    this.rollBoxMove[this.rollBoxMove.length] = 0;


                }else if(f <= i && i < l){

                    this.rollBoxMove[this.rollBoxMove.length] = (f-i)*this.liWidth;

                }else{

                    this.rollBoxMove[this.rollBoxMove.length] = this.maxUlLeft;

                }

            }

            return this;

        },

        _rollBoxPrev:function(){

            var prevLeft = $.leoTools.range(parseFloat(this.rollUl.css('left'))+this.rollListWidth, this.maxUlLeft, 0);

            this._rollBoxDefault(prevLeft).rollUl.stop(true,false).animate({'left':prevLeft}, 400);

            return this;

        },

        _rollBoxDefault:function(Left){

            Left === 0?this.roll_prev.addClass('default'):this.roll_prev.removeClass('default');

            Left === this.maxUlLeft?this.roll_next.addClass('default'):this.roll_next.removeClass('default');

            return this;

        },

        _rollBoxNext:function(){

            var nextLeft = $.leoTools.range(parseFloat(this.rollUl.css('left'))-this.rollListWidth, this.maxUlLeft, 0);

            this._rollBoxDefault(nextLeft).rollUl.stop(true,false).animate({'left':nextLeft}, 400);

            return this;

        },

        _rollBoxClick:function($this){

            if($this.index() === this.index){return this}

            this.index = $this.index();

            this._rollBoxGo()._imgLoad(this.urlArr[$this.index()].carouselSrc);

            return this;

        },

        _rollBoxGo:function(){

            this._rollBoxClass()._rollBoxSlide(this.index);

            return this;

        },

        _rollBoxSlide:function(){

            if(this.notsilde ===true){return this}

            var slideLeft = this.rollBoxMove[this.index];

            this._rollBoxDefault(slideLeft).rollUl.stop(true,false).animate({'left':slideLeft}, 400,'linear');

            return this;

        },

        _rollBoxClass:function(){

            this.rollUl.find('li.active').removeClass('active').end().find('li').eq(this.index).addClass('active');

            return this;

        },

        _rollBoxImgLoad:function(src, $img){

            var img = new Image();

            img.onerror = function () {

                img = img.onload = img.onerror = null;

                return this;

            };

            img.onload = function() {

                $img.stop(true,false).attr('src', src).css({'opacity':'0'}).animate({'opacity':1}, 100);

                img = img.onload = img.onerror = null;

            };

            img.src = src;

            return this;

        },

        _imgLoad:function(src){

            var This = this,img = new Image(),newIndex = this.index;

            img.src = src;

            this.img.css('opacity','0');

            this.load.css('opacity','0');

            if (img.complete) {

                this.imgWidth = img.width;

                this.imgHeight = img.height;

                this.imgScale = this.imgHeight/this.imgWidth;

                this._imgSize();

                this.img.stop(true,false).attr('src', src).animate({'opacity':1}, 400,'linear');

                img = null;

                newIndex = null;

                return this;

            }

            this.load.stop(true, true).delay(100).animate({'opacity':1}, 100);

            img.onerror = function () {

                newIndex = null;

                img = img.onload = img.onerror = null;

            };

            img.onload = function() {

                if(This&&This.index===newIndex){

                    This.load.stop(true, false).css({'opacity':0});

                    This.imgWidth = img.width;

                    This.imgHeight = img.height;

                    This.imgScale = This.imgHeight/This.imgWidth;

                    This._imgSize();

                    This.img.stop(true,false).attr('src', src).animate({'opacity':1}, 400);

                }

                newIndex = null;

                img = img.onload = img.onerror = null;

            };

            return this;

        },

        next:function(){

            this.urlArrLength === this.index?this.index = 0:this.index = this.index+1;

            this._rollBoxGo()._imgLoad(this.urlArr[this.index].carouselSrc);

        },

        prev:function(){

            this.index === 0?this.index = this.urlArrLength:this.index = this.index-1;

            this._rollBoxGo()._imgLoad(this.urlArr[this.index].carouselSrc);

        },

        _imgSize:function(){

            if(this.imgWidth>this.boxWidth||this.imgHeight>this.boxHeight){

                if(this.imgScale>this.options.boxScale){

                    this.imgHeight = this.boxHeight;

                    this.imgWidth = this.imgHeight/this.imgScale;

                }else{

                    this.imgWidth = this.boxWidth;

                    this.imgHeight = this.imgWidth*this.imgScale;

                }

            }else{

                this.imgWidth = this.imgWidth;

                this.imgHeight = this.imgHeight;

            }

            this.imgTop = (this.boxHeight-this.imgHeight)*0.5;

            this.imgLeft = (this.boxWidth-this.imgWidth)*0.5;

            this.img.css({'top': this.imgTop,'left':this.imgLeft,'width':this.imgWidth,'height':this.imgHeight});

            return this;

        },

        _boxSize:function(){

            var op = this.options, win = this.window;

            this.winWidth = win.width();

            this.winHeight = win.height(),

            this.winScale = this.winHeight/this.winWidth;

            if(this.winScale>op.boxScale){

                this.boxWidth = this.winWidth*op.winScale;

                this.boxHeight = this.boxWidth*op.boxScale;

            }else{

                this.boxHeight = this.winHeight*op.winScale;

                this.boxWidth = this.boxHeight/op.boxScale;

            }

            this.box.find('.control').css({'fontSize':this.boxWidth*0.1}).find('span').css('marginTop',-this.boxWidth*0.05);

            this.boxTop = (this.winHeight-this.boxHeight)*op.topScale;

            this.boxLeft = (this.winWidth-this.boxWidth)*op.leftScale;

            this.control.filter('.prev').css('left','-15%').stop(true,false).delay(300).animate({left:0}, 400).end().filter('.next').css('right','-15%').stop(true,false).delay(300).animate({right:0}, 400);

            this._rollBox()._playBoxSize();

            this.box.css({top:this.boxTop,left:this.boxLeft,width:this.boxWidth,height:this.boxHeight});

            return this;

        },

        _clearTime:function(){

            !!this.playBoxTime&&clearInterval(this.playBoxTime);

            !!this.lastTimer&&clearTimeout(this.lastTimer);

            !!this.playBarTime&&clearTimeout(this.playBarTime);

            !!this.controlTime&&clearTimeout(this.controlTime);

            return this;

        },

        hide:function(){

            this._clearTime();

            this.bg.hide();

            this.box.hide();

            this.rollInner.stop(true,true);

            this.img.attr('src','');

            this.isShow = false;

        },

        _destroy:function(){

            this.urlArr = [];

            this.hide();

            this.bg.remove();

            this.box.remove();

        }

    });

    return $;

}));