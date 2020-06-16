const puppeteer = require('puppeteer');
const fs = require('fs');
const firebase = require('./firebase');

const launch = require('./inputs/launch.json');
const items = require('./outputs/walmart-inventory.json');

const db = firebase.initApp;

(async () => {
    const browser = await puppeteer.launch({
        slowMo: 250,
        headless: false
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 1000 });
    await page.setUserAgent(launch.ua);

    for (let item of items) {
        console.log(item.image);
        let view = await page.goto(item.image, { waitUntil: 'load' }).catch(err => {
            console.log(err);
        });
        fs.writeFile('./outputs/images/' + item.id + '.jpg', await view.buffer(), err => {
            if (err) {
                console.log(err);
            } else {
                console.log(item.name);
            }
        });
        await page.waitFor(4000);
    }
    browser.close();
})();
