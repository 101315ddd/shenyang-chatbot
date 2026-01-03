// i18n.js - 双语数据与切换功能
const I18N = {
    // 当前语言状态，默认从本地存储读取或默认为英文('en')
    currentLang: localStorage.getItem('shenyang_lang') || 'en',
    
    // 双语数据字典
    translations: {
        'en': {
            // 导航与标题
            'site_title': 'Shenyang Consultant',
            'switch_to_chinese': '切换到中文',
            'chat_title': 'Shenyang Chatbot',
            'chat_subtitle': 'Let the World Know Shenyang!',
            'status_online': 'Online',
            
            // 控制面板
            'settings_title': 'Settings',
            'dialect_mode': 'Dialect Mode',
            'quick_questions_title': 'Quick Questions',
            'data_panel_title': 'Shenyang Data',
            'clear_chat': 'Clear Chat',
            'dialect_hint_en': 'If you want more formal and serious replies, please turn off dialect mode.',
            
            // 快速问题按钮 (文本)
            'quick_intro': 'Self-introduction',
            'quick_history': 'Historical Sites',
            'quick_food': 'Special Cuisine',
            'quick_global': 'Globalization',
            'quick_industry': 'Industrial Development',
            'quick_travel': 'Travel Routes',
            
            // 数据面板单位
            'year_unit': ' years',
            'ten_thousand_unit': 'M+',
            'unit_ge': '',
            
            // 数据面板统计标签
            'stat_history': 'Years of History',
            'stat_population': 'Resident Population',
            'stat_sister_cities': 'Sister Cities',  // 注意：HTML中是stat_sister_cities
            'stat_foreign_companies': 'Foreign Companies',
            
            // 右侧信息面板
            'personality_title': 'Shenyang Personality',
            'trait_hospitality': 'Hospitable & Sincere',
            'dialect_examples': 'Shenyang Dialect Examples',
            'dialect_hint': 'This section showcases Shenyang dialect vocabulary with local characteristics.',
            
            'international_achievements': 'International Achievements',
            'achievement_1_title': 'Sino-German Equipment Manufacturing Industrial Park',
            'achievement_1_desc': 'A major cooperation project jointly promoted by the Chinese and German governments.',
            'achievement_2_title': 'Shenyang Taoxian International Airport',
            'achievement_2_desc': 'Operating 45 international routes, connecting to the world.',
            'achievement_3_title': 'BMW Shenyang Production Base',
            'achievement_3_desc': 'BMW\'s largest production base worldwide.',
            'achievement_4_title': '23 Sister Cities',
            'achievement_4_desc': 'Establishing friendly relations with cities around the world.',
            
            'todays_history': 'Daily Shenyang History',
            'history_fact_text': 'In 1906, Shenyang opened as a port and became an important commercial center in Northeast China.',
            'history_fact_source': 'Source: "Shenyang Local Chronicles"',
            'learn_more_history': 'Learn More History',
            'learn_more_history_msg': 'Tell me more about Shenyang\'s history',
            'history_questions': [
            "When was the Shenyang Imperial Palace built?",
            "What was Shenyang called in ancient China?",
            "Tell me about the history of Shenyang's industrial development",
            "How did Shenyang become the capital of the Qing Dynasty?",
            "What role did Shenyang play during the Japanese occupation?",
            "Tell me about the modern development of Shenyang since 2000"
            ],
            'refresh': "Refresh",

            // 页脚
            'footer_title': 'Shenyang Chatbot',
            'footer_slogan_zh': '让世界听见沈阳的声音，感受沈阳的温度',
            'footer_slogan_en': 'Hearing Shenyang\'s voice, feeling Shenyang\'s warmth',
            'bilingual_support': 'Bilingual Support: Chinese/English',
            'contact_us': 'Contact Us',
            'follow_shenyang': 'Follow Shenyang',
            
            // 输入区域
            'input_placeholder': 'Type your question here... (e.g., Introduce Shenyang)',
            'input_hint': 'Press Enter to send, Shift+Enter for new line',
            
            // 机器人初始欢迎消息 (英文版)
            'welcome_message': `Hi! I'm the Shenyang Consultant! What would you like to know about Shenyang?<br><br>You can ask me about:<ul class="suggestion-list"><li>History & Culture (Imperial Palace, Qing Culture)</li><li>Industrial Development (The "Eldest Son of the Republic")</li><li>Specialty Foods (Laobian Dumplings, Smoked Meat Pancake, Old Four Seasons Chicken Skeleton)</li><li>Global Development (Sino-German Industrial Park, Free Trade Zone)</li><li>Tourist Attractions (Qipan Mountain, Hun River)</li></ul>You can also click the quick question buttons on the left, or just type your question!`
        },
        'zh': {
            // 导航与标题
            'site_title': '沈阳顾问',
            'switch_to_chinese': 'Switch to English',
            'chat_title': '沈阳聊天机器人',
            'chat_subtitle': '唠唠沈阳嗑，讲讲沈阳事，让世界了解沈阳！',
            'status_online': '在线',
            
            // 控制面板
            'settings_title': '设置',
            'dialect_mode': '沈阳话模式',
            'quick_questions_title': '快速提问',
            'data_panel_title': '沈阳数据',
            'clear_chat': '清空对话',
            'dialect_hint_en': '如果你想要更为严肃正式的回复，请关闭方言模式。',
            
            // 快速问题按钮 (文本)
            'quick_intro': '沈阳话介绍',
            'quick_history': '历史名胜',
            'quick_food': '特色美食',
            'quick_global': '国际化',
            'quick_industry': '工业发展',
            'quick_travel': '旅游路线',
            
            // 数据面板单位
            'year_unit': '年',
            'ten_thousand_unit': '万+',
            'unit_ge': '个',
            
            // 数据面板统计标签
            'stat_history': '建城历史',
            'stat_population': '常住人口',
            'stat_sister_cities': '友好城市',  // 注意：HTML中是stat_sister_cities
            'stat_foreign_companies': '外资企业',
            
            // 右侧信息面板
            'personality_title': '沈阳人格特征',
            'trait_hospitality': '豪爽好客',
            'dialect_examples': '沈阳话示例',
            'dialect_hint': '该部分展示具有沈阳特色的方言词汇。',
            
            'international_achievements': '国际化成就',
            'achievement_1_title': '中德装备制造产业园',
            'achievement_1_desc': '中德两国政府共同推动的重大合作项目',
            'achievement_2_title': '桃仙国际机场',
            'achievement_2_desc': '开通45条国际航线，连接全球',
            'achievement_3_title': '宝马沈阳基地',
            'achievement_3_desc': '宝马全球最大生产基地',
            'achievement_4_title': '23个友好城市',
            'achievement_4_desc': '与世界各地城市建立友好关系',
            
            'todays_history': '每日沈阳历史',
            'history_fact_text': '1906年，沈阳开埠，成为东北重要的商贸中心。',
            'history_fact_source': '来源：《沈阳地方志》',
            'learn_more_history': '了解更多历史',
            'learn_more_history_msg': '再多告诉我一些沈阳的历史',
            'history_questions': [
            "沈阳故宫是哪年建立的？",
            "沈阳在中国古代叫什么名字？",
            "请介绍一下沈阳的工业发展历史",
            "沈阳是如何成为清朝都城的？",
            "日本占领时期沈阳扮演了什么角色？",
            "讲讲2000年以来沈阳的现代化发展"
            ],
            'refresh': "刷新",
            // 页脚
            'footer_title': '沈阳聊天机器人',
            'footer_slogan_zh': '让世界听见沈阳的声音，感受沈阳的温度',
            'footer_slogan_en': 'Hearing Shenyang\'s voice, feeling Shenyang\'s warmth',
            'bilingual_support': '双语支持：中文/English',
            'contact_us': '联系我们',
            'follow_shenyang': '关注沈阳',
            
            // 输入区域
            'input_placeholder': '输入您的问题...（例如：用沈阳话介绍一下沈阳）',
            'input_hint': '按Enter发送，Shift+Enter换行',
            
            // 机器人初始欢迎消息 (中文版)
            'welcome_message': `嗨！我是沈阳顾问！咱沈阳银实在，有啥想唠的尽管说！<br><br>您是想了解沈阳的：<ul class="suggestion-list"><li>历史文化（故宫、清文化）</li><li>工业发展（共和国长子）</li><li>特色美食（老边饺子、熏肉大饼、老四季鸡架）</li><li>国际化发展（中德产业园、自贸区）</li><li>旅游景点（棋盘山、浑河）</li></ul>您也可以点击左侧的快速提问按钮，或者直接输入问题！`
        }
    },
    
    // 初始化与切换函数
    init() {
        this.loadLanguage(this.currentLang);
        this.setupEventListeners();
    },
    
    // 加载语言
    loadLanguage(lang) {
        const t = this.translations[lang];
        if (!t) return;
        
        console.log(`Loading language: ${lang}`);
        
        // 1. 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = t[key];
                } else {
                    el.textContent = t[key];
                }
            }
        });
        
        // 2. 特别处理输入框的placeholder
        const userInput = document.getElementById('user-input');
        if (userInput && t['input_placeholder']) {
            userInput.placeholder = t['input_placeholder'];
        }
        
        // 3. 更新数据面板的单位
        this.updateDataPanel(lang);
        
        // 4. 更新"了解更多历史"按钮
        this.updateMoreHistoryButton(lang);
        
        // 5. 更新右侧信息面板的内容
        this.updateInfoPanel(lang);
        
        // 6. 更新机器人初始欢迎消息
        this.updateWelcomeMessage(lang);
        
        // 7. 更新当前语言状态
        this.currentLang = lang;
        localStorage.setItem('shenyang_lang', lang);
        
        // 8. 触发自定义事件
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
        console.log(`Language switched to: ${lang}`);
    },
    
    // 更新数据面板
    updateDataPanel(lang) {
        const t = this.translations[lang];
        
        // 获取所有数据卡片
        const statCards = document.querySelectorAll('.stat-card');
        
        if (statCards.length >= 4) {
            // 历史数据 - 2300年
            const historyValue = statCards[0].querySelector('.stat-value');
            if (historyValue) {
                if (lang === 'en') {
                    historyValue.innerHTML = '2300<span data-i18n="year_unit"> years</span>';
                } else {
                    historyValue.innerHTML = '2300<span data-i18n="year_unit">年</span>';
                }
                // 更新单位翻译
                const yearUnit = historyValue.querySelector('[data-i18n="year_unit"]');
                if (yearUnit) yearUnit.textContent = t['year_unit'];
            }
            
            // 人口数据 - 900万+
            const populationValue = statCards[1].querySelector('.stat-value');
            if (populationValue) {
                if (lang === 'en') {
                    populationValue.innerHTML = '900<span data-i18n="ten_thousand_unit">M+</span>';
                } else {
                    populationValue.innerHTML = '900<span data-i18n="ten_thousand_unit">万+</span>';
                }
                // 更新单位翻译
                const unit = populationValue.querySelector('[data-i18n="ten_thousand_unit"]');
                if (unit) unit.textContent = t['ten_thousand_unit'];
            }
            
            // 友好城市 - 23个/23
            const citiesValue = statCards[2].querySelector('.stat-value');
            if (citiesValue) {
                if (lang === 'en') {
                    // 英文模式：不加"个"
                    citiesValue.innerHTML = '23'; // 不加单位
                } else {
                    // 中文模式：加"个"
                    citiesValue.innerHTML = '23<span data-i18n="unit_ge">个</span>';
                    const unitGe = citiesValue.querySelector('[data-i18n="unit_ge"]');
                    if (unitGe) unitGe.textContent = t['unit_ge'];
                }
            }
            
            // 外资企业 - 15000+
            const companiesValue = statCards[3].querySelector('.stat-value');
            if (companiesValue) {
                if (lang === 'en') {
                    // 英文模式：不加"个"
                    companiesValue.innerHTML = '15000+';
                } else {
                    // 中文模式：加"个"
                    companiesValue.innerHTML = '15000+<span data-i18n="unit_ge">个</span>';
                    const unitGe = companiesValue.querySelector('[data-i18n="unit_ge"]');
                    if (unitGe) unitGe.textContent = t['unit_ge'];
                }
            }
        }
    },
    
    // 更新"了解更多历史"按钮
    updateMoreHistoryButton(lang) {
        const t = this.translations[lang];
        const moreHistoryBtn = document.getElementById('more-history');
        
        if (moreHistoryBtn) {
            // 更新按钮文本
            moreHistoryBtn.textContent = t['learn_more_history'];
            
            // 设置正确的提问内容
            if (lang === 'en') {
                moreHistoryBtn.setAttribute('data-question', t['learn_more_history_msg'] || 'Tell me more about Shenyang\'s history');
            } else {
                moreHistoryBtn.setAttribute('data-question', t['learn_more_history_msg'] || '再多告诉我一些沈阳的历史');
            }
            
            console.log(`More history button updated: ${moreHistoryBtn.getAttribute('data-question')}`);
        }
    },
    
    // 更新右侧信息面板
    updateInfoPanel(lang) {
        const t = this.translations[lang];
        
        // 更新国际化成就
        const achievements = document.querySelectorAll('.achievement');
        if (achievements.length >= 4) {
            achievements[0].querySelector('strong').textContent = t['achievement_1_title'];
            achievements[0].querySelector('p').textContent = t['achievement_1_desc'];
            
            achievements[1].querySelector('strong').textContent = t['achievement_2_title'];
            achievements[1].querySelector('p').textContent = t['achievement_2_desc'];
            
            achievements[2].querySelector('strong').textContent = t['achievement_3_title'];
            achievements[2].querySelector('p').textContent = t['achievement_3_desc'];
            
            achievements[3].querySelector('strong').textContent = t['achievement_4_title'];
            achievements[3].querySelector('p').textContent = t['achievement_4_desc'];
        }
        
        // 更新今日历史
        const historyFact = document.querySelector('.history-fact p');
        const historySource = document.querySelector('.fact-source');
        
        if (historyFact) {
            historyFact.textContent = t['history_fact_text'];
        }
        if (historySource) {
            historySource.textContent = t['history_fact_source'];
        }
    },
    
    // 更新欢迎消息
    updateWelcomeMessage(lang) {
        const t = this.translations[lang];
        const welcomeMsgEl = document.querySelector('#chat-messages .bot-message .message-text');
        
        if (welcomeMsgEl && t['welcome_message']) {
            welcomeMsgEl.innerHTML = t['welcome_message'];
        }
    },
    
    // 切换语言
    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'zh' : 'en';
        this.loadLanguage(newLang);
    },
    
    // 设置事件监听器
    setupEventListeners() {
        const toggleBtn = document.getElementById('language-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleLanguage());
        }
    },
    
    // 获取当前语言
    getCurrentLang() {
        return this.currentLang;
    },
    
    // 翻译单个键值
    t(key) {
        return this.translations[this.currentLang][key] || key;
    }
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    I18N.init();
});

// 暴露到全局
window.I18N = I18N;