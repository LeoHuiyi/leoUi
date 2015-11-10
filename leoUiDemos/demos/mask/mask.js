leoUiLoad.config({

    debug: true,

    baseUrl: 'leoUi/',

    alias: {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css',

        jqueryMousewheel: '../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.11.2.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-mask,leoUi,ready', function($) {

    var mask = $.leoMask({

        showDelay:1000,

        hideDelay:500

    });

    $('#btn').on('click', function(){

        var state = mask.state();

        if(state === 'close'){

            mask.show();

        }else if(state === 'open'){

            mask.hide();
        }

    });

});