import { initializeApp } from "firebase/app";
import { getMessaging,getToken,onMessage } from "firebase/messaging";
import { v4 as uuidv4 } from 'uuid';


const firebaseConfig = {
    apiKey: "AIzaSyCwe-3H4-bcBRVMVUDh9OVN-JUC4AaoqJA",
    authDomain: "web-push-4e988.firebaseapp.com",
    projectId: "web-push-4e988",
    storageBucket: "web-push-4e988.appspot.com",
    messagingSenderId: "547479027002",
    appId: "1:547479027002:web:3260b46c1ab58dfb94e403",
    measurementId: "G-3DWYMVEKBT"
};

const push_express_app_id = "16183-2";

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // ...
});


function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            const myuuid = uuidv4();
            console.log('Notification permission granted.');
            // Get registration token. Initially this makes a network call, once retrieved
            // subsequent calls to getToken will return from cache.
            getToken(messaging, '').then((currentToken) => {
                if (currentToken) {    
                    let info_about_device = {
                        "transport_type": "fcm",
                        "transport_token": currentToken,
                        "platform_type": "browser",
                        "ext_id": "456453",
                        "lang": window.navigator.language.slice(0,window.navigator.language.indexOf("-")),    // BCP 47
                        "country": "RU", // ISO3166-1
                        "tz_sec": 10800, // seconds from ß
                        "tags": { "audiences": "offer1234" }
                    }
                    let local_storage = getStorageData('PUSHEXPRESS_ID');
                    if (local_storage == null) {
                        init_push_express({ ic_token: myuuid,ext_id: "343" }, push_express_app_id, info_about_device);
                    } else {
                        local_storage = JSON.parse(local_storage);
                        const id_devices = local_storage.id;
                        update_push_express(id_devices,info_about_device,push_express_app_id);
                    }
                    
                } else {
                    // Show permission request UI
                    console.log('No registration token available. Request permission to generate one.');
                    // ...
                }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
                // ...
            });
        }
    });
}

async function init_push_express(data,app_id,info_about_device) {
    const url = "https://core.push.express/api/r/v2/apps/"+app_id+"/instances";
    const result = await fetch(url, {
        method : "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const response = await result.json();
    if (result.status == 201) {
        console.log('Ответ 201', response);
        const info = {
            id : response.id
        }
        setStorageData(info,'PUSHEXPRESS_ID');
        update_push_express(info.id,info_about_device,app_id);
    } else {
        console.log('Ответ не 200', response);
    }
}

async function update_push_express(id_devices,data,app_id) {
    console.log('обновление устройства');
    const url = "https://core.push.express/api/r/v2/apps/"+app_id+"/instances/"+id_devices+"/info";
    const result = await fetch(url, {
        method : "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const response = await result.json();
    console.log(response);
    if (result.status == 200) {
        console.log('Ответ 200', response);
        setStorageData(data,'PUSHEXPRESS_INFO');
    } else {
        console.log('Ответ не 200', response);
    }
}

function getStorageData (name) {
    const infoDevices =  window.localStorage.getItem(name);
    return infoDevices;
}

function setStorageData (info,name) {
    console.log('запись в storage', info);
    window.localStorage.setItem(name,JSON.stringify(info));

}

requestPermission();
console.log(app,messaging);