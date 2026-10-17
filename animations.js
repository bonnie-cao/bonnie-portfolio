// Deferred script: the DOM exists before we collect opening images.
(() => {
  const root = document.documentElement;

  function imageReady(image) {
    const loaded = image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
    return loaded.then(() => {
      // Decoding avoids starting the sequence before an image can be painted.
      if (image.naturalWidth && image.decode) return image.decode().catch(() => {});
    });
  }

  const images = Array.from(document.querySelectorAll(
    'img.envelope, img.headshot, img.bonnieporttext, img.secondary-text, ' +
    '.letter img, .letter-contact img'
  )).filter((image) => getComputedStyle(image).display !== 'none');
  const background = new Image();
  background.src = './images/bg.png';
  const assets = images.map(imageReady);
  assets.push(imageReady(background));
  if (document.fonts) assets.push(document.fonts.ready);

  Promise.allSettled(assets).then(() => {
    // Two frames let the browser apply the paused initial styles first.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      clearTimeout(window.portfolioAnimationFallback);
      root.classList.remove('animations-pending');
    }));
  });
})();
