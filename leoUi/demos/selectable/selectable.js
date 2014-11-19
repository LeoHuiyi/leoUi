//selectable

leoUiLoad.config({

    debug:true,

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

leoUiLoad.require('leoUi-selectable,leoCss,ready', function($) {

    $( "#selectable" ).leoSelectable({
        stop: function(a,b) {

            var result = $( "#select-result" ).empty();
            $( ".leoUi-selected", this ).each(function() {
                var index = $( "#selectable li" ).index( this );
                result.append( " #" + ( index + 1 ) );
            });
        }
    });

    $("#botton_1").click(function(event) {
        $( "#selectable" ).leoSelectable('option','disabled',true);

    });

});
