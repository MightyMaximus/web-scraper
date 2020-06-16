class WalmartItem {
    constructor(name, link, id, aisle, serving, priceKG, price, image) { // add image
        this.name = name; // string
        this.link = link; // string
        this.id = id; // number
        this.aisle = aisle; // string
        this.serving = serving; // string
        this.priceKG = priceKG; // number
        this.price = price; // number
        this.image = image;
    }

    toString() {
        return (this.id + ': ' + this.aisle + ' - ' + this.name + ' -- $' + this.price);
    }
}

module.exports = WalmartItem;
