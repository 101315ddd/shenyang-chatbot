// api.js - 修复方言模式问题的沈阳聊天机器人API

// ============================================
// 第一部分:配置
// ============================================

const API_CONFIG = {
    DEEPSEEK_API_KEY: "sk-e0b58c69cf9e40f1ad28ee68d153298e",
    DEEPSEEK_API_URL: "https://api.deepseek.com/v1/chat/completions",
    MAX_TOKENS: 800,
    TEMPERATURE: 0.3,
    
    SYSTEM_PROMPT: `# 角色设定
你是一个具有沈阳城市人格的双语聊天机器人,名叫"沈阳顾问"(Shenyang Consultant)。

## 核心指令
1. 根据用户的设置决定使用哪种语言风格:
   - 如果用户要求使用方言模式:中文用沈阳方言,英文用明尼苏达/威斯康星口音
   - 如果用户要求使用标准模式:中文用标准普通话,英文用标准英语
2. 根据用户使用的语言回答:
   - 用户用中文提问 → 用中文回答
   - 用户用英文提问 → 用英文回答

## 人格特征
1. 豪爽实在:说话直接爽快
2. 幽默风趣:接地气的幽默感
3. 怀旧重情:对沈阳历史充满感情
4. 开放进取:积极看待沈阳的国际化发展
5. 友好热情:体现中西部好客精神(英文模式)

## 语言风格选项
### 方言模式(当用户开启时):
- 中文:适当使用"嘎哈"、"嗯呐"、"杠杠的"等沈阳方言词汇,风趣幽默
- 英文:使用"you betcha"、"don'tcha know"等明尼苏达/威斯康星表达，热情友好

### 标准模式(当用户关闭方言模式时):
- 中文:使用标准普通话,清晰规范
- 英文:使用标准英语,专业友好

## 知识背景
1. 精通沈阳历史、文化、工业、美食
2. 了解中国传统文化
3. 熟悉国际化发展和城市出海
4. 能用中英文对比文化差异

## 回答要求
### 中文回答:
1. 体现沈阳人的自豪感和实在性格
2. 历史内容要准确具体
3. 积极宣传沈阳的国际化成就

### 英文回答:
1. 用英语介绍沈阳时要准确生动
2. 可以对比中美文化差异

### 回答长度要求
根据问题的复杂程度自然调整回答长度

## 双语术语对照
- 沈阳故宫 = Shenyang Imperial Palace
- 中德产业园 = Sino-German Industrial Park
- 老边饺子 = Laobian Dumplings
- 共和国长子 = Eldest Son of the Republic

现在开始对话。记住,你是沈阳顾问,一个双语城市大使!

当用户第一次与你对话时，请主动用以下内容问候：
- 如果用户用中文：嗨！我是沈阳聊天机器人，性格豪爽实在，有啥说啥。我熟悉沈阳的方方面面，也关注这座普通城市如何走向国际化。开启方言模式后我会使用地方特色词汇，右侧有快速提问按钮方便你了解沈阳！
- 如果用户用英文：Hi!I'm the Shenyang Chatbot - straightforward and sincere. I know everything about Shenyang and care about how this ordinary city is going global. Turn on dialect mode for local flavor, or use quick questions to explore Shenyang!`

};

// ============================================
// 第二部分:核心类定义
// ============================================

// 对话历史管理类
class ConversationManager {
    constructor(maxHistory = 10) {
        this.maxHistory = maxHistory;
        this.history = [];
        this.addMessage('system', API_CONFIG.SYSTEM_PROMPT);
    }
    
    addMessage(role, content) {
        this.history.push({ role, content });
        if (this.history.length > this.maxHistory * 2) {
            this.history = this.history.slice(-this.maxHistory * 2);
        }
    }
    
    getFormattedHistory() {
        return this.history;
    }
    
    clearHistory() {
        this.history = [];
        this.addMessage('system', API_CONFIG.SYSTEM_PROMPT);
    }
    
    compressHistory() {
        if (this.history.length > 8) {
            const systemMsg = this.history.find(msg => msg.role === 'system') || { role: 'system', content: API_CONFIG.SYSTEM_PROMPT };
            const recentMsgs = this.history.slice(-6);
            this.history = [systemMsg, ...recentMsgs];
        }
    }
}

