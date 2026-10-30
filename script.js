/* ============================================
   Генератор номеров — основная логика (заглушка)
   ============================================ */

// Русские буквы, разрешённые на номерах: А, В, Е, К, М, Н, О, Р, С, У, Х, Т
const PLATE_LETTERS = ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'У', 'Х', 'Т'];

const SPIN_COST = 100;          // стоимость одной крутки
let balance = 1000;             // стартовый баланс монет
let regions = [];               // список регионов (грузим из data/regions.json)

const canvas = document.getElementById('plateCanvas');
const ctx = canvas.getContext('2d');
const balanceEl = document.getElementById('balance');
const spinButton = document.getElementById('spinButton');
const messageEl = document.getElementById('message');

// ---------- Загрузка регионов ----------
async function loadRegions() {
    try {
        const resp = await fetch('data/regions.json');
        regions = await resp.json();
    } catch (e) {
        // Фолбэк, если JSON не загрузился (например, открыли файл напрямую)
        console.warn('Не удалось загрузить regions.json, используем фолбэк.', e);
        regions = [
            { code: '77', name: 'Москва' },
            { code: '50', name: 'Московская область' },
            { code: '78', name: 'Санкт-Петербург' }
        ];
    }
}

// ---------- Генерация случайного номера ----------
function randomLetter() {
    return PLATE_LETTERS[Math.floor(Math.random() * PLATE_LETTERS.length)];
}

function generatePlate() {
    const digits = String(Math.floor(100 + Math.random() * 900)); // 3 цифры
    const region = regions[Math.floor(Math.random() * regions.length)] || { code: '77', name: 'Москва' };
    return {
        text: `${randomLetter()}${digits}${randomLetter()}${randomLetter()}`,
        regionCode: region.code,
        regionName: region.name,
    };
}

// ---------- Отрисовка номера на canvas ----------
function drawPlate(plate) {
    const W = canvas.width;
    const H = canvas.height;

    // Фон страницы-канваса
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#10152b';
    ctx.fillRect(0, 0, W, H);

    // Параметры номерной таблички
    const pw = 640;
    const ph = 260;
    const px = (W - pw) / 2;
    const py = (H - ph) / 2;
    const radius = 18;

    // Белая табличка со скруглёнными углами
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px + radius, py);
    ctx.arcTo(px + pw, py, px + pw, py + ph, radius);
    ctx.arcTo(px + pw, py + ph, px, py + ph, radius);
    ctx.arcTo(px, py + ph, px, py, radius);
    ctx.arcTo(px, py, px + pw, py, radius);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // Основной текст номера
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 110px Arial, sans-serif';
    ctx.fillText(plate.text, W / 2 - 40, py + ph / 2 - 20);

    // Блок региона: код + флаг России
    const rx = px + pw - 110;
    const rw = 80;

    // Триколор
    const flagY = py + 40;
    const flagH = 45;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx, flagY, rw, flagH / 3);
    ctx.fillStyle = '#0039a6';
    ctx.fillRect(rx, flagY + flagH / 3, rw, flagH / 3);
    ctx.fillStyle = '#d52b1e';
    ctx.fillRect(rx, flagY + (flagH * 2) / 3, rw, flagH / 3);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, flagY, rw, flagH);

    // Код региона
    ctx.fillStyle = '#000';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.fillText(plate.regionCode, rx + rw / 2, flagY + flagH + 55);

    // Название региона под табличкой
    ctx.fillStyle = '#8b90b5';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText(`Регион: ${plate.regionName} (${plate.regionCode})`, W / 2, py + ph + 55);
}

// ---------- Баланс ----------
function updateBalanceUI() {
    balanceEl.textContent = balance;
}

function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.classList.toggle('error', isError);
}

// ---------- Крутка ----------
function spin() {
    if (balance < SPIN_COST) {
        showMessage('Недостаточно монет! Баланс пополнить пока нельзя 😅', true);
        return;
    }

    balance -= SPIN_COST;
    updateBalanceUI();

    const plate = generatePlate();
    drawPlate(plate);
    showMessage(`Выпал номер ${plate.text} — ${plate.regionName}. Списано ${SPIN_COST} 🪙`);
}

// ---------- Инициализация ----------
(async function init() {
    await loadRegions();
    updateBalanceUI();

    // Стартовая отрисовка пустой таблички
    drawPlate({ text: 'А000А', regionCode: '77', regionName: '—' });

    spinButton.addEventListener('click', spin);
})();
