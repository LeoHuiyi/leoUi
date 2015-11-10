/**
 +-------------------------------------------------------------------
 * jQuery leoUi--mask
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-position","leoUi-effects","leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoMask',

        version:'1.0',

        defaultsTarget:'maskHtml',

        addJquery:true,

        addJqueryFn:false,

        defaults:{

        	'maskHtml':'<div style = "position: fixed;top: 0px; left: 0px;width:100%;height:100%;background-color:black;overflow:hidden;z-index: 9999;"></div>',

        	append:'body',

        	disabled:false,

        	isShow:false,

        	showDelay:'none',//打开mask延迟的时间

            hideDelay:'none',//关闭mask延迟的时间

            zIndex:1000,//设置mask的z-index

            showAnimation:function(next) {

            	this.fadeTo(200, 0.8, function() {

			      	next();

			    });

                // this.show();

                // callBack();


            },//mask显示的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: next）

            hideAnimation:function(next) {

            	var This = this;

            	this.fadeTo(200, 0, function() {

			      	next();

			      	This.hide();

			    });

                // this.hide();

                // callBack();

            }//mask关闭的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: next）

        },

        _init:function(){

        	var op = this.options;

        	this.$target.css({zIndex: op.zIndex}).hide().appendTo(op.append);

        	this._state = 'close';

        	op.isShow && this.show();

        },

        show:function(){

        	this.options.disabled === false && this._show();

        },

        _setOption:function(key, value){

        	if(key === 'zIndex'){

                this.$target.css({zIndex: value});

                return;

            }

        },

        hide:function(){

        	this.options.disabled === false && this._hide();

        },

        state:function(){

        	return this._state;

        },

        _show:function(callback){

            this._showTimeId = this._delay(function(){

                delete this._showTimeId;

                var This = this;

                this._state = 'opening';

                this.options.showAnimation.call(this.$target,

                    function(){

                        This._state = 'open';

                        !!callback && callback.call(This);

                    }

                );

            }, this.options.showDelay);

            this.options.showDelay !== 'none' && (this._state = 'showDelaying');

        },

        _hide:function(callback){

            this._hideTimeId = this._delay(function(){

            	delete this._hideTimeId;

                var This = this;

                this._state = 'closeing';

                this.options.hideAnimation.call( this.$target,

                    function(){

                        This._state = 'close';

                        !!callback && callback.call(This);

                    }

                );

            }, this.options.hideDelay);

            this.options.hideDelay !== 'none' && (this._state = 'hideDelaying');

        },

        _clearTimeout:function(id){

            if(id === 'show' && this._showTimeId){

                clearTimeout(this._showTimeId);

                delete this._showTimeId;

            }else if(id === 'hide' && this._hideTimeId){

                clearTimeout(this._hideTimeId);

                delete this._hideTimeId;

            }

        },

        clearTimeout:function(id){

            if(typeof id !== 'string'){return;}

            if(id === 'all'){

                this._clearTimeout('show');

                this._clearTimeout('hide');

                return;

            }

            var This = this;

            id.replace(/[^, ]+/g, function(name){

                This._clearTimeout(name);

            });

        },

        _destroy:function(){

        	this.$target.remove();

        }

    });

    return $;

}));