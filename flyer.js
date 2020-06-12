/*const firebase = require('./firebase');*/
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/*const db = firebase.initApp;*/
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.0 Safari/537.36';
const url = 'https://flipp.com/flyers/groceries?postal_code=';
let pc = 'L6X5C5';

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: ""
});
const db = admin.firestore();

class FlyerItem {
    constructor(name, id, store, link) {
        this.name = name; // string
        this.id = id; // number
        this.store = store; // string
        this.link = link; // string

        this.startDate = admin.firestore.Timestamp.fromDate(new Date(2020, 4, 14, 0, 0, 0));
        this.endDate = admin.firestore.Timestamp.fromDate(new Date(2020, 4, 20, 23, 59, 59));
    }

    setPrice(price) {
        this.price = price; // number
    }

    setServing(serving) {
        this.serving = serving; // string
    }

    setStartDate(date){
        this.startDate = date; // date
    }

    setEndDate(date) {
        this.endDate = date; // date
    }
}

function Store(name, link) {
    this.name = name;
    this.link = link;
}

const items = [];
const shops = [
    new Store('Food Basics', 'https://flipp.com/en-ca/brampton-on/flyer/3451547-food-basics-flyer?postal_code=' + pc),
    new Store('No Frills', 'https://flipp.com/en-ca/brampton-on/flyer/3452455-no-frills-weekly-flyer?postal_code=' + pc),
    new Store('FreshCo', 'https://flipp.com/en-ca/brampton-on/flyer/3451650-freshco-flyer?postal_code=' + pc),
    new Store('Walmart','https://flipp.com/en-ca/brampton-on/flyer/3501678-walmart-flyer?postal_code=' + pc)
];

(async () => {
    const browser = await puppeteer.launch(
        {
            /*slowMo: 250,*/
            headless: true
        }
    );
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.goto(url + pc);
    console.log(pc);
    await page.waitForSelector('.content');
    /*await page.waitFor(2000);*/

    /*await page.content().then((html) => { // ADD SCROLL
        const $ = cheerio.load(html);
        $('a[class=flyer-container]').each(async function (i) {
            shops[i] = new Store($(this).find($('p[class=flyer-name]')).text().trim('Flyer').trimEnd(), 'https://flipp.com' + $(this).attr('href'));
            console.log(shops[i].name + ': ' + shops[i].link);
        });
    });*/

    let name, id, store, link, price;
    for (let shop of shops) {
        store = shop.name;
        await page.goto(shop.link);
        await page.waitForNavigation();
        await page.waitFor(2000);
        await page.waitForSelector('canvas');
        await page.content().then((html) => {
            const $ = cheerio.load(html);
            $('a[class=item-container]').each(async function () {
                name = $(this).attr('aria-label');
                id = Number($(this).attr('itemid'));
                link = 'https://flipp.com' + $(this).attr('href');
                items.push(new FlyerItem(name, id, store, link));
            });
        });
    }
    console.log(items.length);
    for (let item of items) {
        await page.goto(item.link);
        await page.waitForNavigation();
        await page.waitFor(1000);
        await page.waitForSelector('flipp-item-dialog');
        await page.content().then(async (html) => {
            const $ = cheerio.load(html);
            price = Number($('flipp-price').attr('value'));
            if (!isNaN(price)) {
                item.setPrice(price);
                item.setServing($('.description').find($('span')).text());
                db.collection('general-flyers').add(JSON.parse(JSON.stringify(item))).then(() => console.log('DONE')).catch(err => console.log(err));
                console.log(item.store + ': ' + item.name + ' -- $' + item.price);
            } else {
                console.log('NOPE ----------------');
                items.splice(item, 1);
            }
        });
    }
    console.log(items.length);

    await browser.close();
})();
