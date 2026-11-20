const exprEl = document.getElementById('expr');
const resEl = document.getElementById('result');
const html = document.documentElement;
let current = '';

function vib(ms = 12) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

function evalExpr(raw) {
    try {
        let s = raw
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/,/g, '.')
            .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
        if (!/^[0-9+\-*/().\s]+$/.test(s)) return 'Ошибка';
        const open = (s.match(/\(/g) || []).length;
        const close = (s.match(/\)/g) || []).length;
        if (open > close) s += ')'.repeat(open - close);
        const val = Function('"use strict"; return (' + s + ')')();
        if (!isFinite(val) || Number.isNaN(val)) return 'Ошибка';
        return Number(val.toPrecision(12)).toString().replace('.', ',');
    } catch {
        return 'Ошибка';
    }
}

function update() {
    resEl.textContent = current || '0';
}

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        vib();
        const v = btn.dataset.val;
        const act = btn.dataset.action;

        if (act === 'clear') {
            current = '';
            exprEl.textContent = '';
        } else if (act === 'back') {
            current = current === 'Ошибка' ? '' : current.slice(0, -1);
        } else if (act === 'paren') {
            const open = (current.match(/\(/g) || []).length;
            const close = (current.match(/\)/g) || []).length;
            const last = current.slice(-1);
            if (open > close && /[0-9,)]/.test(last)) current += ')';
            else current += /[0-9,)]/.test(last) ? '×(' : '(';
        } else if (act === 'eq') {
            if (!current) return;
            exprEl.textContent = current + ' =';
            current = evalExpr(current);
        } else if (v) {
            if (current === 'Ошибка') current = '';
            current += v;
        }
        update();
    });
});

document.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        vib(8);
        document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
        sw.classList.add('active');
        html.setAttribute('data-theme', sw.dataset.theme);
        localStorage.setItem('m3_theme', sw.dataset.theme);
    });
});

document.getElementById('darkToggle').addEventListener('click', () => {
    vib(8);
    html.classList.toggle('dark');
    localStorage.setItem('m3_dark', html.classList.contains('dark') ? '1' : '0');
});

const savedTheme = localStorage.getItem('m3_theme');
if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.swatch').forEach(x => x.classList.toggle('active', x.dataset.theme === savedTheme));
}
if (localStorage.getItem('m3_dark') === '1') html.classList.add('dark');