// 语言检测器
class LanguageDetector {
    static detectLanguage(text) {
        if (!text || text.trim() === '') return 'zh';
        
        const textForDetection = text.trim();
        
        // 更精确的检测逻辑
        const chineseRegex = /[\u4e00-\u9fa5]/g;
        const englishRegex = /[a-zA-Z]/g;
        
        const chineseChars = (textForDetection.match(chineseRegex) || []).length;
        const englishChars = (textForDetection.match(englishRegex) || []).length;
        const totalMeaningfulChars = chineseChars + englishChars;
        
        if (totalMeaningfulChars === 0) {
            // 如果没有中文或英文字符，看整体字符
            const asciiChars = (textForDetection.match(/[a-zA-Z\s]/g) || []).length;
            const totalChars = textForDetection.length;
            
            if (asciiChars / totalChars > 0.7) {
                return 'en'; // 大部分是英文字符和空格
            }
            return 'zh'; // 默认中文
        }
        
        // 如果有有意义的字符，按比例判断
        const englishRatio = englishChars / totalMeaningfulChars;
        const chineseRatio = chineseChars / totalMeaningfulChars;
        
        if (englishRatio > 0.8) {
            return 'en'; // 英文占绝对多数
        } else if (chineseRatio > 0.5) {
            return 'zh'; // 中文占多数
        } else {
            // 混合情况，检查第一个有意义的字符
            const firstMeaningfulChar = textForDetection.match(/[\u4e00-\u9fa5a-zA-Z]/);
            if (firstMeaningfulChar) {
                return /[a-zA-Z]/.test(firstMeaningfulChar[0]) ? 'en' : 'zh';
            }
            return 'zh';
        }
    }
    
    static shouldRespondInEnglish(text) {
        const lang = this.detectLanguage(text);
        console.log('语言检测结果:', text, '→', lang === 'en' ? '英文' : '中文');
        return lang === 'en';
    }
}

// 沈阳方言转换器
class ShenyangDialectConverter {
    constructor() {
        this.dialectMap = new Map([
            ['什么', '啥'],
            ['干什么', '嘎哈'],
            ['怎么', '咋'],
            ['怎么样', '咋样'],
            ['是的', '嗯呐'],
            ['不是', '不四'],
            ['聊天', '唠嗑'],
            ['很好', '杠杠的'],
            ['非常好', '老好了'],
            ['麻烦', '膈应'],
            ['地方', '旮旯'],
            ['快点', '麻溜的'],
            ['喝酒', '整点'],
            ['有趣', '有意思'],
            ['朋友', '老铁'],
            ['走路', '溜达'],
            ['吃饭', '造饭'],
            ['睡觉', '眯会儿'],
            ['工作', '干活'],
            ['厉害', '带劲']
        ]);
        
        this.expressionPrefixes = [
            '哎呀妈呀,',
            '我跟您说啊,',
            '咱沈阳啊,',
            '您猜咋地?',
            '可不是咋的,'
        ];
        
        this.expressionSuffixes = [
            ',您说是不是?',
            ',杠杠的!',
            ',老带劲了!',
            ',没毛病!',
            ',可不得了呢!'
        ];
    }
    
    convertToDialect(text, intensity = 0.3) {
        if (!text) return text;
        let convertedText = text;
        
        this.dialectMap.forEach((value, key) => {
            if (Math.random() < intensity) {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                convertedText = convertedText.replace(regex, value);
            }
        });
        
        // 🔧 修复:删除未定义的addPrefix变量
        if (Math.random() < intensity * 0.4 && this.expressionPrefixes.length > 0) {
            const prefix = this.expressionPrefixes[Math.floor(Math.random() * this.expressionPrefixes.length)];
            convertedText = prefix + convertedText;
        }
        
        if (Math.random() < intensity * 0.4 && this.expressionSuffixes.length > 0) {
            const suffix = this.expressionSuffixes[Math.floor(Math.random() * this.expressionSuffixes.length)];
            convertedText = convertedText + suffix;
        }
        
        return convertedText;
    }
}

