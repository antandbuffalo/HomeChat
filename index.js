'use strict';
var rp = true;
var QB = require('quickblox');
var Gpio, chatPin;
if(rp) {
    Gpio = require('onoff').Gpio;
    chatPin = new Gpio(25, 'out');
}
var dialogJid = "62936_59cfaac5a28f9a73196096b5@muc.chat.quickblox.com";
var qbConfig = {
    "appId": 62936,
    "authKey": "Ek5kyf5mfeCAgYN",
    "authSecret": "8Mt4MysTODX9k-B"
};
var appConfig = {
    chatProtocol: {
        active: 2 // set 1 to use BOSH---- set 2 to use wss
    },
    endpoints: {
      api: "api.quickblox.com", // set custom API endpoint
      chat: "chat.quickblox.com" // set custom API endpoint
    },
    streamManagement: {
        enable: true
    },
    debug: {
        mode: 0,
        file: null
    }
};
QB.init(qbConfig.appId, qbConfig.authKey, qbConfig.authSecret, appConfig);
var params = {
    'login': 'test1',
    'password': 'password'
};
QB.createSession(params, function(err, result) {
    if (result) {
        console.log("Sessin success");
        console.log(result);
        createChatConnection();
    } else {
        console.log("ERROR");
        console.log(err);
    }
});

var onMessage = function(userId, message) {
    console.log(userId);    
    console.log(message.body);
    if(message.body === "on") {
        if(rp) {
            chatPin.writeSync(1);    //LED ON
        }        
    }
    else {
        if(rp) {
            chatPin.writeSync(0);    //LED OFF
        }        
    }
};

function createChatConnection() {
    var session = QB.service.getSession();
    var params = {
      "userId": session.user_id,
      "password": 'password'
    };
    QB.chat.connect(params, function(err, roster) {
      if (err) {
        console.log("err ", err);
        console.log("ERROR");
      } else {
        console.log("succ ", roster);
        console.log("SUCCESS");
        QB.chat.muc.join(dialogJid, function(resultStanza) {
            console.log("\n\n==========================================================");
            var joined = true;
            for (var i = 0; i < resultStanza.children.length; i++) {
              var elItem = resultStanza.children[i];
              if (elItem.name === 'error'){
                joined = false;
              }
            }        
            if(joined) {
                console.log("SUCCESS");    
            }
            else {
                console.log("ERROR");    
                QB.chat.disconnect();
                QB.destroySession(function(err, succ) {});
            }
            console.log("==========================================================\n\n");
        });
      }
    });
  
    QB.chat.onMessageListener = onMessage;
  };

