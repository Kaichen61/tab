class TabAutocomplete {
    constructor() {
        this.input = document.getElementById('autocomplete-input');
        this.mirror = document.getElementById('autocomplete-mirror');
        this.status = document.getElementById('status');
        
        // 预测数据库 - 基于常见的中文短语和句子
        this.predictions= {
            '智能键盘的十种': ['花样玩法。', '晴朗', '不错', '好'],
            '花样玩法。': ['1.一键直达'],
            '1.一键直达': [' AI 功能：'],
            'AI 功能：': ['部分智能键盘'],
            '部分智能键盘': ['如 K98M AI 客制化'],
            '如 K98M AI 客制化': ['无线机械键盘，'],
            '无线机械键盘，': ['右上角设有星星键，'],
            '右上角设有星星键，': ['可一键直达 AI 软件'],
            '可一键直达 AI 软件': [''],
            '可一键直达 AI 软件': ['，如 "文心一言"，'],
            '，如 "文心一言"，': ['辅助完成文案生成、'],
            '辅助完成文案生成、': ['图片获取、翻译文本等任务，'],
            '图片获取、翻译文本等任务，': ['为工作和创作提供便利。'],
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

// HashChan