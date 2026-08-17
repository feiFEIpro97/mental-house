const expertService = require('./expertService');

/**
 * 专家抽取引擎
 */
class ExtractionEngine {
    constructor() {
        this.records = []; // 存储所有抽取历史
    }

    /**
     * 执行抽取任务
     * @param {Object} config 抽取配置
     */
    extract(config) {
        const totalNeeded = Math.ceil(config.count * (config.redundancy || 1.0));
        let results = [];

        // 1. 获取基础候选池
        let candidates = expertService.filterExperts({
            major: config.major,
            status: 'available'
        }).filter(e => !config.avoidDistricts.includes(e.district));

        // 2. 按层次分层抽取
        if (config.layers && config.layers.length > 0) {
            config.layers.forEach(layer => {
                const layerCount = Math.ceil(totalNeeded * layer.ratio);
                const layerCandidates = candidates.filter(e => layer.title.includes(e.title));
                const selected = this._shuffleAndPick(layerCandidates, layerCount);
                results.push(...selected);
            });
        } else {
            results = this._shuffleAndPick(candidates, totalNeeded);
        }

        // 3. 创建抽取记录
        const record = {
            id: `REC_${Date.now()}`,
            purpose: config.purpose || '未命名抽取任务',
            timestamp: new Date(),
            config: config,
            candidatesCount: candidates.length,
            selectedExperts: results.map(e => ({ ...e })), // 深度拷贝
            status: 'pending_confirmation' // 状态: pending_confirmation, confirmed, pushed
        };

        this.records.unshift(record);
        return record;
    }

    /**
     * 单个专家重新抽取
     * @param {string} recordId 记录ID
     * @param {string} oldExpertId 要替换的专家ID
     */
    reExtractOne(recordId, oldExpertId) {
        const record = this.records.find(r => r.id === recordId);
        if (!record || record.status !== 'pending_confirmation') return null;

        // 获取当前已选中的所有ID，避免重复抽取
        const currentSelectedIds = record.selectedExperts.map(e => e.id);
        
        // 获取候选池 (同原始配置)
        let candidates = expertService.filterExperts({
            major: record.config.major,
            status: 'available'
        }).filter(e => !record.config.avoidDistricts.includes(e.district) && !currentSelectedIds.includes(e.id));

        if (candidates.length === 0) return null;

        // 随机抽一个新专家
        const newExpert = this._shuffleAndPick(candidates, 1)[0];
        
        // 替换记录中的专家
        const index = record.selectedExperts.findIndex(e => e.id === oldExpertId);
        if (index !== -1) {
            record.selectedExperts[index] = { ...newExpert };
        }

        return newExpert;
    }

    /**
     * 确认并推送
     */
    confirmAndPush(recordId) {
        const record = this.records.find(r => r.id === recordId);
        if (record) {
            record.status = 'pushed';
            record.pushTime = new Date();
            // 模拟推送逻辑
            console.log(`已将名单推送至 ${record.selectedExperts.length} 名教师处`);
            return true;
        }
        return false;
    }

    /**
     * 撤回推送
     */
    withdrawPush(recordId) {
        const record = this.records.find(r => r.id === recordId);
        if (record && record.status === 'pushed') {
            record.status = 'pending_confirmation';
            record.withdrawTime = new Date();
            console.log(`已撤回推送，并通知 ${record.selectedExperts.length} 名教师`);
            return true;
        }
        return false;
    }

    getHistory() {
        return this.records;
    }

    /**
     * 洗牌并选取
     * @private
     */
    _shuffleAndPick(list, count) {
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

module.exports = new ExtractionEngine();
