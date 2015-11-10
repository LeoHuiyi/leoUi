
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

    $('#reset').on('click', function(event) {
        event.preventDefault();
        $('#images').leoImagePlayer('resetBox');
    });
    $('#destroy').on('click', function(event) {
        event.preventDefault();
        $('#images').leoImagePlayer('destroy');
    });
    $('#add').on('click', function(event) {
        event.preventDefault();
        $('.images_lists').append('<li class="list" id="1123"><dl><dt class="photo"><a href="###"><img src="img/16.jpg"></a></dt></dl></li>');
    });
});

