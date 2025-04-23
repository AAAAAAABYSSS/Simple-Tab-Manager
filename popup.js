// popup.js

// Get all category names from storage
function getAllCategories(callback) {
  chrome.storage.local.get("categories", (res) => {
    callback(res.categories || ["work", "personal"]);
  });
}

function updateCategorySelector() {
  const select = document.getElementById("categorySelect");
  getAllCategories((categories) => {
    chrome.storage.local.get("default_category", (res) => {
      const defaultCat = res.default_category || categories[0];
      select.innerHTML = "";
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        if (cat === defaultCat) option.selected = true;
        select.appendChild(option);
      });
    });
  });
}

function renderTabs() {
  getAllCategories((categories) => {
    const container = document.getElementById("categoryContainer");
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    container.innerHTML = "";

    chrome.storage.local.get(["categories_meta", "collapsedCategories"], (metaRes) => {
      const meta = metaRes.categories_meta || {};
      const collapsed = metaRes.collapsedCategories || [];

      categories.forEach((category) => {
        chrome.storage.local.get([category], (result) => {
          const tabList = (result[category] || []).sort((a, b) => {
            return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
          });

          const card = document.createElement("div");
          card.className = "category-card";

          const header = document.createElement("div");
          header.className = "category-header";

          const isCollapsed = collapsed.includes(category);
          const title = document.createElement("h3");
          const style = meta[category] || {};
          title.textContent = `${style.icon || ""} ${category} ${isCollapsed ? "▶" : "▼"}`;
          title.style.cursor = "pointer";
          card.style.borderLeft = `6px solid ${style.color || "#ccc"}`;

          title.addEventListener("click", () => {
            const newCollapsed = isCollapsed
              ? collapsed.filter(c => c !== category)
              : [...collapsed, category];
            chrome.storage.local.set({ collapsedCategories: newCollapsed }, renderTabs);
          });

          const actions = document.createElement("div");
          actions.className = "category-actions";

          const clearBtn = document.createElement("button");
          clearBtn.textContent = currentLang === 'zh' ? '清空' : 'Clear';
          clearBtn.className = "clear-btn";
          clearBtn.addEventListener("click", () => {
            chrome.storage.local.set({ [category]: [] }, () => {
              renderTabs();
              updateCategorySelector();
            });
          });

          const styleBtn = document.createElement("button");
          styleBtn.textContent = currentLang === 'zh' ? '样式' : 'Style';
          styleBtn.addEventListener("click", () => openStyleEditor(category));

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = currentLang === 'zh' ? '删除' : 'Delete';
          deleteBtn.className = "delete-btn";
          deleteBtn.addEventListener("click", () => {
            getAllCategories((categories) => {
              const newCategories = categories.filter(c => c !== category);
              chrome.storage.local.remove(category, () => {
                chrome.storage.local.set({ categories: newCategories }, () => {
                  renderTabs();
                  updateCategorySelector();
                });
              });
            });
          });

          const defaultBtn = document.createElement("button");
          defaultBtn.textContent = "⭐";
          defaultBtn.title = "Set as default";
          defaultBtn.addEventListener("click", () => {
            chrome.storage.local.set({ default_category: category }, () => {
              alert(`"${category}" set as default.`);
              updateCategorySelector();
            });
          });

          actions.appendChild(styleBtn);
          actions.appendChild(defaultBtn);
          actions.appendChild(clearBtn);
          actions.appendChild(deleteBtn);
          header.appendChild(title);
          header.appendChild(actions);
          card.appendChild(header);

          const list = document.createElement("ul");
          list.className = "tab-list";
          list.id = `${category}-list`;
          list.style.display = isCollapsed ? "none" : "block";

          tabList
            .filter(tab => tab.title.toLowerCase().includes(searchQuery) || tab.url.toLowerCase().includes(searchQuery))
            .forEach(((tab, index) => {
              const li = document.createElement("li");
              li.draggable = true;

              li.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", index.toString());
              });

              li.addEventListener("drop", (e) => {
                const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                const moved = tabList.splice(from, 1)[0];
                tabList.splice(index, 0, moved);
                chrome.storage.local.set({ [category]: tabList }, renderTabs);
              });

              const link = document.createElement("a");
              link.textContent = tab.title;
              link.title = tab.url;
              link.href = "#";
              link.addEventListener("click", () => chrome.tabs.create({ url: tab.url }));

              const btnGroup = document.createElement("div");
              btnGroup.className = "btn-group";

              const star = document.createElement("button");
              star.textContent = tab.isStarred ? "⭐" : "☆";
              star.className = tab.isStarred ? "starred" : "";
              star.addEventListener("click", ((i) => () => {
                tabList[i].isStarred = !tabList[i].isStarred;
                chrome.storage.local.set({ [category]: tabList }, renderTabs);
              })(index));

              const del = document.createElement("button");
              del.textContent = "×";
              del.addEventListener("click", () => {
                tabList.splice(index, 1);
                chrome.storage.local.set({ [category]: tabList }, renderTabs);
              });

              btnGroup.appendChild(star);
              btnGroup.appendChild(del);

              li.appendChild(link);
              li.appendChild(btnGroup);
              list.appendChild(li);
            }));

          card.appendChild(list);
          container.appendChild(card);
        });
      });
    });
  });
  updateCategorySelector();
}

