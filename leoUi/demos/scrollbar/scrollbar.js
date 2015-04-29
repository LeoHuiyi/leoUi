leoUiLoad.config({

    debug: false,

    baseUrl: 'leoUi/',

    alias: {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css',

        leoUiGrid: '../../css/leoUi-grid.css',

        jqueryMousewheel: '../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.11.2.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-scrollbar,leoUi,ready', function($) {
    $('#scrollbar').leoScrollbar();
});