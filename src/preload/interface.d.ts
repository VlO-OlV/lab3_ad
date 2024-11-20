export interface IElectronAPI {
  createRecord: (key: number, value: string) => Promise<boolean>,
  findRecord: (key: number) => Promise<{value: string, comparisons: number}>,
  deleteRecord: (key: number) => Promise<boolean>,
  editRecord: (key: number, value: string) => Promise<boolean>,
  getData: () => Promise<Array<{key: number, value: string}>>,
  clearData: () => Promise<void>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI,
  }
}