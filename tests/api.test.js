/**
 * 猎豹出海工具箱 - API 自动化测试
 * 运行: npm test
 * 依赖: jest + supertest
 */

const request = require('supertest')
const app = require('../src/app')

// ============================================================
// 基础配置
// ============================================================
const BASE = 'http://localhost:3000'
let authToken = '' // 登录后获取的 token

// ============================================================
// 1. 健康检查
// ============================================================
describe('【健康检查】', () => {
  test('GET /health 返回 ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

// ============================================================
// 2. 配置接口
// ============================================================
describe('【配置接口】', () => {
  test('GET /api/config/banners 返回轮播图列表', async () => {
    const res = await request(app).get('/api/config/banners')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  test('GET /api/config/communities 返回社群列表', async () => {
    const res = await request(app).get('/api/config/communities')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  test('GET /api/config/popup 返回弹窗（有或无）', async () => {
    const res = await request(app).get('/api/config/popup')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    // data 可以是 null 或对象
  })

  test('GET /api/config/tags 返回标签列表', async () => {
    const res = await request(app).get('/api/config/tags')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

// ============================================================
// 3. 活动接口
// ============================================================
describe('【活动接口】', () => {
  let activityId = null

  test('GET /api/activities 返回活动列表（分页）', async () => {
    const res = await request(app).get('/api/activities?page=1&size=10')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('list')
    expect(res.body.data).toHaveProperty('total')
    expect(Array.isArray(res.body.data.list)).toBe(true)
    if (res.body.data.list.length > 0) {
      activityId = res.body.data.list[0].id
    }
  })

  test('GET /api/activities?type_slug=live 按类型筛选', async () => {
    const res = await request(app).get('/api/activities?type_slug=live')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    // 所有返回的活动类型应该是 live
    res.body.data.list.forEach(a => {
      expect(a.type_slug).toBe('live')
    })
  })

  test('GET /api/activities/:id 返回活动详情', async () => {
    if (!activityId) return
    const res = await request(app).get(`/api/activities/${activityId}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('title')
    expect(res.body.data).toHaveProperty('type_slug')
  })

  test('GET /api/activities/9999 不存在的活动返回 404', async () => {
    const res = await request(app).get('/api/activities/9999')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(404)
  })

  test('POST /api/activities/:id/signup 未登录返回 401', async () => {
    if (!activityId) return
    const res = await request(app).post(`/api/activities/${activityId}/signup`)
    expect(res.status).toBe(401)
  })
})

// ============================================================
// 4. 报告接口
// ============================================================
describe('【报告接口】', () => {
  let reportId = null

  test('GET /api/reports 返回报告列表', async () => {
    const res = await request(app).get('/api/reports?page=1&size=10')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data.list)).toBe(true)
    if (res.body.data.list.length > 0) {
      reportId = res.body.data.list[0].id
    }
  })

  test('GET /api/reports?is_free=1 筛选免费报告', async () => {
    const res = await request(app).get('/api/reports?is_free=1')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/reports/:id 返回报告详情（含 tags）', async () => {
    if (!reportId) return
    const res = await request(app).get(`/api/reports/${reportId}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('title')
    expect(Array.isArray(res.body.data.tags)).toBe(true)
  })

  test('POST /api/reports/:id/view 未登录返回 401', async () => {
    if (!reportId) return
    const res = await request(app).post(`/api/reports/${reportId}/view`)
    expect(res.status).toBe(401)
  })
})

// ============================================================
// 5. 资料接口
// ============================================================
describe('【资料接口】', () => {
  test('GET /api/materials 返回资料列表', async () => {
    const res = await request(app).get('/api/materials?page=1&size=10')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data.list)).toBe(true)
  })

  test('GET /api/materials?content_type=case 返回案例列表', async () => {
    const res = await request(app).get('/api/materials?content_type=case')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    res.body.data.list.forEach(m => {
      expect(m.content_type).toBe('case')
    })
  })

  test('GET /api/materials/categories 返回分类列表', async () => {
    const res = await request(app).get('/api/materials/categories')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

// ============================================================
// 6. 用户登录（测试账号）
// ============================================================
describe('【用户登录】', () => {
  test('POST /api/user/login dev_code 返回 token', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ code: 'dev_test_code_001' })
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('token')
    expect(res.body.data).toHaveProperty('user')
    authToken = res.body.data.token
  })

  test('POST /api/user/login 缺少 code 返回 400', async () => {
    const res = await request(app).post('/api/user/login').send({})
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(400)
  })
})

// ============================================================
// 7. 需要登录的接口
// ============================================================
describe('【需登录接口】', () => {
  test('GET /api/user/profile 已登录返回用户信息', async () => {
    if (!authToken) return
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('openid')
    expect(res.body.data).toHaveProperty('level')
  })

  test('GET /api/user/profile 未登录返回 401', async () => {
    const res = await request(app).get('/api/user/profile')
    expect(res.status).toBe(401)
  })

  test('GET /api/user/favorites 已登录返回收藏列表', async () => {
    if (!authToken) return
    const res = await request(app)
      .get('/api/user/favorites')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  test('GET /api/user/signups 已登录返回报名列表', async () => {
    if (!authToken) return
    const res = await request(app)
      .get('/api/user/signups')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

// ============================================================
// 8. 咨询接口
// ============================================================
describe('【咨询接口】', () => {
  test('POST /api/consult 缺少必填项返回 400', async () => {
    const res = await request(app)
      .post('/api/consult')
      .send({ name: '张三' }) // 缺少 phone
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(400)
  })

  test('POST /api/consult 完整数据提交成功', async () => {
    const res = await request(app)
      .post('/api/consult')
      .send({
        name: '测试用户',
        phone: '13800138000',
        industry: '跨境电商',
        company: '测试公司',
        budget_info: '5-20万',
        core_need: '进入东南亚市场'
      })
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })
})

// ============================================================
// 9. 后台接口（Admin）
// ============================================================
describe('【后台统计接口】', () => {
  test('GET /api/admin/stats 返回统计数据', async () => {
    const res = await request(app).get('/api/admin/stats')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('users')
    expect(res.body.data).toHaveProperty('activities')
    expect(res.body.data).toHaveProperty('reports')
  })

  test('GET /api/admin/activities 返回活动列表', async () => {
    const res = await request(app).get('/api/admin/activities')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data.list)).toBe(true)
  })
})