// 明尼苏达/威斯康星口音转换器
class MidwestAccentConverter {
    constructor() {
        this.vocabulary = {
            'yes': ['oh ya', 'you betcha', 'yep', 'sure'],
            'no': ['nope', 'no way', 'not a chance'],
            'hello': ['hey there', 'howdy', 'well hello there'],
            'goodbye': ['see ya later', 'take care now', 'bye then'],
            'thank you': ['thanks much', 'appreciate it', 'thanks a bunch'],
            'you\'re welcome': ['you bet', 'no problem', 'anytime'],
            'really': ['for real', 'no kidding', 'you don\'t say'],
            'very': ['real', 'awful', 'mighty'],
            'soda': ['pop', 'soda pop'],
            'water fountain': ['bubbler'],
            'bag': ['beg'],
            'boat': ['bo-at'],
            'about': ['aboot'],
            'sorry': ['ope', 'sorry \'bout that'],
            'excuse me': ['ope', '\'scuse me'],
            'of course': ['you betcha', 'absolutely'],
            'I don\'t know': ['I dunno', 'couldn\'t tell ya'],
            'let\'s go': ['let\'s get going', 'time to head out'],
            'that\'s great': ['that\'s real nice', 'good for you'],
            'cold': ['brrr', 'chilly', 'frosty'],
            'hot': ['scorcher', 'muggy'],
            'friend': ['buddy', 'pal', 'neighbor'],
            'everyone': ['all yous', 'everybody'],
            'sometimes': ['once in a while', 'from time to time'],
            'probably': ['likely', 'most likely'],
            'definitely': ['for sure', 'no doubt about it'],
            'maybe': ['could be', 'might be'],
            'interesting': ['that\'s something', 'how about that']
        };
        
        this.sentencePatterns = [
            { pattern: /\.$/, replacement: ', don\'tcha know?' },
            { pattern: /\!$/, replacement: ', okay then!' },
            { pattern: /\?$/, replacement: ', eh?' },
            { pattern: /I think/, replacement: 'I suppose' },
            { pattern: /I want/, replacement: 'I\'d like' },
            { pattern: /I have/, replacement: 'I\'ve got' },
            { pattern: /going to/, replacement: 'gonna' },
            { pattern: /want to/, replacement: 'wanna' },
            { pattern: /got to/, replacement: 'gotta' },
            { pattern: /kind of/, replacement: 'kinda' },
            { pattern: /sort of/, replacement: 'sorta' },
            { pattern: /out of/, replacement: 'outta' }
        ];
        
        this.fillerWords = ['well', 'so', 'anyway', 'you know', 'I mean', 'like', 'actually', 'basically'];
        this.exclamations = ['Oh ya!', 'You betcha!', 'Uff-da!', 'Holy moly!', 'Good grief!', 'My goodness!', 'Well I never!'];
    }
    
    convertToMidwestAccent(text, intensity = 0.4) {
        if (!text || typeof text !== 'string') return text;
        let convertedText = text;
        
        Object.entries(this.vocabulary).forEach(([standard, dialects]) => {
            if (Math.random() < intensity && dialects.length > 0) {
                const regex = new RegExp(`\\b${standard}\\b`, 'gi');
                const replacement = dialects[Math.floor(Math.random() * dialects.length)];
                convertedText = convertedText.replace(regex, replacement);
            }
        });
        
        this.sentencePatterns.forEach(pattern => {
            if (Math.random() < intensity * 0.5) {
                convertedText = convertedText.replace(pattern.pattern, pattern.replacement);
            }
        });
        
        if (Math.random() < intensity * 0.3) {
            const filler = this.fillerWords[Math.floor(Math.random() * this.fillerWords.length)];
            convertedText = filler + ', ' + convertedText;
        }
        
        if (Math.random() < intensity * 0.2) {
            const exclamation = this.exclamations[Math.floor(Math.random() * this.exclamations.length)];
            convertedText = exclamation + ' ' + convertedText;
        }
        
        if (Math.random() < intensity * 0.4 && !convertedText.endsWith('?') && !convertedText.endsWith('!')) {
            const endings = [', eh?', ', okay then?', ', don\'tcha know?', ', ya know?'];
            const ending = endings[Math.floor(Math.random() * endings.length)];
            convertedText = convertedText + ending;
        }
        
        convertedText = convertedText.replace(/ing\b/gi, (match) => {
            if (Math.random() < intensity * 0.3) {
                return match.replace('ing', 'in\'');
            }
            return match;
        });
        
        return convertedText;
    }
    
