// Конфигурация для Telegram Bot
// Замените значения на ваши реальные данные

const CONFIG = {
    // Токен вашего Telegram бота (получите у @BotFather)
    BOT_TOKEN: '7384535948:AAG8iixpK8dKgQv8EE_ifxbj51JW6xZRTts',
    
    // ID чата, куда будут отправляться заказы
    // Это может быть ваш личный ID или ID группы
    CHAT_ID: '817948942',
    
    // Настройки приложения
    APP_SETTINGS: {
        // Название приложения
        APP_NAME: 'Pearl Jewelry',
        
        // Описание
        DESCRIPTION: 'Заказ уникальных украшений ручной работы',
        
        // Версия
        VERSION: '1.0.0',
        
        // Автор
        AUTHOR: 'Jewelry Master'
    },
    
    // Настройки уведомлений
    NOTIFICATIONS: {
        // Включить уведомления о новых заказах
        ENABLED: true,
        
        // Звук уведомления
        SOUND: true,
        
        // Вибрация
        VIBRATION: true
    },
    
    // Настройки формы
    FORM_SETTINGS: {
        // Обязательные поля
        REQUIRED_FIELDS: ['customerName', 'customerContact', 'jewelryType', 'description'],
        
        // Максимальная длина описания
        MAX_DESCRIPTION_LENGTH: 1000,
        
        // Включить валидацию
        VALIDATION_ENABLED: true
    }
};

// Экспорт конфигурации
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
