leoUiLoad.config({

    debug: false,

    baseUrl: 'leoUi/',

    alias: {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css',

        leoUiGrid: '../../css/leoUi-grid.css',

        jqueryMousewheel: '../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-tabs,leoUi,ready', function($) {

    $('#tabs').leoTabs({

        append:'#tabs',

        initCallback:function($target){

            $target.leoTabs('openTab',{tid:'tab1',name:'131221',contentHtml:'<iframe id="leoUiManageTabId_15" frameborder="0" style="height:100%;width:100%" src=""></iframe>'});

            $target.leoTabs('openTab');

            $target.leoTabs('openTab', {tid:'tab2', remove: false});

            $target.leoTabs('openTab', {remove: false});

            $target.leoTabs('openTab',{tid:'tab1'});
        }

    });

});