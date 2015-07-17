var http = require('http'), url = require('url'), util = require('util');

http.createServer(function(req, res) {

	res.writeHead(200, {'Access-Control-Allow-Origin': '*'});

	var query = url.parse(req.url, true).query,

	pageSize = query.pageSize, page = query.page,

	data, len, totalItems = 100000, totalpages, fristItem, lastItem,

	contact = ["Andrew", "Nancy", "Shelley", "Regina", "Yoshi", "Antoni", "Mayumi", "Ian", "Peter", "Lars", "Petra", "Martin", "Sven", "Elio", "Beate", "Cheryl", "Michael", "Guylene"],

	address = ['广东省广州市越秀区中山六路109', '广东省广州市越秀区中山六路101号', ' 广东省广州市越秀区中山六路97号', '广东省广州市越秀区中山六路23号', '广东省广州市越秀区中山六路89号', '广东省广州市越秀区中山一路95号', '广东省广州市越秀区中山六路9212号', '广东省广州市中山六路95号', '广东省广州市越秀区中山六路935号', '广东省广州市越秀区中山六路95号', '广东省广州市95号', '广东省广州市越秀区中山六路235号'],

	phone = ['159', '158', '157', '156', '189', '188', '187', '185'];

	function random(min, max) {

        if (max === undefined) {

            max = min;

            min = 0;

        }

        return min + Math.floor(Math.random() * (max - min + 1));

    };

	function setData(fristItem, lastItem){

		var i = 0, data = [], len = lastItem - fristItem;

		for (; i < len; i++) {

	        var row = {

	        	id: fristItem++,

	        	contact: contact[Math.floor(Math.random() * contact.length)],

	        	mobile: phone[Math.floor(Math.random() * phone.length)] + random(10000000, 99999999),

	        	im: random(10000000, 999999999999),

	        	weixin: random(100000, 999999999),

	        	skype: random(10000, 999999999),

	        	email: (random(10000000, 999999999999) + '.qq.com'),

	        	phone: random(10000000000, 99999999999),

	        	address: address[Math.floor(Math.random() * address.length)],

	        	first: random(0, 1)

	        }

	        data.push(row);

	    }

	    return data;

	}

	page = ~~page;

	page < 1 && (page = 1);

	pageSize = ~~pageSize;

	totalpages = Math.ceil(totalItems / pageSize);

	page > totalpages && (page = totalpages);

	fristItem = (page - 1) * pageSize;

	lastItem = fristItem + pageSize;

	lastItem > totalItems && (lastItem = totalItems);

	data = setData(fristItem, lastItem);

	len = data.length;

	res.end(JSON.stringify({

		pageData: data,

		pageInfo:{

			currentPage: page,

			fristItemShow: fristItem + 1,

			lastItemShow: lastItem,

			currentItems: totalItems,

			isFristPage: page === 1,

			isLastPage: 'none',

			totalpages: totalpages,

			lastPage: totalpages

		}

	}));

}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');