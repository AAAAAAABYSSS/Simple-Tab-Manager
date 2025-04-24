// popup.js

function getAllCategories(callback) {
  chrome.storage.local.get(null, (res) => {
    const reserved = ["categories", "categories_meta", "collapsedCategories"];
    const categories = Object.keys(res).filter(k =>
      Array.isArray(res[k]) &&
      !reserved.includes(k)
    );
    callback(categories);
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

function deleteCategory(categoryToDelete) {
  chrome.storage.local.get(["categories", "categories_meta"], (res) => {
    const updatedCategories = (res.categories || []).filter(cat => cat !== categoryToDelete);
    const updatedMeta = { ...res.categories_meta };
    delete updatedMeta[categoryToDelete];

    // Remove both the category and its data
    chrome.storage.local.remove([categoryToDelete], () => {
      chrome.storage.local.set({
        categories: updatedCategories,
        categories_meta: updatedMeta
      }, () => {
        renderTabs();
        updateCategorySelector();
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

      categories
        .filter(category => category !== "categories")
        .forEach((category) => {
          chrome.storage.local.get([category], (result) => {
            const tabList = result[category] || [];

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
            deleteBtn.addEventListener("click", () => deleteCategory(category));

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

            const filteredTabList = tabList.filter(tab =>
              tab && typeof tab.title === "string" && typeof tab.url === "string"
                && (tab.title.toLowerCase().includes(searchQuery) || tab.url.toLowerCase().includes(searchQuery))
            );

            filteredTabList.forEach((tab) => {
              const li = document.createElement("li");
              li.draggable = true;

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
              star.addEventListener("click", () => {
                const realTab = tabList.find(t => t.title === tab.title && t.url === tab.url);
                if (realTab) {
                  realTab.isStarred = !realTab.isStarred;
                  chrome.storage.local.set({ [category]: tabList }, renderTabs);
                }
              });

              const del = document.createElement("button");
              del.textContent = "×";
              del.addEventListener("click", () => {
                const indexToRemove = tabList.findIndex(t => t.title === tab.title && t.url === tab.url);
                if (indexToRemove !== -1) {
                  tabList.splice(indexToRemove, 1);
                  chrome.storage.local.set({ [category]: tabList }, renderTabs);
                }
              });

              btnGroup.appendChild(star);
              btnGroup.appendChild(del);
              li.appendChild(link);
              li.appendChild(btnGroup);
              list.appendChild(li);
            });

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

  // document.getElementById("importBookmarks").addEventListener("click", () => {
  //   chrome.bookmarks.getTree((bookmarkTreeNodes) => {
  //     const bookmarks = [];
  //     function traverse(nodes) {
  //       for (let node of nodes) {
  //         if (node.url) {
  //           bookmarks.push({ title: node.title, url: node.url });
  //         } else if (node.children) {
  //           traverse(node.children);
  //         }
  //       }
  //     }
  //     traverse(bookmarkTreeNodes);
  //     chrome.storage.local.set({ work: bookmarks }, renderTabs);
  //   });
  // });

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
    savetab: "Save Tab",
    toggleTheme: "Toggle Theme",
    export: "Export All Tabs",
    importTabs: "Import Tabs",
    importJson: "Import JSON",
    clear: "Clear",
    search: "Search tabs...",
    importJson: "Import JSON"
  },
  zh: {
    addCategory: "新建分类",
    savetab: "保存标签页",
    toggleTheme: "切换主题",
    export: "导出全部标签页",
    importTabs: "导入标签页",
    importJson: "导入JSON",
    clear: "清空",
    search: "搜索标签...",
    importJson: "导入JSON"
  }
};

let currentLang = "en";

function applyLang() {
  const L = LANG[currentLang];
  document.getElementById("addCategoryBtn").textContent = L.addCategory;
  document.getElementById("saveTabBtn").textContent = L.savetab;
  document.getElementById("toggleThemeBtn").textContent = L.toggleTheme;
  document.getElementById("exportBtn").textContent = L.export;
  document.getElementById("showBookmarkImporter").textContent = L.importTabs;
  document.getElementById("importOptionsBtn").textContent = L.importJson;
  document.getElementById("searchInput").placeholder = `${L.search}`;
  document.getElementById("langToggleBtn").textContent = currentLang === "en" ? "中文" : "English";

  document.querySelectorAll(".clear-btn").forEach(btn => {
    btn.textContent = L.clear;
  });
}

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      chrome.storage.local.get(null, (existing) => {
        const reservedKeys = ["categories", "categories_meta", "collapsedCategories"];
        const isValidTabArray = (arr) =>
          Array.isArray(arr) &&
          arr.some(item => item && typeof item.title === "string" && typeof item.url === "string");

        const validTabKeys = Object.keys(data).filter(k =>
          !reservedKeys.includes(k) && isValidTabArray(data[k])
        );

        const mergedCategories = Array.from(new Set([
          ...(existing.categories || []),
          ...(data.categories || []),
          ...validTabKeys
        ]));

        const mergedMeta = {
          ...(existing.categories_meta || {}),
          ...(data.categories_meta || {})
        };

        const merged = {
          ...existing,
          ...data,
          categories: mergedCategories,
          categories_meta: mergedMeta
        };

        chrome.storage.local.set(merged, () => {
          alert("导入成功！请重新打开插件查看效果");
        });
      });
    } catch (err) {
      alert("导入失败，文件格式错误");
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


function createBookmarkTreeUI() {
  chrome.bookmarks.getTree((nodes) => {
    const treeContainer = document.getElementById("bookmarkTree");
    treeContainer.innerHTML = "";

    function renderNode(node, parent) {
      const item = document.createElement("div");
      item.style.marginLeft = "20px";

      if (node.url) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.dataset.title = node.title;
        checkbox.dataset.url = node.url;

        const label = document.createElement("label");
        label.textContent = node.title;
        label.style.marginLeft = "4px";

        item.appendChild(checkbox);
        item.appendChild(label);
      } else {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
      
        const folderCheckbox = document.createElement("input");
        folderCheckbox.type = "checkbox";
        folderCheckbox.style.marginRight = "4px";
      
        summary.appendChild(folderCheckbox);
        summary.appendChild(document.createTextNode(node.title || "Unnamed Folder"));
        details.appendChild(summary);
      
        folderCheckbox.addEventListener("change", (e) => {
          const check = (elem) => {
            elem.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = e.target.checked);
          };
          check(details);
        });
      
        node.children?.forEach(child => renderNode(child, details));
        item.appendChild(details);
      }
      parent.appendChild(item);
    }

    nodes.forEach(n => renderNode(n, treeContainer));
  });
}

function setupBookmarkImportUI() {
  const importer = document.getElementById("bookmarkImporter");
  importer.style.display = "block";
  createBookmarkTreeUI();

  const confirmBtn = document.getElementById("confirmImportBookmarks");
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      const checkboxes = document.querySelectorAll("#bookmarkTree input[type='checkbox']:checked");
      const categoryPath = document.getElementById("bookmarkImportCategory").value.trim();
      if (!categoryPath) return alert("Please specify a category name");

      const tabs = Array.from(checkboxes).map(cb => ({ title: cb.dataset.title, url: cb.dataset.url }));

      const category = categoryPath.toLowerCase();
      chrome.storage.local.get([category], (res) => {
        const existing = res[category] || [];
        chrome.storage.local.set({ [category]: [...existing, ...tabs] }, () => {
          alert(`\u60a8\u9009\u4e2d\u7684\u4e66\u7b7e\u5df2\u5bfc\u5165\u81f3\u201c${category}\u201d`);
          document.getElementById("bookmarkImporter").style.display = "none";
          renderTabs();
          updateCategorySelector();
        });
      });
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTabs();              
  setupListeners();         
  applyLang();
  const showBtn = document.getElementById("showBookmarkImporter");
  if (showBtn) {
    showBtn.addEventListener("click", setupBookmarkImportUI);
  }
  const importOptionsBtn = document.getElementById("importOptionsBtn");
if (importOptionsBtn) {
  importOptionsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}

});

