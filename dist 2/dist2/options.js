(() => {
  // src/options.ts
  var ADD_BTN_ID = "add-current-site-btn";
  var LIST_ID = "hosts-list";
  async function getAllowedOrigins() {
    return new Promise((resolve) => {
      chrome.permissions.getAll((permissions) => {
        resolve(permissions.origins || []);
      });
    });
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
  async function onAddCurrentSiteClick() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        return alert("Could not determine current site. Navigate to a tab and try again.");
      }
      const url = tabs[0].url;
      if (!url) {
        return alert("Could not get URL of current site.");
      }
      const pattern = new URL(url).origin + "/*";
      chrome.permissions.request({ origins: [pattern] }, async (granted) => {
        if (granted) {
          chrome.runtime.sendMessage({ type: "PERMISSION_GRANTED", pattern }, () => {
          });
          rebuildList();
          alert("Permission granted for " + pattern);
        } else {
          alert("Permission not granted.");
        }
      });
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById(ADD_BTN_ID).addEventListener("click", onAddCurrentSiteClick);
    rebuildList();
  });
})();
