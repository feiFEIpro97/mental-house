const expertService = require('./expertService');

/**
 * 专家服务评价系统
 */
class EvaluationService {
    constructor() {
        this.evaluations = []; // 存储所有评价记录
    }

    /**
     * 提交评价
     * @param {Object} evalData 
     * {
     *   recordId: 'REC_001', // 关联的抽取记录ID
     *   expertId: 'T001',
     *   score: 4.5,
     *   comment: '专业水平高',
     *   evaluator: '教委A'
     * }
     */
    submitEvaluation(evalData) {
        const evaluation = {
            id: `EVAL_${Date.now()}`,
            ...evalData,
            timestamp: new Date()
        };
        
        this.evaluations.push(evaluation);
        
        // 调用专家服务更新评分和状态
        expertService.updateExpertRating(evalData.expertId, evalData.score);
        
        return evaluation;
    }

    /**
     * 获取某次抽取任务的所有评价
     */
    getRecordEvaluations(recordId) {
        return this.evaluations.filter(e => e.recordId === recordId);
    }

    /**
     * 获取专家的历史评价记录
     */
    getExpertHistory(expertId) {
        return this.evaluations.filter(e => e.expertId === expertId);
    }

    /**
     * 智能分析：获取评分持续走低的专家列表 (后评估预警)
     * @param {number} threshold 阈值
     */
    getWarningExperts(threshold = 3.5) {
        return expertService.experts.filter(e => e.rating < threshold && e.serviceCount > 0);
    }
}

module.exports = new EvaluationService();
