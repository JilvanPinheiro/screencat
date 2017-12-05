/* jshint esversion: 6 */

const path = require('path')
const menubar = require('menubar')
const { 
  app, 
  BrowserWindow, 
  ipcMain,
  dialog,
} = require('electron')

// Configure menu bar

const menuBar = menubar({
  width: 700,
  height: 300,
  index: 'file://' + path.join(__dirname, '../views/app.html'),
  icon: 'file://' + path.join(__dirname, 'img', 'Icon.png')
})

menuBar.app.commandLine.appendSwitch('disable-renderer-backgrounding')

// menuBar.on('after-create-window', function () {
//   menuBar.window.openDevTools()
// })

menuBar.on('ready', function ready () {
  console.log('menu bar ready')
})

app.setAsDefaultProtocolClient('screencat')

menuBar.app.on('open-url', function (e, url) {
  e.preventDefault()

  const roomCode = url.replace('screencat://', '')
  dialog.showErrorBox('Join the room?', `You're about to join the room ${roomCode}`)
})

ipcMain.on('icon', function (ev, key) {
  menuBar.tray.setImage(icons[key])
})

ipcMain.on('terminate', function terminate (ev) {
  menuBar.app.quit()
})

ipcMain.on('resize', function resize (ev, data) {
  menuBar.window.setSize(data.width, data.height)
})

ipcMain.on('error', function error (ev, err) {
  console.error(new Error(err.message))
})

ipcMain.on('create-window', function (ev, config) {
  menuBar.app.dock.show()

  win = new BrowserWindow({width: 720, height: 445})

  win.loadURL('file://' + path.join(__dirname, '../views/screen.html'))

  win.on('closed', function () {
    menuBar.app.dock.hide()
    menuBar.window.webContents.send('disconnected', true)
  })

  ipcMain.once('window-ready', function () {
    win.webContents.send('peer-config', config)
  })

  ipcMain.on('connected', function () {
    menuBar.window.webContents.send('connected', true)
  })

  ipcMain.on('disconnected', function () {
    menuBar.window.webContents.send('disconnected', true)
  })

  ipcMain.on('show-window', function () {
    win.show()
  })

  ipcMain.on('stop-viewing', function () {
    win.close()
    menuBar.window.webContents.send('disconnected', true)
  })
})
