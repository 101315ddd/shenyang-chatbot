// script.js - 聊天机器人交互逻辑（完整修复版）

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearChatBtn = document.getElementById('clear-chat');
    const dialectToggle = document.getElementById('dialect-toggle');
    
    // 当前设置
    let settings = {
        dialectMode: false,  // 改为false，默认关闭
        historyMode: true,
        globalMode: false
    };
    
    // 聊天历史
    let chatHistory = [];
    
    // 防重复标志 - 确保不会重复发送
    let isProcessing = false;
    
    // 初始化
    initChat();
   // 显示初始欢迎消息（如果聊天窗口是空的）
// setTimeout(() => {
//     if (chatMessages.children.length === 0) {
//         showInitialWelcome();
//     }
// }, 1000);

// 添加这个新函数
function showInitialWelcome() {
    const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
    const welcomeMsg = currentLang === 'en' 
        ? "Hi!I'm the Shenyang Chatbot - straightforward and sincere. I know everything about Shenyang and care about how this ordinary city is going global. Turn on dialect mode for local flavor, or use quick questions to explore Shenyang!"
        : "嗨！我是沈阳聊天机器人，性格豪爽实在,有啥说啥！熟悉沈阳的方方面面，也关注这座普通城市如何走向国际化。开启方言模式我会使用地方特色词汇，右侧有快速提问按钮方便你了解沈阳！";
    
    addMessageToChat(welcomeMsg, 'bot');
}
    // 初始化聊天
function initChat() {
    // 加载保存的聊天历史
    loadChatHistory();
    
    // 设置输入框自动调整高度
    setupAutoResizeTextarea();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化快速提问按钮（只绑定一次）
    initQuickButtons();

    // 🔥 新增：立即清除方言提示的初始文本
    setTimeout(() => {
        const dialectHint = document.querySelector('.dialect-hint');
        if (dialectHint) {
            // 清空文本，让JS填充
            dialectHint.textContent = '';
            // 立即更新一次
            updateDialectHint();
        }
    }, 200);

    // 🔥 新增：显示每日历史（添加到initChat的最后）
    setTimeout(() => {
        const historyFactElement = document.querySelector('p[data-i18n="history_fact_text"]');
        if (dailyHistoryElement && window.bilingualKnowledgeBase) {
            try {
                const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
                const historyText = window.bilingualKnowledgeBase.getDailyHistory(
                    currentLang === 'en' ? 'en' : 'zh'
                );
                
                if (historyText) {
                    dailyHistoryElement.textContent = historyText;
                    console.log('每日历史已显示:', historyText.substring(0, 50) + '...');
                }
            } catch (error) {
                console.error('显示每日历史失败:', error);
                const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
                dailyHistoryElement.textContent = currentLang === 'en' 
                    ? "Loading daily history..." 
                    : "加载每日历史中...";
            }
        }
    }, 300); // 延迟300ms确保知识库已加载
}
    
    // 设置输入框自动调整高度
    function setupAutoResizeTextarea() {
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });
    }
    
// 绑定事件监听器
function bindEventListeners() {
    // 发送按钮点击事件
    sendBtn.addEventListener('click', sendMessage);
    
    // 输入框回车发送事件
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 清空聊天按钮
    clearChatBtn.addEventListener('click', clearChat);
    
    // ============ 只修改这里：方言切换事件 ============
    dialectToggle.addEventListener('change', function() {
        console.log('方言按钮切换至:', this.checked);
        
        // 1. 更新本地设置
        settings.dialectMode = this.checked;
        
        // 2. 显示通知
        const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
        if (currentLang === 'en') {
            showNotification('Dialect mode ' + (settings.dialectMode ? 'enabled' : 'disabled'));
        } else {
            showNotification('已' + (settings.dialectMode ? '开启' : '关闭') + '沈阳话模式');
        }
        
        // 3. 更新方言提示文本（如果有的话）
        updateDialectHint();
    });
    
    // 更多历史按钮
    const moreHistoryBtn = document.getElementById('more-history');
    if (moreHistoryBtn) {
        moreHistoryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            askAboutHistory();
        });
    }

    // 🔥 新增：初始化每日历史
    setTimeout(() => {
        displayRandomDailyHistory();
        bindHistoryRefreshButton();
        }, 300);
}

