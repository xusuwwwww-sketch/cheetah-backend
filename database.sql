-- 猎豹出海工具箱 数据库初始化脚本
CREATE DATABASE IF NOT EXISTS cheetah_toolbox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cheetah_toolbox;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(64) UNIQUE NOT NULL COMMENT '微信 openid',
  nickname VARCHAR(64) COMMENT '微信昵称',
  avatar VARCHAR(255) COMMENT '头像',
  name VARCHAR(64) COMMENT '真实姓名',
  industry VARCHAR(64) COMMENT '行业',
  position VARCHAR(64) COMMENT '职位',
  email VARCHAR(128) COMMENT '邮箱',
  company VARCHAR(128) COMMENT '公司名称',
  budget VARCHAR(64) COMMENT '月推广预算',
  core_need VARCHAR(255) COMMENT '核心需求',
  pain_point TEXT COMMENT '最大痛点',
  level TINYINT DEFAULT 1 COMMENT '留资层级: 1=微信登录 2=基础信息 3=深度留资',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('live','closed','salon','camp') DEFAULT 'live' COMMENT '活动类型',
  title VARCHAR(255) NOT NULL COMMENT '活动标题',
  cover_url VARCHAR(500) COMMENT '封面图',
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #ff6b35, #ff9a5c)' COMMENT '渐变色',
  icon VARCHAR(32) COMMENT '图标文字',
  start_time DATETIME COMMENT '开始时间',
  end_time DATETIME COMMENT '结束时间',
  location VARCHAR(255) COMMENT '地点(线上填"线上直播")',
  organizer VARCHAR(128) DEFAULT '猎豹出海' COMMENT '主办方',
  quota INT DEFAULT 0 COMMENT '限额人数(0=不限)',
  signup_count INT DEFAULT 0 COMMENT '已报名人数',
  description TEXT COMMENT '活动详情(富文本)',
  is_online TINYINT DEFAULT 1 COMMENT '是否线上',
  status TINYINT DEFAULT 1 COMMENT '状态: 1=发布 0=下架',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 活动报名表
CREATE TABLE IF NOT EXISTS activity_signups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_id INT NOT NULL,
  status TINYINT DEFAULT 1 COMMENT '1=已报名 0=已取消',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_activity (user_id, activity_id)
);

-- 报告表
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  cover_url VARCHAR(500) COMMENT '封面图',
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #1e3a5f, #2d5f8a)',
  source VARCHAR(128) COMMENT '来源',
  industry VARCHAR(64) COMMENT '行业',
  region VARCHAR(64) COMMENT '地区',
  year VARCHAR(8) COMMENT '年份',
  is_free TINYINT DEFAULT 1 COMMENT '1=免费 0=付费',
  price DECIMAL(10,2) DEFAULT 0 COMMENT '付费价格',
  summary TEXT COMMENT '简介',
  content TEXT COMMENT '详情(富文本)',
  file_url VARCHAR(500) COMMENT 'PDF文件地址',
  download_count INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 资料表
CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tab ENUM('media','lobster','fastgrow') DEFAULT 'media' COMMENT '所属tab',
  title VARCHAR(255) NOT NULL,
  cover_url VARCHAR(500),
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  author VARCHAR(64) COMMENT '作者',
  file_size VARCHAR(32) COMMENT '文件大小',
  file_url VARCHAR(500) COMMENT '文件地址',
  summary TEXT COMMENT '简介',
  content TEXT COMMENT '正文(富文本)',
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 咨询预约表
CREATE TABLE IF NOT EXISTS consults (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT '用户ID(登录后)',
  name VARCHAR(64) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  company VARCHAR(128),
  topic VARCHAR(128) COMMENT '咨询主题',
  note TEXT COMMENT '补充说明',
  status TINYINT DEFAULT 0 COMMENT '0=待处理 1=已跟进 2=已完成',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 轮播图表
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag VARCHAR(32) COMMENT '标签',
  title VARCHAR(128) NOT NULL,
  description VARCHAR(255),
  gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #ff6b35, #ff9a5c)',
  link_type ENUM('activity','report','url','none') DEFAULT 'none',
  link_id INT COMMENT '关联ID',
  link_url VARCHAR(500) COMMENT '外链',
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 社群表
CREATE TABLE IF NOT EXISTS communities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  description VARCHAR(255),
  member_count INT DEFAULT 0,
  qr_url VARCHAR(500) COMMENT '微信群二维码',
  icon_color VARCHAR(32) DEFAULT '#fff0ea',
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初始数据：轮播图
INSERT INTO banners (tag, title, description, gradient, sort_order) VALUES
('热门活动', '2026 出海增长峰会', '7月15日 · 深圳南山 · 限额200人', 'linear-gradient(135deg, #ff6b35, #ff9a5c)', 1),
('限时免费', '东南亚市场洞察报告', '覆盖6国 · 500+品牌数据 · 立即领取', 'linear-gradient(135deg, #1a1a2e, #2d2d44)', 2),
('新品上线', 'CheetahGo 3.0 正式发布', 'AI驱动的广告投放 · 效率提升300%', 'linear-gradient(135deg, #2563eb, #60a5fa)', 3);

-- 初始数据：社群
INSERT INTO communities (title, description, member_count, icon_color, sort_order) VALUES
('出海交流群', '1280人已加入', 1280, '#fff0ea', 1),
('买量优化群', '856人已加入', 856, '#ebf5ff', 2),
('电商出海群', '1032人已加入', 1032, '#ecfdf5', 3),
('游戏出海群', '643人已加入', 643, '#f5f3ff', 4),
('合规交流群', '421人已加入', 421, '#fffbeb', 5);
