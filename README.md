# 猎豹出海工具箱 - 后端 API

## 技术栈
- Node.js + Express
- MySQL 2
- JWT 鉴权

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入数据库配置和微信 AppID/Secret

# 3. 初始化数据库
mysql -u root -p < database.sql

# 4. 启动开发服务器
npm run dev
```

## API 接口文档

### 用户模块
| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/user/login | 微信登录 | 否 |
| POST | /api/user/update-basic | 更新基础信息 | 是 |
| POST | /api/user/update-deep | 更新深度留资 | 是 |
| GET | /api/user/profile | 获取用户信息 | 是 |

### 活动模块
| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/activities | 活动列表 | 否 |
| GET | /api/activities/:id | 活动详情 | 否 |
| POST | /api/activities/:id/signup | 报名活动 | 是 |

### 报告模块
| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/reports | 报告列表 | 否 |
| GET | /api/reports/:id | 报告详情 | 否 |
| POST | /api/reports/:id/view | 查看/下载 | 是 |

### 资料模块
| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/materials | 资料列表 | 否 |
| GET | /api/materials/:id | 资料详情 | 否 |

### 约咨询
| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/consult | 提交预约 | 是 |

### 配置
| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/config/banners | 轮播图 | 否 |
| GET | /api/config/communities | 社群列表 | 否 |

## 鉴权说明
登录后获取 token，请求头加：`Authorization: Bearer <token>`
