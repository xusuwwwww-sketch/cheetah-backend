-- 猎豹出海工具箱 数据库初始化脚本 v2.0
-- 更新内容：ENUM改VARCHAR/字典表、users拆分、budget数值化、补全索引&FK、新增5张表
CREATE DATABASE IF NOT EXISTS cheetah_toolbox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cheetah_toolbox;

-- ============================================================
-- 字典表：活动类型（替代 ENUM 硬编码）
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(32) NOT NULL UNIQUE COMMENT '标识符: live/closed/salon/camp',
  name VARCHAR(64) NOT NULL COMMENT '显示名称',
  sort_order INT DEFAULT 0
);

INSERT INTO activity_types (slug, name, sort_order) VALUES
('all',    '全部',   0),
('live',   '直播',   1),
('salon',  '沙龙',   2),
('closed', '闭门会', 3),
('camp',   '训练营', 4);

-- ============================================================
-- 字典表：资料分类（替代 tab ENUM 硬编码）
-- ============================================================
CREATE TABLE IF NOT EXISTS material_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(32) NOT NULL UNIQUE COMMENT '标识符',
  name VARCHAR(64) NOT NULL COMMENT '显示名称',
  sort_order INT DEFAULT 0
);

INSERT INTO material_categories (slug, name, sort_order) VALUES
('media',    '媒体资料', 1),
('lobster',  '龙虾资料', 2),
('fastgrow', 'FastGrow', 3);

-- ============================================================
-- 用户表（精简：只存身份&留资层级）
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(64) UNIQUE NOT NULL COMMENT '微信 openid',
  nickname VARCHAR(64) COMMENT '微信昵称',
  avatar VARCHAR(500) COMMENT '头像',
  level TINYINT DEFAULT 1 COMMENT '留资层级: 1=微信登录 2=基础信息 3=深度留资',
  is_banned TINYINT DEFAULT 0 COMMENT '是否封禁',
  last_login_at DATETIME COMMENT '最后登录时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 用户资料扩展表（基础信息 + 深度留资，独立拆分）
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  -- 基础信息（level 2）
  name VARCHAR(64) COMMENT '真实姓名',
  industry VARCHAR(64) COMMENT '行业',
  position VARCHAR(64) COMMENT '职位',
  email VARCHAR(128) COMMENT '邮箱',
  phone VARCHAR(32) COMMENT '手机号',
  -- 深度留资（level 3）
  company VARCHAR(128) COMMENT '公司名称',
  budget_min INT DEFAULT 0 COMMENT '月推广预算下限（元）',
  budget_max INT DEFAULT 0 COMMENT '月推广预算上限（元）',
  core_need VARCHAR(255) COMMENT '核心需求',
  pain_point TEXT COMMENT '最大痛点',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 活动表
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_slug VARCHAR(32) DEFAULT 'live' COMMENT '活动类型 slug，关联 activity_types.slug',
  title VARCHAR(255) NOT NULL COMMENT '活动标题',
  cover_url VARCHAR(500) COMMENT '封面图',
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #ff6b35, #ff9a5c)' COMMENT '渐变色',
  start_time DATETIME COMMENT '开始时间',
  end_time DATETIME COMMENT '结束时间',
  signup_deadline DATETIME COMMENT '报名截止时间',
  location VARCHAR(255) COMMENT '地点（线上填"线上直播"）',
  organizer VARCHAR(128) DEFAULT '猎豹出海' COMMENT '主办方',
  quota INT DEFAULT 0 COMMENT '限额人数（0=不限）',
  description TEXT COMMENT '活动详情（富文本）',
  is_online TINYINT DEFAULT 1 COMMENT '是否线上',
  status TINYINT DEFAULT 1 COMMENT '0=下架 1=报名中 2=已结束',
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_type (type_slug),
  KEY idx_status (status),
  KEY idx_start_time (start_time)
);

