(function(){
	var aHtml5 = ['article','aside','audio','bdi','canvas','command','datalist','details','figcaption','figure','footer','header','hgroup','keygen','mark','meter','nav','output','progress','rp','rt','ruby','section','source','summary','time','track','vedio'];
    var iHtml5 = aHtml5.length;
    for(var i=0;i<iHtml5;i++){
		document.createElement(aHtml5[i]);
	}
})();