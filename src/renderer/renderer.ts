import './index.css';

const menuButtons = document.getElementsByClassName('menu-button') as HTMLCollectionOf<HTMLButtonElement>;
const actionBlocks = document.getElementsByClassName('action-block') as HTMLCollectionOf<HTMLDivElement>;
const createForm = document.getElementsByClassName('create-form')[0] as HTMLFormElement;
const findForm = document.getElementsByClassName('find-form')[0] as HTMLFormElement;
const editForm = document.getElementsByClassName('edit-form')[0] as HTMLFormElement;
const deleteForm = document.getElementsByClassName('delete-form')[0] as HTMLFormElement;
const messageBlock = document.getElementsByClassName('message-block')[0] as HTMLDivElement;
const dataTable = document.getElementsByClassName('data-table')[0] as HTMLTableElement;
const clearButton = document.getElementsByClassName('clear-button')[0] as HTMLButtonElement;

let records: Array<{key: number, value: string}> = [];

const validateKey = (key: string) => {
  const validSymbols = '0123456789';
  for (let i = 0; i < key.length; i++) {
    if (!validSymbols.includes(key[i])) {
      return false;
    }
  }
  if (key[0] === '0') {
    return false;
  }
  return true;
}

const showMessage = (isError: boolean, message: string) => {
  if (!isError) {
    messageBlock.style.color = '#1dc9a0';
  } else {
    messageBlock.style.color = '#da1f1f';
  }
  messageBlock.innerHTML = `<p>${message}</p>`;
  setTimeout(() => {
    messageBlock.innerHTML = '';
  }, 3000);
}

const hideActionBlocks = () => {
  for (let i = 0; i < actionBlocks.length; i++) {
    actionBlocks[i].style.display = 'none';
  }
}

const showRecords = () => {
  dataTable.innerHTML = '';
  records.forEach((record) => {
    const row = document.createElement('tr');
    const keyColumn = document.createElement('td');
    keyColumn.className = 'key-column';
    const keyText = document.createTextNode(`${record.key}`);
    keyColumn.appendChild(keyText);
    const valueColumn = document.createElement('td');
    valueColumn.className = 'value-column';
    const valueText = document.createTextNode(`${record.value}`);
    valueColumn.appendChild(valueText);
    row.appendChild(keyColumn);
    row.appendChild(valueColumn);
    dataTable.appendChild(row);
  });
}

const showActionBlock = (blockNumber: number) => {
  actionBlocks[blockNumber].style.display = 'flex';
}

for (let i = 0; i < menuButtons.length; i++) {
  menuButtons[i].addEventListener('click', () => {
    hideActionBlocks();
    messageBlock.innerHTML = '';
    showActionBlock(i);
    if (i == menuButtons.length - 1) {
      showRecords();
    }
  });
}

createForm.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();
  const formData = new FormData(createForm);
  if (!validateKey(formData.get('key') as string)) {
    showMessage(true, 'Key must be a number');
  } else {
    const key = parseInt(formData.get('key') as string);
    const value = formData.get('value') as string;
    const result = await window.electronAPI.createRecord(key, value);
    if (result) {
      showMessage(false, 'Record created');
      records.push({key: key, value: value});
    } else {
      showMessage(true, 'This key is already used');
    }
  }
});

findForm.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();
  const formData = new FormData(findForm);
  if (!validateKey(formData.get('key') as string)) {
    showMessage(true, 'Key must be a number');
  } else {
    const key = parseInt(formData.get('key') as string);
    const { value: value, comparisons: comparisons } = await window.electronAPI.findRecord(key);
    if (value) {
      showMessage(false, `Found value: ${value}</p><p>Comparisons: ${comparisons}`);
    } else {
      showMessage(true, 'Record with such key is not found');
    }
  }
});

editForm.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();
  const formData = new FormData(editForm);
  if (!validateKey(formData.get('key') as string)) {
    showMessage(true, 'Key must be a number');
  } else {
    const key = parseInt(formData.get('key') as string);
    const value = formData.get('value') as string;
    const result = await window.electronAPI.editRecord(key, value);
    if (result) {
      showMessage(false, 'Record updated');
      records = records.map((record) => record.key === key ? { key: key, value: value } : record);
    } else {
      showMessage(true, 'Record with such key is not found');
    }
  }
});

deleteForm.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();
  const formData = new FormData(deleteForm);
  if (!validateKey(formData.get('key') as string)) {
    showMessage(true, 'Key must be a number');
  } else {
    const key = parseInt(formData.get('key') as string);
    const result = await window.electronAPI.deleteRecord(key);
    if (result) {
      showMessage(false, 'Record deleted');
      records = records.filter((record) => record.key !== key);
    } else {
      showMessage(true, 'Record with such key is not found');
    }
  }
});

clearButton.addEventListener('click', () => {
  window.electronAPI.clearData();
  records = [];
});

window.addEventListener('DOMContentLoaded', async () => {
  records = await window.electronAPI.getData();
});