//tooltip
leoUiLoad.config({

    debug: true,

    baseUrl:'/leoUi/',

    alias : {

        leoCss : '../../css/leo.css',

        jqueryMousewheel:'../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-tooltip,leoCss,ready', function($) {

    var a = $.leoTooltip({

        position:{

            positionStr:'random',//topLeft,topCenter,topRight,leftTop,leftCenter,leftBottom,bottomLeft,bottomCenter,bottomRight,rightTop,rightCenter,rightBottom,random;

            toCenterOffset:"0"

        }

    }),str,arr;

    a.setOfTraget( $("#botton_1") );


    $("#botton_1").click(function(event) {

        if(a.tooltipState() ==="close"){

            arr=['asdfsdfads','adfafd','aadsf','adfads','adfasfd'];

            str = ran(arr,$.leoTools.random);

            a.option({'content':str})

            a.setOfTraget( $("#botton_1") );

            a.show();

        }else if(a.tooltipState() === "open"){

            // a.option({'arrow':false})

            // a.option({"isPositionStr":false});

            // a.option({'disabled':true})

            a.hide();

        }

    });

    var b = $.leoTooltip({

        position:{

            positionStr:'random',//topLeft,topCenter,topRight,leftTop,leftCenter,leftBottom,bottomLeft,bottomCenter,bottomRight,rightTop,rightCenter,rightBottom,random;

            toCenterOffset:"-25%"

        }

    }),str,arr;

    b.setOfTraget( $("#botton_1") );


    $("#botton_2").click(function(event) {

        // a.option({'arrow':true})

        if(b.tooltipState() ==="close"){

            arr=['asdfsdfads','adfafd','aadsf','adfads','adfasfd'];

            str = ran(arr,$.leoTools.random);

            b.option({'content':str,"position.toCenterOffset":"-50%"});

            b.setOfTraget( $("#botton_2") );

            b.show();

        }else if(b.tooltipState() === "open"){

            // b.option({'disabled':true})

            b.hide();

        }

    });

    function ran(arr,random){

        arr.length = random(1,arr.length - 1);

        return arr.join(' ');

    }

});

