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
        define(["leoUi-position","leoUi-date","leoUi-tools","leoUi-effects"], factory);

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

			weeksName:"周数",

        	weekStart:0,//一周从哪一天开始。0（星期日）到6（星期六）

        	hasYearsButton:true,

        	showWeekDays:true,

        	showOtherMonthDays:true,

        	parseFormat:"yyyy-MM-dd",

        	strFormat: "yyyy-MM-dd",

        	dayTitleFormat: "yyyy-MM-dd",

        	maxMineFormat:"yyyy-MM-dd",

        	maxDate:"2015-02-04",

        	minDate:"2015-02-04"


        },

        _init:function(){

        	this._getDateValue();

        	this._createDatetimepicker();

        },

        _getDateValue:function(){

        	this._initLeoDate(this.$target.val());

        },

        _initLeoDate:function(date){

        	var leoDate = $.leoTools.Date, op = this.options;

        	this._currentDate = new leoDate(date, {

        		parseFormat:op.parseFormat,

        		strFormat:op.strFormat

        	});

        },

        _getDaysTableDayStart:function(){

        	var firstDateOfMonthDate = this._currentDate.getFirstDayOfMonthDate(),

        	difDays = this.options.weekStart - firstDateOfMonthDate.getDay();

        	difDays >= 0 && (difDays -= 7);

        	return firstDateOfMonthDate.addDays(difDays).clearTime();

        },

        _createDatetimepicker:function(){

        	this.$datetimepicker = $('<div class="leoDatetimepicker leoUi_clearfix"></div>').append(this._createHeaderStr() + this._createMonthsYearsTable()).appendTo(this.$target);

        	this.addEvent();

        },

        _getHeaderTitle:function(){

        	var currentDate = this._currentDate.getCurrentDate(),

        	currentMonth = this.options.monthsName[currentDate.getMonth()],

        	currentYear = currentDate.getFullYear();

        	return currentMonth + '&nbsp&nbsp' + currentYear;

        },

        _createHeaderStr:function(){

        	var str, innerStr = '<div class="leoDatetimepicker-header-inner"><a href="#" class="leoDatetimepicker-header-prevMonths leoDatetimepicker-header-button" role="prevMonths"><span class="leoDatetimepicker-icon"></span></a><div class="leoDatetimepicker-header-inner-title" role="headerTitle">' + this._getHeaderTitle() +'</div><a href="#" class="leoDatetimepicker-header-nextMonths leoDatetimepicker-header-button" role="nextMonths"><span class="leoDatetimepicker-icon"></span></a></div>';

        	if(!this.options.hasYearsButton){

        		str = '<div class="leoDatetimepicker-header" role="header">';

        		str += innerStr;

        		str += '</div>';

        	}else{

        		str = '<div class="leoDatetimepicker-header leoDatetimepicker-header-yearsbutton" role="header"><a href="#" class="leoDatetimepicker-header-prevYears leoDatetimepicker-header-button" role="prevYears"><span class="leoDatetimepicker-icon"></span></a>';

        		str += innerStr;

        		str += '<a href="#" class="leoDatetimepicker-header-nextYears leoDatetimepicker-header-button" role="nextYears"><span class="leoDatetimepicker-icon"></span></a></div>';

        	}

        	return str;

        },

        _createDaysTable:function(){

        	var op = this.options,weekStart = op.weekStart,

            dayOfWeekName = op.dayOfWeekName,

        	weeksName = op.weeksName, showWeekDays = op.showWeekDays,

        	showOtherMonthDays = op.showOtherMonthDays,

        	minDate = op.minDate, maxDate = op.maxDate,

        	leoDate = $.leoTools.Date,

        	maxMineFormat = op.maxMineFormat,

        	startDate = this._getDaysTableDayStart(),

        	currentDate = this._currentDate.getCurrentDate(),

        	currentMonth = currentDate.getMonth(),

        	today = Date.today(),weekDayLen = 7,

        	dayTitleFormat = op.dayTitleFormat,

        	d, y, m, classes, i = 0, j = 0, z,

        	equals = Date.equals,

        	tableStr = '<table class="leoDatetimepicker-calendar" role="dayTable"><thead><tr>';

        	if(showWeekDays){

        		tableStr +='<th>' + weeksName + '</th>';

        		weekDayLen = 8;

        	}

        	for (; i < 7; i++) {

				tableStr += '<th>' + dayOfWeekName[(i + weekStart) > 6 ? 0 : i + weekStart] + '</th>';

			}

			tableStr += '</tr></thead><tbody>';

			if(maxDate !== false){

				maxDate = leoDate.getMaxDate(maxDate, maxMineFormat, true);

			}

			if(minDate !== false){

				minDate = leoDate.getMinDate(minDate, maxMineFormat, true);

			}

			for(; j < 6; j++){

				tableStr += '<tr>';

				for(z = 0; z < weekDayLen; z++ ){

					classes = [];

					d = startDate.getDate();

					y = startDate.getFullYear();

					m = startDate.getMonth();

					if(showWeekDays && z === 0){

						tableStr += '<td class="leoDatetimepicker-week-col">' + startDate.getWeek() + '</td>';

						continue;

					}

					if(currentMonth !== m){

						if(showOtherMonthDays){

							classes.push('leoDatetimepicker-other-month');

						}else{

							tableStr += '<td class="leoDatetimepicker-day-gap"></td>';

							startDate.addDays(1);

							continue;

						}

					}

					if(((maxDate !== false && startDate > maxDate) || (minDate !== false && startDate < minDate))){

						classes.push('leoDatetimepicker-disabled');

					}

					if(equals(startDate, today)){

						classes.push('leoDatetimepicker-today');

					}

					tableStr += '<td class="' + classes.join(' ') + '" title="' +  startDate.toString(dayTitleFormat) + '"><a href="#" class="leoDatetimepicker-day-default">' + d + '</a></td>';

					startDate.addDays(1);

				}

				tableStr += '</tr>';

			}

			tableStr += '</tbody></table>';

			return tableStr;

        },

        _createMonthsYearsTable:function(){

            var op = this.options, rows = 3, cols = 4, i, j,

            tableStr = '<table class="leoDatetimepicker-calendar leoDatetimepicker-grid" style="height:187px"><tbody>',

            date = this._currentDate.getCurrentDate(),

            monthsName = op.monthsName,

            leoDate = $.leoTools.Date, cls = '',

            maxMineFormat = op.maxMineFormat,

            startMonth = date.getFullYear() * 12,

            minDate = op.minDate, maxDate = op.maxDate,

            index,outofRange,cellText,v

            tableType = this.tableType = 'month';

            if(maxDate !== false){

                maxDate = leoDate.getMaxDate(maxDate, maxMineFormat, true);

            }

            if(minDate !== false){

                minDate = leoDate.getMinDate(minDate, maxMineFormat, true);

            }

            for(i = 0; i < rows; i++){

                tableStr += '<tr height="30%">';

                for(j = 0; j < cols; j++){

                    index = i * 4 + j;

                    outofRange = false;

                    cellText = '';

                    v = null;

                    switch (tableType) {

                        case "month":

                        cellText = monthsName[index];

                        console.log((minDate !== false && (startMonth + index) > (minDate.getFullYear() * 12 + minDate.getMonth())))

                        console.log((maxDate !== false && (startMonth + index) < (maxDate.getFullYear() * 12 + maxDate.getMonth())))

                        console.log(index)

                        outofRange = (minDate !== false && (startMonth + index) < (minDate.getFullYear() * 12 + minDate.getMonth())) || (maxDate !== false && (startMonth + index) > (maxDate.getFullYear() * 12 + maxDate.getMonth()));

                        // console.log(outofRange)

                        break;

                        case "year":

                                v = startYear + index;

                                if ((minDate !== false && (v < o.minDate.getFullYear())) || (maxDate !== false && (v > o.maxDate.getFullYear()))) {

                                    outofRange = true;

                                }

                                cellText = v.toString();

                        break;

                    }

                    if(!outofRange){

                        cls += 'leoDatetimepicker-disabled';

                    }

                    tableStr += '<td class="leoDatetimepicker-day-default '+cls+'"><a href="">' + cellText + '</a></td>';

                }

                tableStr += '</tr>';

            }

            return tableStr;

        },

        _rangeDateCreate:function(type, start){

            var op = this.options, maxDate = op.maxDate,

            minDate = op.minDate, leoDate = $.leoTools.Date,

            maxMineFormat = op.maxMineFormat;

            switch (type) {

                case "day":

                    if(maxDate !== false){

                        maxDate = leoDate.getMaxDate(maxDate, maxMineFormat, true);

                    }

                    if(minDate !== false){

                        minDate = leoDate.getMinDate(minDate, maxMineFormat, true);

                    }

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

                break;

                case "year":

                    if(maxDate !== false){

                        maxDate = leoDate.getDate(maxDate, maxMineFormat, true);

                        maxDate && (maxDate = maxDate.getFullYear());

                    }

                    if(minDate !== false){

                        minDate = leoDate.getDate(minDate, maxMineFormat, true);

                        maxDate && (maxDate = maxDate.getFullYear());

                    }

                    start = start.getFullYear();

                break;

            }

            return function(date){

                var returnVal;

                switch (type) {

                    case "day":

                    if(((maxDate !== false && startDate > maxDate) || (minDate !== false && startDate < minDate))){

                        returnVal = false;

                    }else{

                        returnVal = true;

                    }

                    break;

                    case "month":

                    cellText = monthsName[index];

                    console.log((minDate !== false && (startMonth + index) > (minDate.getFullYear() * 12 + minDate.getMonth())))

                    console.log((maxDate !== false && (startMonth + index) < (maxDate.getFullYear() * 12 + maxDate.getMonth())))

                    console.log(index)

                    outofRange = (minDate !== false && (startMonth + index) < (minDate.getFullYear() * 12 + minDate.getMonth())) || (maxDate !== false && (startMonth + index) > (maxDate.getFullYear() * 12 + maxDate.getMonth()));

                    // console.log(outofRange)

                    break;

                    case "year":

                            v = startYear + index;

                            if ((minDate !== false && (v < o.minDate.getFullYear())) || (maxDate !== false && (v > o.maxDate.getFullYear()))) {

                                outofRange = true;

                            }

                            cellText = v.toString();

                    break;

                }


            }

        },

        _updateDaysTable:function(){

        	var $daysTable = this.$datetimepicker;

        	this.$datetimepicker.find('div[role="headerTitle"]').html(this._getHeaderTitle()).end().find('table[role="dayTable"]').remove().end().append(this._createDaysTable());

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

        addEvent:function(){

        	var This = this;

        	this._on(this.$datetimepicker, 'click', 'a', function(event){

        		var $this = $(this), role = $this.attr('role');

        		if(role === 'prevMonths'){

        			This._currentDatePrevMonths();

        			This._updateDaysTable();

        		}else if(role === 'nextMonths'){

        			This._currentDateNextMonths();

        			This._updateDaysTable();

        		}else if(role === 'prevYears'){

                    This._currentDatePrevYears();

                    This._updateDaysTable();

        		}else if(role === 'nextYears'){

                    This._currentDateNextYears();

                    This._updateDaysTable();

        		}



        	});



        }

    });

    return $;

}));