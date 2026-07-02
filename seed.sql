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
-- 资料库数据（资料下载）
INSERT INTO materials (content_type, title, gradient, author, file_size, summary, status, sort_order) VALUES
('material', '2026年海外媒体投放渠道指南', 'linear-gradient(135deg, #8b5cf6, #a78bfa)', 'CheetahGo 投放团队', 'PDF · 2.3MB', '覆盖 Meta、Google、TikTok、Twitter 等主流平台的投放策略、受众定向和预算分配指南。', 1, 10),
('material', 'Google Ads 最佳实践手册 2026', 'linear-gradient(135deg, #6366f1, #818cf8)', 'CheetahGo 投放团队', 'PDF · 4.1MB', '从账户结构到关键词策略，从出价优化到广告素材创作，全面覆盖 Google Ads 核心操作技巧。', 1, 9),
('material', 'Meta 广告政策合规速查手册', 'linear-gradient(135deg, #7c3aed, #a78bfa)', 'CheetahGo 合规团队', 'PDF · 1.8MB', '汇总 Meta 广告政策中的高频违规场景和解决方案，帮助广告主避免账号封禁风险。', 1, 8),
('material', 'WhatsApp Business API 接入指南', 'linear-gradient(135deg, #25d366, #128c7e)', 'CheetahGo 技术团队', 'PDF · 3.5MB', '完整介绍 WhatsApp BSP 接入流程、API 使用方法和常见问题解决方案。', 1, 7),
('material', 'TikTok Shop 运营全攻略', 'linear-gradient(135deg, #000000, #333366)', 'CheetahGo 电商团队', 'PDF · 5.1MB', '从店铺搭建到爆款打造，TikTok Shop 运营完整指南。', 1, 6);

-- 案例库数据（图文展示）
INSERT INTO materials (content_type, title, gradient, author, summary, content, status, sort_order) VALUES
('case', '某跨境电商品牌TikTok出海增长案例', 'linear-gradient(135deg, #059669, #34d399)', '猎豹研究院', '通过 TikTok Shop + 达人合作，3个月内 GMV 增长 320%，ROI 提升至 4.2。', '案例背景：某家居品牌计划进入东南亚市场...

核心策略：
1. 本地化内容生产，覆盖印尼、泰国、越南三国语言
2. 与头部达人合作，借助达人粉丝基础快速起量
3. TikTok Shop 直播带货，平均每场 GMV 超 5 万元

核心数据：
- 月 GMV：从 0 增长至 80 万元
- ROI：4.2
- 粉丝增长：12 万

复盘总结：本土化内容是东南亚出海最关键的一步。', 1, 10),
('case', 'SaaS 工具出海：Google Ads 精细化投放实战', 'linear-gradient(135deg, #2563eb, #60a5fa)', 'CheetahGo 投放团队', '通过账户结构优化+受众分层，CPA 降低 47%，MQL 提升 2.3 倍。', '项目背景：某 B2B SaaS 工具希望进入北美市场...

核心挑战：
- 北美 Google Ads CPC 均价高，预算有限
- 产品试用转化率低，漏斗需要优化

解决方案：
1. 账户结构重组：按产品功能拆分广告系列
2. 受众分层：区分品牌词/竞品词/通用词出价策略
3. 落地页 A/B 测：测试 6 个版本，找到最优转化页

结果：
- CPA 降低 47%
- 试用注册率提升 68%
- MQL 数量增长 2.3 倍', 1, 9),
('case', '独立站冷启动：如何在 3 个月内突破百万美金', 'linear-gradient(135deg, #d97706, #fbbf24)', '猎豹出海顾问团队', '0 资源起步，通过精准选品+社媒矩阵+红人营销，3 个月独立站 GMV 破百万美金。', '案例主角：服装配饰垂直品牌

起盘策略：
1. 选品：聚焦小众细分赛道，避开红海竞争
2. 内容：Instagram + Pinterest 双平台矩阵铺量
3. KOL：与 50 个腰部网红合作，CPS 模式控制成本
4. 数据：每周复盘 Top/Bottom SKU，快速迭代

月度数据：
- 第1月：$3.2万
- 第2月：$18.6万
- 第3月：$112万

关键经验：选品比投放更重要，找到 Product-Market Fit 才是核心。', 1, 8);

-- 标签测试数据
INSERT INTO tags (name, type, sort_order) VALUES
('电商', 'industry', 1), ('游戏', 'industry', 2), ('广告投放', 'industry', 3), ('独立站', 'industry', 4), ('社交媒体', 'industry', 5),
('东南亚', 'region', 1), ('中东', 'region', 2), ('拉美', 'region', 3), ('全球', 'region', 4), ('北美', 'region', 5),
('2026', 'topic', 1), ('白皮书', 'topic', 2), ('实战指南', 'topic', 3), ('趋势报告', 'topic', 4);

SELECT '测试数据插入完成' as status;
SELECT '活动数量:' as label, COUNT(*) as count FROM activities;
SELECT '报告数量:' as label, COUNT(*) as count FROM reports;
SELECT '资料数量:' as label, COUNT(*) as count FROM materials;
