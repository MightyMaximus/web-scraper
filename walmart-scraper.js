const puppeteer = require('puppeteer');
const scrollPageToBottom = require('puppeteer-autoscroll-down')
const cheerio = require('cheerio');
/*const fs = require('fs');*/
const firebase = require('./firebase');

const WalmartItem = require('./structs/WalmartItem.model');
const launch = require('./inputs/launch.json');
const aisles = require('./inputs/aisles.json').aisles;

const collection = 'walmart-inventory';
const db = firebase.initApp.firestore();
let items = [];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 1000 });
    await page.setUserAgent(launch.ua);

    for (let aisle of aisles) {
        await page.goto(aisle.url, { waitUntil: 'load' });

        let next = true;
        while (next) {
            await page.waitFor(5000);
            await page.evaluate(_ => { // Scroll to the very top of the page
                window.scrollTo(0, 0);
            });
            await scrollPageToBottom(page); // Scroll to the bottom of the page with puppeteer-autoscroll-down
            await page.waitFor(5000); // update to optimize speed - run on script completion
            await page.content().then((html) => {
                const $ = cheerio.load(html);
                $('.thumb-inner-wrap').each(function () {
                    let name = $(this).find($('.thumb-header')).text();
                    let link = 'https://www.walmart.ca' + $(this).find($('a[class=product-link]')).attr('href');
                    let id = Number(link.split('/')[6].trim());
                    let image = 'http://' + $(this).find($('img')).first().attr('src').substr(2);
                    let serving = $(this).find($('.description')).text().trim();
                    let priceKG = Number($(this).find($('.price-unit')).find('a').text().trim().replace('$','').replace('/kg',''));
                    let price = $(this).find($('.all-price-sections')).children().eq(1).text().trim();
                    if (price.includes('$')) {
                        price = Number(price.replace('$',''));
                    } else {
                        price = Number(price.replace('¢','')) / 100;
                    }
                    items.push(new WalmartItem(name, link, id, aisle.name, serving, priceKG, price, image));
                    db.collection(collection).where('id', '==', id).get().then(snap => {
                        if (snap.empty) {
                            // also add image
                            db.collection(collection).add(JSON.parse(JSON.stringify(items[items.length - 1]))).catch(err => console.log(err));
                        } else {
                            snap.forEach(doc => { // temporary solution, need to set doc ids to walmart ids
                               db.collection(collection).doc(doc.id).update(JSON.parse(JSON.stringify(items[items.length - 1]))).catch(err => console.log(err));
                            });
                        }
                    });
                    console.log(items[items.length - 1].toString());
                    console.log(image);
                });
                if ($('div[id=acsMainInvite]').length > 0) { // exit out of survey popup
                    page.click('.acsDeclineButton').then(() => console.log('POPUP CLOSED!'));
                }
            }).catch(err => console.log(err));
            await page.click('#loadmore', { waitUntil: 'load' }).catch(() => { // catch if loadmore D/N exist
                next = false;
            });
        }
    }
    /*fs.writeFile('./outputs/walmart-inventory.json', JSON.stringify(items), function(err) {
        if (err) throw err;
        console.log('complete');
    });*/
    browser.close();
})();
