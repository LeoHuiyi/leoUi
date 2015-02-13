/**
 +-------------------------------------------------------------------
 * jQuery leoUi--datetimepicker
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-position","jqueryMousewheel","leoUi-date","leoUi-tools","leoUi-effects"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoDatetimepicker',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

        	monthsName: [
				"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
			],

			dayOfWeekName: [
				"日", "一", "二", "三", "四", "五", "六"
			],

			weeksName:"周",

            append:'body',

            autoClose:false,

        	weekStart:0,//一周从哪一天开始。0（星期日）到6（星期六）

        	quickButton:false,

        	showWeekDays:true,

        	showOtherMonthDays:true,

        	dateFormat:"yyyy-MM-dd",

        	dayTitleFormat:"yyyy-MM-dd",

        	maxMineFormat:"yyyy-MM-dd",

            defaultDateFormat:"yyyy-MM-dd",

            defaultDate:"",

            position:{//参考jqueryUi的API（其中of和within属性设置成“window”或者“document”使用当前框架的window或者document）

                my:"left top",

                at:"left bottom",

                of:'target',

                collision:"fit",

                within:'window'

            },

            showDelay:0,//打开延迟的时间

            hideDelay:0,//关闭延迟的时间

            showAnimation: function(callBack, state) {

                this.show( { effect: "clip", duration: 200, complete: callBack } );

                // this.show();

                // callBack();

            },//显示的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: callBack, state）

            hideAnimation: function(callBack, state) {

                this.hide( { effect: "clip", duration: 200, complete: callBack } );

                // this.hide();

                // callBack();

            },//关闭的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: callBack, state）

        	maxDate:false,//"2015-02-04"

            minDate:false,//"2015-02-04"

            startView:'day',//'year', 'month', 'day'

            minView:'day',//'year', 'month', 'day'

            maxView:'year',//'year', 'month', 'day'

            beforeShowDay:false,

            selectChange:$.noop

        },

        _init:function(){

            this._selectDay = false;

            this._selectMonth= false;

            this._selectYear = false;

            this._state = 'hide';

            this.isInput = this.$target.is('input');

            this._changePosition();

        	this._createDatetimepicker();

            this.addEvent();

        },

        _getDateValue:function(){

            var op = this.options, defaultDate = op.defaultDate,

            leoDate = $.leoTools.Date;

            this._currentVal = leoDate.getDate(this.$target.val(), op.dateFormat);

            if(!this._currentVal){

                defaultDate === 'now' ? this._currentVal = new Date() : this._currentVal = leoDate.getDate(defaultDate, op.defaultDateFormat);

            }

            this._getCurrentDate();

        },

        _getCurrentDate:function(){

        	var op = this.options;

        	this._currentDate = new $.leoTools.Date(this._currentVal && this._currentVal.clone(), {

        		parseFormat:op.dateFormat,

        		strFormat:op.dateFormat

        	});

        },

        _getDaysTableDayStart:function(){

        	var firstDateOfMonthDate = this._currentDate.getFirstDayOfMonthDate(),

        	difDays = this.options.weekStart - firstDateOfMonthDate.getDay();

        	difDays >= 0 && (difDays -= 7);

        	return firstDateOfMonthDate.addDays(difDays).clearTime();

        },

        _changePosition:function(){

            var position = this.options.position;

            if(position.of === 'window'){

                position.of = this.window;

            }else if(position.of === 'document'){

                position.of = this.document;

            }else if(position.of === 'target'){

                position.of = this.$target;

            }

            if(position.within === 'window'){

                position.within = this.window;

            }else if(position.within === 'document'){

                position.within = this.document;

            }

        },

        setPosition:function(){

            if( this.options.disabled ){ return; }

            var isVisible = this._state === 'open',

            $datetimepicker = this.$datetimepicker;

            !isVisible && $datetimepicker.show();

            $datetimepicker.position( this.options.position );

            !isVisible && $datetimepicker.hide();

        },

        state:function(){

            return this._state;

        },

        show:function(){

            if( this.options.disabled ){ return; }

            this._showFn();

        },

        hide:function(){

            if( this.options.disabled ){ return; }

            this._hideFn();

        },

        _hideFn:function(){

            this.delayHideTimeId = this._delay(function(){

                delete this.delayHideTimeId;

                if( this.options.disabled || this._state === 'close' ){ return; }

                var This = this;

                this._state = 'closeing';

                this.options.hideAnimation.call( this.$datetimepicker, function(){

                    This._state = 'close';

                }, this._state );

            }, this.options.hideDelay );

        },

        _showFn:function(){

            this.delayShowTimeId = this._delay(function(){

                delete this.delayShowTimeId;

                if( this.options.disabled || this._state === 'open' ){ return; }

                var This = this;

                this._getDateValue();

                this._getViewGrade('init');

                this._setViewSelectTable();

                this.setPosition();

                this._state = 'opening';

                this.options.showAnimation.call( this.$datetimepicker, function(){

                    This._state = 'open';

                }, this._state );

            },this.options.showDelay);

        },

        _clearTimeout:function(id){

            if(id === 'show' && this.delayShowTimeId){

                window.clearTimeout(this.delayShowTimeId);

                delete this.delayShowTimeId;

            }else if(id === 'hide' && this.delayHideTimeId){

                window.clearTimeout(this.delayHideTimeId);

                delete this.delayHideTimeId;

            }

        },

        clearTimeout:function(id){

            if(typeof id !== 'string'){return;}

            var This = this;

            id.replace(/[^, ]+/g, function(name){

                This._clearTimeout(name);

            });

        },

        _createDatetimepicker:function(){

            var op = this.options, $datetimepicker;

            this._createHeader();

        	$datetimepicker = this.$datetimepicker = $('<div class="leoDatetimepicker leoUi_clearfix"></div>').append(this.$datetimepickerHeader).hide().appendTo(this.options.append || this.$target);

            if(this.isInput){

                $datetimepicker.css('position', 'absolute');

            }else{

                this._getDateValue();

                this._getViewGrade('init');

                this._setViewSelectTable();

                $datetimepicker.show();

            }


        },

        _setHeader:function(){

            var headerTitle = this._getHeaderTitle(),

            quickButton = this.options.quickButton;

            this.$datetimepickerHeaderTitle.html(this._getHeaderTitle());

            switch (this.viewSelect) {

                case "day":

                    this.$datetimepickerHeaderPrev.attr('event', "prevMonths");

                    this.$datetimepickerHeaderNext.attr('event', "nextMonths");

                    if(quickButton){

                        this.$datetimepickerHeaderQuickPrev.attr('event', "prevYears");

                        this.$datetimepickerHeaderQuickNext.attr('event', "nextYears");

                    }

                    break;

                case "month":

                    this.$datetimepickerHeaderPrev.attr('event', "prevYears");

                    this.$datetimepickerHeaderNext.attr('event', "nextYears");

                    if(quickButton){

                        this.$datetimepickerHeaderQuickPrev.attr('event', "prevYears");

                        this.$datetimepickerHeaderQuickNext.attr('event', "nextYears");

                    }

                    break;

                case "year":

                    this.$datetimepickerHeaderPrev.attr('event', "prevTenYears");

                    this.$datetimepickerHeaderNext.attr('event', "nextTenYears");

                    if(quickButton){

                        this.$datetimepickerHeaderQuickPrev.attr('event', "prevTenYears");

                        this.$datetimepickerHeaderQuickNext.attr('event', "nextTenYears");

                    }

                    break;

            }

        },

        _getViewGrade:function(viewSelect){

            var op = this.options, returnVal = true,

            viewGrade = {'day': 1, 'month': 2, 'year': 3},

            viewSelectGrade;

            if(viewSelect === 'init'){

                viewSelectGrade = viewGrade[op.startView]

                if(viewGrade[op.minView] > viewSelectGrade){

                    this.viewSelect = op.minView;

                }else if(viewGrade[op.maxView] < viewSelectGrade){

                    this.viewSelect = op.maxView;

                }else{

                    this.viewSelect = op.startView;

                }

                return;

            }

            viewSelectGrade = viewGrade[viewSelect || this.viewSelect || op.startView];

            if(viewGrade[op.minView] > viewSelectGrade || viewGrade[op.maxView] < viewSelectGrade ){

                returnVal = false;

            }

            return returnVal;

        },

        _setViewSelectTable:function(){

            var $datetimepickerHeader = this.$datetimepickerHeader;

            this._setHeader();

            switch (this.viewSelect) {

                case "day":

                    $(this._createDaysTable()).appendTo(this.$datetimepicker.find('table[role="leoDatetimepickerTable"]').remove().end()).height();

                    break;

                case "month":

                    $(this._createMonthsYearsTable()).appendTo(this.$datetimepicker.find('table[role="leoDatetimepickerTable"]').remove().end());

                    break;

                case "year":

                    $(this._createMonthsYearsTable()).appendTo(this.$datetimepicker.find('table[role="leoDatetimepickerTable"]').remove().end());

                    break;

            }


        },

        _getHeaderTitle:function(){

            var currentDate = this._currentDate.getCurrentDate(true),

            op = this.options, returnVal, year;

            switch (this.viewSelect) {

                case "day":

                    returnVal = op.monthsName[currentDate.getMonth()] + '&nbsp;&nbsp;' + currentDate.getFullYear();

                    break;

                case "month":

                    returnVal = currentDate.getFullYear();

                    break;

                case "year":

                    year = Math.floor(currentDate.getFullYear() / 10) * 10 - 1;

                    returnVal = (year + 1) + " - " + (year + 10);

                    break;

            }

        	return returnVal;

        },

        _createHeader:function(){

        	var str, innerStr = '<div class="leoDatetimepicker-header-inner"><a href="#" class="leoDatetimepicker-header-prevMonths leoDatetimepicker-header-button" role="prev"  event="prevMonths"><span class="leoDatetimepicker-icon"></span></a><div class="leoDatetimepicker-header-inner-title" role="headerTitle"></div><a href="#" class="leoDatetimepicker-header-nextMonths leoDatetimepicker-header-button" role="next"  event="nextMonths"><span class="leoDatetimepicker-icon"></span></a></div>',

            $datetimepickerHeader,

            quickButton = this.options.quickButton;

        	if(!quickButton){

        		str = '<div class="leoDatetimepicker-header" role="header">';

        		str += innerStr;

        		str += '</div>';

        	}else{

        		str = '<div class="leoDatetimepicker-header leoDatetimepicker-header-yearsbutton" role="header"><a href="#" class="leoDatetimepicker-header-prevYears leoDatetimepicker-header-button" role="quickPrev" event="prevYears"><span class="leoDatetimepicker-icon"></span></a>';

        		str += innerStr;

        		str += '<a href="#" class="leoDatetimepicker-header-nextYears leoDatetimepicker-header-button" role="quickNext" event="nextYears"><span class="leoDatetimepicker-icon"></span></a></div>';

        	}

            $datetimepickerHeader = this.$datetimepickerHeader = $(str);

            this.$datetimepickerHeaderTitle = $datetimepickerHeader.find('div[role="headerTitle"]');

            this.$datetimepickerHeaderPrev = $datetimepickerHeader.find('a[role="prev"]');

            this.$datetimepickerHeaderNext = $datetimepickerHeader.find('a[role="next"]');

            if(quickButton){

                this.$datetimepickerHeaderQuickPrev = $datetimepickerHeader.find('a[role="quickPrev"]');

                this.$datetimepickerHeaderQuickNext = $datetimepickerHeader.find('a[role="quickNext"]');

            }

        	return str;

        },

        _createDaysTable:function(){

        	var op = this.options,weekStart = op.weekStart,

            dayOfWeekName = op.dayOfWeekName,

        	weeksName = op.weeksName, showWeekDays = op.showWeekDays,

        	showOtherMonthDays = op.showOtherMonthDays,

        	leoDate = $.leoTools.Date,

        	maxMineFormat = op.maxMineFormat,

        	startDate = this._getDaysTableDayStart(),

        	currentDate = this._currentDate.getCurrentDate(),

        	currentMonth = currentDate.getMonth(),

        	today = Date.today(),weekDayLen = 7,

        	dayTitleFormat = op.dayTitleFormat,

        	d, m, y, classes, i = 0, j = 0, z,

        	equals = Date.equals,role, beforeShowDay = op.beforeShowDay,

            currentVal = this._currentVal, beforeShowDayObj,

            rangeDateCreate = this._rangeDateCreate('day'),

        	tableStr = '<table class="leoDatetimepicker-calendar" role="leoDatetimepickerTable"><thead><tr>';

        	if(showWeekDays){

        		tableStr +='<th>' + weeksName + '</th>';

        		weekDayLen = 8;

        	}

        	for (; i < 7; i++) {

				tableStr += '<th>' + dayOfWeekName[(i + weekStart)%7] + '</th>';

			}

			tableStr += '</tr></thead><tbody>';

			for(; j < 6; j++){

				tableStr += '<tr>';

				for(z = 0; z < weekDayLen; z++ ){

					classes = [];

					d = startDate.getDate();

					m = startDate.getMonth();

                    y = startDate.getFullYear();

                    if(beforeShowDay){

                        beforeShowDayObj = beforeShowDay(startDate.clone());

                        console.log(beforeShowDayObj)

                    }

					if(showWeekDays && z === 0){

						tableStr += '<td class="leoDatetimepicker-week-col">' + startDate.getWeek() + '</td>';

						continue;

					}

					if(currentMonth !== m){

						if(showOtherMonthDays){

							classes.push('leoDatetimepicker-other-month');

						}else{

							tableStr += '<td class="leoDatetimepicker-day-gap">&nbsp;</td>';

							startDate.addDays(1);

							continue;

						}

					}

					if(!rangeDateCreate(startDate)){

						classes.push('leoDatetimepicker-disabled');

                        role = "disabled";

					}else{

                        role = "select";

                        if(currentVal && equals(startDate, currentVal)){

                            classes.push('leoDatetimepicker-active');

                        }

                        if(equals(startDate, today)){

                            classes.push('leoDatetimepicker-today');

                        }

                    }

					tableStr += '<td class="' + classes.join(' ') + '" title="' +  startDate.toString(dayTitleFormat) + '" year="' + y + '" month="' + m + '" day="' + d + '" role="' + role + '"><a href="#" class="leoDatetimepicker-day-default">' + d + '</a></td>';

					startDate.addDays(1);

				}

				tableStr += '</tr>';

			}

			tableStr += '</tbody></table>';

			return tableStr;

        },

        _createMonthsYearsTable:function(){

            var op = this.options, rows = 3, cols = 4, i, j,

            tableStr = '<table class="leoDatetimepicker-calendar leoDatetimepicker-grid" role="leoDatetimepickerTable"><tbody>',

            date = this._currentDate.getCurrentDate(true),

            monthsName = op.monthsName,value,role,

            leoDate = $.leoTools.Date, cls = [],

            maxMineFormat = op.maxMineFormat,select,

            index,outofRange,cellText,year,range,

            viewSelect = this.viewSelect, startDate, rangeDateCreate;

            if(viewSelect === 'month'){

                startDate = date;

            }else{

                startDate = Math.floor(date.getFullYear() / 10) * 10 - 1;

            }

            rangeDateCreate = this._rangeDateCreate(viewSelect, startDate);

            for(i = 0; i < rows; i++){

                tableStr += '<tr height="30%">';

                for(j = 0; j < cols; j++){

                    index = i * 4 + j;

                    outofRange = false;

                    cellText = '';

                    year = null;

                    cls = [];

                    switch (viewSelect) {

                        case "month":

                            cellText = monthsName[index];

                            range = rangeDateCreate(index);

                            value = index;

                            select = this._selectMonth;

                            break;

                        case "year":

                            year = startDate + index;

                            range = rangeDateCreate(index);

                            cellText = year.toString();

                            value = cellText;

                            select = this._selectYear;

                            ;(index === 0 || index === 11) && (cls.push('leoDatetimepicker-grid-other'));

                            break;

                    }

                    if(!range){

                        cls.push('leoDatetimepicker-disabled');

                        role = "disabled";

                    }else{

                        role = "select";

                        select && cls.push('leoDatetimepicker-active');

                    }

                    tableStr += '<td class="leoDatetimepicker-day-default '+cls.join(' ')+'" value="'+value+'" role="' + role + '"><a href="###">' + cellText + '</a></td>';

                }

                tableStr += '</tr>';

            }

            return tableStr;

        },

        _rangeDateCreate:function(type, start){

            var op = this.options, maxDate = op.maxDate,

            minDate = op.minDate, leoDate = $.leoTools.Date,

            maxMineFormat = op.maxMineFormat,

            This = this, currentVal = this._currentVal;

            !currentVal && (currentVal = false);

            switch (type) {

                case "day":

                    if(maxDate !== false){

                        maxDate = leoDate.getMaxDate(maxDate, maxMineFormat, true);

                    }

                    if(minDate !== false){

                        minDate = leoDate.getMinDate(minDate, maxMineFormat, true);

                    }

                    currentVal && (currentVal = currentVal.clearTime());

                    break;

                case "month":

                    if(maxDate !== false){

                        maxDate = leoDate.getDate(maxDate, maxMineFormat, true);

                        maxDate && (maxDate = maxDate.getFullYear() * 12 + maxDate.getMonth());

                    }

                    if(minDate !== false){

                        minDate = leoDate.getDate(minDate, maxMineFormat, true);

                        minDate && (minDate = minDate.getFullYear() * 12 + minDate.getMonth());

                    }

                    start = start.getFullYear() * 12;

                    currentVal && (currentVal = currentVal.getFullYear() * 12 + currentVal.getMonth());

                    break;

                case "year":

                    if(maxDate !== false){

                        maxDate = leoDate.getDate(maxDate, maxMineFormat, true);

                        maxDate && (maxDate = maxDate.getFullYear());

                    }

                    if(minDate !== false){

                        minDate = leoDate.getDate(minDate, maxMineFormat, true);

                        minDate && (minDate = minDate.getFullYear());

                    }

                    currentVal && (currentVal = currentVal.getFullYear());

                    break;

            }

            return function(date){

                var returnVal, value;

                switch (type) {

                    case "day":

                        if((maxDate !== false && date > maxDate) || (minDate !== false && date < minDate)){

                            returnVal = false;

                        }else{

                            returnVal = true;

                        }

                        if(currentVal !== false && currentVal === date){

                            This._selectDay = true;

                        }else{

                            This._selectDay = false;

                        }

                        break;

                    case "month":

                        value = start + date;

                        if((minDate !== false && value < minDate) || (maxDate !== false && value > maxDate)){

                            returnVal = false;

                        }else{

                            returnVal = true;

                        }

                        if(currentVal !== false && currentVal === value){

                            This._selectMonth = true;

                        }else{

                            This._selectMonth = false;

                        }

                        break;

                    case "year":

                        value = start + date;

                        if((minDate !== false && value < minDate) || (maxDate !== false && value > maxDate)){

                            returnVal = false;

                        }else{

                            returnVal = true;

                        }

                        if(currentVal !== false && currentVal === value){

                            This._selectYear = true;

                        }else{

                            This._selectYear = false;

                        }

                        break;

                }

                return returnVal;

            }

        },

        _currentDateNextMonths:function(){

        	this._currentDate.nextMonths();

        },

        _currentDatePrevMonths:function(){

        	this._currentDate.prevMonths();

        },

        _currentDateNextYears:function(){

            this._currentDate.nextYears();

        },

        _currentDatePrevYears:function(){

            this._currentDate.prevYears();

        },

        _currentDatePrevTenYears:function(){

            this._currentDate.addYears(-10);

        },

        _currentDateNextTenYears:function(){

            this._currentDate.addYears(10);

        },

        getCurrentVal:function(format){

            return this._currentVal && this._currentVal.toString(format || this.options.dateFormat);

        },

        _setCurrentVal:function(){

            var op = this.options;

            this._currentVal = this._currentDate.getCurrentDate(true);

            if(this.isInput){

                this.$target.val(this.getCurrentVal());

                op.autoClose ? this.hide() : this._setViewSelectTable();

            }else{

                this._setViewSelectTable()

            }

            op.selectChange(this._currentVal.clone());

        },

        _activeClass:function(elem){

            $datetimepicker.find('.leoDatetimepicker-active').removeClass('leoDatetimepicker-active');

            $(elem).addClass('leoDatetimepicker-active');

        },

        _isMinView:function(){

            return this.viewSelect === this.minView;

        },

        _rollViewTable:function(eventName){

            switch(eventName) {

                case "prevMonths":

                    this._currentDatePrevMonths();

                    this._setViewSelectTable();

                    break;

                case "nextMonths":

                    this._currentDateNextMonths();

                    this._setViewSelectTable();

                    break;

                case "prevYears":

                    this._currentDatePrevYears();

                    this._setViewSelectTable();

                    break;

                case "nextYears":

                    this._currentDateNextYears();

                    this._setViewSelectTable();

                    break;

                case "prevMonths":

                    this._currentDateNextYears();

                    this._setViewSelectTable();

                    break;

                case "prevTenYears":

                    this._currentDatePrevTenYears();

                    this._setViewSelectTable();

                    break;

                case "nextTenYears":

                    this._currentDateNextTenYears();

                    this._setViewSelectTable();

                    break;

            }

        },

        _destroy:function(){

            this.$datetimepicker.remove();

        },

        addEvent:function(){

        	var This = this, $datetimepicker = this.$datetimepicker,

            isClose = false, timeId, isRoll = false;

        	this._on($datetimepicker, 'click', 'a', function(event){

                event.preventDefault();

                !isRoll && This._rollViewTable($(this).attr('event'));

        	})._on($datetimepicker, 'mousedown', 'a', function(event){

                event.preventDefault();

                var $this = $(this);

                isRoll = false;

                timeId && window.clearInterval(timeId);

                timeId = window.setInterval(function(){

                    isRoll = true;

                    This._rollViewTable($this.attr('event'));

                }, 100);

            })._on($datetimepicker, 'mouseup', 'a', function(event){

                event.preventDefault();

                timeId && window.clearInterval(timeId);

            })._on($datetimepicker, 'mousewheel', function(event, delta, deltaX, deltaY){

                switch(This.viewSelect) {

                    case "day":

                        if(delta < 0){

                            This._rollViewTable("nextMonths")

                        }else{

                            This._rollViewTable("prevMonths")

                        }

                        break;

                    case "month":

                        if(delta < 0){

                            This._rollViewTable("nextYears")

                        }else{

                            This._rollViewTable("prevYears")

                        }

                        break;

                    case "year":

                        if(delta < 0){

                            This._rollViewTable("nextTenYears")

                        }else{

                            This._rollViewTable("prevTenYears")

                        }

                        break;

                }

            })._on(this.$datetimepickerHeaderTitle, 'click', function(event){

                event.preventDefault();

                switch(This.viewSelect) {

                    case "day":

                        if(This._getViewGrade('month')){

                            This.viewSelect = 'month';

                            This._setViewSelectTable();

                        }

                        break;

                    case "month":

                        if(This._getViewGrade('year')){

                            This.viewSelect = 'year';

                            This._setViewSelectTable();

                        }

                        break;

                }

            })._on($datetimepicker, 'click', 'td[role="select"]', function(event){

                event.preventDefault();

                switch(This.viewSelect) {

                    case "day":

                        This._currentDate.set({

                            year: +$(this).attr('year'),

                            month: +$(this).attr('month'),

                            day: +$(this).attr('day')

                        });

                        This._setCurrentVal();

                        break;

                    case "month":

                        if(This._getViewGrade('day')){

                            This.viewSelect = 'day';

                            This._currentDate.set({month: +$(this).attr('value')});

                            This._setViewSelectTable();

                            isClose = true;

                        }else{

                            This._currentDate.set({month: +$(this).attr('value')});

                            This._setCurrentVal();

                        }

                        break;

                    case "year":

                        if(This._getViewGrade('month')){

                            This.viewSelect = 'month';

                            This._currentDate.set({year: +$(this).attr('value')});

                            This._setViewSelectTable();

                            isClose = true;

                        }else{

                            This._currentDate.set({year: +$(this).attr('value')});

                            This._setCurrentVal();

                        }

                        break;

                }

            })._on($datetimepicker, 'mouseenter', 'td[role="select"]', function(event){

                $(this).addClass('leoDatetimepicker-hover');

            })._on($datetimepicker, 'mouseleave', 'td[role="select"]', function(event){

                $(this).removeClass('leoDatetimepicker-hover');

            });

            if(this.isInput){

                this._on(this.$target, 'focus', function(event){

                    This.show();

                })._on(this.$target, 'click', function(event){

                    isClose = true;

                    This._state === 'close' && This.show();

                })._on(document, 'click', function(event){

                    var $evTarget = $(event.target);

                    if(!isClose && !$evTarget.closest($datetimepicker)[0]){

                        This.hide();

                    }else{

                        isClose = false;

                    }

                });

            }

        }

    });

    return $;

}));