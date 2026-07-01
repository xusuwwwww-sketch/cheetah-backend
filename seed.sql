-- 猎豹出海工具箱 测试数据 v2.0（适配 database v2.0）
USE cheetah_toolbox;

-- 活动测试数据（用 type_slug，无 signup_count/icon）
INSERT INTO activities (type_slug, title, gradient, start_time, end_time, signup_deadline, location, organizer, quota, description, is_online, status, sort_order) VALUES
('live', '出海直播季·第12期：TikTok Shop 新加坡爆单秘籍', 'linear-gradient(135deg, #ff6b35, #ff9a5c)', '2026-07-28 20:00:00', '2026-07-28 22:00:00', '2026-07-28 18:00:00', '线上直播', '猎豹出海', 500, '邀请 TikTok Shop 新加坡区域负责人及3位GMV破百万卖家，深度拆解新加坡电商市场趋势、选品逻辑、达人合作策略和投放技巧。', 1, 1, 10),
('live', 'AI 时代的买量投放策略：从手动到智能', 'linear-gradient(135deg, #2563eb, #60a5fa)', '2026-08-05 19:30:00', '2026-08-05 21:00:00', '2026-08-05 18:00:00', '线上直播', '猎豹出海', 300, '探讨 AI 如何革新广告投放方式，从智能出价到素材生成，分享实战经验。', 1, 1, 9),
('live', '出海实战：独立站从0到100万美元的完整路径', 'linear-gradient(135deg, #10b981, #34d399)', '2026-08-12 20:00:00', '2026-08-12 22:00:00', '2026-08-12 18:00:00', '线上直播', '猎豹出海', 200, '独立站创业全路径分享，从选品到投放到留存的完整方法论。', 1, 1, 8),
('closed', '中东品牌增长闭门会：支付、合规与渠道打法', 'linear-gradient(135deg, #1a1a2e, #3f3f5a)', '2026-08-18 14:00:00', '2026-08-18 18:00:00', '2026-08-15 18:00:00', '深圳南山·猎豹出海总部', '猎豹出海', 50, '限额50人闭门会，深度探讨中东市场支付解决方案、合规要点和本地化渠道策略。', 0, 1, 7),
('salon', '独立站运营沙龙：从素材测试到转化漏斗优化', 'linear-gradient(135deg, #f59e0b, #fbbf24)', '2026-08-24 15:00:00', '2026-08-24 18:00:00', '2026-08-22 18:00:00', '上海静安·WeWork', '猎豹出海', 80, '面对面交流独立站运营经验，重点分享素材测试方法论和转化率优化技巧。', 0, 1, 6),
('camp', '跨境广告投放7天训练营', 'linear-gradient(135deg, #8b5cf6, #a78bfa)', '2026-09-01 09:00:00', '2026-09-07 21:00:00', '2026-08-28 18:00:00', '线上训练营', '猎豹出海', 200, '7天系统学习跨境广告投放，从基础到进阶，配套作业和答疑。', 1, 1, 5),
('live', 'WhatsApp 营销实战：B2B询盘转化全链路', 'linear-gradient(135deg, #25d366, #128c7e)', '2026-08-20 20:00:00', '2026-08-20 22:00:00', '2026-08-20 18:00:00', '线上直播', '猎豹出海', 400, '从 CTWA 广告到 WhatsApp 私域运营，全面解析 B2B 获客转化最短路径。', 1, 1, 4),
('salon', '东南亚选品沙龙：2026年爆款品类深度解析', 'linear-gradient(135deg, #f59e0b, #d97706)', '2026-09-10 14:00:00', '2026-09-10 17:00:00', '2026-09-08 18:00:00', '广州天河·联合办公', '猎豹出海', 60, '聚焦东南亚市场2026年爆款品类趋势，分享选品逻辑和供应链整合策略。', 0, 1, 3);

-- 报告测试数据
INSERT INTO reports (title, gradient, source, industry, region, year, is_free, price, summary, content, status, sort_order) VALUES
('2026年Q2中国出海品牌Top50排行榜', 'linear-gradient(135deg, #1e3a5f, #2d5f8a)', '猎豹研究院', '综合', '全球', '2026', 1, 0, '基于猎豹大数据平台监测的5000+中国出海品牌数据，从品牌知名度、用户口碑、市场份额、增长趋势四个维度评选出2026年Q2 Top50。', '报告完整内容请下载查看...', 1, 10),
('东南亚社交媒体营销白皮书 2026', 'linear-gradient(135deg, #2d1b4e, #5b3a8c)', 'CheetahGo', '综合', '东南亚', '2026', 0, 99, '深度分析东南亚6国社交媒体用户行为、平台生态和营销趋势，提供本地化运营策略指南。', '付费报告完整内容...', 1, 9),
('中东市场游戏出海深度报告', 'linear-gradient(135deg, #1a3c34, #2d6b5a)', '出海情报站', '游戏', '中东', '2026', 1, 0, '全面分析中东6国游戏市场规模、用户偏好、付费习惯和主流渠道，附典型成功案例拆解。', '报告完整内容请下载查看...', 1, 8),
('拉美电商市场机遇与挑战全景分析', 'linear-gradient(135deg, #4a1942, #8b4578)', '猎豹研究院', '电商', '拉美', '2026', 0, 129, '拉美电商市场正处于高速增长期，本报告深度分析巴西、墨西哥、哥伦比亚三大核心市场的机遇与挑战。', '付费报告完整内容...', 1, 7),
('2026年出海广告投放趋势报告', 'linear-gradient(135deg, #0f3460, #16213e)', 'CheetahGo', '广告', '全球', '2026', 1, 0, 'AI赋能广告创意、隐私政策收紧背景下的投放新策略，及主流平台算法变化深度解读。', '报告完整内容请下载查看...', 1, 6),
('TikTok Shop 东南亚运营全攻略', 'linear-gradient(135deg, #000000, #333366)', 'CheetahGo', '电商', '东南亚', '2026', 1, 0, '从店铺搭建到爆款打造，从达人合作到广告投放，TikTok Shop 东南亚运营完整指南。', '报告完整内容请下载查看...', 1, 5);

