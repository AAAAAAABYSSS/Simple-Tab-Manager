document.getElementById("importConfirmBtn").addEventListener("click", () => {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];
    const status = document.getElementById("importStatus");
  
    if (!file) {
      status.style.color = "red";
      status.textContent = "Please select a file first.";
      return;
    }
  
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
  
          const merged = {
            ...existing,
            ...data,
            categories: mergedCategories,
            categories_meta: {
              ...(existing.categories_meta || {}),
              ...(data.categories_meta || {})
            }
          };
  
          chrome.storage.local.set(merged, () => {
            status.style.color = "green";
            status.textContent = "✅ Tabs imported successfully!";
          });
        });
      } catch (err) {
        status.style.color = "red";
        status.textContent = "❌ Invalid file format.";
      }
    };
    reader.readAsText(file);
  });
  