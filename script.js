let riddles = []; // 確保它是全域變數
let currentIndex = -1;
let currentStep = 0;

async function loadData() {
    console.log("1. 開始執行 loadData...");
    try {
        // 使用相對路徑抓取同目錄下的 json
        const response = await fetch('./riddles.json');
        
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }

        riddles = await response.json();
        console.log("2. 資料成功載入，筆數:", riddles.length);

        if (riddles.length > 0) {
            handleRouting();
        } else {
            document.getElementById('question').innerText = "JSON 檔案內沒有資料";
        }

    } catch (e) {
        console.error("❌ 載入失敗:", e);
        document.getElementById('question').innerText = "載入失敗: " + e.message;
    }
}

function handleRouting() {
    const hash = window.location.hash;
    console.log("3. 當前 Hash:", hash);

    // 取得 ID (從 #id=X 提取 X)
    let targetId = null;
    if (hash.includes('id=')) {
        targetId = hash.split('id=')[1];
    }

    // 關鍵修正：將 ID 轉為字串比較，避免型別錯誤
    currentIndex = riddles.findIndex(r => String(r.id) === String(targetId));

    // 如果找不到或是剛進網頁，自動導向第一題
    if (currentIndex === -1) {
        console.log("4. 找不到對應 ID，導向第一題");
        currentIndex = 0;
        // 只有在完全沒 hash 的情況下才更新 hash，避免無窮迴圈
        if (!hash.includes('id=')) {
            window.location.hash = `id=${riddles[0].id}`;
            return; // hash 改變會觸發 onhashchange，所以這裡 return
        }
    }
    
    currentStep = 0;
    displayRiddle(riddles[currentIndex]);
}

function displayRiddle(item) {
    console.log("5. 正在顯示題目 ID:", item.id);
    document.getElementById('question').innerText = item.question;
    
    const hintText = (item.hint && item.hint.length > 0) ? `提示：${item.hint.join('、')}` : "此題無提示";
    document.getElementById('hint-display').innerText = hintText;
    document.getElementById('answer-display').innerText = `答案：${item.answer}`;
    
    document.getElementById('hint-display').classList.add('hidden');
    document.getElementById('answer-display').classList.add('hidden');
    
    // 更新按鈕狀態
    document.getElementById('btn-prev').disabled = (currentIndex === 0);
    document.getElementById('btn-next').disabled = (currentIndex === riddles.length - 1);
}

// 事件監聽
window.onhashchange = handleRouting;

// 鍵盤空白鍵邏輯
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (currentStep === 0) {
            document.getElementById('hint-display').classList.remove('hidden');
            currentStep = 1;
        } else if (currentStep === 1) {
            document.getElementById('answer-display').classList.remove('hidden');
            currentStep = 2;
        } else if (currentStep === 2) {
            if (currentIndex < riddles.length - 1) {
                window.location.hash = `id=${riddles[currentIndex + 1].id}`;
            }
        }
    }
});

// 按鈕邏輯
document.getElementById('btn-prev').onclick = () => {
    if (currentIndex > 0) window.location.hash = `id=${riddles[currentIndex - 1].id}`;
};
document.getElementById('btn-next').onclick = () => {
    if (currentIndex < riddles.length - 1) window.location.hash = `id=${riddles[currentIndex + 1].id}`;
};
document.getElementById('btn-hint').onclick = () => document.getElementById('hint-display').classList.toggle('hidden');
document.getElementById('btn-answer').onclick = () => document.getElementById('answer-display').classList.toggle('hidden');

// 啟動！
loadData();