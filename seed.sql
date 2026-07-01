-- 猎豹出海工具箱 测试数据
USE cheetah_toolbox;

-- 活动测试数据
INSERT INTO activities (type, title, cover_url, gradient, icon, start_time, end_time, location, organizer, quota, signup_count, description, is_online, status, sort_order) VALUES
('live', '出海直播季·第12期：TikTok Shop 新加坡爆单秘籍', NULL, 'linear-gradient(135deg, #ff6b35, #ff9a5c)', 'LIVE', '2026-07-28 20:00:00', '2026-07-28 22:00:00', '线上直播', '猎豹出海', 500, 186, '邀请 TikTok Shop 新加坡区域负责人及3位GMV破百万卖家，深度拆解新加坡电商市场趋势、选品逻辑、达人合作策略和投放技巧。\n\n无论你是刚入局的新手还是寻求突破的老卖家，这场直播都能给你带来实实在在的干货。\n\n【嘉宾阵容】\nTikTok Shop 新加坡区域负责人、GMV月入百万卖家、猎豹出海高级投放专家', 1, 1, 10),
('live', 'AI 时代的买量投放策略：从手动到智能', NULL, 'linear-gradient(135deg, #2563eb, #60a5fa)', 'AI', '2026-08-05 19:30:00', '2026-08-05 21:00:00', '线上直播', '猎豹出海', 300, 92, '探讨 AI 如何革新广告投放方式，从智能出价到素材生成，分享实战经验。', 1, 1, 9),
('live', '出海实战：独立站从0到100万美元的完整路径', NULL, 'linear-gradient(135deg, #10b981, #34d399)', 'SHOP', '2026-08-12 20:00:00', '2026-08-12 22:00:00', '线上直播', '猎豹出海', 200, 200, '独立站创业全路径分享，从选品到投放到留存的完整方法论。', 1, 1, 8),
('closed', '中东品牌增长闭门会：支付、合规与渠道打法', NULL, 'linear-gradient(135deg, #1a1a2e, #3f3f5a)', 'VIP', '2026-08-18 14:00:00', '2026-08-18 18:00:00', '深圳南山·猎豹出海总部', '猎豹出海', 50, 38, '限额50人闭门会，深度探讨中东市场支付解决方案、合规要点和本地化渠道策略。', 0, 1, 7),
('salon', '独立站运营沙龙：从素材测试到转化漏斗优化', NULL, 'linear-gradient(135deg, #f59e0b, #fbbf24)', '沙龙', '2026-08-24 15:00:00', '2026-08-24 18:00:00', '上海静安·WeWork', '猎豹出海', 80, 64, '面对面交流独立站运营经验，重点分享素材测试方法论和转化率优化技巧。', 0, 1, 6),
('camp', '跨境广告投放7天训练营', NULL, 'linear-gradient(135deg, #8b5cf6, #a78bfa)', '营', '2026-09-01 09:00:00', '2026-09-07 21:00:00', '线上训练营', '猎豹出海', 200, 112, '7天系统学习跨境广告投放，从基础到进阶，配套作业和答疑。', 1, 1, 5);