// ============ 每日历史功能 - 核心修复 ============

// 1. 获取每日历史数据
function getDailyHistoryData() {
    // 直接从你的知识库API中提取数据
    const dailyHistories = {
        zh: [
            "1923年4月18日：沈阳故宫被正式列为国家重点文物保护单位。",
            "1948年11月2日：沈阳解放，成为新中国的重要工业基地。",
            "1953年7月15日：中国第一座重型机器厂在沈阳铁西区建成投产。",
            "1986年9月1日：沈阳桃仙国际机场正式启用。",
            "2004年7月1日：沈阳地铁一号线开工建设，2010年9月27日开通运营。",
            "2015年12月17日：国务院批准设立中德（沈阳）高端装备制造产业园。",
            "2017年3月31日：沈阳自贸区正式挂牌成立。",
            "1625年3月3日：清太祖努尔哈赤迁都沈阳，改名盛京。",
            "1644年5月28日：清军入关后，沈阳作为陪都继续发展。",
            "1905年9月5日：日俄战争结束，沈阳进入日本势力范围。",
            "1931年9月18日：九一八事变在沈阳爆发。",
            "1949年10月1日：新中国成立后，沈阳被确定为重要工业城市。",
            "1950年：沈阳成为抗美援朝战争的后方基地。",
            "1978年：改革开放后，沈阳开始经济转型。",
            "1999年：沈阳成功举办第34届亚洲男子篮球锦标赛。",
            "2006年：沈阳故宫、昭陵、福陵被列入世界文化遗产名录。",
            "2013年：沈阳承办第十二届全国运动会。",
            "2020年：沈阳成为国家中心城市。"
        ],
        en: [
            "April 18, 1923: Shenyang Imperial Palace was officially listed as a national key cultural relics protection unit.",
            "November 2, 1948: Shenyang was liberated and became an important industrial base of New China.",
            "July 15, 1953: China's first heavy machinery factory was completed and put into operation in Tiexi District, Shenyang.",
            "September 1, 1986: Shenyang Taoxian International Airport was officially opened.",
            "July 1, 2004: Shenyang Metro Line 1 started construction, opened on September 27, 2010.",
            "December 17, 2015: The State Council approved the establishment of Sino-German (Shenyang) High-end Equipment Manufacturing Industrial Park.",
            "March 31, 2017: Shenyang Free Trade Zone was officially established.",
            "March 3, 1625: Qing Emperor Nurhaci moved his capital to Shenyang, renamed it Shengjing.",
            "May 28, 1644: After the Qing army entered the pass, Shenyang continued to develop as a secondary capital.",
            "September 5, 1905: After the Russo-Japanese War, Shenyang came under Japanese influence.",
            "September 18, 1931: The September 18 Incident broke out in Shenyang.",
            "October 1, 1949: After the founding of New China, Shenyang was designated as an important industrial city.",
            "1950: Shenyang became the rear base of the War to Resist US Aggression and Aid Korea.",
            "1978: After the reform and opening up, Shenyang began economic transformation.",
            "1999: Shenyang successfully hosted the 34th Asian Men's Basketball Championship.",
            "2006: Shenyang Imperial Palace, Zhaoling and Fuling were included in the World Cultural Heritage List.",
            "2013: Shenyang hosted the 12th National Games.",
            "2020: Shenyang became a national central city."
        ]
    };
    
    return dailyHistories;
}

