/**
+-------------------------------------------------------------------
* jQuery leoUi--date
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["jquery", "dateZn"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($){

	$.leoTools = $.leoTools || {};

    var leoDate = $.leoTools.Date = function(date, option){

    	return new leoDate.fn.init(date, option);

    };

    leoDate.fn = leoDate.prototype = {

        constructor: leoDate,

        init: function(date, option){

            var defaultDate;

            this.options = $.extend({}, leoDate.defaultOp, option);

            this.currentDate = leoDate.getDate(date, this.options.parseFormat);

            if(!this.currentDate){

                defaultDate = this.options.defaultDate;

                if(leoDate.isValidDate(defaultDate)){

                    this.currentDate = defaultDate;

                }else if(defaultDate === 'now'){

                    this.currentDate = new Date();

                }

            }

            return this;

        },

        setTimeToNow:function(){

            this.currentDate.setTimeToNow();

            return this;

        },

        strTime: function(strFormat){

            return this.currentDate.toString(strFormat || this.options.strFormat);

        },

        today: function(){

            this.currentDate = Date.today();

            return this;

        },

        getLastDayOfMonth:function(){

            return Date.getDaysInMonth(this.currentDate.getFullYear(), this.currentDate.getMonth());

        },

        getFirstDayOfMonthDate:function(){

            return this.currentDate.clone().moveToFirstDayOfMonth();

        },

        getLastDayOfMonthDate:function(){

            return this.currentDate.clone().moveToLastDayOfMonth();

        },

        getNextMonthsLastDayOfMonth:function(){

            var cloneCurrentDate = this.currentDate.clone().addMonths(1);

            return Date.getDaysInMonth(cloneCurrentDate.getFullYear(), cloneCurrentDate.getMonth());

        },

        getPrevMonthsLastDayOfMonth:function(){

            var cloneCurrentDate = this.currentDate.clone().addMonths(-1);

            return Date.getDaysInMonth(cloneCurrentDate.getFullYear(), cloneCurrentDate.getMonth());

        },

        getCurrentDate: function(isClone){

            return !isClone ? this.currentDate : this.currentDate.clone();

        },

        setCurrentDate: function(date, parseFormat){

            this.currentDate = leoDate.getDate(date, parseFormat || this.options.parseFormat);

            return this;

        },

        getWeek: function(){

            return this.currentDate.getWeek();

        },

        setWeek: function(n){

            this.currentDate = this.currentDate.setWeek(n);

            return this;

        },

        add: function(config){

            this.currentDate = this.currentDate.add(config);

            return this;

        },

        set: function(config){

            this.currentDate = this.currentDate.set(config);

            return this;

        }

    };

    leoDate.fn.init.prototype = leoDate.fn;

    (function (){

        var arr = ['Milliseconds', 'Seconds', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Years'],

        i = arr.length, leoDateFn = leoDate.fn, name;

        while(i--){

            name = arr[i];

            leoDateFn['next' + name] = (function(name){

                return function(){

                    this.currentDate = this.currentDate['add' + name](1);

                    return this;


                }

            })(name);

            leoDateFn['prev' + name] = (function(name){

                return function(){

                    this.currentDate = this.currentDate['add' + name](-1);

                    return this;


                }

            })(name);

            leoDateFn['add' + name] = (function(name){

                return function(value){

                    this.currentDate = this.currentDate['add' + name](value);

                    return this;


                }

            })(name);

        }

    }());

    $.extend(leoDate, {

        defaultOp: {

            strFormat: "yyyy-MM-dd HH:mm:ss",

            parseFormat: "yyyy-MM-dd HH:mm:ss",

            defaultDate: "now"

        },

        isValidDate: function(date){

            if (Object.prototype.toString.call(date) !== "[object Date]"){

                return false;

            }

            return !isNaN(date.getTime());

        },

        getDate:function(date, format){

            var d;

            if(leoDate.isValidDate(date)){

                return date;

            }else if(typeof date ==='string'){

                return Date.parseExact(date, format);

            }else{

                return null;

            }

        },

        getMaxDate:function(date, format){

            if(date !== false){

                var maxDate = leoDate.getDate(date, format);

                maxDate && (date = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999));

            }

            return date;

        },

        getMinDate: function(date, format){

            if(date !== false){

                var minDate = leoDate.getDate(date, format);

                minDate && (date = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0, 0));

            }

            return date;

        },

        between: function(date, minDate, maxDate){

            var isValidDate = leoDate.isValidDate,

            isValidDateMax, isValidDateMin;

            if(isValidDate(date)){

            	isValidDateMin = isValidDate(minDate);

            	isValidDateMax = isValidDate(maxDate);

            	if(isValidDateMin && isValidDateMax){

            		return date.getTime() >= minDate.getTime() && date.getTime() <= maxDate.getTime();

            	}else if(!isValidDateMin && isValidDateMax){

	            	return date.getTime() <= maxDate.getTime();

	            }else if(!isValidDateMax && isValidDateMin){

	            	return date.getTime() >= minDate.getTime();

	            }

            }

        }

    });

	return $;

}));