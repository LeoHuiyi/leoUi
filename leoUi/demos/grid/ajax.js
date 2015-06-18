var http = require('http'), url = require('url'), util = require('util');

http.createServer(function(req, res) {

	res.writeHead(200, {'Access-Control-Allow-Origin': '*'});

	var query = url.parse(req.url, true).query, data, len,

	pageSize = query.pageSize, page = query.page, totalpages = 20,

	contact = ["Andrew", "Nancy", "Shelley", "Regina", "Yoshi", "Antoni", "Mayumi", "Ian", "Peter", "Lars", "Petra", "Martin", "Sven", "Elio", "Beate", "Cheryl", "Michael", "Guylene"],

	address = ['广东省广州市越秀区中山六路109', '广东省广州市越秀区中山六路101号', ' 广东省广州市越秀区中山六路97号', '广东省广州市越秀区中山六路23号', '广东省广州市越秀区中山六路89号', '广东省广州市越秀区中山一路95号', '广东省广州市越秀区中山六路9212号', '广东省广州市中山六路95号', '广东省广州市越秀区中山六路935号', '广东省广州市越秀区中山六路95号', '广东省广州市95号', '广东省广州市越秀区中山六路235号'];

	function random(min, max) {

        if (max === undefined) {

            max = min;

            min = 0;

        }

        return min + Math.floor(Math.random() * (max - min + 1));

    };

	function setData(pageSize, page){

		var i = 0, data = [], id = (page - 1) * pageSize;

		for (; i < pageSize; i++) {

	        var row = {

	        	id: id,

	        	contact: contact[Math.floor(Math.random() * contact.length)],

	        	mobile: random(100000000, 999999999),

	        	im: random(10000000, 999999999999),

	        	weixin: random(100000, 999999999),

	        	skype: random(10000, 999999999),

	        	email: (random(10000000, 999999999999) + '.qq.com'),

	        	phone: random(10000000000, 99999999999),

	        	address: address[Math.floor(Math.random() * address.length)],

	        }

	        id++;

	        data.push(row);

	    }

	    return data;

	}

	page = page >> 0;

	page > totalpages && (page = totalpages);

	data = setData(pageSize, page);

	len = data.length;

	res.end(JSON.stringify({

		pageData: data,

		pageInfo:{

			currentPage: page,

			fristItemShow: data[0].id + 1,

			lastItemShow: data[len - 1].id + 1,

			currentItems: len * totalpages,

			isFristPage: page === 1,

			isLastPage: 'none',

			totalpages: totalpages,

			lastPage: totalpages

		}

	}));

}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');