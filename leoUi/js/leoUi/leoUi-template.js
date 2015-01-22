/**
 * baiduTemplate简单好用的Javascript模板引擎 1.0.6 版本
 * http://baidufe.github.com/BaiduTemplate
 * 开源协议：BSD License
 * 浏览器环境占用命名空间 baidu.template ，nodejs环境直接安装 npm install baidutemplate
 * @param str{String} dom结点ID，或者模板string
 * @param data{Object} 需要渲染的json对象，可以为空。当data为{}时，仍然返回html。
 * @return 如果无data，直接返回编译后的函数；如果有data，返回html。
 * @author wangxiao
 * @email 1988wangxiao@gmail.com
*/

;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($){

	$.leoTools = $.leoTools || {};

	$.leoTools.template = (function() {

        var DefaultOp = {

            leftDelimit: '<%',

            rightDelimit: '%>',

            htmlEncode: true

        },cache = {},

        //转义影响正则的字符
        _encodeReg = function (source) {

            return String(source).replace(/([.*+?^=!:${}()|[\]/\\])/g,'\\$1');

        },

        //将字符串拼接生成函数，即编译过程(compile)
        _compile = function(str, op){

            var funBody = "var _template_fun_array=[];\nvar fn=(function(__data__){\nvar _template_varName='';\nfor(name in __data__){\n_template_varName+=('var '+name+'=__data__[\"'+name+'\"];');\n};\neval(_template_varName);\n_template_fun_array.push('"+_analysisStr(str, op)+"');\n_template_varName=null;\n})(_template_object);\nfn = null;\nreturn _template_fun_array.join('');\n";

            return new Function("_template_object", funBody);

        },

        //解析模板字符串
        _analysisStr = function(str, op){

            var _left_,_right_,_left,_right;

            //取得分隔符
            _left_ = op.leftDelimit;

            _right_ = op.rightDelimit;

            //对分隔符进行转义，支持正则中的元字符，可以是HTML注释 <! !>
            _left = _encodeReg(_left_);

            _right = _encodeReg(_right_);

            str = String(str)
            //去掉分隔符中js注释
            .replace(new RegExp("("+_left+"[^"+_right+"]*)//.*\n","g"), "$1")
            //去掉注释内容 <%* 这里可以任意的注释 *%>
            //默认支持HTML注释，将HTML注释匹配掉的原因是用户有可能用 <! !>来做分割符
            .replace(new RegExp("<!--.*?-->", "g"),"")
            .replace(new RegExp(_left+"\\*.*?\\*"+_right, "g"),"")
            //把所有换行去掉 \r回车符 \t制表符 \n换行符
            .replace(new RegExp("[\\r\\t\\n]","g"), "")
            //用来处理非分隔符内部的内容中含有 斜杠 \ 单引号 ‘ ，处理办法为HTML转义
            .replace(new RegExp(_left+"(?:(?!"+_right+")[\\s\\S])*"+_right+"|((?:(?!"+_left+")[\\s\\S])+)","g"),function (item, $1) {

                var str = '';

                if($1){

                    //将 斜杠 单引 HTML转义
                    str = $1.replace(/\\/g,"&#92;").replace(/'/g,'&#39;');

                    while(/<[^<]*?&#39;[^<]*?>/g.test(str)){

                        //将标签内的单引号转义为\r 结合最后一步，替换为\'
                        str = str.replace(/(<[^<]*?)&#39;([^<]*?>)/g,'$1\r$2');

                    };

                }else{

                    str = item;

                }

                return str;

            });

            str = str
            //定义变量，如果没有分号，需要容错 <%var val='test'%>
            .replace(new RegExp("("+_left+"[\\s]*?var[\\s]*?.*?[\\s]*?[^;])[\\s]*?"+_right,"g"),"$1;"+_right_)
            //对变量后面的分号做容错(包括转义模式 如<%:h=value%>) <%=value;%> 排除掉函数的情况 <%fun1();%> 排除定义变量情况 <%var val='test';%>
            .replace(new RegExp("("+_left+":?[hvu]?[\\s]*?=[\\s]*?[^;|"+_right+"]*?);[\\s]*?"+_right,"g"),"$1"+_right_)
            //按照 <% 分割为一个个数组，再用 \t 和在一起，相当于将 <% 替换为 \t
            //将模板按照<%分为一段一段的，再在每段的结尾加入 \t,即用 \t 将每个模板片段前面分隔开
            .split(_left_).join("\t");

            //支持用户配置默认是否自动转义
            if(op.htmlEncode){

                str = str
                //找到 \t=任意一个字符%> 替换为 ‘，任意字符,'
                //即替换简单变量 \t=data%> 替换为 ',data,'
                //默认HTML转义 也支持HTML转义写法<%:h=value%>
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':$.leoTools.template._encodeHTML($1),'");

            }else{

                str = str
                //默认不转义HTML转义
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':$1,'");

            };

            str = str
            //支持HTML转义写法<%:h=value%>
            .replace(new RegExp("\\t:h=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':$.leoTools.template._encodeHTML($1),'")
            //支持不转义写法 <%:=value%>和<%-value%>
            .replace(new RegExp("\\t(?::=|-)(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':$1,'")
            //支持url转义 <%:u=value%>
            .replace(new RegExp("\\t:u=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':encodeURIComponent($1),'")
            //支持UI 变量使用在HTML页面标签onclick等事件函数参数中 <%:v=value%>
            .replace(new RegExp("\\t:v=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':$.leoTools.template._encodeEventHTML($1),'")
            //将字符串按照 \t 分成为数组，在用'); 将其合并，即替换掉结尾的 \t 为 ');
            //在if，for等语句前面加上 '); ，形成 ');if ');for 的形式
            .split("\t").join("');")
            //将 %> 替换为_template_fun_array.push('
            //即去掉结尾符，生成函数中的push方法
            //如：if(list.length=5){%><h2>',list[4],'</h2>');}
            //会被替换为 if(list.length=5){_template_fun_array.push('<h2>',list[4],'</h2>');}
            .split(_right_).join("_template_fun_array.push('")
            //将 \r 替换为 \
            .split("\r").join("\\'");

            return str;

        };

        return function(str, data, option){

            var op = $.extend({}, DefaultOp, option);

            //检查是否有该id的元素存在，如果有元素则获取元素的innerHTML/value，否则认为字符串为模板
            var fn = (function(){

                //判断如果没有document，则为非浏览器环境
                if(!window.document){

                    return _compile(str, op);

                };

                //HTML5规定ID可以由任何不包含空格字符的字符串组成
                var element = document.getElementById(str);

                if (element) {

                    //取到对应id的dom，缓存其编译后的HTML模板函数
                    if (cache[str]) {

                        return cache[str];

                    };
                    //textarea或input则取value，其它情况取innerHTML
                    var html = /^(textarea|input)$/i.test(element.nodeName) ? element.value : element.innerHTML,

                    compile = _compile(html, op);

                    cache[str] = compile;

                    return compile;

                }else{

                    //是模板字符串，则生成一个函数
                    //如果直接传入字符串作为模板，则可能变化过多，因此不考虑缓存
                    return _compile(str, op);

                };

            })();

            //有数据则返回HTML字符串，没有数据则返回函数 支持data={}的情况
            var result = $.isPlainObject(data) ? fn( data ) : fn;

            fn = null;

            return result;

        }

    })();

    //HTML转义
    $.leoTools.template._encodeHTML = function (source) {

        return String(source).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\/g,'&#92;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

    };

    //转义UI UI变量使用在HTML页面标签onclick等事件函数参数中
    $.leoTools.template._encodeEventHTML = function (source) {

        return String(source).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\\\\/g,'\\').replace(/\\\//g,'\/').replace(/\\n/g,'\n').replace(/\\r/g,'\r');

    };

    return $;

}));