const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const expertService = require('./services/expertService');
const extractionEngine = require('./services/extractionEngine');
const evaluationService = require('./services/evaluationService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 专家管理接口 ---

/**
 * 获取专家列表 (支持多维筛选)
 */
app.get('/api/experts', (req, res) => {
    const criteria = {
        major: req.query.major,
        titles: req.query.titles ? req.query.titles.split(',') : null,
        tags: req.query.tags ? req.query.tags.split(',') : null,
        status: req.query.status
    };
    const results = expertService.filterExperts(criteria);
    res.json(results);
});

/**
 * 获取标签统计及全局标签库
 */
app.get('/api/experts/tags', (req, res) => {
    res.json(expertService.getTagStats());
});

/**
 * 全局标签管理：新增
 */
app.post('/api/tags', (req, res) => {
    const { tag } = req.body;
    const success = expertService.addGlobalTag(tag);
    res.json({ success });
});

/**
 * 全局标签管理：删除
 */
app.delete('/api/tags/:tag', (req, res) => {
    expertService.deleteGlobalTag(req.params.tag);
    res.json({ success: true });
});

/**
 * 专家打标
 */
app.post('/api/experts/:id/tags', (req, res) => {
    const { tag } = req.body;
    const success = expertService.tagExpert(req.params.id, tag);
    res.json({ success });
});

/**
 * 专家取消打标
 */
app.delete('/api/experts/:id/tags/:tag', (req, res) => {
    const success = expertService.untagExpert(req.params.id, req.params.tag);
    res.json({ success });
});

/**
 * 批量专家打标
 */
app.post('/api/experts/batch/tags', (req, res) => {
    const { ids, tag } = req.body;
    const success = expertService.batchTagExperts(ids, tag);
    res.json({ success });
});

/**
 * 自动化规则打标
 */
app.post('/api/experts/automated-tagging', (req, res) => {
    const rule = req.body;
    const count = expertService.runAutomatedTagRule(rule);
    res.json({ success: true, count });
});

/**
 * 从人社局同步教师数据
 */
app.post('/api/sync/hrssb', async (req, res) => {
    try {
        const result = await expertService.syncFromHRSSB();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 专家抽取接口 ---

/**
 * 抽取专家
 */
app.post('/api/extraction/run', (req, res) => {
    try {
        const config = req.body;
        const result = extractionEngine.extract(config);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取抽取历史
 */
app.get('/api/extraction/history', (req, res) => {
    res.json(extractionEngine.getHistory());
});

/**
 * 单个专家重抽
 */
app.post('/api/extraction/re-extract', (req, res) => {
    const { recordId, expertId } = req.body;
    const newExpert = extractionEngine.reExtractOne(recordId, expertId);
    if (newExpert) {
        res.json(newExpert);
    } else {
        res.status(400).json({ error: '无法重新抽取专家' });
    }
});

/**
 * 确认并推送抽取结果
 */
app.post('/api/extraction/push', (req, res) => {
    const { recordId } = req.body;
    const success = extractionEngine.confirmAndPush(recordId);
    res.json({ success });
});

/**
 * 撤回推送
 */
app.post('/api/extraction/withdraw', (req, res) => {
    const { recordId } = req.body;
    const success = extractionEngine.withdrawPush(recordId);
    res.json({ success });
});

// --- 专家评价接口 ---

/**
 * 提交专家服务评价
 */
app.post('/api/evaluation/submit', (req, res) => {
    const evalData = req.body;
    const result = evaluationService.submitEvaluation(evalData);
    res.json(result);
});

/**
 * 获取某次抽取记录下的所有专家评价
 */
app.get('/api/evaluation/record/:recordId', (req, res) => {
    res.json(evaluationService.getRecordEvaluations(req.params.recordId));
});

/**
 * 黑名单管理：新增
 */
app.post('/api/blacklist', (req, res) => {
    const { expertId, reason } = req.body;
    const success = expertService.addToBlacklist(expertId, reason);
    res.json({ success });
});

/**
 * 黑名单管理：移出
 */
app.delete('/api/blacklist/:id', (req, res) => {
    const success = expertService.removeFromBlacklist(req.params.id);
    res.json({ success });
});

/**
 * 获取黑名单列表
 */
app.get('/api/blacklist', (req, res) => {
    res.json(expertService.getBlacklist());
});

/**
 * 获取预警专家 (保持兼容，但内部逻辑已改为黑名单)
 */
app.get('/api/evaluation/warnings', (req, res) => {
    res.json(expertService.getBlacklist());
});

const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`专家库系统模块已启动，监听端口: ${PORT}`);
// });

module.exports = app; // 导出用于测试
