// Telegram Web App initialization
let tg = window.Telegram.WebApp;

// Initialize the app
if (tg) {
    tg.ready();
    tg.expand();
    
    // Настройка кнопок
    tg.MainButton.setText('Связаться с мастером');
    tg.MainButton.show();
    
    tg.MainButton.onClick(function() {
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    });
}

// Test bot connection
async function testBotConnection() {
    try {
        const url = `https://api.telegram.org/bot${BOT_CONFIG.BOT_TOKEN}/getMe`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
            console.log('Bot connection successful:', data.result);
            return true;
        } else {
            console.error('Bot connection failed:', data);
            return false;
        }
    } catch (error) {
        console.error('Error testing bot connection:', error);
        return false;
    }
}

// Test connection on page load
testBotConnection();

// Configuration - используем данные из config.js
const BOT_CONFIG = {
    BOT_TOKEN: '7384535948:AAG8iixpK8dKgQv8EE_ifxbj51JW6xZRTts',
    CHAT_ID: '817948942'
};

// Utility functions
function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('orderForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function showLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Отправка...';
    button.disabled = true;
    return originalText;
}

function hideLoading(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

// Form validation
function validateForm(formData) {
    const requiredFields = ['customerName', 'customerContact', 'jewelryType', 'description'];
    
    for (const field of requiredFields) {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            return `Поле "${getFieldLabel(field)}" обязательно для заполнения`;
        }
    }
    
    return null;
}

function getFieldLabel(fieldName) {
    const labels = {
        'customerName': 'Ваше имя',
        'customerContact': 'Контакт для связи',
        'jewelryType': 'Тип украшения',
        'description': 'Описание желаемого украшения'
    };
    return labels[fieldName] || fieldName;
}

// Format form data for Telegram
function formatOrderMessage(formData) {
    const jewelryTypeLabels = {
        'ring': 'Кольцо',
        'earrings': 'Серьги',
        'necklace': 'Ожерелье/Кулон',
        'bracelet': 'Браслет',
        'set': 'Комплект',
        'other': 'Другое'
    };
    
    const budgetLabels = {
        '5000-10000': '5,000 - 10,000 руб',
        '10000-20000': '10,000 - 20,000 руб',
        '20000-50000': '20,000 - 50,000 руб',
        '50000+': '50,000+ руб'
    };
    
    const timelineLabels = {
        '1week': 'В течение недели',
        '2weeks': 'В течение 2 недель',
        '1month': 'В течение месяца',
        'flexible': 'Гибкие сроки'
    };
    
    let message = `🛍️ *НОВЫЙ ЗАКАЗ УКРАШЕНИЯ*\n\n`;
    message += `👤 *Клиент:* ${formData.get('customerName')}\n`;
    message += `📞 *Контакт:* ${formData.get('customerContact')}\n`;
    message += `💎 *Тип украшения:* ${jewelryTypeLabels[formData.get('jewelryType')] || formData.get('jewelryType')}\n\n`;
    
    if (formData.get('materials')) {
        message += `🔧 *Материалы:* ${formData.get('materials')}\n`;
    }
    
    if (formData.get('colors')) {
        message += `🎨 *Цвета:* ${formData.get('colors')}\n`;
    }
    
    if (formData.get('budget')) {
        message += `💰 *Бюджет:* ${budgetLabels[formData.get('budget')] || formData.get('budget')}\n`;
    }
    
    if (formData.get('timeline')) {
        message += `⏰ *Сроки:* ${timelineLabels[formData.get('timeline')] || formData.get('timeline')}\n`;
    }
    
    message += `\n📝 *Описание:*\n${formData.get('description')}\n\n`;
    message += `🕐 *Время заказа:* ${new Date().toLocaleString('ru-RU')}`;
    
    return message;
}

// Send order via Telegram Bot API
async function sendOrderToTelegram(message) {
    const url = `https://api.telegram.org/bot${BOT_CONFIG.BOT_TOKEN}/sendMessage`;
    
    console.log('Отправка сообщения в Telegram...');
    console.log('URL:', url);
    console.log('Chat ID:', BOT_CONFIG.CHAT_ID);
    console.log('Message:', message);
    
    // Сначала попробуем с Markdown
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: BOT_CONFIG.CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    // Если Markdown не работает, попробуем без него
    if (!response.ok) {
        console.log('Markdown failed, trying without parse_mode...');
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: BOT_CONFIG.CHAT_ID,
                text: message
            })
        });
        
        console.log('Second attempt - Response status:', response.status);
        console.log('Second attempt - Response ok:', response.ok);
    }
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Success response:', result);
    return result;
}

// Alternative: Send via Telegram Web App (if available)
function sendViaTelegramWebApp(message) {
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify({
            type: 'order',
            message: message,
            timestamp: new Date().toISOString()
        }));
        return true;
    }
    return false;
}

