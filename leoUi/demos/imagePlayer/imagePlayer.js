
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

leoUiLoad.require('leoUi-imagePlayer,leoUi, ready', function($) {

    $('#images').leoImagePlayer();

});

