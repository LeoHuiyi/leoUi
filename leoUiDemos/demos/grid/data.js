function getData(length) {

    var row, i = 0,
        arr = [],

        contact = ["Andrew", "Nancy", "Shelley", "Regina", "Yoshi", "Antoni", "Mayumi", "Ian", "Peter", "Lars", "Petra", "Martin", "Sven", "Elio", "Beate", "Cheryl", "Michael", "Guylene"],

        address = ['广东省广州市越秀区中山六路109', '广东省广州市越秀区中山六路101号', ' 广东省广州市越秀区中山六路97号', '广东省广州市越秀区中山六路23号', '广东省广州市越秀区中山六路89号', '广东省广州市越秀区中山一路95号', '广东省广州市越秀区中山六路9212号', '广东省广州市中山六路95号', '广东省广州市越秀区中山六路935号', '广东省广州市越秀区中山六路95号', '广东省广州市95号', '广东省广州市越秀区中山六路235号'],

        phone = ['159', '158', '157', '156', '189', '188', '187', '185'];

    while (length--) {

        row = {

            id: i++,

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

        arr.push(row);

    }

    return arr;

}

return getData(10000)
