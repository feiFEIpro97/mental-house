/**
 * 专家库系统功能演示脚本
 */
const expertService = require('./services/expertService');
const extractionEngine = require('./services/extractionEngine');
const evaluationService = require('./services/evaluationService');

console.log('=== 1. 专家库初始化 (全量教师入库) ===');
console.log(`当前专家总数: ${expertService.experts.length}`);
console.log('标签分布情况:', expertService.getTagStats());

console.log('\n=== 2. 执行专家抽取 (规则配置) ===');
const extractionConfig = {
    count: 3,
    redundancy: 1.5, // 抽取 3 * 1.5 = 5 人供选
    major: '数学',
    avoidDistricts: ['海淀区'], // 回避海淀区
    layers: [
        { title: ['正高级', '高级'], ratio: 0.6 }, // 60% 高级
        { title: ['一级', '二级'], ratio: 0.4 }  // 40% 普通
    ]
};

const extractResult = extractionEngine.extract(extractionConfig);
console.log(extractResult.message);
extractResult.experts.forEach(e => {
    console.log(`- [${e.title}] ${e.name} (${e.district} - ${e.school}) 标签: ${e.tags.join(', ')}`);
});

console.log('\n=== 3. 专家服务评价与反馈机制 ===');
const targetExpertId = extractResult.experts[0].id;
console.log(`对专家 ${targetExpertId} 进行评价...`);

evaluationService.submitEvaluation({
    expertId: targetExpertId,
    score: 2.0, // 故意给低分测试预警
    comment: '表现不佳，迟到且不专业',
    evaluator: '系统管理员'
});

const warnings = evaluationService.getWarningExperts(3.0);
if (warnings.length > 0) {
    console.log('【预警】评分低于3.0的专家:', warnings.map(e => `${e.name} (当前评分: ${e.rating.toFixed(1)})`));
}

console.log('\n=== 4. 再次筛选专家 (查看状态变化) ===');
const currentExpert = expertService.experts.find(e => e.id === targetExpertId);
console.log(`专家 ${currentExpert.name} 当前状态: ${currentExpert.status}, 评分: ${currentExpert.rating.toFixed(1)}`);
