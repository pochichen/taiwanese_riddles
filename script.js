let riddles = [];
let currentIndex = -1;
let currentStep = 0; // 0: 題目, 1: 提示, 2: 答案

async function loadData() {
    console.log('start loading...');
    try {
        const response = await fetch('./riddles.json');
        riddles = await response.json();
        console.log('finish loading');
        handleRouting();
    } catch (e) {
        document.getElementById('question').innerText = "無法載入謎題資料";
    }
}

function handleRouting() {
    const hash = window.location.hash;
    console.log("當前 Hash:", hash); // 偵錯用

    // 取得 ID
    let targetId = null;
    if (hash.includes('id=')) {
        targetId = hash.split('id=')[1];
    }
    console.log('targetId: ', targetId);

    // 在 riddles 陣列中尋找
    currentIndex = riddles.findIndex(r => String(r.id) === String(targetId));

    // 如果找不到 (例如剛進入網頁 hash 為空)，預設顯示第一題
    if (currentIndex === -1) {
        console.log("找不到 ID 或 Hash 為空，導向第一題");
        currentIndex = 0;
        // 如果網址完全沒 Hash，補上它
        if (!hash) window.location.hash = `id=${riddles[0].id}`;
    }
    
    displayRiddle(riddles[currentIndex]);
}

function displayRiddle(item) {
    document.getElementById('question').innerText = item.question;
    
    // 處理提示文字內容
    const hintText = (item.hint && item.hint.length > 0) ? `提示：${item.hint.join('、')}` : "此題無提示";
    document.getElementById('hint-display').innerText = hintText;
    document.getElementById('answer-display').innerText = `答案：${item.answer}`;
    
    // 初始狀態：隱藏提示與答案
    document.getElementById('hint-display').classList.add('hidden');
    document.getElementById('answer-display').classList.add('hidden');
    
    // 導覽按鈕狀態
    document.getElementById('btn-prev').disabled = (currentIndex === 0);
    document.getElementById('btn-next').disabled = (currentIndex === riddles.length - 1);
}

// 空白鍵控制邏輯
function handleSpaceKey() {
    if (currentStep === 0) {
        // 進入提示階段
        document.getElementById('hint-display').classList.remove('hidden');
        currentStep = 1;
    } else if (currentStep === 1) {
        // 進入答案階段
        document.getElementById('answer-display').classList.remove('hidden');
        currentStep = 2;
    } else if (currentStep === 2) {
        // 進入下一題
        if (currentIndex < riddles.length - 1) {
            const nextId = riddles[currentIndex + 1].id;
            window.location.hash = `id=${nextId}`;
        } else {
            alert("已經是最後一題了！");
        }
    }
}

// 監聽鍵盤事件
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); // 防止空白鍵捲動網頁
        handleSpaceKey();
    }
});

// 保留原有的按鈕點擊功能
document.getElementById('btn-prev').onclick = () => {
    if (currentIndex > 0) window.location.hash = `id=${riddles[currentIndex - 1].id}`;
};

document.getElementById('btn-next').onclick = () => {
    if (currentIndex < riddles.length - 1) window.location.hash = `id=${riddles[currentIndex + 1].id}`;
};

document.getElementById('btn-hint').onclick = () => {
    document.getElementById('hint-display').classList.toggle('hidden');
};

document.getElementById('btn-answer').onclick = () => {
    document.getElementById('answer-display').classList.toggle('hidden');
};

window.onhashchange = handleRouting;
loadData();