-- ============================================================
-- 活动报名表
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_signups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_id INT NOT NULL,
  status TINYINT DEFAULT 1 COMMENT '1=已报名 0=已取消',
  cancelled_at DATETIME COMMENT '取消时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_activity (user_id, activity_id),
  CONSTRAINT fk_signup_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_signup_activity FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- ============================================================
-- 报告表
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  cover_url VARCHAR(500) COMMENT '封面图',
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #1e3a5f, #2d5f8a)',
  source VARCHAR(128) COMMENT '来源',
  industry VARCHAR(64) COMMENT '行业（保留单字段，多标签用 content_tags）',
  region VARCHAR(64) COMMENT '地区',
  year VARCHAR(8) COMMENT '年份',
  is_free TINYINT DEFAULT 1 COMMENT '1=免费 0=付费',
  price DECIMAL(10,2) DEFAULT 0 COMMENT '付费价格',
  summary TEXT COMMENT '简介',
  content TEXT COMMENT '详情（富文本）',
  file_url VARCHAR(500) COMMENT 'PDF 文件地址',
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_industry (industry),
  KEY idx_status (status)
);

-- ============================================================
-- 资料表
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_type VARCHAR(20) DEFAULT 'material' COMMENT 'report=报告 / case=案例库 / material=资料库',
  category_id INT COMMENT '分类ID（可选）',
  title VARCHAR(255) NOT NULL,
  cover_url VARCHAR(500),
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  author VARCHAR(64) COMMENT '作者',
  file_size VARCHAR(32) COMMENT '文件大小',
  file_url VARCHAR(500) COMMENT '文件地址',
  summary TEXT COMMENT '简介',
  content TEXT COMMENT '正文（富文本）',
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_category (category_id),
  -- category_id FK removed: optional field
);

-- ============================================================
-- 咨询预约表（补全跟进字段）
-- ============================================================
CREATE TABLE IF NOT EXISTS consults (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT '用户ID（登录后）',
  name VARCHAR(64) NOT NULL COMMENT '姓名（必填）',
  phone VARCHAR(32) COMMENT '手机号',
  industry VARCHAR(64) COMMENT '行业（必填）',
  position VARCHAR(64) COMMENT '职位（选填）',
  company VARCHAR(128) COMMENT '公司名称（必填）',
  budget_info VARCHAR(128) COMMENT '推广预算（必填）',
  core_need VARCHAR(500) COMMENT '核心需求（必填）',
  pain_point TEXT COMMENT '当前最大痛点（选填）',
  topic VARCHAR(128) COMMENT '咨询主题',
  note TEXT COMMENT '补充说明',
  scheduled_at DATETIME COMMENT '预约时间',
  advisor_id INT COMMENT '跟进顾问（关联 users.id）',
  follow_up_note TEXT COMMENT '跟进记录',
  status TINYINT DEFAULT 0 COMMENT '0=待处理 1=已跟进 2=已完成 3=已取消',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_status (status),
  KEY idx_user (user_id)
);

-- ============================================================
-- 轮播图表（link_type 改 VARCHAR）
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag VARCHAR(32) COMMENT '标签',
  title VARCHAR(128) NOT NULL,
  description VARCHAR(255),
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #ff6b35, #ff9a5c)',
  cover_url VARCHAR(500) COMMENT '封面图URL（优先于渐变色）',
  link_type VARCHAR(32) DEFAULT 'none' COMMENT 'activity/report/material/url/none',
  link_id INT COMMENT '关联 ID',
  link_url VARCHAR(500) COMMENT '外链',
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 社群表
-- ============================================================
CREATE TABLE IF NOT EXISTS communities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  description VARCHAR(255),
  qr_url VARCHAR(500) COMMENT '微信群二维码',
  icon_color VARCHAR(32) DEFAULT '#fff0ea',
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 【新增】标签表（报告/资料通用）
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(32) NOT NULL UNIQUE,
  type VARCHAR(32) DEFAULT 'topic' COMMENT 'industry/region/topic/format',
  sort_order INT DEFAULT 0
);