// Show share button as fallback
function showShareButton(message) {
    const shareButton = document.createElement('button');
    shareButton.className = 'submit-btn';
    shareButton.innerHTML = '📤 Отправить заказ в чат';
    shareButton.style.marginTop = '10px';
    shareButton.style.width = '100%';
    
    shareButton.onclick = function() {
        // Создаем ссылку для отправки в Telegram
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('Заказ украшения')}&text=${encodeURIComponent(message)}`;
        window.open(telegramUrl, '_blank');
        
        showMessage('📱 Откройте Telegram и отправьте сообщение мастеру', 'success');
        shareButton.remove();
    };
    
    const form = document.getElementById('orderForm');
    form.parentNode.insertBefore(shareButton, form.nextSibling);
}

// Show send options
function showSendOptions(message) {
    // Remove existing options
    const existingOptions = document.querySelectorAll('.send-options');
    existingOptions.forEach(option => option.remove());
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'send-options';
    optionsDiv.style.marginTop = '20px';
    optionsDiv.style.textAlign = 'center';
    
    optionsDiv.innerHTML = `
        <h4 style="margin-bottom: 15px; color: #495057;">Выберите способ отправки:</h4>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            <button class="send-option-btn" onclick="sendViaEmail('${message.replace(/'/g, "\\'")}')">
                📧 Отправить на почту
            </button>
            <button class="send-option-btn" onclick="sendViaTelegram('${message.replace(/'/g, "\\'")}')">
                📱 Отправить в Telegram
            </button>
            <button class="send-option-btn" onclick="copyToClipboard('${message.replace(/'/g, "\\'")}')">
                📋 Скопировать текст
            </button>
        </div>
    `;
    
    const form = document.getElementById('orderForm');
    form.parentNode.insertBefore(optionsDiv, form.nextSibling);
}

// Send via email
function sendViaEmail(message) {
    const emailTo = 'samsung20152637@gmail.com'; // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ EMAIL
    const emailSubject = encodeURIComponent('Новый заказ украшения');
    const emailBody = encodeURIComponent(message);
    const mailtoLink = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
    
    window.open(mailtoLink, '_blank');
    showMessage('📧 Откройте почтовый клиент и отправьте письмо', 'success');
}

// Send via Telegram
function sendViaTelegram(message) {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('Заказ украшения')}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
    showMessage('📱 Откройте Telegram и отправьте сообщение мастеру', 'success');
}

// Copy to clipboard
function copyToClipboard(message) {
    navigator.clipboard.writeText(message).then(() => {
        showMessage('📋 Текст заказа скопирован! Теперь можете отправить его мастеру любым способом', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = message;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showMessage('📋 Текст заказа скопирован!', 'success');
    });
}

// Form submission handler
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('.submit-btn');
    
    // Validate form
    const validationError = validateForm(formData);
    if (validationError) {
        showMessage(validationError, 'error');
        return;
    }
    
    // Show loading state
    const originalButtonText = showLoading(submitButton);
    
    try {
        // Format the message
        const message = formatOrderMessage(formData);
        
        // Отправка заказа на почту девушки
        let sent = false;
        
        try {
            // Создаем ссылку для отправки на почту
            const emailSubject = encodeURIComponent('Новый заказ украшения');
            const emailBody = encodeURIComponent(message);
            const emailTo = 'jewelry.master@example.com'; // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ EMAIL ДЕВУШКИ
            
            // Создаем mailto ссылку
            const mailtoLink = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
            
            // Открываем почтовый клиент
            window.open(mailtoLink, '_blank');
            
            sent = true;
            console.log('Заказ отправлен на почту');
            
        } catch (error) {
            console.error('Ошибка отправки на почту:', error);
            // Fallback - показываем кнопку для ручной отправки
            showShareButton(message);
            sent = true;
        }
        
        if (sent) {
            showMessage('✅ Заказ подготовлен! Выберите способ отправки:', 'success');
            form.reset();
            
            // Показываем кнопки для отправки
            showSendOptions(message);
        } else {
            throw new Error('Не удалось отправить заказ');
        }
        
    } catch (error) {
        console.error('Error sending order:', error);
        showMessage('❌ Произошла ошибка при отправке заказа. Попробуйте еще раз или свяжитесь со мной напрямую.', 'error');
    } finally {
        hideLoading(submitButton, originalButtonText);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add focus effects to form inputs
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

// Handle Telegram Web App events
if (tg) {
    // Set up the app
    tg.MainButton.setText('Связаться с мастером');
    tg.MainButton.show();
    
    tg.MainButton.onClick(function() {
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Handle back button
    tg.BackButton.onClick(function() {
        window.history.back();
    });
}

// Add some visual feedback for form interactions
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.style.borderColor = '#4CAF50';
        } else {
            this.style.borderColor = 'rgba(102, 126, 234, 0.2)';
        }
    });
});

// Add loading state to the page
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
