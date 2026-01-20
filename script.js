document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("imageInput");
  const previewImg = document.getElementById("preview");
  const emojiResult = document.getElementById("emojiResult");

  if (!fileInput || !previewImg || !emojiResult) {
    // If IDs don't match, fail loudly for easy debugging.
    console.error("Missing required elements: #imageInput, #preview, #emojiResult");
    return;
  }

  const resetUI = () => {
    previewImg.removeAttribute("src");
    previewImg.classList.remove("is-visible");
    emojiResult.textContent = "";
  };

  const animateEmoji = () => {
    emojiResult.classList.remove("emoji-animate");
    // Force reflow so the animation can restart even if the same emoji is set again
    // eslint-disable-next-line no-unused-expressions
    emojiResult.offsetWidth;
    emojiResult.classList.add("emoji-animate");
  };

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];

    if (!file) {
      resetUI();
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      resetUI();
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      previewImg.onload = () => {
        previewImg.classList.add("is-visible");

        // Simple brightness estimation: downscale then average luminance.
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const w = 50;
        const h = 50;
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(previewImg, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);

        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // perceived luminance (0..255)
          sum += 0.299 * r + 0.587 * g + 0.114 * b;
        }

        const avg = sum / (w * h);
        const threshold = 128;
        emojiResult.textContent = avg >= threshold ? "🌞" : "🌙";
        animateEmoji();
      };

      previewImg.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
});

