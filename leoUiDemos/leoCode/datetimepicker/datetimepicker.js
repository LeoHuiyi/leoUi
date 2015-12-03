leoUiLoad.config({

    debug: true,

    baseUrl:'leoUi/',

    alias : {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css',

        'jqueryMousewheel': '../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　,

        dateZn: {

            src: '../jquery/date.zn.min.js',

            exports: "Date"

        }

    }

});

leoUiLoad.require('leoUi-datetimepicker,leoUi, ready', function($) {

    $('.calendar').leoDatetimepicker({

        append:'.calendar',

        quickButton:true,

        beforeShowDay:function(dateObj){

            if(dateObj.date.getDate() === 4 && !dateObj.isWeekCell){

                return {

                    classes:'a 23432',

                    html:'34534'

                }

            }

        },

        beforeShowMonth:function(dateObj){

            if(dateObj.year === 2014 && dateObj.month === 8){

                return {

                    classes:'a 23432',

                    html:'34534'

                }

            }

        },

        beforeShowYear:function(dateObj){

            if(dateObj.year === 2014){

                return {

                    classes:'a 23432',

                    html:'34534'

                }

            }

        }

    });

    $('#input').leoDatetimepicker({selectChange:function(date){

        // console.log(date)

        $('#input1').leoDatetimepicker('option','minDate',date);


    },dateFormat:"yyyy-MM-dd",isTimePicker:false});

    $('#input1').leoDatetimepicker({selectChange:function(date){

        $('#input').leoDatetimepicker('option','maxDate',date);


    },dateFormat:"yyyy-MM-dd",isTimePicker:false});

    $('#button').on('click', function(event) {
        event.preventDefault();
        // console.log($('.calendar').leoDatetimepicker('state'))

        // if($('.calendar').leoDatetimepicker('state')==='open'){

        //     $('.calendar').leoDatetimepicker('hide');

        // }else{

        //     $('.calendar').leoDatetimepicker('show');

        // }
         console.log($('.calendar').leoDatetimepicker('getCurrentVal', "yyyy-MM-dd HH:mm:ss"))
        // $('.calendar').leoDatetimepicker('destroy')

    });

});