-- 报告测试数据
INSERT INTO reports (title, gradient, source, industry, region, year, is_free, price, summary, content, status, sort_order) VALUES
('2026年Q2中国出海品牌Top50排行榜', 'linear-gradient(135deg, #1e3a5f, #2d5f8a)', '猎豹研究院', '综合', '全球', '2026', 1, 0, '本报告基于猎豹大数据平台监测的5000+中国出海品牌数据，从品牌知名度、用户口碑、市场份额、增长趋势四个维度评选出2026年Q2中国出海品牌Top50。涵盖电商、游戏、社交、工具、教育五大行业，覆盖东南亚、中东、拉美、非洲等新兴市场。', '报告完整内容请下载查看...', 1, 10),
('东南亚社交媒体营销白皮书 2026', 'linear-gradient(135deg, #2d1b4e, #5b3a8c)', 'CheetahGo', '综合', '东南亚', '2026', 0, 99, '深度分析东南亚6国社交媒体用户行为、平台生态和营销趋势，提供本地化运营策略指南。', '付费报告完整内容...', 1, 9),
('中东市场游戏出海深度报告', 'linear-gradient(135deg, #1a3c34, #2d6b5a)', '出海情报站', '游戏', '中东', '2026', 1, 0, '全面分析中东6国游戏市场规模、用户偏好、付费习惯和主流渠道，附典型成功案例拆解。', '报告完整内容请下载查看...', 1, 8),
('拉美电商市场机遇与挑战全景分析', 'linear-gradient(135deg, #4a1942, #8b4578)', '猎豹研究院', '电商', '拉美', '2026', 0, 129, '拉美电商市场正处于高速增长期，本报告深度分析巴西、墨西哥、哥伦比亚三大核心市场的机遇与挑战。', '付费报告完整内容...', 1, 7),
('2026年出海广告投放趋势报告', 'linear-gradient(135deg, #0f3460, #16213e)', 'CheetahGo', '广告', '全球', '2026', 1, 0, 'AI赋能广告创意、隐私政策收紧背景下的投放新策略，及主流平台算法变化深度解读。', '报告完整内容请下载查看...', 1, 6);

-- 资料测试数据
INSERT INTO materials (tab, title, gradient, author, file_size, summary, status, sort_order) VALUES
('media', '2026年海外媒体投放渠道指南', 'linear-gradient(135deg, #8b5cf6, #a78bfa)', 'CheetahGo 投放团队', 'PDF · 2.3MB', '覆盖 Meta、Google、TikTok、Twitter 等主流平台的投放策略、受众定向和预算分配指南。', 1, 10),
('media', 'Google Ads 最佳实践手册 2026', 'linear-gradient(135deg, #6366f1, #818cf8)', 'CheetahGo 投放团队', 'PDF · 4.1MB', '从账户结构到关键词策略，从出价优化到广告素材创作，全面覆盖 Google Ads 核心操作技巧。', 1, 9),
('media', 'Meta 广告政策合规速查手册', 'linear-gradient(135deg, #7c3aed, #a78bfa)', 'CheetahGo 合规团队', 'PDF · 1.8MB', '汇总 Meta 广告政策中的高频违规场景和解决方案，帮助广告主避免账号封禁风险。', 1, 8),
('lobster', '龙虾投放平台入门指南', 'linear-gradient(135deg, #ef4444, #f87171)', '龙虾产品团队', 'PDF · 3.2MB', '从账号注册到第一个广告活动，手把手带你快速上手龙虾投放平台的核心功能。', 1, 10),
('lobster', '龙虾自动化规则配置手册', 'linear-gradient(135deg, #f97316, #fb923c)', '龙虾产品团队', 'PDF · 2.6MB', '详解龙虾平台自动化规则的设置方法，实现广告的智能监控和自动优化。', 1, 9),
('fastgrow', 'FastGrow 素材测试工作流', 'linear-gradient(135deg, #06b6d4, #22d3ee)', 'FastGrow 产品团队', 'PDF · 2.9MB', '系统介绍如何利用 FastGrow 平台进行高效的广告素材 A/B 测试，快速找到高转化素材。', 1, 10),
('fastgrow', 'FastGrow 数据看板使用手册', 'linear-gradient(135deg, #0f766e, #14b8a6)', 'FastGrow 产品团队', 'PDF · 3.7MB', '全面介绍 FastGrow 数据分析功能，帮助您从数据中挖掘投放洞察，提升 ROI。', 1, 9);

SELECT '测试数据插入完成' as status;
SELECT '活动数量:' as label, COUNT(*) as count FROM activities;
SELECT '报告数量:' as label, COUNT(*) as count FROM reports;
SELECT '资料数量:' as label, COUNT(*) as count FROM materials;
