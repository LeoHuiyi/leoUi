
leoUiLoad.config({

    debug: false,

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

        beforeShowDay:function(date){

            if(date.getDate() === 4){

                return {

                    classes:[],

                    html:''


                }

            }

        }

    });

    $('#input').leoDatetimepicker({selectChange:function(date){

        // console.log(date)

        $('#input1').leoDatetimepicker('option','minDate',date);


    }});

    $('#input1').leoDatetimepicker({selectChange:function(date){

        $('#input').leoDatetimepicker('option','maxDate',date);


    }});

    $('#button').on('click', function(event) {
        event.preventDefault();
        // console.log($('.calendar').leoDatetimepicker('state'))

        // if($('.calendar').leoDatetimepicker('state')==='open'){

        //     $('.calendar').leoDatetimepicker('hide');

        // }else{

        //     $('.calendar').leoDatetimepicker('show');

        // }

        $('.calendar').leoDatetimepicker('destroy')

    });

});

