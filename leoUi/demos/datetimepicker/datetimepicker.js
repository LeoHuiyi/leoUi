
leoUiLoad.config({

    debug: false,

    baseUrl:'leoUi/',

    alias : {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css'

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

    $('.calendar').leoDatetimepicker();

    $('#button').on('click', function(event) {
        event.preventDefault();
        console.log($('.calendar').leoDatetimepicker('getCurrentVal'))
    });

    

});

