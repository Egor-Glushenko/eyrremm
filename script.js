// If running inside Telegram WebApp, safely init (optional)
let tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg) {
    try {
        tg.ready();
        tg.expand();
    } catch (_) {}
}

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

// (Telegram-related sending removed per requirements)

// Show send options (created programmatically to avoid inline handlers and escaping issues)
function showSendOptions(message) {
    // Remove existing options
    const existingOptions = document.querySelectorAll('.send-options');
    existingOptions.forEach(option => option.remove());
    
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'send-options';
    optionsDiv.style.marginTop = '20px';
    optionsDiv.style.textAlign = 'center';
    
    const title = document.createElement('h4');
    title.style.marginBottom = '15px';
    title.style.color = '#495057';
    title.textContent = 'Выберите способ отправки:';
    optionsDiv.appendChild(title);
    
    const buttonsWrap = document.createElement('div');
    buttonsWrap.style.display = 'flex';
    buttonsWrap.style.gap = '10px';
    buttonsWrap.style.flexWrap = 'wrap';
    buttonsWrap.style.justifyContent = 'center';
    
    const emailBtn = document.createElement('button');
    emailBtn.className = 'send-option-btn';
    emailBtn.textContent = '📧 Отправить на почту';
    emailBtn.addEventListener('click', () => sendViaEmail(message));
    
    const tgBtn = document.createElement('button');
    tgBtn.className = 'send-option-btn';
    tgBtn.textContent = '📱 Отправить в Telegram';
    tgBtn.addEventListener('click', () => sendViaTelegram(message));
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'send-option-btn';
    copyBtn.textContent = '📋 Скопировать текст';
    copyBtn.addEventListener('click', () => copyToClipboard(message));
    
    buttonsWrap.appendChild(emailBtn);
    buttonsWrap.appendChild(tgBtn);
    buttonsWrap.appendChild(copyBtn);
    
    optionsDiv.appendChild(buttonsWrap);
    
    const form = document.getElementById('orderForm');
    form.parentNode.insertBefore(optionsDiv, form.nextSibling);
}

// Send via email
function sendViaEmail(message) {
    const emailTo = 'samsung20152637@gmail.com'; // ЗАМЕНИТЕ НА РЕАЛЬНЫЙ EMAIL
    const emailSubject = encodeURIComponent('Новый заказ украшения');
    const emailBody = encodeURIComponent(message);
    // Используем location.href, чтобы некоторые клиенты корректно подставляли получателя
    const mailtoLink = `mailto:${encodeURIComponent(emailTo)}?subject=${emailSubject}&body=${emailBody}`;
    
    window.location.href = mailtoLink;
    showMessage('📧 Откройте почтовый клиент и отправьте письмо', 'success');
}

// (Telegram share and copy options removed per requirements)

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
        
        // Открываем письмо в почтовом клиенте сразу после формирования
        sendViaEmail(message);
        form.reset();
        showMessage('✅ Письмо с заказом подготовлено. Проверьте почтовый клиент.', 'success');
        
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
