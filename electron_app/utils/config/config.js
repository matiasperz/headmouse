'use strict';

const path = require('path');

var nconf = require('nconf').file({ file: path.join(__dirname + '/app-config.json' )});

function saveSettings(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
}

function readSettings(settingKey = null) {
    nconf.load();
    return nconf.get(settingKey);
}

module.exports = {
    saveSettings: saveSettings,
    readSettings: readSettings
};