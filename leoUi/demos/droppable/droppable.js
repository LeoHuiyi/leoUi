
$.config({

        level:6,

        baseUrl:'leoUi/',

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

}).require('leoUi-droppable,leoCss,ready', function($) {

    $('.portlet').leoDraggable({
     bClone:true,
     revert:false,
     revertAnimate:true,
     bCloneAnimate:true,
     dragBoxReturnToTarget:true,
     useDroppable:true,
     // cursorAt:{top:10,left:10},

     stopMouseWheel:false,

     proxy: function(source) { //source

       return $(source).clone().css({'z-index':1,width:$(source).width(),position:'fixed'}).insertAfter(source);

     },

     onStartDrag:function(e,darg){

       $(this).css({'opacity':'0.5'})


     },
     onStopDrag:function(){

       $(this).css('opacity','1');

       // $('.portlet').leoRizeBox('destroy');

       // $('.portlet').leoDroppable('destroy')

     }
    })

    $('.portlet').leoDroppable({

     // accept:'#leo',

     onDragEnter:function(e,source,dargBox){

       if(source !== this){

         if($(this).parent()[0] !== $(source).parent()[0] || $(this).index() < $(source).index()){

           $(source).insertBefore(this);

         }else {

           $(source).insertAfter(this);

         }

       }

     },onDrop:function(){

       // console.log(this)

       // return false;

     }

    })
    $('.column').leoDroppable({

     // accept:'#leo',

     onDragEnter:function(e,source,dargBox){

       if(!$.contains( this, source )){

         $(source).appendTo(this);

       }

     }

    });

    $('.connectedSortable>li').leoDraggable({
     bClone:true,
     revert:false,
     revertAnimate:true, 
     bCloneAnimate:true,
     bCloneAnimateDargBox:true,
     onStartDrag:function(e,darg){

       $(this).css({'opacity':'0.5'})
       $(darg).css({'z-index':1})
       $('#sortable>li').leoDraggable({disabled:true});
     },
     onStopDrag:function(){

       $(this).css('opacity','1')

       $('#sortable>li').leoDraggable({disabled:false});

     }
    }).leoDroppable({

     onDragEnter:function(e,source,dargBox){

       if($(this).index() <$(source).index()){

         $(source).insertBefore(this);

       }else{

         $(source).insertAfter(this);

       }

     }
    });

    $('#sortable2').leoDroppable({

     onDragOver:function(e,source,dargBox){

       console.log(1)

     }
    });


});
