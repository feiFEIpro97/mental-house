/**
 * 专家模型定义
 */
class Expert {
    constructor(data) {
        this.id = data.id; // 唯一标识 (通常是教师ID)
        this.name = data.name; // 姓名
        this.gender = data.gender; // 性别
        this.district = data.district; // 所属区县 (用于回避原则)
        this.school = data.school; // 所属学校
        
        // 核心属性
        this.title = data.title; // 职称 (如：正高级、高级、一级、二级)
        this.certificates = data.certificates || []; // 证书列表 (如：特级教师、学科带头人)
        this.major = data.major; // 专业/学科 (如：数学、语文)
        this.seniority = data.seniority; // 资历/教龄 (年)
        
        // 标签系统
        this.autoTags = []; // 系统自动生成的标签
        this.manualTags = data.manualTags || []; // 手动设定的标签
        this.tags = []; // 最终合并显示的标签
        
        // 状态与评价
        this.status = data.status || 'available'; // 状态: available, busy, suspended
        this.rating = data.rating || 5.0; // 专家评分 (初始5.0)
        this.serviceCount = data.serviceCount || 0; // 服务次数
        this.lastServiceDate = data.lastServiceDate || null; // 最近服务日期
        
        // 其他扩展字段
        this.metadata = data.metadata || {}; 
    }

    /**
     * 根据属性自动更新标签并合并手动标签
     */
    updateTags() {
        const newAutoTags = new Set();
        
        // 根据职称打标签
        if (['正高级', '高级'].includes(this.title)) {
            newAutoTags.add('高层次人才');
        }
        
        // 根据证书打标签
        if (this.certificates && this.certificates.includes('特级教师')) {
            newAutoTags.add('名师');
        }
        
        // 根据教龄打标签
        if (this.seniority >= 20) {
            newAutoTags.add('资深专家');
        } else if (this.seniority >= 10) {
            newAutoTags.add('骨干专家');
        }
        
        // 根据评分打标签
        if (this.rating >= 4.8 && this.serviceCount > 5) {
            newAutoTags.add('优质专家');
        }

        this.autoTags = Array.from(newAutoTags);
        // 合并去重
        this.tags = Array.from(new Set([...this.autoTags, ...this.manualTags]));
    }

    /**
     * 手动添加标签
     */
    addManualTag(tag) {
        if (!this.manualTags.includes(tag)) {
            this.manualTags.push(tag);
            this.updateTags();
        }
    }

    /**
     * 手动删除标签
     */
    removeManualTag(tag) {
        this.manualTags = this.manualTags.filter(t => t !== tag);
        this.updateTags();
    }
}

module.exports = Expert;
