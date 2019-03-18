/* jshint esversion: 6 */

const path = require('path')
const menubar = require('menubar')
const { 
  app, 
  BrowserWindow, 
  ipcMain,
} = require('electron')

// Configure menu bar

const menu = menubar({
  width: 700,
  height: 300,
  index: 'file://' + path.join(__dirname, '../views/app.html'),
  icon: 'file://' + path.join(__dirname, 'img', 'Icon.png'),
  preloadWindow: true
})

menu.app.commandLine.appendSwitch('disable-renderer-backgrounding')

 menu.on('after-create-window', function () {
   menu.window.openDevTools()
 })

app.setAsDefaultProtocolClient('screencat')

menu.app.on('open-url', function (e, url) {
  e.preventDefault()

  const roomCode = url.replace('screencat://', '')
  menu.window.webContents.send('join-room', roomCode)
})

// ipcMain.on('icon', function (ev, key) {
//  menu.tray.setImage(icons[key])
// })

ipcMain.on('terminate', function terminate (ev) {
  menu.app.quit()
})

ipcMain.on('resize', function resize (ev, data) {
  menu.window.setSize(data.width, data.height)
})

ipcMain.on('error', function error (ev, err) {
  console.log('teste')
  console.error(new Error(err.message))
})

ipcMain.on('create-window', function (ev, config) {
  // menu.app.dock.show()
  win = new BrowserWindow({width: 720, height: 445})

  win.loadURL('file://' + path.join(__dirname, '../views/screen.html'))

  win.on('closed', function () {
    // menu.app.dock.hide()
    menu.window.webContents.send('disconnected', true)
  })

  ipcMain.once('window-ready', function () {
    win.webContents.send('peer-config', config)
  })

  ipcMain.on('connected', function () {
    menu.window.webContents.send('connected', true)
  })

  ipcMain.on('disconnected', function () {
    menu.window.webContents.send('disconnected', true)
  })

  ipcMain.on('show-window', function () {
    win.show()
  })

  ipcMain.on('stop-viewing', function () {
    win.close()
    menuBar.window.webContents.send('disconnected', true)
  })
})
