
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

leoUiLoad.require('leoUi-selectable,base,leoUi,ready', function($) {

    $( "#selectable" ).leoSelectable({
        stop: function(event, $selected) {

            var result = $( "#select-result" ).empty();

            $selected.each(function() {
                var index = $( "#selectable li" ).index( this );
                result.append( " #" + ( index + 1 ) );
            });
        }
    });

    $( "#selectable1" ).leoSelectable();

    $("#botton_1").click(function(event) {
        $( "#selectable" ).leoSelectable('destroy');
        $( "#selectable" ).leoSelectable('option','disabled',true);

    });

});
