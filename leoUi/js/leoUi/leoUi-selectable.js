/**
+-------------------------------------------------------------------
* jQuery leoUi--selectable
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-mouse"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

	$.leoTools.plugIn({

        name:'leoSelectable',

        version:'1.0',

        inherit:'leoMouse',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            appendTo: "body",//选择帮手（套索） 应追加到哪个元素 。

			autoRefresh: true,//这个选项确定每个选择操作开始时如何刷新(重新计算)每个选择项的位置和大小. 如果你有很多很多选择项, 你应当设置此项为false并且手动调用refresh() 方法.

			distance: 0,//定义需要移动多少个像素选择才会开始. 如果指定了该项, 选择不会马上开始,而是会在鼠标移动了指定像素的距离之后才会开始.

			filter: "*",//匹配子元素中那些符合条件的元素才可以被选择.

			tolerance: "touch",//指定那种模式，用来测试套索是否应该选择一个项目。允许使用的值:"fit": 套索完全重叠的项目。"touch": 套索重叠的项目任何部分。

			disabled:false,//如果设置为 true 将禁止selectable。

			helperClassName:"leoUi-selectable-helper",//助手ClassName

			selectedClassName:"leoUi-selected",//选中的ClassName

			selectingClassName:"leoUi-selecting",//正在选择的ClassName

			// callbacks
			selected: $.noop,//此事件会在选择操作结束时，在添加到选择的每个元素上触发。

			selecting: $.noop,//此事件会在选择操作过程中，在添加到选择的每个元素上触发。

			start: $.noop,//这个事件将在选择操作开始时触发。

			stop: $.noop,//这个事件将在选择操作结束后触发。

			unselected: $.noop,//此事件会在选择操作结束时，在从选择元素集合中每个元素上触发。

			unselecting: $.noop//此事件会在选择操作过程中，在从选择元素集合中移除的每个元素上触发。

        },

        _init: function(){

            var selectees,that = this,options = this.options;

			this.dragged = false;

			this.dataName = "leoUi-selectee-" + this.dataId;

			this.refresh = function() {

				selectees = $( options.filter, that.$target[0] );

				selectees.addClass("leoUi-selectee");

				selectees.each( function() {

					var $this = $(this),pos = $this.offset();

					$.data( this, that.dataName, {

						element: this,

						$element: $this,

						left: pos.left,

						top: pos.top,

						right: pos.left + $this.outerWidth(),

						bottom: pos.top + $this.outerHeight(),

						startselected: false,

						selected: $this.hasClass(options.selectedClassName),

						selecting: $this.hasClass(options.selectingClassName),

						unselecting: $this.hasClass("leoUi-unselecting")

					});

				});

			};

			this.refresh();

			this.selectees = selectees.addClass("leoUi-selectee");

			this.helper = $("<div class=' " + options.helperClassName + " '></div>");

			this._super();

        },

        _destroy:function() {

            this.selectees.removeClass("leoUi-selectee").removeData(this.dataName);

        },

        _mouseStart: function(event) {

			var that = this,options = this.options;

			this.opos = [event.pageX, event.pageY];

			if ( options.disabled ){ return; }

			this.selectees = $( options.filter, this.$target[0] );

			options.start.call( this.$target[0], event );

			$( options.appendTo ).append( this.helper );

			this.helper.css({

				"left": event.pageX,

				"top": event.pageY,

				"width": 0,

				"height": 0

			});

			!!options.autoRefresh && this.refresh();

			this.selectees.filter(".leoUi-selected").each(function() {

				var selectee = $.data(this, that.dataName);

				selectee.startselected = true;

				if ( !event.metaKey && !event.ctrlKey ) {

					selectee.$element.removeClass(options.selectedClassName);

					selectee.selected = false;

					selectee.$element.addClass("leoUi-unselecting");

					selectee.unselecting = true;

					options.unselecting.call( that.$target[0], event, {

						unselecting: selectee.element

					});

				}

			});

			$( event.target ).parents().addBack().each(function() {

				var doSelect,selectee = $.data(this, that.dataName);

				if (selectee) {

					doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass(options.selectedClassName);

					selectee.$element.removeClass(doSelect ? "leoUi-unselecting" : options.selectedClassName).addClass(doSelect ? options.selectingClassName : "leoUi-unselecting");

					selectee.unselecting = !doSelect;

					selectee.selecting = doSelect;

					selectee.selected = doSelect;

					if (doSelect) {

						options.selecting.call( that.$target[0], event, {

							selecting: selectee.element

						});

					} else {

						options.unselecting.call( that.$target[0], event, {

							unselecting: selectee.element

						});

					}

					return false;

				}

			});

		},

		_mouseDrag: function(event) {

			this.dragged = true;

			if (this.options.disabled) {return;}

			var tmp,that = this,options = this.options,x1 = this.opos[0],

			y1 = this.opos[1],x2 = event.pageX,y2 = event.pageY;

			if (x1 > x2) {

				tmp = x2;

				x2 = x1;

				x1 = tmp;

			}

			if (y1 > y2) {

				tmp = y2;

				y2 = y1;

				y1 = tmp;

			}

			this.helper.css({

				left: x1,

				top: y1,

				width: x2 - x1,

				height: y2 - y1

			});

			this.selectees.each(function() {

				var selectee = $.data(this, that.dataName),hit = false;

				if (!selectee || selectee.element === that.$target[0]) {

					return;

				}

				if (options.tolerance === "touch") {

					hit = (!(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1));

				} else if (options.tolerance === "fit") {

					hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);

				}

				if (hit) {

					if (selectee.selected) {

						selectee.$element.removeClass(options.selectedClassName);

						selectee.selected = false;

					}

					if (selectee.unselecting) {

						selectee.$element.removeClass("leoUi-unselecting");

						selectee.unselecting = false;

					}

					if (!selectee.selecting) {

						selectee.$element.addClass(options.selectingClassName);

						selectee.selecting = true;

						that.options.selecting.call( that.$target[0], event, {

							selecting: selectee.element

						});

					}

				} else {

					if (selectee.selecting) {

						if ((event.metaKey || event.ctrlKey) && selectee.startselected) {

							selectee.$element.removeClass(options.selectingClassName);

							selectee.selecting = false;

							selectee.$element.addClass(options.selectedClassName);

							selectee.selected = true;

						} else {

							selectee.$element.removeClass(options.selectingClassName);

							selectee.selecting = false;

							if (selectee.startselected) {

								selectee.$element.addClass("leoUi-unselecting");

								selectee.unselecting = true;

							}

							that.options.unselecting.call( that.$target[0], event, {

								unselecting: selectee.element

							});

						}

					}
					if (selectee.selected) {

						if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {

							selectee.$element.removeClass(options.selectedClassName);

							selectee.selected = false;

							selectee.$element.addClass("leoUi-unselecting");

							selectee.unselecting = true;

							that.options.unselecting.call( that.$target[0], event, {

								unselecting: selectee.element

							});

						}

					}

				}

			});

			return false;
		},

		_mouseStop: function(event) {

			var that = this,options = this.options;

			this.dragged = false;

			$(".leoUi-unselecting", this.$target[0]).each(function() {

				var selectee = $.data(this, that.dataName);

				selectee.$element.removeClass("leoUi-unselecting");

				selectee.unselecting = false;

				selectee.startselected = false;

				options.unselected.call( that.$target[0], event, {

					unselected: selectee.element

				});

			});

			$(".leoUi-selecting", this.$target[0]).each(function() {

				var selectee = $.data(this, that.dataName);

				selectee.$element.removeClass(options.selectingClassName).addClass(options.selectedClassName);

				selectee.selecting = false;

				selectee.selected = true;

				selectee.startselected = true;

				options.selected.call( that.$target[0], event, {

					selected: selectee.element

				});

			});

			options.stop.call( this.$target[0], event );

			this.helper.remove();

			return false;
		}

    });

	return $;

}));