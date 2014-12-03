leoUiLoad.config({

    debug: true,

    baseUrl: 'leoUi/',

    alias: {

        leoCss: '../../css/leo.css',

        jqueryMousewheel: '../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-droppable,leoCss,ready', function($) {

    $('.portlet').leoDraggable({
        bClone: true,
        revert: false,
        revertAnimate: true,
        bCloneAnimate: true,
        dragBoxReturnToTarget: true,
        useLeoDroppable: true,
        // cursorAt:{top:10,left:10},

        stopMouseWheel: false,

        proxy: function(source) { //source

            return $(source).clone().css({
                'z-index': 1,
                width: $(source).width(),
                position: 'fixed'
            }).insertAfter(source);

        },

        onStartDrag: function(e, darg) {

            $(this).css({
                'opacity': '0.5'
            })


        },
        onStopDrag: function() {

            $(this).css('opacity', '1');

            // $('.portlet').leoRizeBox('destroy');

            // $('.portlet').leoDroppable('destroy')

        }
    })

    $('.portlet').leoDroppable({

        // accept:'#leo',

        onDragEnter: function( e, drop, dargBox ) {

            var source = dargBox.box;

            if (source !== this) {

                if ($(this).parent()[0] !== $(source).parent()[0] || $(this).index() < $(source).index()) {

                    $(source).insertBefore(this).leoDraggable('setDropsProp');

                } else {

                    $(source).insertAfter(this).leoDraggable('setDropsProp');

                }

            }

        },
        onDrop: function() {

            // console.log(this)

            // return false;

        }

    })
    $('.column').leoDroppable({

        // accept:'#leo',

        onDragEnter: function( e, drop, dargBox ) {

            var source = dargBox.box;

            if (!$.contains(this, source)) {

                $(source).appendTo(this);

            }

        }

    });


});