// Setup event listeners for buttons and inputs
function setupListeners() {
  document.getElementById("saveTabBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const category = document.getElementById("categorySelect").value;
      chrome.storage.local.get([category], (result) => {
        const tabList = result[category] || [];
        tabList.push({ title: tab.title, url: tab.url });
        chrome.storage.local.set({ [category]: tabList }, renderTabs);
      });
    });
  });

  document.getElementById("addCategoryBtn").addEventListener("click", () => {
    const name = prompt(currentLang === 'zh' ? "输入新分类名称：" : "Enter new category name:");
    if (!name) return;

    getAllCategories((categories) => {
      if (categories.includes(name)) {
        alert(currentLang === 'zh' ? "分类已存在。" : "Category already exists.");
        return;
      }
      categories.push(name);
      chrome.storage.local.set({ categories, [name]: [] }, () => {
        renderTabs();
        updateCategorySelector();
      });
    });
  });

  document.getElementById("toggleThemeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  document.getElementById("importBookmarks").addEventListener("click", () => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const bookmarks = [];
      function traverse(nodes) {
        for (let node of nodes) {
          if (node.url) {
            bookmarks.push({ title: node.title, url: node.url });
          } else if (node.children) {
            traverse(node.children);
          }
        }
      }
      traverse(bookmarkTreeNodes);
      chrome.storage.local.set({ work: bookmarks }, renderTabs);
    });
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    chrome.storage.local.get(null, (allData) => {
      const json = JSON.stringify(allData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tabs_export.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById("searchInput").addEventListener("input", renderTabs);

  document.getElementById("langToggleBtn").addEventListener("click", () => {
    currentLang = currentLang === "en" ? "zh" : "en";
    applyLang();
  });
}

const LANG = {
  en: {
    addCategory: "New Category",
    importBookmarks: "Import Bookmarks",
    savetab: "Save Tab",
    toggleTheme: "Toggle Theme",
    export: "Export All Tabs",
    clear: "Clear",
    search: "Search tabs...",
    importJson: "Import JSON"
  },
  zh: {
    addCategory: "新建分类",
    importBookmarks: "导入书签",
    savetab: "保存标签页",
    toggleTheme: "切换主题",
    export: "导出全部标签页",
    clear: "清空",
    search: "搜索标签...",
    importJson: "导入JSON"
  }
};

let currentLang = "en";

function applyLang() {
  const L = LANG[currentLang];
  document.getElementById("addCategoryBtn").textContent = L.addCategory;
  document.getElementById("importBookmarks").textContent = L.importBookmarks;
  document.getElementById("saveTabBtn").textContent = L.savetab;
  document.getElementById("toggleThemeBtn").textContent = L.toggleTheme;
  document.getElementById("exportBtn").textContent = L.export;
  document.getElementById("searchInput").placeholder = `${L.search}`;
  document.getElementById("importJsonBtn").textContent = L.importJson;
  document.getElementById("langToggleBtn").textContent = currentLang === "en" ? "中文" : "English";

  document.querySelectorAll(".clear-btn").forEach(btn => {
    btn.textContent = L.clear;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTabs();
  setupListeners();
  applyLang();
});


document.getElementById("importJsonBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      chrome.storage.local.set(data, () => {
        alert(currentLang === "zh" ? "导入成功！" : "Import successful!");
        renderTabs();
        updateCategorySelector();
      });
    } catch (err) {
      alert(currentLang === "zh" ? "导入失败，文件格式有误。" : "Failed to import: invalid file format.");
    }
  };
  reader.readAsText(file);
});

let currentEditCategory = null;

function openStyleEditor(category) {
  currentEditCategory = category;
  document.getElementById("styleEditor").style.display = "block";
}

document.getElementById("saveStyleBtn").addEventListener("click", () => {
  const icon = document.getElementById("iconPicker").value;
  const color = document.getElementById("colorPicker").value;

  chrome.storage.local.get("categories_meta", (res) => {
    const meta = res.categories_meta || {};
    meta[currentEditCategory] = { icon, color };
    chrome.storage.local.set({ categories_meta: meta }, () => {
      document.getElementById("styleEditor").style.display = "none";
      renderTabs();
    });
  });
});
