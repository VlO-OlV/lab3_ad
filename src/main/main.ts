
import { app, BrowserWindow, ipcMain } from 'electron';
import { AVLTree } from './avltree';
import { AVLConverter } from './avlconverter';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): BrowserWindow => {
  const window = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  return window;
};

app.on('ready', () => {
  const converter = new AVLConverter();
  let data = converter.loadData();

  const treeToArray = (tree: AVLTree) => {
    const usedKeys = tree.getUsedKeys();
    const arrayTree: Array<{key: number, value: string}> = [];
    usedKeys.forEach((key) => {
      arrayTree.push({
        key,
        value: tree.search(key).value,
      });
    });
    return arrayTree;
  }

  ipcMain.handle('create', (event, key, value) => {
    try {
      data.insert(key, value);
    } catch (error) {
      return false;
    }
    return true;
  });

  ipcMain.handle('find', (event, key) => {
    let result;
    try {
      result = data.search(key);
    } catch (error) {
      return false;
    }
    return result;
  });

  ipcMain.handle('delete', (event, key) => {
    try {
      data.delete(key);
    } catch (error) {
      return false;
    }
    return true;
  });

  ipcMain.handle('edit', (event, key, value) => {
    try {
      data.update(key, value);
    } catch (error) {
      return false;
    }
    return true;
  });

  ipcMain.handle('get-data', () => {
    return treeToArray(data);
  });

  ipcMain.on('clear-data', () => {
    data = new AVLTree();
  });

  const window: BrowserWindow = createWindow();

  window.on('close', () => {
    converter.saveData(data);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});