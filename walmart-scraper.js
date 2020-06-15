const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const firebase = require('./firebase');

const WalmartItem = require('./structs/WalmartItem.model');
const launch = require('./inputs/launch.json');
const aisles = require('./inputs/aisles.json').aisles;

const collection = 'walmart-inventory';
const db = firebase.initApp;
let items = [];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(launch.ua);

    for (let aisle of aisles) {
        await page.goto(aisle.url);
        let next = true;
        while (next) {
            await page.waitFor(5000); // update to optimize speed - run on script completion
            await page.content().then((html) => {
                const $ = cheerio.load(html);
                // $('div[class=thumb-inner-wrap]')
                $('.thumb-inner-wrap').each(function () {
                    let name = $(this).find($('.thumb-header')).text();
                    let link = $(this).find($('a[class=product-link]')).attr('href');
                    let id = Number(link.split('/')[4].trim());
                    /*let image = $(this).find($('img[class=lazy-img]')).attr('src');*/
                    let serving = $(this).find($('.description')).text().trim();
                    let priceKG = Number($(this).find($('.price-unit')).find('a').text().trim().replace('$','').replace('/kg',''));
                    let price = $(this).find($('.all-price-sections')).children().eq(1).text().trim();
                    if (price.includes('$')) {
                        price = Number(price.replace('$',''));
                    } else {
                        price = Number(price.replace('¢','')) / 100;
                    }
                    items.push(new WalmartItem(name, link, id, aisle.name, serving, priceKG, price));
                    db.collection(collection).where('id', '==', id).get().then(snap => {
                        if (snap.empty) {
                            db.collection(collection).add(JSON.parse(JSON.stringify(items[items.length - 1]))).catch(err => console.log(err));
                        } else {
                            snap.forEach(doc => { // temporary solution, need to set doc ids to walmart ids
                               db.collection(collection).doc(doc.id).update(JSON.parse(JSON.stringify(items[items.length - 1]))).catch(err => console.log(err));
                            });
                        }
                    });
                    console.log(items[items.length - 1].toString());
                });
                if ($('div[id=acsMainInvite]').length > 0) { // exit out of survey popup
                    page.click('.acsDeclineButton').then(() => console.log('POPUP CLOSED!'));
                }
            }).catch(err => console.log(err));
            await page.click('#loadmore').catch(() => { // catch if loadmore D/N exist
                next = false;
            });
        }
    }
    browser.close();
})();