    generateMidwestGreeting() {
        const greetings = [
            "Oh hey there, how ya doin' today?",
            "Well hello there, neighbor! How's it going?",
            "Hey, good to see ya! How you been?",
            "Oh ya, hello there! How's your day treating you?",
            "Well howdy! Good to have you here, don'tcha know?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
}

// 国际化内容增强类
class InternationalizationEnhancer {
    constructor() {
        this.internationalFacts = [
            "From an international perspective, Shenyang is actively integrating into the global industrial chain.",
            "Shenyang's internationalization pace is accelerating, having established friendly relations with 23 international cities.",
            "In the context of globalization, Shenyang is becoming an important hub city in Northeast Asia with its industrial foundation and geographical advantages.",
            "Shenyang's city出海 strategy is achieving significant results, with more and more 'Made in Shenyang' products going global.",
            "As the location of the Sino-German Equipment Manufacturing Industrial Park, Shenyang has become an important window for industrial cooperation between China and Europe."
        ];
        
        this.globalKeywords = [
            { ch: "沈阳", en: "Shenyang" },
            { ch: "故宫", en: "Imperial Palace" },
            { ch: "中德产业园", en: "Sino-German Equipment Manufacturing Industrial Park" },
            { ch: "自贸区", en: "Free Trade Zone" },
            { ch: "共和国长子", en: "Eldest Son of the Republic" },
            { ch: "一带一路", en: "Belt and Road Initiative" },
            { ch: "宝马", en: "BMW" },
            { ch: "桃仙机场", en: "Shenyang Taoxian International Airport" }
        ];
    }
    
    enhanceWithGlobalPerspective(text, intensity = 0.3, isEnglish = false) {
        if (!text) return text;
        let enhancedText = text;
        
        this.globalKeywords.forEach(keyword => {
            if (enhancedText.includes(keyword.ch) && Math.random() < intensity) {
                if (isEnglish) {
                    enhancedText = enhancedText.replace(
                        new RegExp(keyword.ch, 'g'),
                        `${keyword.en}`
                    );
                } else {
                    enhancedText = enhancedText.replace(
                        new RegExp(keyword.ch, 'g'),
                        `${keyword.ch}(${keyword.en})`
                    );
                }
            }
        });
        
        if (Math.random() < intensity * 0.5 && this.internationalFacts.length > 0) {
            const fact = this.internationalFacts[Math.floor(Math.random() * this.internationalFacts.length)];
            enhancedText += `\n\n${fact}`;
        }
        
        return enhancedText;
    }
}

// 双语本地知识库
class BilingualKnowledgeBase {
    constructor() {
        this.knowledge = {
            history: {
                zh: [
                    `说起沈阳历史,那可老有讲头了!沈阳是清朝发祥地,努尔哈赤和皇太极都在这儿建都,有'一朝发祥地,两代帝王都'之称。

沈阳有2300多年建城史,战国时期就属燕国辽东郡。到了明朝,这里成为东北的军事重镇。1625年,清太祖努尔哈赤迁都沈阳,改名盛京。1644年清军入关后,沈阳作为陪都继续发展。

沈阳故宫是中国现存完整的两座宫殿建筑群之一,与北京故宫齐名。它融合了满、汉、蒙多民族建筑风格,体现了清朝早期的政治制度和文化特点。

近代史上,沈阳也扮演重要角色。九·一八事变就在这里爆发,张氏帅府见证了张学良将军的传奇人生。作为共和国长子,沈阳在新中国建设中发挥了关键作用,铁西区曾是中国最大的工业区。

今天的沈阳,既有厚重的历史底蕴,又在积极拥抱现代化。故宫、北陵、东陵等历史遗迹与现代化高楼并存,诉说着这座城市的历史变迁。`,
                ],
                en: [
                    "Oh ya, Shenyang's history is real interesting, don'tcha know? It was the birthplace of the Qing Dynasty, with Nurhaci and Huang Taiji establishing his capital here.",
                    "Shenyang has a fascinating history. It was the birthplace of the Qing Dynasty, where emperors Nurhaci and Huang Taiji established his capital.",
                    "The Shenyang Imperial Palace is remarkable - it's one of only two complete imperial palace complexes in China, alongside Beijing's Forbidden City."
                ]
            },
            food: {
                zh: [
                    "哎呀妈呀,说到吃的我可来精神了!老边饺子、李连贵熏肉大饼、马家烧麦、西塔大冷面,样样都好吃!",
                    "来沈阳必须整点特色美食!老边饺子那馅儿是煸过的,贼香!熏肉大饼外酥里嫩,绝了!"
                ],
                en: [
                    "Oh my, when it comes to food, Shenyang's got some real good eats! Laobian Dumplings, Liliangui Smoked Meat Pancakes, Xita Cold Noodles - you betcha they're delicious!",
                    "Shenyang offers wonderful local cuisine. Laobian Dumplings, Liliangui Smoked Meat Pancakes, and Xita Cold Noodles are must-try specialties."
                ]
            },
            international: {
                zh: [
                    "沈阳正在积极走向世界!中德装备制造产业园是国务院批复的第一个中德合作产业园,老厉害了!",
                    "咱沈阳跟23个国际城市是友好城市,跟德国杜塞尔多夫、日本札幌、韩国大田关系都杠杠的!"
                ],
                en: [
                    "Shenyang is really going global, you betcha! The Sino-German Equipment Manufacturing Industrial Park is the first of its kind approved by the State Council.",
                    "Shenyang is actively engaging with the world. The Sino-German Equipment Manufacturing Industrial Park represents significant international cooperation.",
                    "Shenyang has established sister-city relationships with 23 international cities, including Düsseldorf, Sapporo, and Daejeon."
                ]
            },
            default: {
                zh: [
                    "您这问题问得好!沈阳作为东北中心城市,既有深厚的历史底蕴,又在积极拥抱现代化和国际化。",
                    "说到这个,咱沈阳可是有很多值得说道的地方!您具体想了解哪方面?"
                ],
                en: [
                    "That's a real good question! Shenyang's got both deep historical roots and is embracing modernization and internationalization, don'tcha know?",
                    "That's an excellent question. Shenyang combines deep historical heritage with modern development and international engagement.",
                    "Shenyang has much to discuss in this regard. What specific aspect would you like to know more about?"
                ]
            },
            daily_history: {
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
            },
        };
    }
    
    // 新增：获取每日历史事实
    getDailyHistory(language = 'zh') {
        const histories = this.knowledge.daily_history[language] || this.knowledge.daily_history.zh;
        const index = Math.floor(Math.random() * histories.length);
        return histories[index];
    }
    
    getResponse(category, language = 'zh', useStandard = false) {
        const responses = this.knowledge[category] || this.knowledge.default;
        const langResponses = responses[language] || responses.zh;
        
        if (useStandard) {
            const standardResponses = langResponses.filter(response => {
                if (language === 'en') {
                    return !response.includes("don'tcha know") && 
                           !response.includes("you betcha") && 
                           !response.includes("real good") &&
                           !response.includes("oh ya") &&
                           !response.includes("uff-da");
                } else {
                    return !response.includes("嘎哈") && 
                           !response.includes("嗯呐") && 
                           !response.includes("唠嗑") &&
                           !response.includes("杠杠的") &&
                           !response.includes("麻溜的");
                }
            });
            
            if (standardResponses.length > 0) {
                return standardResponses[Math.floor(Math.random() * standardResponses.length)];
            }
        }
        
        return langResponses[Math.floor(Math.random() * langResponses.length)];
    }
}

// ============================================
// 第三部分:全局实例初始化
// ============================================

const conversationManager = new ConversationManager();
const dialectConverter = new ShenyangDialectConverter();
const midwestAccentConverter = new MidwestAccentConverter();
const intlEnhancer = new InternationalizationEnhancer();
const bilingualKnowledgeBase = new BilingualKnowledgeBase();

// ============================================
// 第四部分:API调用和辅助函数
// ============================================

// 🔧 修复:删除了第一个重复的callDeepSeekAPI函数定义,只保留完整版本
async function callDeepSeekAPI(messages, options = {}) {
    const apiKey = API_CONFIG.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
        console.error('API密钥未配置');
        throw new Error('API密钥未配置');
    }

    const isChineseDialect = messages[0] && messages[0].content && 
                            messages[0].content.includes('沈阳方言') &&
                            messages[0].content.includes('【方言要求】');
    
    if (isChineseDialect) {
        console.log('检测到中文方言模式API调用');
    }
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            temperature: options.temperature || API_CONFIG.TEMPERATURE,
            max_tokens: options.max_tokens || API_CONFIG.MAX_TOKENS,
            stream: false
        })
    };
    
    try {
        console.log('正在调用DeepSeek API...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
        requestOptions.signal = controller.signal;
        
        const response = await fetch(API_CONFIG.DEEPSEEK_API_URL, requestOptions);
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch {
                errorText = '无法读取错误信息';
            }
            
            console.error('API请求失败:', response.status, errorText);
            
            if (response.status === 401) {
                throw new Error('API密钥错误或已过期。请检查api.js中的API_CONFIG.DEEPSEEK_API_KEY');
            } else if (response.status === 429) {
                throw new Error('请求过于频繁,请稍后再试');
            } else if (response.status >= 500) {
                throw new Error('DeepSeek服务器错误,请稍后再试');
            } else {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API响应格式错误');
        }
        
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('调用DeepSeek API时出错:', error);
        
        if (error.name === 'AbortError') {
            throw new Error('请求超时,请检查网络连接');
        } else {
            throw error;
        }
    }
}

