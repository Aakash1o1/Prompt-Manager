"use strict";
(() => {
  // src/lib/permissions.ts
  async function getAllowedOrigins() {
    return new Promise((resolve) => {
      chrome.permissions.getAll((permissions) => {
        resolve(permissions.origins || []);
      });
    });
  }
  async function requestPermission(pattern) {
    return new Promise((resolve) => {
      try {
        chrome.permissions.request({ origins: [pattern] }, (granted) => {
          if (chrome.runtime.lastError) {
            console.error("Permission request error", chrome.runtime.lastError);
            resolve(false);
            return;
          }
          resolve(Boolean(granted));
        });
      } catch (e) {
        console.error("permissions.request threw", e);
        resolve(false);
      }
    });
  }
  async function removePermission(pattern) {
    return new Promise((resolve) => {
      chrome.permissions.remove({ origins: [pattern] }, (removed) => {
        if (chrome.runtime.lastError) {
          console.error("Permission remove error", chrome.runtime.lastError);
        }
        resolve(Boolean(removed));
      });
    });
  }

  // src/action.ts
  var STATUS = "status";
  function setStatus(msg) {
    const el = document.getElementById(STATUS);
    el.textContent = msg;
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
        const removed = await removePermission(pattern);
        if (removed) {
          setStatus(`Permission for ${pattern} has been revoked.`);
          renderAllowedSites();
        } else {
          setStatus(`Permission removal was not completed for ${pattern}.`);
        }
      });
      row.appendChild(span);
      row.appendChild(btn);
      container.appendChild(row);
    }
  }
  document.addEventListener("DOMContentLoaded", async () => {
    const addSiteBtn = document.getElementById("add-current-site-btn");
    const enabledSitesDropdown = document.getElementById("enabled-sites-dropdown");
    const enabledSitesToggle = document.getElementById("enabled-sites-toggle");
    const enabledSitesList = document.getElementById("allowed-sites-list");
    let currentTabPattern = null;
    const initializeDynamicButton = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs?.[0];
      if (!tab?.url || !tab.url.startsWith("http")) {
        addSiteBtn.textContent = "Cannot determine current site";
        addSiteBtn.disabled = true;
        return;
      }
      currentTabPattern = new URL(tab.url).origin + "/*";
      chrome.permissions.contains({ origins: [currentTabPattern] }, (hasPermission) => {
        if (hasPermission) {
          updateButtonState("remove");
        } else {
          updateButtonState("add");
        }
        addSiteBtn.disabled = false;
      });
    };
    const updateButtonState = (state) => {
      if (!currentTabPattern)
        return;
      if (state === "add") {
        addSiteBtn.textContent = "Add to this site";
        addSiteBtn.classList.remove("danger");
        addSiteBtn.onclick = handleAddPermission;
      } else {
        addSiteBtn.textContent = "Remove permission from this site";
        addSiteBtn.classList.add("danger");
        addSiteBtn.onclick = handleRemovePermission;
      }
    };
    const handleAddPermission = () => {
      if (!currentTabPattern)
        return;
      setStatus(`Requesting permission for ${currentTabPattern}...`);
      requestPermission(currentTabPattern).then((granted) => {
        if (granted) {
          setStatus(`Permission granted for ${currentTabPattern}`);
          renderAllowedSites();
          updateButtonState("remove");
        } else {
          setStatus("Permission request was denied.");
        }
      });
    };
    const handleRemovePermission = () => {
      if (!currentTabPattern)
        return;
      setStatus(`Removing permission for ${currentTabPattern}...`);
      removePermission(currentTabPattern).then((removed) => {
        if (removed) {
          setStatus(`Permission removed for ${currentTabPattern}`);
          renderAllowedSites();
          updateButtonState("add");
        } else {
          setStatus("Permission removal failed or was cancelled.");
        }
      });
    };
    enabledSitesToggle.addEventListener("click", () => {
      const isOpen = enabledSitesList.style.display === "block";
      enabledSitesList.style.display = isOpen ? "none" : "block";
      enabledSitesDropdown.classList.toggle("dd-open", !isOpen);
    });
    await renderAllowedSites();
    await initializeDynamicButton();
    setStatus("");
    document.addEventListener("click", (ev) => {
      const path = ev.composedPath ? ev.composedPath() : [];
      const isClickInside = path.some((n) => n && n.id === "enabled-sites-dropdown");
      if (!isClickInside) {
        enabledSitesList.style.display = "none";
        enabledSitesDropdown.classList.remove("dd-open");
      }
    });
  });
})();
