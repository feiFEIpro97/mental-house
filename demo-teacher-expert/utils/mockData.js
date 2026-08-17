/**
 * 模拟教师/专家原始数据池
 */
const mockTeachers = [
    {
        id: 'T001',
        name: '张伟',
        gender: '男',
        district: '海淀区',
        school: '海淀第一中学',
        title: '正高级',
        certificates: ['特级教师', '学科带头人'],
        major: '数学',
        seniority: 25,
        rating: 4.9,
        serviceCount: 12
    },
    {
        id: 'T002',
        name: '王芳',
        gender: '女',
        district: '西城区',
        school: '西城实验小学',
        title: '高级',
        certificates: ['骨干教师'],
        major: '语文',
        seniority: 15,
        rating: 4.7,
        serviceCount: 8
    },
    {
        id: 'T003',
        name: '李强',
        gender: '男',
        district: '朝阳区',
        school: '朝阳中学',
        title: '一级',
        certificates: [],
        major: '英语',
        seniority: 8,
        rating: 4.5,
        serviceCount: 3
    },
    {
        id: 'T004',
        name: '赵静',
        gender: '女',
        district: '海淀区',
        school: '中关村二小',
        title: '高级',
        certificates: ['学科带头人'],
        major: '数学',
        seniority: 18,
        rating: 4.8,
        serviceCount: 15
    },
    {
        id: 'T005',
        name: '孙博',
        gender: '男',
        district: '东城区',
        school: '北京二中',
        title: '正高级',
        certificates: ['特级教师'],
        major: '物理',
        seniority: 22,
        rating: 5.0,
        serviceCount: 20
    },
    {
        id: 'T006',
        name: '周梅',
        gender: '女',
        district: '通州区',
        school: '潞河中学',
        title: '高级',
        certificates: [],
        major: '化学',
        seniority: 12,
        rating: 4.6,
        serviceCount: 5
    },
    {
        id: 'T007',
        name: '吴刚',
        gender: '男',
        district: '西城区',
        school: '北京八中',
        title: '一级',
        certificates: ['市级骨干'],
        major: '语文',
        seniority: 10,
        rating: 4.4,
        serviceCount: 4
    },
    {
        id: 'T008',
        name: '郑红',
        gender: '女',
        district: '海淀区',
        school: '人大附中',
        title: '正高级',
        certificates: ['学科带头人'],
        major: '数学',
        seniority: 28,
        rating: 4.9,
        serviceCount: 18
    }
];

module.exports = { mockTeachers };
