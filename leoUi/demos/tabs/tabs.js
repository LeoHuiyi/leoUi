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
    var name = 'tab_1111111111111',i=1;
    $('#tabs').leoTabs({

        append:'#tabs',

        initCallback:function($target){

            $target.leoTabs('openTab',{tid:'tab1',name:'131221',contentHtml:'<iframe id="leoUiManageTabId_15" frameborder="0" style="height:100%;width:100%" src="3434543"></iframe>'});

            $target.leoTabs('openTab',{contentHtml:'newTab1'});

            $target.leoTabs('openTab', {tid:'tab2', remove: false,contentHtml:'newTab2'});

            $target.leoTabs('openTab', {remove: false,contentHtml:'newTab3'});

            $target.leoTabs('openTab',{tid:'tab1'});
        },

        limitLen:100

    });

    $('#button').on('click', function(event) {
        event.preventDefault();
        var str = name + i++;
        str = str.slice(0,$.leoTools.random(7,20));
        $('#tabs').leoTabs('openTab',{name: str,contentHtml:str});
    });

    $('#destroy').on('click', function(event) {
        event.preventDefault();
        $('#tabs').leoTabs('destroy');
    });
});