-- ============================================================
-- 【新增】内容-标签关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS content_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_type VARCHAR(32) NOT NULL COMMENT 'report/material',
  content_id INT NOT NULL,
  tag_id INT NOT NULL,
  UNIQUE KEY uk_content_tag (content_type, content_id, tag_id),
  KEY idx_tag (tag_id),
  CONSTRAINT fk_content_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================================
-- 【新增】用户收藏表（报告/资料/活动通用）
-- ============================================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target_type VARCHAR(32) NOT NULL COMMENT 'report/material/activity',
  target_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fav (user_id, target_type, target_id),
  KEY idx_user (user_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 【新增】用户下载/查看记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS user_downloads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target_type VARCHAR(32) NOT NULL COMMENT 'report/material',
  target_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user (user_id),
  KEY idx_target (target_type, target_id),
  CONSTRAINT fk_dl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 【新增】社群入群申请记录
-- ============================================================
CREATE TABLE IF NOT EXISTS community_joins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  community_id INT NOT NULL,
  status TINYINT DEFAULT 0 COMMENT '0=申请中 1=已入群 2=已拒绝',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_join (user_id, community_id),
  CONSTRAINT fk_join_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_join_community FOREIGN KEY (community_id) REFERENCES communities(id)
);

-- ============================================================
-- 【新增】用户行为日志（埋点）
-- ============================================================
CREATE TABLE IF NOT EXISTS user_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT '未登录时为 NULL',
  event_type VARCHAR(32) NOT NULL COMMENT 'view/click/signup/download/favorite',
  target_type VARCHAR(32) COMMENT 'activity/report/material/community',
  target_id INT,
  extra JSON COMMENT '额外参数（页面来源等）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user (user_id),
  KEY idx_event (event_type),
  KEY idx_time (created_at)
);

-- ============================================================
-- 初始数据
-- ============================================================
INSERT INTO banners (tag, title, description, gradient, sort_order) VALUES
('热门活动', '2026 出海增长峰会', '7月15日 · 深圳南山 · 限额200人', 'linear-gradient(135deg, #ff6b35, #ff9a5c)', 1),
('限时免费', '东南亚市场洞察报告', '覆盖6国 · 500+品牌数据 · 立即领取', 'linear-gradient(135deg, #1a1a2e, #2d2d44)', 2),
('新品上线', 'CheetahGo 3.0 正式发布', 'AI驱动的广告投放 · 效率提升300%', 'linear-gradient(135deg, #2563eb, #60a5fa)', 3);

INSERT INTO communities (title, description, icon_color, sort_order) VALUES
('出海交流群', '1280人已加入', '#fff0ea', 1),
('买量优化群', '856人已加入',  '#ebf5ff', 2),
('电商出海群', '1032人已加入', '#ecfdf5', 3),
('游戏出海群', '643人已加入',  '#f5f3ff', 4),
('合规交流群', '421人已加入',  '#fffbeb', 5);

-- ============================================================
-- 启动弹窗表
-- ============================================================
CREATE TABLE IF NOT EXISTS popups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(128) NOT NULL COMMENT '弹窗标题',
  cover_url VARCHAR(500) COMMENT '封面图URL',
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #ff6b35, #ff9a5c)' COMMENT '无图时的渐变色',
  description TEXT COMMENT '描述文字',
  btn_text VARCHAR(32) DEFAULT '立即查看' COMMENT '按钮文字',
  link_type VARCHAR(32) DEFAULT 'none' COMMENT 'activity/report/material/case/url/none',
  link_id INT COMMENT '关联ID',
  link_url VARCHAR(500) COMMENT '外部链接',
  show_once TINYINT DEFAULT 1 COMMENT '1=今日内不再提醒 0=每次都弹',
  status TINYINT DEFAULT 1 COMMENT '0=关闭 1=启用',
  sort_order INT DEFAULT 0,
  start_time DATETIME COMMENT '展示开始时间（NULL=立即）',
  end_time DATETIME COMMENT '展示结束时间（NULL=永久）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
