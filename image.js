const puppeteer = require('puppeteer');
const fs = require('fs');
const firebase = require('./firebase');

const launch = require('./inputs/launch.json');
const items = require('./outputs/walmart-inventory.json').list;

const storage = firebase.initApp.storage();

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 1000 });
    await page.setUserAgent(launch.ua);

    for (let i = 1368; i < items.length; i++) {
        console.log(items[i].name);
        let view = await page.goto(items[i].image, { waitUntil: 'load' }).catch(err => {
            console.log(err);
        });
        fs.writeFile('./outputs/images/' + items[i].aisle + '/' + items[i].id + '.jpg', await view.buffer(), err => {
            if (err) {
                console.log(err);
            } else {
                console.log(items[i].image);
            }
        });
        /*console.log(items[i].image);*/
        await page.waitFor(3000);
    }
    /*const bucket = storage.bucket().;
    const path = './outputs/images/';
    for (let item of items) {
        let file = path + item.id + '.jpg';
        bucket.upload(file, {
            gzip: true,
        }).catch(err => console.log(err));
        break;
    }*/
    browser.close();
})();
