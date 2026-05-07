document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });

  // Chat
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    appendMessage("user", query);
    chatInput.value = "";

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 }),
      });
      const data = await res.json();
      appendMessage("assistant", data.answer);
    } catch (err) {
      appendMessage("assistant", "Error: " + err.message);
    }
  });

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = `<p>${text.replace(/\n/g, "<br>")}</p>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Generate
  const generateForm = document.getElementById("generateForm");
  const generateBtn = document.getElementById("generateBtn");
  const loading = document.getElementById("loading");
  const resultArea = document.getElementById("resultArea");
  const downloadLink = document.getElementById("downloadLink");
  const slidesPreview = document.getElementById("slidesPreview");

  generateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const topic = document.getElementById("topic").value.trim();
    if (!topic) return;

    const brand = document.getElementById("brand").value;
    const numSlides = parseInt(document.getElementById("numSlides").value) || 8;
    const style = document.getElementById("style").value.trim();

    generateBtn.disabled = true;
    loading.style.display = "block";
    resultArea.style.display = "none";

    try {
      const res = await fetch("/api/generate-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          brand: brand || null,
          num_slides: numSlides,
          style: style || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Generation failed");
      }

      const data = await res.json();

      downloadLink.href = data.download_url;
      downloadLink.download = data.filename;

      slidesPreview.innerHTML = "";
      data.slides.forEach((slide, i) => {
        const card = document.createElement("div");
        card.className = "slide-card";
        let bulletsHtml = "";
        if (slide.bullets && slide.bullets.length) {
          bulletsHtml = `<div class="slide-bullets">${slide.bullets.map((b) => `• ${b}`).join("<br>")}</div>`;
        }
        if (slide.stats && slide.stats.length) {
          bulletsHtml = `<div class="slide-bullets">${slide.stats.map((s) => `${s.value} — ${s.label}`).join("<br>")}</div>`;
        }
        card.innerHTML = `
          <div class="slide-type">${i + 1}. ${slide.slide_type}</div>
          <div class="slide-headline">${slide.headline}</div>
          ${bulletsHtml}
        `;
        slidesPreview.appendChild(card);
      });

      resultArea.style.display = "block";
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      generateBtn.disabled = false;
      loading.style.display = "none";
    }
  });
});
