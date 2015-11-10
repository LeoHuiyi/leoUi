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

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-droppable,base,leoUi,ready', function($) {

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
            }).removeAttr('id').insertAfter(source);

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

        checkFirst:false,

        onDragEnter: function( e, drop, dargBox ) {

            var source = dargBox.box,$drag,$drop;

            if (source !== this) {

                $drag = $(source);

                $drop = $(this);

                if($drag.parent()[0] !== $drop.parent()[0]){

                    $drag.insertBefore(this).leoDraggable('setDropsProp');

                }else if($drop.index() < $drag.index()){

                    $drag.insertBefore(this).leoDraggable('setDropsProp');

                }else if(!$drop.is('.portlet-last')){

                    $drag.insertAfter(this).leoDraggable('setDropsProp');

                }

            }

        },
        onDrop: function() {

            // console.log(this)

            // return false;

        }

    })
    // $('.column').leoDroppable({

    //     // accept:'#leo',

    //     checkFirst:false,

    //     onDragEnter: function( e, drop, dargBox ) {

    //         var source = dargBox.box;

    //         if (!$.contains(this, source)) {

    //             $(source).appendTo(this);

    //         }

    //     }

    // });

    $('#scroll').leoDraggable({
        bClone: true,
        revert: false,
        revertAnimate: true,
        bCloneAnimate: true,
        dragBoxReturnToTarget: true,
        droppableScope:'scroll',
        useLeoDroppable: true,
        // cursorAt:{top:10,left:10},

        stopMouseWheel: false,

        proxy: function(source) { //source

            return $(source).clone().css({
                'z-index': 1,
                width: $(source).width(),
                position: 'fixed'
            }).removeAttr('id').insertAfter(source);

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

    $('#scroll_drop').leoDroppable({

        accept:'#scroll',

        scope:'scroll',

        onDragEnter: function( e, drop, dargBox ) {

            // console.log(drop)

            // console.log(dargBox)


            alert('碰撞')

        }
    })

    $('#botton_1').on('click', function(event) {
        event.preventDefault();

        $('.portlet').leoDroppable('option','scope','leo');

        $('.column').leoDroppable('destroy');

    });


});