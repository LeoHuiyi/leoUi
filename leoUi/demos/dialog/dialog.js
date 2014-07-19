
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

}).require('leoUi-dialog,leoCss,ready', function($) {

    var a = $.leoDialog({

        appendTo: 'body',

        contentHtml :'<div id="delete_image">'
            +       '<div class="send_content clearfix">'
            +           '<div class="text">'
            +               '<span class="icon"></span>'
            +               '<span class="title">标题内容</span>'
            +           '</div>'
            +           '<div class="send_bottom clearfix">'
            +               '<input class="send_submit" type="submit" value="改变按钮" name="submit" />'
            +               '<input class="send_off" type="submit" value="取消" name="submit" />'
            +           '</div>'
            +       '</div>'
            +   '</div>',

        captionButtons: {
            refresh: false
        },

        height: 190,

        resizableOption: {

            containment: 'parent',

            stopMouseWheel: true

            // minWidth:50,

            //               minHeight:57

        },

        quickClose:false,

        draggableOption: {

            containment: 'parent',

            stopMouseWheel: false

        },

        initDraggable: true,

        restore: false,

        modal: false

    });

    var b = $.leoDialog({

      appendTo:'body',

      dialogHtml: '<div class="leoDialog">'
              +               '<div class="leoDialog_titlebar leoUi_clearfix">'
              +                   '<span class="leoDialog_title">标 题</span>'
              +               '</div>'
              +               '<div class="leoDialog_content leoDialog_content_iframe">'
              +               '</div>'
              +           '</div>',

      contentHtml:'<iframe style="width:100%;height:100%;" frameborder="0" src="http://baidu.com"></iframe>',

      fixIframeMask:true,

      captionButtons:{refresh:true},

      width:600,

      height:300,

      showAnimation: function(callBack) {

          this.show( 500, callBack );

    },

      hideAnimation: function(callBack) {

            this.hide( 500, callBack );

        },

      resizableOption:{

          containment:'parent',

          iframeFix:true

      },

      draggableOption:{

          containment: 'parent',

          iframeFix:true

      },

      initDraggable:true,

      restore:false,

      modal:false

    });

    $('#botton_1').on('click', function() {


        if(a.dialogState() ==="close"){

            a.dialogShow();

        }else if(a.dialogState() === "open"){

            a.dialogHide();
        }


        a.option('okCallback', function(event, disabled, enable) {

            a.option('captionButtons',{

                 pin: false,

                 toggle: false,

                 minimize: false,

                 maximize: false,

                 close: true

             });
            // a.option('draggableOption.stopMouseWheel', true)
            // a.option('scope','all' );
            // a.option({width:200,height:500,'position':{
            // disabled()
            // my: "center",

            // at: "right top",

            // of: window,

            // collision: "fit",using: function( pos ) {

            //   var topOffset = $( this ).css( pos ).offset().top;

            //   if ( topOffset < 0 ) {

            //       $( this ).css( "top", pos.top - topOffset );

            //   }

            // }} })


            // a.option({width:200,height:500,'position.at':'right top'} )

        })

        a.option('cancelCallback', function(event, disabled, enable) {

            a.destroy();

            a=null;

        })
    })

    $('#botton_2').on('click', function() {


        b.dialogShow();


    })


});
