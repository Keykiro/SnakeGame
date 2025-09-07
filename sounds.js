// 音效管理
const SoundManager = {
    // 由于浏览器安全策略限制，我们使用音频API创建音效
    sounds: {
        eat: null,
        gameOver: null,
        move: null,
        start: null
    },
    
    // 使用Web Audio API创建音效
    createSound: function(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 根据不同类型设置不同的音效参数
        switch(type) {
            case 'eat':
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 100);
                break;
            case 'gameOver':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 150;
                gainNode.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => {
                    oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 1);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    setTimeout(() => oscillator.stop(), 1000);
                }, 100);
                break;
            case 'move':
                oscillator.type = 'sine';
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.05;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 50);
                break;
            case 'start':
                oscillator.type = 'sine';
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => {
                    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
                    setTimeout(() => oscillator.stop(), 200);
                }, 100);
                break;
        }
    },
    
    // 音效对象缓存
    audioObjects: {},
    
    // 是否启用音效
    enabled: true,
    
    // 初始化音效
    init: function() {
        // 从本地存储中获取音效设置
        const soundEnabled = localStorage.getItem('snakeSoundEnabled');
        if (soundEnabled !== null) {
            this.enabled = soundEnabled === 'true';
        }
        
        // 更新音效开关按钮状态
        this.updateSoundToggleButton();
        
        // 检查浏览器是否支持Web Audio API
        if (!(window.AudioContext || window.webkitAudioContext)) {
            console.warn('您的浏览器不支持Web Audio API，音效将被禁用');
            this.enabled = false;
            this.updateSoundToggleButton();
        }
    },
    
    // 播放音效
    play: function(soundName) {
        if (!this.enabled) return;
        
        try {
            this.createSound(soundName);
        } catch (e) {
            console.log('音效播放失败:', e);
        }
    },
    
    // 切换音效开关
    toggleSound: function() {
        this.enabled = !this.enabled;
        localStorage.setItem('snakeSoundEnabled', this.enabled);
        this.updateSoundToggleButton();
        
        // 播放或停止背景音乐
        if (this.enabled) {
            this.play('start');
        }
    },
    
    // 更新音效开关按钮状态
    updateSoundToggleButton: function() {
        const soundToggleBtn = document.getElementById('sound-toggle');
        if (soundToggleBtn) {
            soundToggleBtn.textContent = this.enabled ? '🔊 音效: 开' : '🔇 音效: 关';
        }
    }
};

// 导出音效管理器
window.SoundManager = SoundManager;