(() => {
  // src/action.ts
  var HOST_INPUT = "host";
  var BTN = "enable";
  var STATUS = "status";
  var POPULAR_SITES = [
    { id: "aistudio-google", title: "AI Studio", pattern: "https://aistudio.google.com/*" },
    { id: "chatgpt", title: "ChatGPT", pattern: "https://chatgpt.com/*" },
    { id: "notebooklm-google", title: "NotebookLM", pattern: "https://notebooklm.google.com/*" },
    { id: "deepseek-chat", title: "DeepSeek", pattern: "https://chat.deepseek.com/*" },
    { id: "perplexity-ai", title: "Perplexity", pattern: "https://www.perplexity.ai/*" },
    { id: "claude-ai", title: "Claude", pattern: "https://claude.ai/*" },
    { id: "grok", title: "Grok", pattern: "https://grok.com/*" }
  ];
  async function getAllowedOrigins() {
    return new Promise((resolve) => {
      chrome.permissions.getAll((permissions) => {
        resolve(permissions.origins || []);
      });
    });
  }
  function setStatus(msg) {
    const el = document.getElementById(STATUS);
    el.textContent = msg;
  }
  function normalizePattern(input) {
    const s = input.trim();
    if (!s)
      return "";
    if (s.endsWith("/*")) {
      try {
        const candidate = s.replace(/\*.*$/, "");
        const u = new URL(candidate);
        if (!u.hostname)
          return "";
        return `${u.protocol}//${u.hostname}/*`;
      } catch {
      }
    }
    try {
      let candidate = s;
      if (!/^https?:\/\//i.test(candidate)) {
        candidate = "https://" + candidate;
      }
      const u = new URL(candidate);
      if (!u.hostname)
        return "";
      return `${u.protocol}//${u.hostname}/*`;
    } catch {
      return "";
    }
  }
  async function renderPopularSites() {
    const listEl = document.getElementById("popular-sites-list");
    listEl.innerHTML = "";
    listEl.style.display = "grid";
    const allAllowed = await getAllowedOrigins();
    for (const entry of POPULAR_SITES.map((s) => ({ s, allowed: allAllowed.includes(s.pattern) }))) {
      const s = entry.s;
      const alreadyAllowed = allAllowed.includes(s.pattern);
      const siteButton = document.createElement("div");
      siteButton.className = "site-button";
      if (alreadyAllowed)
        siteButton.classList.add("site-enabled");
      siteButton.dataset.pattern = s.pattern;
      siteButton.title = alreadyAllowed ? `Already enabled on ${s.pattern}` : `Select to enable on ${s.title}`;
      siteButton.textContent = s.title;
      siteButton.addEventListener("click", () => {
        if (alreadyAllowed)
          return;
        siteButton.classList.toggle("site-selected");
      });
      listEl.appendChild(siteButton);
    }
  }
  async function renderAllowedSites() {
    const container = document.getElementById("allowed-sites-list");
    container.innerHTML = "";
    const hosts = await getAllowedOrigins();
    if (hosts.length === 0) {
      container.innerHTML = '<div class="small" style="padding: 4px;">No sites have been enabled yet.</div>';
      return;
    }
    for (const pattern of hosts) {
      const row = document.createElement("div");
      row.className = "site-row";
      const span = document.createElement("span");
      span.textContent = pattern;
      const btn = document.createElement("button");
      btn.textContent = "Remove";
      btn.className = "remove-btn";
      btn.addEventListener("click", async () => {
        setStatus(`Removing permission for ${pattern}...`);
        chrome.permissions.remove({ origins: [pattern] }, (removed) => {
          if (chrome.runtime.lastError) {
            console.error("permissions.remove failed:", chrome.runtime.lastError.message);
            setStatus(`Failed to remove: ${chrome.runtime.lastError.message}`);
            return;
          }
          if (removed) {
            setStatus(`Permission for ${pattern} has been revoked.`);
            renderAllowedSites();
            renderPopularSites();
          } else {
            setStatus(`Permission removal was not completed for ${pattern}.`);
          }
        });
      });
      row.appendChild(span);
      row.appendChild(btn);
      container.appendChild(row);
    }
  }
  document.addEventListener("DOMContentLoaded", async () => {
    const hostInput = document.getElementById(HOST_INPUT);
    const btn = document.getElementById(BTN);
    const enabledSitesDropdown = document.getElementById("enabled-sites-dropdown");
    const enabledSitesToggle = document.getElementById("enabled-sites-toggle");
    const enabledSitesList = document.getElementById("allowed-sites-list");
    enabledSitesToggle.addEventListener("click", () => {
      const isOpen = enabledSitesList.style.display === "block";
      enabledSitesList.style.display = isOpen ? "none" : "block";
      enabledSitesDropdown.classList.toggle("dd-open", !isOpen);
    });
    const popularSitesDropdown = document.getElementById("popular-sites-dropdown");
    const popularSitesToggle = document.getElementById("popular-sites-toggle");
    const popularSitesList = document.getElementById("popular-sites-list");
    popularSitesToggle.addEventListener("click", () => {
      const isOpen = popularSitesList.style.display === "grid";
      popularSitesList.style.display = isOpen ? "none" : "grid";
      popularSitesDropdown.classList.toggle("dd-open", !isOpen);
    });
    btn.addEventListener("click", async () => {
      const manual = normalizePattern(hostInput.value);
      const selected = Array.from(document.querySelectorAll(".site-button.site-selected")).map((e) => (e.dataset.pattern || "").trim()).filter(Boolean);
      const originsToRequest = Array.from(/* @__PURE__ */ new Set([...manual ? [manual] : [], ...selected]));
      if (originsToRequest.length === 0) {
        setStatus("Enter a site (e.g., https://example.com) or select one.");
        return;
      }
      let grantedCount = 0;
      setStatus(`Requesting permission for ${originsToRequest.length} site(s)...`);
      const grantedAll = await new Promise((res) => {
        try {
          chrome.permissions.request({ origins: originsToRequest }, (granted) => {
            if (chrome.runtime.lastError) {
              console.error("permissions.request failed:", chrome.runtime.lastError);
              res(false);
              return;
            }
            res(Boolean(granted));
          });
        } catch (e) {
          console.error("permissions.request threw", e);
          res(false);
        }
      });
      if (!grantedAll) {
        setStatus("Permission not granted for the requested sites.");
      } else {
      }
      hostInput.value = "";
      setTimeout(() => setStatus(""), 4e3);
    });
    await renderPopularSites();
    await renderAllowedSites();
    setStatus("");
    document.addEventListener("click", (ev) => {
      const path = ev.composedPath ? ev.composedPath() : [];
      const isClickInside = path.some((n) => n && (n.id === "popular-sites-dropdown" || n.id === "enabled-sites-dropdown"));
      if (!isClickInside) {
        popularSitesList.style.display = "none";
        popularSitesDropdown.classList.remove("dd-open");
        enabledSitesList.style.display = "none";
        enabledSitesDropdown.classList.remove("dd-open");
      }
    });
  });
})();
