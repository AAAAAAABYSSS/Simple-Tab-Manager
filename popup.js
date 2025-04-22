document.getElementById("saveTabBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const category = document.getElementById("categorySelect").value;
      chrome.storage.local.get([category], (result) => {
        const tabs = result[category] || [];
        tabs.push({ title: tab.title, url: tab.url });
        chrome.storage.local.set({ [category]: tabs }, () => {
          renderTabs();
        });
      });
    });
  });
  
  function renderTabs() {
    ["work", "personal"].forEach((category) => {
      chrome.storage.local.get([category], (result) => {
        const list = document.getElementById(`${category}-list`);
        list.innerHTML = "";
        const tabList = result[category] || [];
  
        tabList.forEach((tab, index) => {
          const li = document.createElement("li");
  
          const link = document.createElement("a");
          link.href = "#";
          link.textContent = tab.title;
          link.addEventListener("click", () => {
            chrome.tabs.create({ url: tab.url });
          });
  
          const delBtn = document.createElement("button");
          delBtn.innerHTML = "&times;";
          delBtn.style.marginLeft = "8px";
          delBtn.addEventListener("click", () => {

            tabList.splice(index, 1);  
            chrome.storage.local.set({ [category]: tabList }, () => {
              renderTabs(); 
            });
          });
  
          li.appendChild(link);
          li.appendChild(delBtn);
          list.appendChild(li);
        });
      });
    });
  }
  
  document.addEventListener("DOMContentLoaded", renderTabs);
  