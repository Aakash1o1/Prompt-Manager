(() => {
  // src/options.ts
  var INPUT_ID = "new-host";
  var REQ_BTN = "request-btn";
  var LIST_ID = "hosts-list";
  var STORAGE_KEY = "promptManager.allowedHosts";
  async function getHosts() {
    return new Promise((res) => chrome.storage.local.get([STORAGE_KEY], (r) => res(r[STORAGE_KEY] ?? [])));
  }
  async function setHosts(hosts) {
    return new Promise((res) => chrome.storage.local.set({ [STORAGE_KEY]: hosts }, () => res()));
  }
  function normalizePattern(s) {
    return s.trim();
  }
  async function rebuildList() {
    const listEl = document.getElementById(LIST_ID);
    listEl.innerHTML = "";
    const hosts = await getHosts();
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
          if (removed) {
            getHosts().then((cur) => {
              const next = cur.filter((x) => x !== h);
              setHosts(next).then(() => {
                rebuildList();
              });
            });
          } else {
            getHosts().then((cur) => {
              const next = cur.filter((x) => x !== h);
              setHosts(next).then(rebuildList);
            });
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
          const hosts = await getHosts();
          if (!hosts.includes(val)) {
            hosts.push(val);
            await setHosts(hosts);
          }
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
