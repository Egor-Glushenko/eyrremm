// Telegram Web App initialization
let tg = window.Telegram.WebApp;

// Initialize the app
tg.ready();
tg.expand();

// Configuration
const BOT_CONFIG = {
    // Замените на токен вашего бота
    BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
    // Замените на ID чата, куда будут отправляться заказы
    CHAT_ID: 'YOUR_CHAT_ID_HERE'
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
    
    const response = await fetch(url, {
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
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
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
        
        // Try to send via Telegram Web App first
        let sent = false;
        
        if (sendViaTelegramWebApp(message)) {
            sent = true;
            console.log('Order sent via Telegram Web App');
        } else {
            // Fallback to Bot API
            try {
                await sendOrderToTelegram(message);
                sent = true;
                console.log('Order sent via Bot API');
            } catch (botError) {
                console.error('Bot API error:', botError);
                // If Bot API fails, try to send via Telegram Web App
                if (tg && tg.sendData) {
                    tg.sendData(JSON.stringify({
                        type: 'order',
                        message: message,
                        timestamp: new Date().toISOString()
                    }));
                    sent = true;
                }
            }
        }
        
        if (sent) {
            showMessage('✅ Заказ успешно отправлен! Я свяжусь с вами в ближайшее время.', 'success');
            form.reset();
            
            // Close the app if in Telegram
            if (tg && tg.close) {
                setTimeout(() => {
                    tg.close();
                }, 2000);
            }
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
