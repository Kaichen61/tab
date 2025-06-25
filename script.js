class TabAutocomplete {
    constructor() {
        this.input = document.getElementById('autocomplete-input');
        this.mirror = document.getElementById('autocomplete-mirror');
        this.status = document.getElementById('status');
        
        // 预测数据库 - 基于常见的中文短语和句子
        this.predictions = {
            '今天天气很': ['温暖', '晴朗', '不错', '好'],
            '今天天气很好': ['，我想去爬山。'],
            '今天天气很好，': ['我想去爬山。'],
            '今天天气很好，我想去爬山。': ['所以我需要去超市购物。'],
            '今天天气很温暖，': ['我想去爬山。'],
            '今天天气很晴朗，': ['我想去公园散步。'],
            '今天天气很不错，': ['我想和朋友聚会。'],
            '今天天气很好，': ['我想去爬山。'],
            '我想去爬山。': ['所以我需要去超市购物。'],
            '我想去爬山。所以我需要去超市购物。': ['我需要购买'],
            '所以我需要去超市购物。': ['我需要购买'],
            '我需要购买': ['水', '食物', '登山鞋', '背包'],
            '我需要购买水': ['、食物'],
            '我需要购买水、食物': ['、登山鞋'],
            '我需要购买水、食物、登山鞋': ['、背包'],
            '我需要购买水、食物、登山鞋、背包': ['。'],
            '我需要购买水、食物、登山鞋、背包。': ['然后准备明天的行程。'],
            '然后准备明天的行程。': ['希望明天一切顺利！'],
            '今天天气很': ['好', '不错', '晴朗', '温暖', '适合出门'],
            '我想学习': ['编程', '英语', '数学', '音乐', '绘画', '烹饪'],
            '请帮我': ['一下', '看看', '检查', '解决', '分析'],
            '谢谢你的': ['帮助', '支持', '理解', '耐心', '时间'],
            '明天我要': ['上班', '学习', '运动', '购物', '旅行', '休息'],
            '我很喜欢': ['这个', '那个', '音乐', '电影', '读书', '运动'],
            '你觉得': ['怎么样', '如何', '可以吗', '合适吗'],
            '我需要': ['帮助', '建议', '时间', '休息', '学习'],
            '这个': ['很好', '不错', '太棒了', '有问题', '需要改进'],
            '我们': ['一起', '可以', '应该', '需要', '必须'],
            '你': ['好', '真棒', '太厉害了', '辛苦了', '加油'],
            '我': ['觉得', '认为', '希望', '想要', '需要'],
            '这个项目': ['很有前景', '需要改进', '完成了', '开始了'],
            '学习': ['编程', '英语', '新技术', '新技能'],
            '工作': ['很忙', '很累', '很有趣', '很有挑战性'],
            '生活': ['很美好', '很充实', '需要改变', '很满意'],
            '朋友': ['很好', '很多', '很少', '很贴心'],
            '家人': ['很支持', '很理解', '很关心', '很温暖'],
            '时间': ['很紧', '很充足', '很宝贵', '很有限'],
            '机会': ['很难得', '很好', '很多', '很少']
        };
        
        this.currentPrediction = '';
        this.isPredictionActive = false;
        
        this.init();
    }
    
    init() {
        // 绑定事件监听器
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.input.addEventListener('keydown', this.handleKeydown.bind(this));
        this.input.addEventListener('click', this.updateMirror.bind(this));
        this.input.addEventListener('keyup', this.updateMirror.bind(this));
        this.input.addEventListener('scroll', this.updateMirror.bind(this));
        this.input.addEventListener('select', this.updateMirror.bind(this));
        
        // 绑定示例按钮
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.dataset.text;
                this.input.value = text;
                this.input.focus();
                this.input.setSelectionRange(text.length, text.length);
                this.handleInput();
            });
        });
        
        // 初始化状态
        this.updateStatus('准备就绪，开始输入文本...', 'info');
        this.updateMirror();
    }
    
    handleInput() {
        const text = this.input.value;
        const cursorPosition = this.input.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPosition);
        
        // 分析文本并生成预测
        const prediction = this.generatePrediction(textBeforeCursor);
        
        if (prediction) {
            this.currentPrediction = prediction;
            this.isPredictionActive = true;
            this.updateStatus(`预测: "${prediction}" - 按Tab键接受`, 'success');
        } else {
            this.currentPrediction = '';
            this.isPredictionActive = false;
            this.updateStatus('准备就绪，继续输入...', 'info');
        }
        this.updateMirror();
    }
    
    generatePrediction(text) {
        // 优先全句匹配
        for (const [key, predictions] of Object.entries(this.predictions)) {
            if (text.endsWith(key)) {
                return predictions[0]; // 连续补全时取第一个
            }
        }
        // 其次部分匹配
        const words = text.trim().split(/\s+/);
        const lastWord = words[words.length - 1] || '';
        for (const [key, predictions] of Object.entries(this.predictions)) {
            if (key.includes(lastWord) && lastWord.length > 1) {
                return predictions[0];
            }
        }
        return null;
    }
    
    updateMirror() {
        const text = this.input.value;
        const cursorPosition = this.input.selectionStart;
        const before = text.substring(0, cursorPosition);
        const after = text.substring(cursorPosition);
        let html = this.escapeHtml(before);
        if (this.isPredictionActive && this.currentPrediction) {
            html += `<span class='prediction-inline'>${this.escapeHtml(this.currentPrediction)}</span>`;
        }
        html += this.escapeHtml(after);
        // 保证换行和空格显示
        html = html.replace(/\n/g, '<br>');
        html = html.replace(/ {2}/g, ' &nbsp;');
        this.mirror.innerHTML = html;
        // 滚动同步
        this.mirror.scrollTop = this.input.scrollTop;
    }
    
    escapeHtml(str) {
        return str.replace(/[&<>"']/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }
    
    handleKeydown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            
            if (this.isPredictionActive && this.currentPrediction) {
                // 接受预测
                this.acceptPrediction();
            } else {
                // 插入制表符
                this.insertTab();
            }
        }
    }
    
    acceptPrediction() {
        const text = this.input.value;
        const cursorPosition = this.input.selectionStart;
        
        // 在光标位置插入预测文本
        const newText = text.substring(0, cursorPosition) + 
                       this.currentPrediction + 
                       text.substring(cursorPosition);
        
        this.input.value = newText;
        
        // 移动光标到预测文本后
        const newCursorPosition = cursorPosition + this.currentPrediction.length;
        this.input.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // 隐藏预测
        this.currentPrediction = '';
        this.isPredictionActive = false;
        
        // 更新状态
        this.updateStatus(`已接受预测: "${this.currentPrediction}"`, 'success');
        
        // 关键：补全后自动再次预测，直到没有预测为止
        setTimeout(() => {
            this.handleInput();
        }, 0);
    }
    
    insertTab() {
        const text = this.input.value;
        const cursorPosition = this.input.selectionStart;
        
        // 在光标位置插入制表符
        const newText = text.substring(0, cursorPosition) + '\t' + text.substring(cursorPosition);
        this.input.value = newText;
        
        // 移动光标到制表符后
        const newCursorPosition = cursorPosition + 1;
        this.input.setSelectionRange(newCursorPosition, newCursorPosition);
        
        this.updateStatus('插入了制表符', 'warning');
        
        // 触发输入事件以重新分析
        this.handleInput();
    }
    
    updateStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new TabAutocomplete();
});

// 添加一些额外的预测数据
window.addEventListener('load', () => {
    // 可以在这里动态添加更多预测数据
    console.log('Tab自动完成功能已启动');
}); 