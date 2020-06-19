const fs = require('fs');
const firebase = require('./firebase');
/*const Item = require('./structs/Item.model');*/
const items = require('./outputs/inventory.json');

const db = firebase.initApp.firestore();
const collection = 'walmart-inventory';
/*const file = './outputs/inventory2.json';*/

function duplicates(array) {
    let map = new Map();
    for (let item of array) {
        if (item.id == null) continue;
        if (map.has(item.id)) {
            let ref = map.get(item.id);
            if (!ref.aisles.includes(item.aisles[0])) {
                ref.aisles.push(item.aisles[0]);
            }
        } else map.set(item.id, item);
    }
    console.log(map.size);
    return map;
}

function write(file) {
    fs.writeFile(file, JSON.stringify(items), function(err) {
        if (err) console.log(err);
    });
}

(async () => {
    const map = duplicates(items);
    console.log(items.length);
    for (const [key, value] of map.entries()) {
        db.collection(collection).doc(key.toString()).set((JSON.parse(JSON.stringify(value)))).catch(err => console.log(err));
    }
})();
