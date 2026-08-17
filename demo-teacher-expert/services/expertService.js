const Expert = require('../models/expert');
const { mockTeachers } = require('../utils/mockData');

/**
 * 专家服务类
 * 负责专家库的维护、筛选、标签化
 */
class ExpertService {
    constructor() {
        this.experts = [];
        this.globalTags = ['高层次人才', '名师', '资深专家', '骨干专家', '优质专家', '中考评卷', '心理辅导']; // 初始全局标签库
        this.initPool();
    }

    /**
     * 初始化专家池 (从所有教师中转化)
     */
    initPool() {
        this.experts = mockTeachers.map(t => {
            const expert = new Expert(t);
            expert.updateTags(); // 自动打标签
            return expert;
        });
    }

    /**
     * 多维度筛选专家
     * @param {Object} criteria 筛选条件
     */
    filterExperts(criteria) {
        return this.experts.filter(expert => {
            // 核心逻辑：黑名单教师永远不被抽取
            if (expert.status === 'blacklisted') return false;

            // 专业匹配
            if (criteria.major && expert.major !== criteria.major) return false;
            
            // 职称匹配
            if (criteria.titles && !criteria.titles.includes(expert.title)) return false;
            
            // 标签匹配
            if (criteria.tags && !criteria.tags.every(tag => expert.tags.includes(tag))) return false;
            
            // 地区过滤 (非回避，而是选定地区)
            if (criteria.districts && !criteria.districts.includes(expert.district)) return false;
            
            // 评分阈值
            if (criteria.minRating && expert.rating < criteria.minRating) return false;
            
            // 状态过滤
            if (criteria.status && expert.status !== criteria.status) return false;

            return true;
        });
    }

    /**
     * 获取所有专家标签分布
     */
    getTagStats() {
        const stats = {};
        this.experts.forEach(expert => {
            expert.tags.forEach(tag => {
                stats[tag] = (stats[tag] || 0) + 1;
            });
        });
        return {
            stats,
            globalTags: this.globalTags
        };
    }

    /**
     * 全局标签管理：新增
     */
    addGlobalTag(tag) {
        if (!this.globalTags.includes(tag)) {
            this.globalTags.push(tag);
            return true;
        }
        return false;
    }

    /**
     * 全局标签管理：删除
     */
    deleteGlobalTag(tag) {
        this.globalTags = this.globalTags.filter(t => t !== tag);
        // 同时清理所有专家中包含的该标签
        this.experts.forEach(e => e.removeManualTag(tag));
    }

    /**
     * 为专家手动打标
     */
    tagExpert(expertId, tag) {
        const expert = this.experts.find(e => e.id === expertId);
        if (expert) {
            expert.addManualTag(tag);
            this.addGlobalTag(tag);
            return true;
        }
        return false;
    }

    /**
     * 取消专家打标
     */
    untagExpert(expertId, tag) {
        const expert = this.experts.find(e => e.id === expertId);
        if (expert) {
            expert.removeManualTag(tag);
            return true;
        }
        return false;
    }

    /**
     * 批量为专家打标
     */
    batchTagExperts(expertIds, tag) {
        expertIds.forEach(id => this.tagExpert(id, tag));
        return true;
    }

    /**
     * 自动化规则打标
     */
    runAutomatedTagRule(rule) {
        let count = 0;
        this.experts.forEach(expert => {
            let match = false;
            const { field, value, operator } = rule.condition;
            const expertValue = expert[field];

            if (operator === 'equals' && expertValue === value) match = true;
            if (operator === 'contains' && Array.isArray(expertValue) && expertValue.includes(value)) match = true;
            if (operator === 'greaterThan' && expertValue > value) match = true;

            if (match) {
                expert.addManualTag(rule.tag);
                this.addGlobalTag(rule.tag);
                count++;
            }
        });
        return count;
    }

    /**
     * 批量导入专家 (教师转专家)
     */
    importTeachers(teachers) {
        const newExperts = teachers.map(t => {
            const expert = new Expert(t);
            expert.updateTags();
            return expert;
        });
        
        // 避免重复导入 (以ID为准)
        const existingIds = new Set(this.experts.map(e => e.id));
        const filteredNewExperts = newExperts.filter(ne => !existingIds.has(ne.id));
        
        this.experts.push(...filteredNewExperts);
        return filteredNewExperts.length;
    }

    /**
     * 从人社局同步全量XX教师信息 (模拟)
     */
    async syncFromHRSSB() {
        console.log('正在从XX人社局拉取全量教师数据...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const cqTeachers = [
            { id: 'XX001', name: '刘洋', gender: '男', district: 'XX区', school: 'XX中学', title: '高级', certificates: ['骨干教师'], major: '数学', seniority: 12, rating: 4.8, serviceCount: 0 },
            { id: 'XX002', name: '陈思', gender: '女', district: 'XX区', school: 'XX一中', title: '正高级', certificates: ['特级教师'], major: '语文', seniority: 25, rating: 5.0, serviceCount: 0 },
            { id: 'XX003', name: '杨光', gender: '男', district: 'XX区', school: '育才中学', title: '一级', certificates: [], major: '物理', seniority: 6, rating: 4.2, serviceCount: 0 },
            { id: 'XX004', name: '黄芳', gender: '女', district: 'XX区', school: '南开中学', title: '高级', certificates: ['市级名师'], major: '英语', seniority: 18, rating: 4.9, serviceCount: 0 }
        ];

        const importedCount = this.importTeachers(cqTeachers);
        return {
            totalFetched: cqTeachers.length,
            newImported: importedCount,
            message: `同步完成：从人社局拉取 ${cqTeachers.length} 条数据，新增 ${importedCount} 名专家入库。`
        };
    }

    /**
     * 将专家加入黑名单
     */
    addToBlacklist(expertId, reason = '手动添加') {
        const expert = this.experts.find(e => e.id === expertId);
        if (expert) {
            expert.status = 'blacklisted';
            expert.blacklistReason = reason;
            expert.blacklistDate = new Date();
            return true;
        }
        return false;
    }

    /**
     * 从黑名单移出
     */
    removeFromBlacklist(expertId) {
        const expert = this.experts.find(e => e.id === expertId);
        if (expert && expert.status === 'blacklisted') {
            expert.status = 'available';
            delete expert.blacklistReason;
            delete expert.blacklistDate;
            return true;
        }
        return false;
    }

    /**
     * 获取黑名单列表
     */
    getBlacklist() {
        return this.experts.filter(e => e.status === 'blacklisted');
    }

    /**
     * 更新专家评价信息
     */
    updateExpertRating(expertId, newRating) {
        const expert = this.experts.find(e => e.id === expertId);
        if (expert) {
            expert.rating = (expert.rating * expert.serviceCount + newRating) / (expert.serviceCount + 1);
            expert.serviceCount += 1;
            expert.lastServiceDate = new Date();
            expert.updateTags();
            
            // 自动化黑名单逻辑：评分低于 3.0 分自动拉黑
            if (expert.rating < 3.0) {
                this.addToBlacklist(expertId, `评分过低自动拉黑 (当前分值: ${expert.rating.toFixed(2)})`);
            }
        }
    }
}

// 单例模式
module.exports = new ExpertService();