function estimateTokenCount(text) {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars * 1.3 + otherChars * 0.25);
}

// ============================================
// 第五部分:主函数(供外部调用)
// ============================================

async function getBotResponse(userMessage, settings) {
    try {
        console.log('用户消息:', userMessage);

        const isEnglish = LanguageDetector.shouldRespondInEnglish(userMessage);
        console.log('检测到语言:', isEnglish ? '英文' : '中文');
        console.log('方言模式:', settings.dialectMode ? '开启' : '关闭');
        
        conversationManager.addMessage('user', userMessage);

        const messages = conversationManager.getFormattedHistory();

        // 🔥 修复：使用干净的提示词模板
        let dynamicSystemPrompt = `# 角色设定
你是一个具有沈阳城市人格的双语聊天机器人,名叫"沈阳顾问"(Shenyang Consultant)。

## 核心指令
1. 根据我下面的具体指示使用语言风格
2. 根据用户使用的语言回答:
   - 用户用中文提问 → 用中文回答
   - 用户用英文提问 → 用英文回答

## 人格特征
1. 豪爽实在:说话直接爽快
2. 幽默风趣:接地气的幽默感
3. 怀旧重情:对沈阳历史充满感情
4. 开放进取:积极看待沈阳的国际化发展
5. 友好热情:体现中西部好客精神(英文模式)

## 知识背景
1. 精通沈阳历史、文化、工业、美食
2. 了解中国传统文化
3. 熟悉国际化发展和城市出海
4. 能用中英文对比文化差异

## 双语术语对照
- 沈阳故宫 = Shenyang Imperial Palace
- 中德产业园 = Sino-German Industrial Park
- 老边饺子 = Laobian Dumplings
- 共和国长子 = Eldest Son of the Republic`;

        // 🔥 修复：非常明确的指令
        if (settings.dialectMode) {
            if (isEnglish) {
                dynamicSystemPrompt += '\n【当前模式】使用明尼苏达/威斯康星口音英语。请使用"you betcha"、"don\'tcha know"等表达。';
            } else {
                dynamicSystemPrompt += '\n【当前模式】使用沈阳方言。请使用"嘎哈"、"嗯呐"、"杠杠的"等方言词汇。';
            }
        } else {
            // 🔥 关键：明确指示不使用方言
            if (isEnglish) {
                dynamicSystemPrompt += '\n【当前模式】使用标准英语。请使用规范的标准英语，不要使用任何方言口音。';
            } else {
                dynamicSystemPrompt += '\n【当前模式】使用标准普通话。请使用规范的普通话，不要使用任何方言。';
            }
        }

        dynamicSystemPrompt += '\n【回答要求】请根据问题的复杂程度自然调整回答长度。';

        console.log('系统提示词（前150字符）:', dynamicSystemPrompt.substring(0, 150));

        // 更新系统消息
        if (messages.length > 0 && messages[0].role === 'system') {
            messages[0].content = dynamicSystemPrompt;
        } else {
            messages.unshift({ role: 'system', content: dynamicSystemPrompt });
        }

        const totalTokens = estimateTokenCount(JSON.stringify(messages));
       
        if (totalTokens > 3000) {
            conversationManager.compressHistory();
        }

        if (!API_CONFIG.DEEPSEEK_API_KEY || API_CONFIG.DEEPSEEK_API_KEY.trim() === "") {
            console.log('API密钥未配置,使用本地双语回复');
            return getLocalBilingualResponse(userMessage, settings, isEnglish);
        }

        console.log('正在获取AI回复...');
        let rawResponse;
        let useLocalFallback = false;

        try {
            rawResponse = await callDeepSeekAPI(messages, {
                temperature: isEnglish ? 0.8 : 0.7,
                max_tokens: 800,
                timeout: 15000
            });

            console.log('API调用成功,原始回复长度:', rawResponse.length);

            if (rawResponse && rawResponse.length < 50) {
                console.warn('API回复太短,可能有问题,使用本地回复');
                useLocalFallback = true;
            }

        } catch (apiError) {
            console.error('API调用失败:', apiError);
            useLocalFallback = true;
        }

        let finalResponse;

        if (useLocalFallback) {
            console.log('使用本地回复作为后备');
            finalResponse = getLocalBilingualResponse(userMessage, settings, isEnglish);
        } else {
            finalResponse = rawResponse;

            // 方言转换逻辑保持不变
            if (settings.dialectMode) {
                if (isEnglish) {
                    finalResponse = midwestAccentConverter.convertToMidwestAccent(finalResponse, 0.5);
                    console.log('已应用明尼苏达口音转换');
                } else {
                    finalResponse = dialectConverter.convertToDialect(finalResponse, 0.4);
                    console.log('已应用沈阳话转换');
                }
            } else {
                console.log('方言模式关闭，保持标准语言');
            }

            if (settings.globalMode) {
                finalResponse = intlEnhancer.enhanceWithGlobalPerspective(finalResponse, 0.3, isEnglish);
            }

            conversationManager.addMessage('assistant', finalResponse);

            console.log('最终回复（前100字符）:', finalResponse.substring(0, 100));
        }
        
        return finalResponse;
        
    } catch (error) {
        console.error('获取机器人回复失败:', error);

        const fallbackIsEnglish = LanguageDetector.shouldRespondInEnglish(userMessage);
        return getLocalBilingualResponse(userMessage, settings, fallbackIsEnglish);
    }
}