// 2. 获取并显示随机历史
function displayRandomDailyHistory() {
    const historyElement = document.getElementById('daily-history-text');
    if (!historyElement) {
        console.warn('未找到每日历史元素');
        return;
    }
    
    // 获取当前语言
    const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
    const lang = currentLang === 'en' ? 'en' : 'zh';
    
    // 获取历史数据
    const dailyHistories = getDailyHistoryData();
    const histories = dailyHistories[lang] || dailyHistories.zh;
    
    if (histories.length === 0) {
        historyElement.textContent = lang === 'en' 
            ? "No historical data available." 
            : "暂无历史数据。";
        return;
    }
    
    // 从本地存储获取历史索引，确保每天不同
    const today = new Date().toDateString(); // 只取日期部分
    const storageKey = `shenyang_daily_history_index_${lang}`;
    
    let lastDate, lastIndex;
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const data = JSON.parse(saved);
            lastDate = data.date;
            lastIndex = data.index;
        }
    } catch (e) {
        console.error('读取历史索引失败:', e);
    }
    
    let newIndex;
    if (lastDate === today && lastIndex !== undefined) {
        // 如果是同一天，使用保存的索引
        newIndex = lastIndex;
    } else {
        // 新的一天，生成随机索引
        newIndex = Math.floor(Math.random() * histories.length);
        
        // 保存到本地存储
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                date: today,
                index: newIndex,
                lang: lang
            }));
        } catch (e) {
            console.error('保存历史索引失败:', e);
        }
    }
    
    // 显示历史
    historyElement.textContent = histories[newIndex];
    console.log('显示每日历史:', histories[newIndex].substring(0, 50) + '...');
}

// 3. 手动刷新历史
function refreshDailyHistory() {
    const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
    const lang = currentLang === 'en' ? 'en' : 'zh';
    
    const dailyHistories = getDailyHistoryData();
    const histories = dailyHistories[lang] || dailyHistories.zh;
    
    if (histories.length === 0) return;
    
    // 生成新的随机索引
    const newIndex = Math.floor(Math.random() * histories.length);
    const historyElement = document.getElementById('daily-history-text');
    
    if (historyElement) {
        historyElement.textContent = histories[newIndex];
        
        // 更新本地存储
        const today = new Date().toDateString();
        const storageKey = `shenyang_daily_history_index_${lang}`;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                date: today,
                index: newIndex,
                lang: lang
            }));
        } catch (e) {
            console.error('更新历史索引失败:', e);
        }
        
        // 显示通知
        const notificationMsg = currentLang === 'en' 
            ? 'Daily history refreshed' 
            : '每日历史已刷新';
        showNotification(notificationMsg);
    }
}

