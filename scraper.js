const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

var admin = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");

const AISLES = [
    {
        name: 'Fruits & Vegetables',
        url: 'https://www.walmart.ca/en/grocery/fruits-vegetables/N-3799'
    },
    {
        name: 'Dairy & Eggs',
        url: 'https://www.walmart.ca/en/grocery/dairy-eggs/N-3798'
    },
    {
        name: 'Meat & Seafood',
        url: 'https://www.walmart.ca/en/grocery/meat-seafood/N-3793'
    },
    {
        name: 'Natural & Organic',
        url: 'https://www.walmart.ca/en/grocery/natural-organic-food/N-3992'
    },
    {
        name: 'Pantry food',
        url: 'https://www.walmart.ca/en/grocery/pantry-food/N-3794'
    },
    {
        name: 'International Foods',
        url: 'https://www.walmart.ca/en/grocery/international-foods/N-4356'
    },
    {
        name: 'Frozen Food',
        url: 'https://www.walmart.ca/en/grocery/frozen-food/N-3795'
    },
    {
        name: 'Ice Cream & Treats',
        url: 'https://www.walmart.ca/en/grocery/frozen-food/ice-cream-treats/N-3828'
    },
    {
        name: 'Chips & Snacks',
        url: 'https://www.walmart.ca/en/grocery/pantry-food/chips-snacks/N-3842'
    },
    {
        name: 'Cereal & Breakfast',
        url: 'https://www.walmart.ca/en/grocery/pantry-food/cereal-breakfast/N-3830'
    },
    {
        name: 'Deli & Ready Made Meals',
        url: 'https://www.walmart.ca/en/grocery/deli-ready-made-meals/N-3792'
    },
    {
        name: 'Household Supplies',
        url: 'https://www.walmart.ca/en/grocery/household-supplies/N-3803'
    },
    {
        name: 'Health, Beauty, & Pharmacy',
        url: 'https://www.walmart.ca/en/grocery/health-beauty-pharmacy/N-3800'
    },
    {
        name: 'Baby',
        url: 'https://www.walmart.ca/en/grocery/baby/N-3789'
    },
    {
        name: 'Bakery',
        url: 'https://www.walmart.ca/en/grocery/bakery/N-3796'
    },
    {
        name: 'Drinks',
        url: 'https://www.walmart.ca/en/grocery/drinks/N-3791'
    },
    {
        name: 'Home & Outdoor',
        url: 'https://www.walmart.ca/en/grocery/home-outdoor/N-8584'
    },
    {
        name: 'Pets',
        url: 'https://www.walmart.ca/en/grocery/pets/N-3797'
    }
];
let items = [];
function Item(name, aisle, serving, priceKG, price) { // add image
    this.name = name;
    this.aisle = aisle;
    this.serving = serving;
    this.priceKG = priceKG;
    this.price = price;
}

function scrape(html) {
}

(async () => {
    const browser = await puppeteer.launch(
        {
            headless: true
        }
    );
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.0 Safari/537.36');
    let j = 1;
    for (let i = 0; i < AISLES.length; i++) {
        await page.goto(AISLES[i].url);
        let next = true;
        while (next) {
            await page.waitFor(5000); // update to optimize speed - run on script completion
            await page.content().then((html) => {
                const $ = cheerio.load(html);
                $('div[class=product-details-container]').each(function (i) {
                    let name = $(this).find($('.thumb-header')).text();
                    let aisle = 'AISLES[i].name';
                    let serving = $(this).find($('.description')).text().trim();
                    let priceKG = $(this).find($('.price-unit')).find('a').text().trim();
                    let price = $(this).find($('.all-price-sections')).children().eq(1).text().trim();
                    items[i] = new Item(name, aisle, serving, priceKG, price);
                    console.log(name + ': ' + serving + ' --- ' + priceKG + ' --- ' + price);
                });
                if ($('div[id=acsMainInvite]').length > 0) { // exit out of survey popup
                    page.click('.acsDeclineButton');
                    console.log('POPUP CLOSED! =====================================================================');
                }
                console.log('******************************************* ' + j);
            });
            await page.click('#loadmore').catch(() => {
                next = false;
                console.log('done :)');
            });
            j++;
        }
    }
    browser.close();
})();