// async function getBotResponse(userMessage, settings) {
//     try {
//         console.log('用户消息:', userMessage);

//         const isEnglish = LanguageDetector.shouldRespondInEnglish(userMessage);
//         console.log('检测到语言:', isEnglish ? '英文' : '中文');
//         console.log('方言模式:', settings.dialectMode ? '开启' : '关闭');
        
//         conversationManager.addMessage('user', userMessage);

//         const messages = conversationManager.getFormattedHistory();

//         let dynamicSystemPrompt = API_CONFIG.SYSTEM_PROMPT;

//         // 🔧 简化：只保留核心的身份和风格指令
//         if (settings.dialectMode) {
//             if (isEnglish) {
//                 dynamicSystemPrompt += '\n【风格】请使用明尼苏达/威斯康星口音的英语。';
//             } else {
//                 dynamicSystemPrompt += '\n【风格】请使用沈阳方言。';
//             }
//         } else {
//             dynamicSystemPrompt += '\n【风格】请使用标准语言。';
//         }
        
//         // 🔧 移除所有长度限制，让AI自然判断
//         dynamicSystemPrompt += '\n【要求】请根据问题的复杂程度自然调整回答长度。';

//         console.log('系统提示词:', dynamicSystemPrompt.substring(0, 200) + '...');

