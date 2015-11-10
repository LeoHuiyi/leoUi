
leoUiLoad.config({

    debug: true,

    baseUrl:'leoUi/',

    alias : {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css',

        jqueryMousewheel:'../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-tooltip,base,leoUi,ready', function($) {

    var a = $.leoTooltip({

        position:{

            orientation:'random',//topLeft,topCenter,topRight,leftTop,leftCenter,leftBottom,bottomLeft,bottomCenter,bottomRight,rightTop,rightCenter,rightBottom,random;

            toCenterOffset:"0",

            of:$("#botton_1")

        },

        arrow:true

    }),str,arr;


    $("#botton_1").click(function(event) {

        if(a.tooltipState() ==="close"){

            arr=['asdfsdfads','adfafd','aadsf','adfads','adfasfd'];

            str = ran(arr,$.leoTools.random);

            a.option({'content':str})

            a.show();

        }else if(a.tooltipState() === "open"){

            // a.option({'disabled':true})

            // a.hide();

             a.option({'arrow':false, 'distance':100,"arrowHeight":"100"})

        }

    });

    var b = $.leoTooltip({

        position:{

            orientation:'random',//topLeft,topCenter,topRight,leftTop,leftCenter,leftBottom,bottomLeft,bottomCenter,bottomRight,rightTop,rightCenter,rightBottom,random;

            toCenterOffset:"-50%",

            of:$("#botton_2")

        },

        'content':"strsssssssssssssss666666666666666666666666666666666666666666666666666666666666666666sssssssssssssssssssssss"

    }),str,arr;


    $("#botton_2").click(function(event) {

        // a.option({'arrow':true})

        if(b.tooltipState() ==="close"){

            // arr=['asdfsdfads','strsssssssssssssss666666666666666666666666666666666666666666666666666666666666666666sssssssssssssssssssssss','aadsf','adfads','adfasfd'];

            // str = ran(arr,$.leoTools.random);

            // b.option({'content':"str","position.toCenterOffset":"0"});

            b.show();

        }else if(b.tooltipState() === "open"){

            // b.option({'content':'strsssssssssssssss666666666666666666666666666666666666666666666666666666666666666666sssssssssssssssssssssss'});
            // b.option({"position.orientation":"bottomCenter"});
            // b.option({"distance":"100"});

            // b.option({'arrowHeight':100})

            // b.option({'closeClassName':false})

            b.hide();

        }

    });

    function ran(arr,random){

        arr.length = random(1,arr.length - 1);

        return arr.join(' ');

    }

});

