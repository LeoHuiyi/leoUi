
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

leoUiLoad.require('leoUi-template,ready', function($) {

    var data={
            value1:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value2:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value3:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value4:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value5:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value6:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value7:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span><span style="color:red;">\\\'\"</span>',
            value8:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span><span style="color:red;">\\\'\"</span>',
            value9:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value10:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value14:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value15:'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>',
            value16:['<span style="color:red;">这是value</span>',123,'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>'],
            value17:['<span style="color:red;">这是value</span>',123,'<span style="color:red;">http://wangxiao.github.com/BaiduTemplate/</span>']
        };
        
        //使用
        var bat=$.leoTools.template;
        
        //设置分隔符
        //bat.LEFT_DELIMITER='<!';
        //bat.RIGHT_DELIMITER='!>';

        //设置默认是否转义
        //bat.ESCAPE = false;

        var timestart = new Date().getTime();

        //输出函数
        var fun=bat('t:_1234-abcd-1',false, {

            leftDelimit: '{{',

            rightDelimit: '%>',

            htmlEncode: true

        });

        var timeend = new Date().getTime();

        alert('最大话编译一次时间：'+(timeend-timestart)+'毫秒');

        timestart = new Date().getTime();

        //输出HTML
        var html=bat('t:_1234-abcd-1',data);

        timeend = new Date().getTime();

        alert('运行时间：'+(timeend-timestart)+'毫秒');

        //显示结果
        document.getElementById('results').innerHTML=html;
});