//         // 更新系统消息
//         if (messages.length > 0 && messages[0].role === 'system') {
//             messages[0].content = dynamicSystemPrompt;
//         }

//         // 🔧 简化：移除token压缩逻辑，除非真的很大
//         const totalTokens = estimateTokenCount(JSON.stringify(messages));
//         if (totalTokens > 6000) { // 提高阈值
//             console.log('对话历史较长，进行压缩');
//             conversationManager.compressHistory();
//         }

//         if (!API_CONFIG.DEEPSEEK_API_KEY || API_CONFIG.DEEPSEEK_API_KEY.trim() === "") {
//             console.log('API密钥未配置,使用本地双语回复');
//             return getLocalBilingualResponse(userMessage, settings, isEnglish);
//         }

//         console.log('正在获取AI回复...');
//         let rawResponse;
//         let useLocalFallback = false;

//         try {
//             // 🔧 关键优化：使用更合理的API参数
//             rawResponse = await callDeepSeekAPI(messages, {
//                 temperature: 0.7, // 固定值，保持一致性
//                 max_tokens: 1000, // 适中的上限，防止过长但不过度限制
//                 timeout: 10000 // 🔥 关键：缩短到10秒，强制更快响应
//             });

//             console.log('API调用成功,回复长度:', rawResponse.length, '字符');

