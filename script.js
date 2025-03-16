document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input");
    const sendBtn = document.getElementById("sendBtn");
    const chat = document.getElementById("chat");
  
    const menuBtn = document.getElementById("menuBtn");
    const menuDropdown = document.getElementById("menuDropdown");
    const enterSelectionModeBtn = document.getElementById("enterSelectionModeBtn");
  
    const mainHeader = document.getElementById("mainHeader");
    const selectionHeader = document.getElementById("selectionHeader");
    const selectedCountText = document.getElementById("selectedCount");
    const cancelSelectionBtn = document.getElementById("cancelSelectionBtn");
  
    const inputArea = document.getElementById("inputArea");
    const deleteArea = document.getElementById("deleteArea");
    const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  
    let lastDate = "";
    let selectionMode = false;
    let selectedMessages = new Set();
    let savedTicket = null;
  
    // --- UI Events ---
    menuBtn.onclick = () => {
      menuDropdown.classList.toggle("hidden");
    };
  
    enterSelectionModeBtn.onclick = () => {
      enterSelectionMode();
      menuDropdown.classList.add("hidden");
    };
  
    cancelSelectionBtn.onclick = exitSelectionMode;
  
    deleteSelectedBtn.onclick = () => {
      selectedMessages.forEach(msg => msg.remove());
      exitSelectionMode();
      cleanUpEmptyDateDividers(); // <-- удаляет лишние даты
    };
  
    sendBtn.onclick = () => handleSendMessage(input.value);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSendMessage(input.value);
    });
  
    // --- Helpers ---
    function handleSendMessage(text) {
      text = text.trim();
      if (text === "") return;
  
      const time = getTime();
      const date = getFormattedDate();
  
      insertDateDividerIfNeeded(date);
  
      if (isTicketCode(text)) {
        savedTicket = text;
        chat.appendChild(createMessage("from-user", text, time));
        input.value = "";
        return;
      }
  
      if (isSevenDigitNumber(text) && savedTicket) {
        chat.appendChild(createMessage("from-user", text, time));
  
        const datetime = getCurrentDateTime();
        const randomCode = generateRandomCode();
        const response = `ONAY! ALA<br>AT ${datetime}<br>${savedTicket},120₸<br><a href="http://qr.tha.kz/${randomCode}" target="_blank">http://qr.tha.kz/${randomCode}</a>`;
  
        setTimeout(() => {
          chat.appendChild(createMessage("from-system", response, time));
        }, 300);
  
        input.value = "";
        return;
      }
  
      chat.appendChild(createMessage("from-user", text, time));
      input.value = "";
    }
  
    function insertDateDividerIfNeeded(currentDate) {
      if (lastDate !== currentDate) {
        lastDate = currentDate;
        const divider = document.createElement("div");
        divider.className = "date-divider";
        divider.textContent = currentDate;
        chat.appendChild(divider);
      }
    }
  
    function createMessage(cls, content, time) {
      const row = document.createElement("div");
      row.className = `message-row ${cls}`;
  
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
  
      const msg = document.createElement("div");
      msg.className = "message";
      msg.innerHTML = content;
  
      const timeEl = document.createElement("div");
      timeEl.className = "message-time";
      timeEl.textContent = time;
  
      bubble.appendChild(msg);
  
      if (cls === 'from-user') {
        row.appendChild(timeEl);
        row.appendChild(bubble);
      } else {
        row.appendChild(bubble);
        row.appendChild(timeEl);
      }
  
      // выбор при клике
      row.addEventListener("click", () => {
        if (selectionMode) toggleSelection(row);
      });
  
      return row;
    }
  
    function toggleSelection(msg) {
      if (selectedMessages.has(msg)) {
        msg.classList.remove("selected");
        selectedMessages.delete(msg);
      } else {
        msg.classList.add("selected");
        selectedMessages.add(msg);
      }
      updateSelectedCount();
    }
  
    function updateSelectedCount() {
      selectedCountText.textContent = `Выбрано: ${selectedMessages.size}`;
    }
  
    function enterSelectionMode() {
      selectionMode = true;
      mainHeader.classList.add("hidden");
      selectionHeader.classList.remove("hidden");
      inputArea.classList.add("hidden");
      deleteArea.classList.remove("hidden");
      updateSelectedCount();
    }
  
    function exitSelectionMode() {
      selectionMode = false;
      selectedMessages.forEach(msg => msg.classList.remove("selected"));
      selectedMessages.clear();
      mainHeader.classList.remove("hidden");
      selectionHeader.classList.add("hidden");
      inputArea.classList.remove("hidden");
      deleteArea.classList.add("hidden");
    }
  
    function cleanUpEmptyDateDividers() {
        const dividers = chat.querySelectorAll(".date-divider");
      
        dividers.forEach(divider => {
          let next = divider.nextElementSibling;
          let hasMessages = false;
      
          while (next && !next.classList.contains("date-divider")) {
            if (next.classList.contains("message-row")) {
              hasMessages = true;
              break;
            }
            next = next.nextElementSibling;
          }
      
          if (!hasMessages) {
            if (divider.textContent === lastDate) {
              lastDate = ""; // <-- сбрасываем, чтобы дата вставилась снова при следующем сообщении
            }
            divider.remove();
          }
        });
      }      
  
    // --- Format Helpers ---
    function getTime() {
      const now = new Date();
      return now.toTimeString().slice(0, 5);
    }
  
    function getFormattedDate() {
      const now = new Date();
      return now.toLocaleDateString("ru-RU", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  
    function getCurrentDateTime() {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${day}/${month} ${hours}:${minutes}`;
    }
  
    function generateRandomCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }
  
    function isTicketCode(text) {
      return /^[0]{0,3}\d{1,3},\d{3}[A-Z]{2}\d{2}$/.test(text.trim());
    }
  
    function isSevenDigitNumber(text) {
      return /^\d{7}$/.test(text.trim());
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('SW зарегистрирован'))
      .catch(err => console.log('Ошибка регистрации SW', err));
  }
  