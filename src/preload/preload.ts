import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  createRecord: (key: number, value: string) => ipcRenderer.invoke('create', key, value),
  findRecord: (key: number) => ipcRenderer.invoke('find', key),
  deleteRecord: (key: number) => ipcRenderer.invoke('delete', key),
  editRecord: (key: number, value: string) => ipcRenderer.invoke('edit', key, value),
  getData: () => ipcRenderer.invoke('get-data'),
  clearData: () => ipcRenderer.send('clear-data'),
});