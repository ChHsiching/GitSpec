const { ipcRenderer } = require('electron');

ipcRenderer.on('git-status', (event, status) => {
    document.getElementById('git-status').textContent = status;
});

// Listen to button click events
document.getElementById('select-repo').addEventListener('click', () => {
    ipcRenderer.send('select-repo');
});
