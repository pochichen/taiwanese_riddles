let riddles = []; // 確保它是全域變數
let currentIndex = -1;
let currentStep = 0;
let currentHintIndex = 0; // 新增：用來追蹤目前顯示到第幾個提示

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
    console.log("正在顯示題目 ID:", item.id);
    document.getElementById('question').innerText = item.question;
    
    // 清空並初始化提示區域
    const hintDisplay = document.getElementById('hint-display');
    hintDisplay.innerHTML = ""; 
    hintDisplay.classList.add('hidden');
    
    document.getElementById('answer-display').innerText = `答案：${item.answer}`;
    document.getElementById('answer-display').classList.add('hidden');
    
    // 重設狀態
    currentStep = 0; 
    currentHintIndex = 0; 

    // 更新導覽按鈕
    document.getElementById('btn-prev').disabled = (currentIndex === 0);
    document.getElementById('btn-next').disabled = (currentIndex === riddles.length - 1);
}

function handleAdvanceStep() {
    const item = riddles[currentIndex];
    const hintDisplay = document.getElementById('hint-display');
    const answerDisplay = document.getElementById('answer-display');

    // 狀態 0 或 1：處理提示顯示
    if (currentStep === 0 || currentStep === 1) {
        if (item.hint && currentHintIndex < item.hint.length) {
            // 如果還有提示沒顯示
            const newHint = document.createElement('div');
            newHint.innerText = `提示 ${currentHintIndex + 1}：${item.hint[currentHintIndex]}`;
            hintDisplay.appendChild(newHint);
            hintDisplay.classList.remove('hidden');
            
            currentHintIndex++;
            currentStep = 1; // 進入提示模式
        } else {
            // 沒有提示或提示已顯示完畢 -> 顯示答案
            if (item.hint.length === 0 && currentStep === 0) {
                hintDisplay.innerText = "此題無提示";
                hintDisplay.classList.remove('hidden');
                currentStep = 1; // 先讓使用者看「無提示」，下次按才出答案
            } else {
                answerDisplay.classList.remove('hidden');
                currentStep = 2; // 進入答案模式
            }
        }
    } 
    // 狀態 2：跳下一題
    else if (currentStep === 2) {
        if (currentIndex < riddles.length - 1) {
            window.location.hash = `id=${riddles[currentIndex + 1].id}`;
        }
    }
}

// 修改鍵盤監聽
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleAdvanceStep();
    }
});

// 事件監聽
window.onhashchange = handleRouting;

// 按鈕邏輯
document.getElementById('btn-prev').onclick = () => {
    if (currentIndex > 0) window.location.hash = `id=${riddles[currentIndex - 1].id}`;
};
document.getElementById('btn-next').onclick = () => {
    if (currentIndex < riddles.length - 1) window.location.hash = `id=${riddles[currentIndex + 1].id}`;
};
// 修改提示與答案按鈕（讓它們也遵循這個流程）
document.getElementById('btn-hint').onclick = handleAdvanceStep;
document.getElementById('btn-answer').onclick = () => {
    // 點擊「看答案」按鈕直接強制跳到顯示答案
    document.getElementById('answer-display').classList.remove('hidden');
    currentStep = 2;
};
// 啟動！
loadData();