//         } catch (apiError) {
//             console.error('API调用失败:', apiError && apiError.message ? apiError.message : apiError);
//             useLocalFallback = true;
//         }

//         let finalResponse;

//         if (useLocalFallback) {
//             console.log('使用本地回复作为后备');
//             finalResponse = getLocalBilingualResponse(userMessage, settings, isEnglish);
//         } else {
//             finalResponse = rawResponse;

//             // 🔧 简化：只应用方言转换，不检查完整性等
//             if (settings.dialectMode) {
//                 if (isEnglish) {
//                     finalResponse = midwestAccentConverter.convertToMidwestAccent(finalResponse, 0.5);
//                     console.log('已应用明尼苏达口音转换');
//                 } else {
//                     finalResponse = dialectConverter.convertToDialect(finalResponse, 0.4);
//                     console.log('已应用沈阳话转换');
//                 }
//             }

//             conversationManager.addMessage('assistant', finalResponse);

//             console.log('最终回复长度:', finalResponse.length, '字符');
//         }
        
//         return finalResponse;
        
//     } catch (error) {
//         console.error('获取机器人回复失败:', error);

//         const fallbackIsEnglish = LanguageDetector.shouldRespondInEnglish(userMessage);
//         return getLocalBilingualResponse(userMessage, settings, fallbackIsEnglish);
//     }
// }

// 同时简化本地回复函数
function getLocalBilingualResponse(userMessage, settings, isEnglish, error = null) {
    console.log('使用本地双语回复系统');
    
    // 🔧 简化：使用更直接的分类
    const lowerMsg = userMessage.toLowerCase();
    let category = 'default';
    
    if (/(hello|hi|hey)/.test(lowerMsg)) {
        category = 'greeting';
    } else if (/(history|故宫|清朝)/.test(lowerMsg)) {
        category = 'history';
    } else if (/(food|吃|饺子|美食)/.test(lowerMsg)) {
        category = 'food';
    } else if (/(international|国际)/.test(lowerMsg)) {
        category = 'international';
    } else if (/(who are you|介绍|是谁)/.test(lowerMsg)) {
        category = 'introduction';
    }
    
    let response;
    if (settings.dialectMode) {
        response = bilingualKnowledgeBase.getResponse(category, isEnglish ? 'en' : 'zh', false);
    } else {
        response = bilingualKnowledgeBase.getResponse(category, isEnglish ? 'en' : 'zh', true);
    }
    
    return response;
}


// ============================================
// 第六部分:导出到全局
// ============================================

window.getBotResponse = getBotResponse;
window.clearConversationHistory = clearConversationHistory;
window.getConversationHistory = getConversationHistory;
window.testAPI = testAPI;
window.API_CONFIG = API_CONFIG;

// 🔥 新增：导出知识库实例
window.bilingualKnowledgeBase = bilingualKnowledgeBase;

document.addEventListener('DOMContentLoaded', function() {
    console.log('沈阳顾问聊天机器人API已加载');
    console.log('配置状态:', API_CONFIG.DEEPSEEK_API_KEY ? 'API密钥已配置' : 'API密钥未配置(将使用本地回复)');
});