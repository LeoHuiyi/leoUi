/**
+-------------------------------------------------------------------
* jQuery leoUi--tabs
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    var mouseHandled = false;

    $( document ).mouseup( function() {

        mouseHandled = false;

    });

    $.leoTools.plugIn({

        name:'leoTabs',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            

        },

        _init: function(){

            

        },



    });

    return $;

}));