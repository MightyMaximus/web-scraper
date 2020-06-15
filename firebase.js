function initApp() {
    const admin = require("firebase-admin");
    const serviceAccount = require("./inputs/serviceAccountKey.json");
    const launch = require("./inputs/launch.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: launch.databaseURL
    });
    return admin.firestore();
}

module.exports.initApp = initApp();
