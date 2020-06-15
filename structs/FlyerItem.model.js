class FlyerItem {
    constructor(name, id, store, link) {
        this.name = name; // string
        this.id = id; // number
        this.store = store; // string
        this.link = link; // string

        /*this.startDate = admin.firestore.Timestamp.fromDate(new Date(2020, 4, 14, 0, 0, 0));
        this.endDate = admin.firestore.Timestamp.fromDate(new Date(2020, 4, 20, 23, 59, 59));*/
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

    toString() {
        return (this.store + ' -- ' + this.id + ': ' + this.name + ' -- $' + this.price);
    }
}

module.exports = FlyerItem;
