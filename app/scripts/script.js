const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');

const form = document.getElementById('image-form');
const img = document.getElementById('img');
const slider = document.getElementById('slider');


form.addEventListener('submit', (e) => {
  e.preventDefault();

  const imgPath = img.files[0].path;
  const quality = slider.value;

  ipcRenderer.send('image:prep', { imgPath, quality });
});

document.getElementById('output-path').innerText = path.join(os.homedir(), 'image-prep');