// 4. 绑定刷新按钮事件
function bindHistoryRefreshButton() {
    const refreshBtn = document.getElementById('refresh-history');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function(e) {
            e.preventDefault();
            refreshDailyHistory();
        });
    }
}
    // ============ 修复快速提问按钮 ============
    function initQuickButtons() {
        console.log('初始化快速提问按钮');
        
        // 移除所有现有的按钮事件（通过克隆替换）
        const quickBtns = document.querySelectorAll('.quick-btn');
        quickBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // 重新绑定事件
        const newQuickBtns = document.querySelectorAll('.quick-btn');
        newQuickBtns.forEach(btn => {
            // 使用 onclick 而不是 addEventListener，避免重复绑定
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('快速提问按钮点击');
                
                // 如果正在处理，直接返回
                if (isProcessing) {
                    console.log('正在处理中，请稍候');
                    return;
                }
                
                // 获取当前语言
                const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
                
                // 获取问题
                let question = '';
                if (currentLang === 'en') {
                    question = this.getAttribute('data-question-en');
                } else {
                    question = this.getAttribute('data-question-zh');
                }
                
                // 如果语言特定的问题不存在，使用通用问题
                if (!question || question.trim() === '') {
                    question = this.getAttribute('data-question');
                }
                
                console.log('获取到问题:', question);
                
                if (question && question.trim() !== '') {
                    // 直接发送消息
                    sendQuickQuestion(question.trim());
                }
            };
        });
    }
    
    // 发送快速问题的专用函数
    function sendQuickQuestion(question) {
        console.log('发送快速问题:', question);
        
        // 检查是否正在处理
        if (isProcessing) {
            console.log('正在处理其他消息，跳过');
            return;
        }
        
        // 标记为处理中
        isProcessing = true;
        
        // 显示用户消息
        addMessageToChat(question, 'user');
        
        // 获取当前设置 - 确保使用最新的方言设置
        const currentSettings = {
            dialectMode: settings.dialectMode,  // 使用本地settings，不是从DOM获取
            historyMode: true,
            globalMode: false
        };
        
        console.log('快速问题方言设置:', currentSettings.dialectMode);
        
        // 显示正在输入提示
        showTypingIndicator();
        
        // 调用API
        getBotResponse(question, currentSettings)
            .then(response => {
                // 移除正在输入提示
                removeTypingIndicator();
                
                // 显示机器人回复
                addMessageToChat(response, 'bot');
                
                // 保存到历史记录
                saveToHistory(question, response, currentSettings);
            })
            .catch(error => {
                console.error('获取回复失败:', error);
                removeTypingIndicator();
                
                // 显示错误消息
                const isEnglish = /^[A-Za-z\s.,!?'"-]+$/.test(question);
                const errorMsg = isEnglish 
                    ? "Sorry, there was an error processing your request." 
                    : "抱歉，处理您的请求时出错了。";
                addMessageToChat(errorMsg, 'bot');
            })
            .finally(() => {
                // 1秒后重置处理状态
                setTimeout(() => {
                    isProcessing = false;
                    console.log('重置处理状态');
                }, 1000);
            });
    }
    
    // ============ 手动发送消息函数 ============
    async function sendMessage() {
        const message = userInput.value.trim();
        
        if (!message) {
            const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
            const notificationMsg = currentLang === 'en' 
                ? 'Please enter a message' 
                : '请输入消息内容';
            showNotification(notificationMsg);
            return;
        }
        
        // 检查是否正在处理
        if (isProcessing) {
            console.log('正在处理中，请稍候');
            const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
            const notificationMsg = currentLang === 'en' 
                ? 'Processing previous message, please wait...' 
                : '正在处理上一条消息，请稍候...';
            showNotification(notificationMsg);
            return;
        }
        
        // 标记为处理中
        isProcessing = true;
        
        console.log('手动发送消息:', message);
        
        // 添加用户消息到聊天窗口
        addMessageToChat(message, 'user');
        
        // 清空输入框
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 显示正在输入提示
        showTypingIndicator();
        
        // 获取当前设置 - 确保使用最新的方言设置
        const currentSettings = {
            dialectMode: settings.dialectMode,  // 使用本地settings，不是从DOM获取
            historyMode: true,
            globalMode: false
        };
        
        console.log('手动发送方言设置:', currentSettings.dialectMode);
        
        try {
            const response = await getBotResponse(message, currentSettings);
            
            // 移除正在输入提示
            removeTypingIndicator();
            
            // 添加机器人回复到聊天窗口
            addMessageToChat(response, 'bot');
            
            // 保存到历史记录
            saveToHistory(message, response, currentSettings);
            
        } catch (error) {
            console.error('获取回复失败:', error);
            removeTypingIndicator();
            
            // 检测消息语言
            const isEnglish = /^[A-Za-z\s.,!?'"-]+$/.test(message) || 
                            (!/[\u4e00-\u9fa5]/.test(message) && /[A-Za-z]/.test(message));
            
            let errorMessage;
            if (isEnglish) {
                errorMessage = "Sorry about that! We're experiencing some technical difficulties. Please try again.";
            } else {
                errorMessage = "哎呀，我这会儿有点卡壳，可能是网络不太好，您再说一遍呗？";
            }
            
            addMessageToChat(errorMessage, 'bot');
        } finally {
            // 1秒后重置处理状态
            setTimeout(() => {
                isProcessing = false;
                console.log('重置处理状态');
            }, 1000);
        }
    }
    
    // ============ 以下是原有功能函数，保持不变 ============
    
    // 添加消息到聊天窗口
    function addMessageToChat(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
        const senderName = sender === 'user' 
            ? (currentLang === 'en' ? 'You' : '您') 
            : (currentLang === 'en' ? 'Shenyang Consultant' : '沈阳顾问');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">${senderName}</div>
                <div class="message-text">${formatMessage(message)}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // 格式化消息内容
    function formatMessage(message) {
        let formatted = message.replace(/\n/g, '<br>');
        
        // 将沈阳相关关键词加粗
        const shenyangKeywords = [
            '沈阳', '故宫', '中街', '浑河', '棋盘山', '铁西',
            '老边饺子', '熏肉大饼', '西塔大冷面', '中德产业园',
            '共和国长子', '清文化', '二人转', '东北'
        ];
        
        shenyangKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'g');
            formatted = formatted.replace(regex, `<strong>${keyword}</strong>`);
        });
        
        // 如果是方言模式，给方言词加特殊样式
        if (settings.dialectMode) {
            const dialectWords = [
                '嘎哈', '嗯呐', '唠嗑', '杠杠的', '膈应',
                '旮旯', '邪乎', '麻溜的', '整点', '咋地'
            ];
            
            dialectWords.forEach(word => {
                const regex = new RegExp(word, 'g');
                formatted = formatted.replace(regex, `<span class="dialect-word">${word}</span>`);
            });
        }
        
        return formatted;
    }
    
    // 显示正在输入提示
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
        const senderName = currentLang === 'en' ? 'Shenyang Consultant' : '沈阳顾问';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">${senderName}</div>
                <div class="message-text">
                    <span class="typing-dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }
    
    // 移除正在输入提示
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 清空聊天
    function clearChat() {
        const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
        const confirmMsg = currentLang === 'en' 
            ? 'Are you sure you want to clear the chat history?' 
            : '确定要清空聊天记录吗？';
        
        if (confirm(confirmMsg)) {
            const welcomeMessage = chatMessages.querySelector('.bot-message:first-child');
            chatMessages.innerHTML = '';
    
            if (welcomeMessage) {
                chatMessages.appendChild(welcomeMessage);
            } else {
                const welcomeMsg = currentLang === 'en' 
                    ? 'Hi!I\'m the Shenyang Chatbot - straightforward and sincere. I know everything about Shenyang and care about how this ordinary city is going global. Turn on dialect mode for local flavor, or use quick questions to explore Shenyang!' 
                    : '嗨！我是沈阳聊天机器人，性格豪爽实在，有啥说啥!我熟悉沈阳的方方面面，也关注这座普通城市如何走向国际化。开启方言模式后我会使用地方特色词汇，右侧有快速提问按钮方便你了解沈阳！';
                addMessageToChat(welcomeMsg, 'bot');
            }
            
            chatHistory = [];
            saveChatHistory();
            
            const notificationMsg = currentLang === 'en' 
                ? 'Chat history cleared' 
                : '聊天记录已清空';
            showNotification(notificationMsg);
        }
    }
    
    // 询问历史相关
    function askAboutHistory() {
        const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
        
        const questions = currentLang === 'en' ? [
            "When was the Shenyang Imperial Palace built?",
            "What was Shenyang called in ancient China?",
            "Tell me about the history of Shenyang's industrial development",
            "How did Shenyang become the capital of the Qing Dynasty?",
            "What role did Shenyang play during the Japanese occupation?"
        ] : [
            "沈阳故宫是哪年建立的？",
            "沈阳在中国古代叫什么名字？",
            "请介绍一下沈阳的工业发展历史",
            "沈阳是如何成为清朝都城的？",
            "日本占领时期沈阳扮演了什么角色？"
        ];
        
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        sendQuickQuestion(randomQuestion);
    }
    
    // 保存到历史记录
    function saveToHistory(userMessage, botResponse) {
        chatHistory.push({
            user: userMessage,
            bot: botResponse,
            time: new Date().toISOString(),
            settings: { ...settings }
        });
        
        if (chatHistory.length > 50) {
            chatHistory = chatHistory.slice(-50);
        }
        
        saveChatHistory();
    }
    
    // 保存聊天历史到本地存储
    function saveChatHistory() {
        try {
            localStorage.setItem('shenyang_chat_history', JSON.stringify(chatHistory));
        } catch (e) {
            console.error('保存聊天历史失败:', e);
        }
    }
    
    // 从本地存储加载聊天历史
    function loadChatHistory() {
            try {
        const saved = localStorage.getItem('shenyang_chat_history');
        if (saved) {
            chatHistory = JSON.parse(saved) || [];
            
            // 清空当前聊天显示
            chatMessages.innerHTML = '';
            
            // 显示新的欢迎消息
            showInitialWelcome();
            
            // 只加载用户和AI的实际对话，跳过旧的系统消息
            const actualConversations = chatHistory.slice(-5);
            actualConversations.forEach(entry => {
                addMessageToChat(entry.user, 'user');
                addMessageToChat(entry.bot, 'bot');
            });
        } else {
            // 如果没有历史记录，显示初始欢迎
            setTimeout(showInitialWelcome, 500);
        }
    } catch (e) {
        console.error('加载聊天历史失败:', e);
        // 出错时也显示欢迎消息
        setTimeout(showInitialWelcome, 500);
    }
}
    
    // 显示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 监听语言变化
    window.addEventListener('languageChanged', function() {
    console.log('语言切换，重新初始化按钮');
    
    // 🔥 关键：检查是否有用户消息（是否已经开始对话）
    const hasUserMessages = document.querySelectorAll('.user-message').length > 0;
    
    // 如果没有用户消息（只有欢迎消息），清除并重新添加
    if (!hasUserMessages) {
        // 立即清除聊天窗口，避免闪烁
        chatMessages.innerHTML = '';
        
        // 延迟一点时间添加新消息
        setTimeout(() => {
            const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
            const welcomeMsg = currentLang === 'en' 
                ? "Hi!I'm the Shenyang Chatbot - straightforward and sincere. I know everything about Shenyang and care about how this ordinary city is going global. Turn on dialect mode for local flavor, or use quick questions to explore Shenyang!"
                : "嗨！我是沈阳聊天机器人，性格豪爽实在。熟悉沈阳的方方面面，也关注这座普通城市如何走向国际化。开启方言模式我会使用地方特色词汇，右侧有快速提问按钮方便你了解沈阳！";
            
            addMessageToChat(welcomeMsg, 'bot');
        }, 50);
    }
    
    // 延迟一点时间，确保DOM更新完成
    setTimeout(() => {
        initQuickButtons();
        // 🔥 关键：更新方言提示
        updateDialectHint();
        // 不再调用 updateWelcomeMessageOnLanguageChange()，因为上面已经处理了
    }, 100);
});

