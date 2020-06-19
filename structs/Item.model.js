class Item {
    constructor(name, link, id, aisles, serving, priceKG, price, image) { // add image
        this.name = name; // string
        this.link = link; // string
        this.id = id; // number
        this.aisles = aisles; // string array
        this.serving = serving; // string
        this.priceKG = priceKG; // number
        this.price = price; // number
        this.image = image;
    }

    toString() {
        return (this.id + ': ' + this.aisles.toString() + ' - ' + this.name + ' -- $' + this.price);
    }
}

module.exports = Item;