-- 资料测试数据（用 category_id，对应 material_categories 的 id）
-- media=1, lobster=2, fastgrow=3
INSERT INTO materials (category_id, title, gradient, author, file_size, summary, status, sort_order) VALUES
(1, '2026年海外媒体投放渠道指南', 'linear-gradient(135deg, #8b5cf6, #a78bfa)', 'CheetahGo 投放团队', 'PDF · 2.3MB', '覆盖 Meta、Google、TikTok、Twitter 等主流平台的投放策略、受众定向和预算分配指南。', 1, 10),
(1, 'Google Ads 最佳实践手册 2026', 'linear-gradient(135deg, #6366f1, #818cf8)', 'CheetahGo 投放团队', 'PDF · 4.1MB', '从账户结构到关键词策略，从出价优化到广告素材创作，全面覆盖 Google Ads 核心操作技巧。', 1, 9),
(1, 'Meta 广告政策合规速查手册', 'linear-gradient(135deg, #7c3aed, #a78bfa)', 'CheetahGo 合规团队', 'PDF · 1.8MB', '汇总 Meta 广告政策中的高频违规场景和解决方案，帮助广告主避免账号封禁风险。', 1, 8),
(1, 'WhatsApp Business API 接入指南', 'linear-gradient(135deg, #25d366, #128c7e)', 'CheetahGo 技术团队', 'PDF · 3.5MB', '完整介绍 WhatsApp BSP 接入流程、API 使用方法和常见问题解决方案。', 1, 7),
(2, '龙虾投放平台入门指南', 'linear-gradient(135deg, #ef4444, #f87171)', '龙虾产品团队', 'PDF · 3.2MB', '从账号注册到第一个广告活动，手把手带你快速上手龙虾投放平台的核心功能。', 1, 10),
(2, '龙虾自动化规则配置手册', 'linear-gradient(135deg, #f97316, #fb923c)', '龙虾产品团队', 'PDF · 2.6MB', '详解龙虾平台自动化规则的设置方法，实现广告的智能监控和自动优化。', 1, 9),
(2, '龙虾 AI 素材生成使用指南', 'linear-gradient(135deg, #dc2626, #ef4444)', '龙虾产品团队', 'PDF · 2.1MB', '介绍龙虾平台 AI 素材生成功能，批量生成多语言广告素材，提升创意效率。', 1, 8),
(3, 'FastGrow 素材测试工作流', 'linear-gradient(135deg, #06b6d4, #22d3ee)', 'FastGrow 产品团队', 'PDF · 2.9MB', '系统介绍如何利用 FastGrow 平台进行高效的广告素材 A/B 测试，快速找到高转化素材。', 1, 10),
(3, 'FastGrow 数据看板使用手册', 'linear-gradient(135deg, #0f766e, #14b8a6)', 'FastGrow 产品团队', 'PDF · 3.7MB', '全面介绍 FastGrow 数据分析功能，帮助您从数据中挖掘投放洞察，提升 ROI。', 1, 9),
(3, 'FastGrow AI 视频广告制作教程', 'linear-gradient(135deg, #0284c7, #38bdf8)', 'FastGrow 产品团队', 'PDF · 4.2MB', '从脚本撰写到视频生成，完整介绍 FastGrow AI 视频广告制作全流程。', 1, 8);

-- 标签测试数据
INSERT INTO tags (name, type, sort_order) VALUES
('电商', 'industry', 1), ('游戏', 'industry', 2), ('广告投放', 'industry', 3), ('独立站', 'industry', 4), ('社交媒体', 'industry', 5),
('东南亚', 'region', 1), ('中东', 'region', 2), ('拉美', 'region', 3), ('全球', 'region', 4), ('北美', 'region', 5),
('2026', 'topic', 1), ('白皮书', 'topic', 2), ('实战指南', 'topic', 3), ('趋势报告', 'topic', 4);

SELECT '测试数据插入完成' as status;
SELECT '活动数量:' as label, COUNT(*) as count FROM activities;
SELECT '报告数量:' as label, COUNT(*) as count FROM reports;
SELECT '资料数量:' as label, COUNT(*) as count FROM materials;