// 保留 updateDialectHint 函数（但不再需要 updateWelcomeMessageOnLanguageChange）
function updateDialectHint() {
    const dialectHint = document.querySelector('.dialect-hint');
    if (dialectHint) {
        const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
        const isDialectOn = document.getElementById('dialect-toggle')?.checked || false;
        
        if (currentLang === 'en') {
            dialectHint.textContent = isDialectOn 
                ? "Using friendly Midwest accent (Minnesota/Wisconsin style)" 
                : "Using standard English for formal replies";
            dialectHint.className = isDialectOn ? 'dialect-hint' : 'dialect-hint disabled-hint';
        } else {
            dialectHint.textContent = isDialectOn 
                ? "使用沈阳方言，让对话更有地方特色" 
                : "使用标准普通话，回复更加正式";
            dialectHint.className = isDialectOn ? 'dialect-hint' : 'dialect-hint disabled-hint';
        }
    }
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .dialect-word {
        color: #d32f2f;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        padding: 0 2px;
    }
    
    .typing-dots span {
        animation: blink 1.4s infinite both;
        font-size: 1.2rem;
        margin: 0 2px;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes blink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
    }
    
    .notification {
        font-family: 'Noto Sans SC', sans-serif;
    }
`;
document.head.appendChild(style);

// ============ 只保留一个方言提示更新函数 ============
function updateDialectHint() {
    const dialectHint = document.querySelector('.dialect-hint');
    if (dialectHint) {
        const currentLang = window.I18N ? window.I18N.getCurrentLang() : 'zh';
        
        // 使用最新的方言设置
        const isDialectOn = document.getElementById('dialect-toggle')?.checked || false;
        
        if (currentLang === 'en') {
            dialectHint.textContent = isDialectOn 
                ? "Using friendly Midwest accent (Minnesota/Wisconsin style)" 
                : "Using more standard English ";
            dialectHint.className = isDialectOn ? 'dialect-hint' : 'dialect-hint disabled-hint';
        } else {
            dialectHint.textContent = isDialectOn 
                ? "使用沈阳方言，让对话更有地方特色" 
                : "使用较为标准的普通话";
            dialectHint.className = isDialectOn ? 'dialect-hint' : 'dialect-hint disabled-hint';
        }
    }
}

// 在DOM加载完成后初始化提示
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateDialectHint, 100);

    // 🔥 新增：DOM加载后立即清除并更新方言提示
    setTimeout(() => {
        updateDialectHint();
    }, 300);
});

// 监听语言变化时也更新提示
window.addEventListener('languageChanged', function() {
    setTimeout(updateDialectHint, 100);
});

// API调用函数在api.js中定义
});