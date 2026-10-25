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

function updateProgress() {
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    if (!progressText || !progressBar || riddles.length === 0) return;

    const hasIntro = riddles[0] && String(riddles[0].id) === "0";
    const totalRiddles = hasIntro ? riddles.length - 1 : riddles.length;

    if (hasIntro && currentIndex === 0) {
        progressText.innerText = `說明 (共 ${totalRiddles} 題)`;
        progressBar.style.width = '0%';
    } else {
        const currentNum = hasIntro ? currentIndex : currentIndex + 1;
        progressText.innerText = `第 ${currentNum} / ${totalRiddles} 題`;
        const percentage = Math.round((currentNum / totalRiddles) * 100);
        progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
}

function updateStatusBadge(state, detail = {}) {
    const badge = document.getElementById('status-badge');
    if (!badge) return;

    badge.className = 'status-badge';
    if (state === 'intro') {
        badge.innerText = '📖 操作引導';
    } else if (state === 'thinking') {
        badge.innerText = '🤔 思考中';
    } else if (state === 'hint') {
        badge.classList.add('status-hint');
        const { current, total } = detail;
        if (total > 0) {
            badge.innerText = `💡 提示 (${current}/${total})`;
        } else {
            badge.innerText = '💡 此題無提示';
        }
    } else if (state === 'answer') {
        badge.classList.add('status-answer');
        badge.innerText = '🎉 答案揭曉';
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
        window.location.hash = `id=${riddles[0].id}`;
        return; // hash 改變會觸發 onhashchange，所以這裡 return
    }
    
    currentStep = 0;
    displayRiddle(riddles[currentIndex]);
}

function showAnswer() {
    const answerSection = document.getElementById('answer-section');
    if (answerSection) {
        answerSection.classList.remove('hidden');
    }
    const answerDisplay = document.getElementById('answer-display');
    if (answerDisplay) {
        answerDisplay.classList.remove('hidden');
    }
    currentStep = 2; // 進入答案模式
    updateStatusBadge('answer');
}

function displayRiddle(item) {
    console.log("正在顯示題目 ID:", item.id);
    document.getElementById('question').innerText = item.question;
    
    // 題目台羅拼音
    const qTlDisplay = document.getElementById('question-tl');
    if (qTlDisplay) {
        qTlDisplay.innerText = item.question_tl || "";
    }

    // 清空並初始化提示區域
    const hintDisplay = document.getElementById('hint-display');
    hintDisplay.innerHTML = ""; 
    hintDisplay.classList.add('hidden');
    
    // 初始化答案與由來解析
    const answerSection = document.getElementById('answer-section');
    if (answerSection) answerSection.classList.add('hidden');

    const answerDisplay = document.getElementById('answer-display');
    answerDisplay.innerText = `答案：${item.answer}`;
    answerDisplay.classList.add('hidden');

    // 答案台羅拼音
    const aTlDisplay = document.getElementById('answer-tl');
    if (aTlDisplay) {
        aTlDisplay.innerText = item.answer_tl ? `(${item.answer_tl})` : "";
    }

    const expDisplay = document.getElementById('explanation-display');
    if (expDisplay) {
        if (item.explanation) {
            expDisplay.innerHTML = `<span class="exp-title">📖 解析：</span>${item.explanation}`;
            expDisplay.classList.remove('hidden');
        } else {
            expDisplay.innerHTML = "";
            expDisplay.classList.add('hidden');
        }
    }
    
    // 重設狀態
    currentStep = 0; 
    currentHintIndex = 0; 

    // 更新導覽按鈕
    document.getElementById('btn-prev').disabled = (currentIndex === 0);
    document.getElementById('btn-next').disabled = (currentIndex === riddles.length - 1);

    // 更新進度指示與當前狀態標籤
    updateProgress();
    if (String(item.id) === "0") {
        updateStatusBadge('intro');
    } else {
        updateStatusBadge('thinking');
    }
}

function handleAdvanceStep() {
    const item = riddles[currentIndex];
    const hintDisplay = document.getElementById('hint-display');
    const hints = Array.isArray(item.hint) ? item.hint : [];

    // 狀態 0 或 1：處理提示顯示
    if (currentStep === 0 || currentStep === 1) {
        if (hints.length > 0 && currentHintIndex < hints.length) {
            // 如果還有提示沒顯示
            const newHint = document.createElement('div');
            newHint.innerText = `提示 ${currentHintIndex + 1}：${hints[currentHintIndex]}`;
            hintDisplay.appendChild(newHint);
            hintDisplay.classList.remove('hidden');
            
            currentHintIndex++;
            currentStep = 1; // 進入提示模式
            updateStatusBadge('hint', { current: currentHintIndex, total: hints.length });
        } else {
            // 沒有提示或提示已顯示完畢 -> 顯示答案
            if (hints.length === 0 && currentStep === 0) {
                hintDisplay.innerText = "此題無提示";
                hintDisplay.classList.remove('hidden');
                currentStep = 1; // 先讓使用者看「無提示」，下次按才出答案
                updateStatusBadge('hint', { current: 0, total: 0 });
            } else {
                showAnswer();
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

// 專門處理提示按鈕的邏輯 - 只顯示提示，不顯示答案
function handleHintClick() {
    const item = riddles[currentIndex];
    const hintDisplay = document.getElementById('hint-display');
    const hints = Array.isArray(item.hint) ? item.hint : [];

    // 如果還有提示沒顯示
    if (hints.length > 0 && currentHintIndex < hints.length) {
        const newHint = document.createElement('div');
        newHint.innerText = `提示 ${currentHintIndex + 1}：${hints[currentHintIndex]}`;
        hintDisplay.appendChild(newHint);
        hintDisplay.classList.remove('hidden');
        
        currentHintIndex++;
        currentStep = 1; // 進入提示模式
        updateStatusBadge('hint', { current: currentHintIndex, total: hints.length });
    } else if (currentHintIndex === 0 && hints.length === 0) {
        // 完全沒有提示的情況
        hintDisplay.innerText = "此題無提示";
        hintDisplay.classList.remove('hidden');
        currentStep = 1;
        updateStatusBadge('hint', { current: 0, total: 0 });
    }
}

// 鍵盤監聽
document.addEventListener('keydown', (e) => {
    // 防止在輸入框中觸發（雖然目前沒有輸入框，但以防萬一）
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
        case 'ArrowLeft':
            e.preventDefault();
            if (currentIndex > 0) {
                window.location.hash = `id=${riddles[currentIndex - 1].id}`;
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (currentIndex < riddles.length - 1) {
                window.location.hash = `id=${riddles[currentIndex + 1].id}`;
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            handleHintClick();
            break;
        case 'ArrowDown':
            e.preventDefault();
            showAnswer();
            break;
        case 'Space':
            e.preventDefault();
            handleAdvanceStep();
            break;
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
// 提示與答案按鈕
document.getElementById('btn-hint').onclick = handleHintClick;
document.getElementById('btn-answer').onclick = () => {
    // 點擊「看答案」按鈕直接強制跳到顯示答案
    showAnswer();
};
// 啟動！
loadData();