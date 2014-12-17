/**
+-------------------------------------------------------------------
* jQuery leoUi--selectable//参考jqueryUi
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

            appendTo: "body",//选择帮手（套索） 应追加到哪个元素

			autoRefresh: true,//这个选项确定每个选择操作开始时如何刷新(重新计算)每个选择项的位置和大小. 如果你有很多很多选择项, 你应当设置此项为false并且手动调用refresh() 方法

			distance: 0,//定义需要移动多少个像素选择才会开始. 如果指定了该项, 选择不会马上开始,而是会在鼠标移动了指定像素的距离之后才会开始

			filter: "*",//匹配子元素中那些符合条件的元素才可以被选择

			tolerance: "touch",//指定那种模式，用来测试套索是否应该选择一个项目。允许使用的值:"fit": 套索完全重叠的项目。"touch": 套索重叠的项目任何部分

			disabled:false,//如果设置为 true 将禁止selectable

			helperClassName:"leoUi_selectable_helper",//助手的ClassName

			selectedClassName:"leoUi_selected",//选中的select的ClassName

			selectingClassName:"leoUi_selecting",//正在选择的select的ClassName

			unselectingClassName:"leoUi_unselecting",//移除的select的ClassName

			selecteeClassName:"leoUi_selectee",//能被选着的select的ClassName

			// callbacks
			selected: $.noop,//此事件会在选择操作结束时，在添加到选择的每个元素上触发（ this: target, arguments: event, selected ）

			selecting: $.noop,//此事件会在选择操作过程中，在添加到选择的每个元素上触发（ this: target, arguments: event, selecting ）

			start: $.noop,//这个事件将在选择操作开始时触发（ this: target, arguments: event ）

			stop: $.noop,//这个事件将在选择操作结束后触发（ this: target, arguments: event, $selected ）

			unselected: $.noop,//此事件会在选择操作结束时，在从选择元素集合中每个元素上触发（ this: target, arguments: event, unselected ）

			unselecting: $.noop//此事件会在选择操作过程中，在从选择元素集合中移除的每个元素上触发（ this: target, arguments: event, unselecting ）

        },

        _init: function(){

            var selectees,that = this,options = this.options;

			this.dataName = this.dataId + "_uid_" + $.leoTools.getUuid();

			this.refresh = function() {

				selectees = $( options.filter, that.$target[0] );

				selectees.addClass(options.selecteeClassName);

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

						unselecting: $this.hasClass(options.unselectingClassName)

					});

				});

			};

			this.refresh();

			this.selectees = selectees.addClass(options.selecteeClassName);

			this.helper = $("<div class=' " + options.helperClassName + " '></div>");

			this._super();

        },

        _destroy:function() {

        	var options = this.options;

            this.selectees.removeClass(options.selectedClassName + " " + options.selecteeClassName + " " + options.selectingClassName).removeData(this.dataName);

            this.helper.remove();

            delete this.helper;

        },

        _mouseStart: function(event) {

			var that = this,options = this.options,target = this.$target[0];

			this.opos = [event.pageX, event.pageY];

			if ( options.disabled ){ return; }

			this.selectees = $( options.filter, target );

			options.start.call( target, event );

			$( options.appendTo ).append( this.helper );

			this.helper.css({

				"left": event.pageX,

				"top": event.pageY,

				"width": 0,

				"height": 0

			});

			!!options.autoRefresh && this.refresh();

			this.selectees.filter("." + options.selectedClassName).each(function() {

				var selectee = $.data(this, that.dataName);

				selectee.startselected = true;

				if ( !event.metaKey && !event.ctrlKey ) {

					selectee.$element.removeClass(options.selectedClassName);

					selectee.selected = false;

					selectee.$element.addClass(options.unselectingClassName);

					selectee.unselecting = true;

					options.unselecting.call( target, event, {

						unselecting: selectee.element

					});

				}

			});

			$( event.target ).parents().addBack().each(function() {

				var doSelect,selectee = $.data(this, that.dataName);

				if (selectee) {

					doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass(options.selectedClassName);

					selectee.$element.removeClass(doSelect ? options.unselectingClassName : options.selectedClassName).addClass(doSelect ? options.selectingClassName : options.unselectingClassName);

					selectee.unselecting = !doSelect;

					selectee.selecting = doSelect;

					selectee.selected = doSelect;

					if (doSelect) {

						options.selecting.call( target, event, {

							selecting: selectee.element

						});

					} else {

						options.unselecting.call( target, event, {

							unselecting: selectee.element

						});

					}

					return false;

				}

			});

		},

		_mouseDrag: function(event) {

			if (this.options.disabled) {return;}

			var tmp,that = this,options = this.options,x1 = this.opos[0],

			y1 = this.opos[1],x2 = event.pageX,y2 = event.pageY,target = this.$target[0];

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

				if (!selectee || selectee.element === target) {

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

						selectee.$element.removeClass(options.unselectingClassName);

						selectee.unselecting = false;

					}

					if (!selectee.selecting) {

						selectee.$element.addClass(options.selectingClassName);

						selectee.selecting = true;

						that.options.selecting.call( target, event, {

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

								selectee.$element.addClass(options.unselectingClassName);

								selectee.unselecting = true;

							}

							that.options.unselecting.call( target, event, {

								unselecting: selectee.element

							});

						}

					}

					if (selectee.selected) {

						if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {

							selectee.$element.removeClass(options.selectedClassName);

							selectee.selected = false;

							selectee.$element.addClass(options.unselectingClassName);

							selectee.unselecting = true;

							that.options.unselecting.call( target, event, {

								unselecting: selectee.element

							});

						}

					}

				}

			});

			return false;
		},

		_mouseStop: function(event) {

			var that = this,options = this.options,$selected,

			target = this.$target[0];

			$("." + options.unselectingClassName, target).each(function() {

				var selectee = $.data(this, that.dataName);

				selectee.$element.removeClass(options.unselectingClassName);

				selectee.unselecting = false;

				selectee.startselected = false;

				options.unselected.call( target, event, {

					unselected: selectee.element

				});

			});

			$selected = $("." + options.selectingClassName, target).each(function() {

				var selectee = $.data(this, that.dataName);

				selectee.$element.removeClass(options.selectingClassName).addClass(options.selectedClassName);

				selectee.selecting = false;

				selectee.selected = true;

				selectee.startselected = true;

				options.selected.call( target, event, {

					selected: selectee.element

				});

			});

			options.stop.call( target, event, $selected.add("." + options.selectedClassName, target) );

			this.helper.remove();

			return false;
		}

    });

	return $;

}));