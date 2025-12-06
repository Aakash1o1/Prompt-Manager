(() => {
  // src/options.ts
  var INPUT_ID = "new-host";
  var REQ_BTN = "request-btn";
  var LIST_ID = "hosts-list";
  async function getAllowedOrigins() {
    return new Promise((resolve) => {
      chrome.permissions.getAll((permissions) => {
        resolve(permissions.origins || []);
      });
    });
  }
  function normalizePattern(s) {
    return s.trim();
  }
  async function rebuildList() {
    const listEl = document.getElementById(LIST_ID);
    listEl.innerHTML = "";
    const hosts = await getAllowedOrigins();
    if (!hosts.length) {
      listEl.innerHTML = '<li class="small">No sites enabled yet.</li>';
      return;
    }
    for (const h of hosts) {
      const li = document.createElement("li");
      const span = document.createElement("div");
      span.className = "host";
      span.textContent = h;
      const btn = document.createElement("button");
      btn.textContent = "Remove";
      btn.style.background = "#e02424";
      btn.style.color = "#fff";
      btn.addEventListener("click", async () => {
        chrome.permissions.remove({ origins: [h] }, (removed) => {
          if (chrome.runtime.lastError) {
            console.error(`permissions.remove failed for ${h}:`, chrome.runtime.lastError.message);
            alert(`Failed to remove permission: ${chrome.runtime.lastError.message}`);
            return;
          }
          if (removed) {
            console.log(`Permission for ${h} removed. Rebuilding list.`);
            rebuildList();
          } else {
            console.log(`Permission removal for ${h} was not completed.`);
          }
        });
      });
      li.appendChild(span);
      li.appendChild(btn);
      listEl.appendChild(li);
    }
  }
  async function onRequestClick() {
    const input = document.getElementById(INPUT_ID);
    const val = normalizePattern(input.value);
    if (!val)
      return alert("Enter a host pattern like https://example.com/*");
    try {
      chrome.permissions.request({ origins: [val] }, async (granted) => {
        if (granted) {
          chrome.runtime.sendMessage({ type: "PERMISSION_GRANTED", pattern: val }, () => {
          });
          input.value = "";
          rebuildList();
          alert("Permission granted and content injected into matching open tabs (if any).");
        } else {
          alert("Permission not granted.");
        }
      });
    } catch (e) {
      console.error(e);
      alert("Request failed. Check the pattern format (e.g. https://example.com/*)");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById(REQ_BTN).addEventListener("click", onRequestClick);
    rebuildList();
  });
})();
