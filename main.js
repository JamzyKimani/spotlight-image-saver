  const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')
  var fs = require('fs') 
  const path = require('path')
  const url = require('url')
  const os = require('os');
  const Store = require('electron-store');
  const store = new Store();
  const Jimp = require("jimp");
  const probe = require('probe-image-size');

  var username = os.userInfo().username;
  var spotlightFolder = `C:/Users/${username}/AppData/Local/Packages/Microsoft.Windows.ContentDeliveryManager_cw5n1h2txyewy/LocalState/Assets`

  
  
  let win
  
  function createWindow () {
    

    // Create the browser window.
    win = new BrowserWindow({width: 930, height: 525})
  
    // and load the index.html of the app.
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'src/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  
    // Open the DevTools.
    win.webContents.openDevTools()
  
    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
    
    var menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                {label: 'Change Images Folder'},
                {label: 'Open Images Folder'},
                {type: 'separator'},
                {
                    label: 'Exit',
                    click() {
                        app.quit();
                    }
                },
            ]

        }, 
        { 
            label: 'About'
        }
    
    ])

     Menu.setApplicationMenu(menu); 

  }   
 
  app.on('ready', createWindow)
  
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  ipcMain.on('createImagesFolder', function(event) {
    //check if the default folder exists
    let defaultPath = app.getPath('documents')+'/Spotlight-Images';
    defaultPath = defaultPath.replace(/\\/g, '/'); //replaces "frontlaces" with backslashes

    if(!fs.existsSync(defaultPath)) { //check if default folder already exists
      fs.mkdirSync(defaultPath, '0o765')
      event.returnValue = defaultPath;
    } else { 
      event.returnValue = defaultPath;
    }

  });


  ipcMain.on('getFolderFiles', (event,folder) => {
    event.returnValue = fs.readdirSync(folder);
     
  })


  ipcMain.on('saveIfWallpaper', (event,file) => {
    var response;
    var slFolder = store.get('app-folders.spotlight-folder')
    var imgsFolder = store.get('app-folders.images-folder')
    var imgsFolderFiles = fs.readdirSync(imgsFolder);
    
      Jimp.read(`${slFolder}/${file}`)
      .then(img => {
        var h = img.bitmap.height;
        var w = img.bitmap.width;

        if (h<w && w>1000 && imgsFolderFiles.indexOf(`${file}.jpg`) == -1 ) { //check if image is rectangular and width is big enuf to be wallpaper
          img.write(`${imgsFolder}/${file}.jpg`); // save file to images folder 
          response = `{"successful" : true,  "new-image-captured" : true, "new-image" : "${file}.jpg" }`;
          event.sender.send('saveIfWallpaper', response);
        
        } else {
          response = `{"successful" : true,  "new-image-captured" : false, "new-image" : null }`;
          event.sender.send('saveIfWallpaper', response);
        }

      })
      .catch(err =>  {
        response = `{"successful" : false,  "error" : "file is not an image file"}`;
        event.sender.send('saveIfWallpaper', response);
      })

  })
  
 
