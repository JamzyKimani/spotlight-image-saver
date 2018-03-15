const {ipcRenderer, electron} = require('electron');
const os = require('os');
const Store = require('electron-store');
const store = new Store();

if(!store.has('app-folders.spotlight-folder')) {
    var username = os.userInfo().username;
    var spotlightFolder = `C:/Users/${username}/AppData/Local/Packages/Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy/LocalState/Assets`;
    store.set('app-folders.spotlight-folder', spotlightFolder);
}

var imagesFolder = store.get('app-folders.images-folder', null );

if(imagesFolder == null) {
    //set images folder on apps first startup
    store.set('app-folders.images-folder', ipcRenderer.sendSync('createImagesFolder'));   
    console.log('images folder created');     
}

var spotlightFiles = ipcRenderer.sendSync('getFolderFiles', store.get('app-folders.spotlight-folder'))

//check if each of the files in the windows spotlight folder is a wallpaper image
//save it in images-folder if it is
spotlightFiles.forEach(file => {
   ipcRenderer.send('saveIfWallpaper', file);
})


ipcRenderer.on('saveIfWallpaper', (event, response) => {
    console.log("anything")
    console.log(response);
    let res = JSON.parse(response);
    if(res.successful) {
        
    } else {
        console.log(res.error)
    }
}) 





