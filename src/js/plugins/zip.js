import JSZip from 'jszip';
import saveAs from 'save-as';
import { getImageBlob, cleanDOM } from '../util';

function download () {
  const frag = this.outputFragment();
  const images = Array.from(frag.querySelectorAll('img'));
  const artboard = frag.querySelector('#artboard');
  const head = frag.querySelector('head');
  const imagePromises = [];
  const zip = new JSZip();
  const output = zip.folder('project');
  const imgFolder = output.folder('assets/img');

  images.forEach((image) => {
    const imageLoader = getImageBlob(image.src);
    imagePromises.push(imageLoader);
    imageLoader.then((img) => {
      imgFolder.file(img.name, img.blob, { base64: true });
      image.setAttribute('src', `assets/img/${img.name}`);
    })
  });

  Promise.all(imagePromises).then(() => {
    cleanDOM(frag);

    output.file('index.html',
      `<html>
          <head>
            ${head.innerHTML}
          </head>
          <body>
            ${artboard.innerHTML}
          </body>
        </html>`);

    zip.generateAsync({ type: 'blob' }).then((blob) => {
      saveAs(blob, 'project.zip');
    });
  });
}

export default function install ({ builder }) {
  builder.download = download;
};
