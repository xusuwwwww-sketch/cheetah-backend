<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="display:flex;gap:8px;align-items:center;">
        <el-select v-model="sourceFilter" style="width:130px" @change="loadData(1)">
          <el-option label="全部来源" value="" />
          <el-option label="小程序登录" value="login" />
          <el-option label="约咨询" value="consult" />
          <el-option label="下载留资" value="download_lead" />
        </el-select>
        <el-select v-model="statusFilter" style="width:120px" @change="loadData(1)">
          <el-option label="全部状态" :value="-1" />
          <el-option label="待处理" :value="0" />
          <el-option label="已跟进" :value="1" />
          <el-option label="已完成" :value="2" />
        </el-select>
      </div>
      <span style="font-size:13px;color:#666">共 {{ total }} 条留资</span>
    </div>

    <el-table :data="list" stripe v-loading="loading">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column prop="name" label="姓名" width="90" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="company" label="公司" show-overflow-tooltip />
      <el-table-column prop="industry" label="行业" width="100" />
      <el-table-column prop="budget_info" label="预算" width="110" show-overflow-tooltip />
      <el-table-column prop="core_need" label="核心需求" show-overflow-tooltip />
      <el-table-column label="来源" width="100">
        <template #default="{row}">
          <el-tag :type="sourceTagType(row.source)" size="small">{{ row.source || '未知' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="时间" width="150">
        <template #default="{row}">{{ row.created_at?.replace('T',' ').substring(0,16) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" v-if="sourceFilter !== 'login'">
        <template #default="{row}">
          <el-tag :type="statusType(row.status)" size="small" v-if="row.status !== undefined">{{ statusLabel(row.status) }}</el-tag>
          <span v-else style="color:#9ca3af;font-size:12px">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{row}">
          <el-button size="small" @click="openDetail(row)" v-if="row._type === 'consult'">跟进</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px" :total="total" :page-size="20" :current-page="currentPage" @current-change="onPageChange" layout="total, prev, pager, next" />

    <!-- 跟进弹窗 -->
    <el-dialog v-model="consultDialog" title="咨询详情/跟进" width="560px" :z-index="2000" append-to-body>
      <el-descriptions :column="2" border size="small" v-if="currentConsult">
        <el-descriptions-item label="姓名">{{ currentConsult.name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentConsult.phone }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ currentConsult.company }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ currentConsult.industry }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ currentConsult.position || '-' }}</el-descriptions-item>
        <el-descriptions-item label="月推广预算">{{ currentConsult.budget_info }}</el-descriptions-item>
        <el-descriptions-item label="核心需求" :span="2">{{ currentConsult.core_need }}</el-descriptions-item>
        <el-descriptions-item label="当前痛点" :span="2">{{ currentConsult.pain_point || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top:16px">
        <div style="font-size:14px;font-weight:600;margin-bottom:8px">跟进记录</div>
        <el-input v-model="followNote" type="textarea" :rows="3" placeholder="填写跟进内容..." />
        <div style="display:flex;gap:8px;margin-top:10px">
          <el-button @click="updateConsult(1)" type="primary" plain>已跟进</el-button>
          <el-button @click="updateConsult(2)" type="success" plain>已完成</el-button>
          <el-button @click="updateConsult(3)" type="danger" plain>已取消</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="consultDialog = false">关闭</el-button>
        <el-button type="primary" @click="saveConsult">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../utils/request'
import { ElMessage } from 'element-plus'

const list = ref([]), total = ref(0), loading = ref(false)
const currentPage = ref(1)
const sourceFilter = ref(''), statusFilter = ref(-1)
const consultDialog = ref(false), currentConsult = ref(null), followNote = ref('')

const statusLabel = (s) => ({ 0: '待处理', 1: '已跟进', 2: '已完成', 3: '已取消' }[s] ?? '-')
const statusType = (s) => ({ 0: 'warning', 1: 'primary', 2: 'success', 3: 'info' }[s] ?? 'info')
const sourceTagType = (s) => ({ '小程序登录': 'primary', '约咨询': 'warning', '下载留资': 'success' }[s] ?? 'info')

const loadData = async (page = currentPage.value) => {
  loading.value = true
  try {
    // 合并小程序登录用户 + 咨询提交用户，统一显示
    const [r1, r2] = await Promise.all([
      axios.get('/api/admin/users?page=1&size=200'),
      axios.get('/api/admin/consults?page=1&size=200')
    ])

    const loginUsers = (r1.data.data?.list || []).map(u => ({
      _type: 'user',
      name: u.name || u.nickname || '-',
      phone: u.phone || '-',
      company: u.company || '-',
      industry: u.industry || '-',
      budget_info: u.budget_min > 0 ? `${u.budget_min/10000}万+` : '-',
      core_need: u.core_need || '-',
      source: '小程序登录',
      status: undefined,
      created_at: u.created_at,
      _raw: u
    }))

    const consultUsers = (r2.data.data?.list || r2.data.data || []).map(c => ({
      _type: 'consult',
      _id: c.id,
      name: c.name || '-',
      phone: c.phone || '-',
      company: c.company || '-',
      industry: c.industry || '-',
      budget_info: c.budget_info || '-',
      core_need: c.core_need || '-',
      pain_point: c.pain_point,
      position: c.position,
      source: c.topic === '下载资料留资' ? '下载留资' : '约咨询',
      status: c.status,
      follow_up_note: c.follow_up_note,
      created_at: c.created_at,
      _raw: c
    }))

    // 合并，同手机号优先保留咨询记录（数据更完整），登录用户作为补充
    const phoneSet = new Set(consultUsers.filter(c => c.phone !== '-').map(c => c.phone))
    const filteredLogin = loginUsers.filter(u => !phoneSet.has(u.phone))
    let merged = [...consultUsers, ...filteredLogin].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // 来源筛选
    if (sourceFilter.value === 'login') merged = merged.filter(r => r.source === '小程序登录')
    else if (sourceFilter.value === 'consult') merged = merged.filter(r => r.source === '约咨询')
    else if (sourceFilter.value === 'download_lead') merged = merged.filter(r => r.source === '下载留资')

    // 状态筛选（只针对 consult 类型）
    if (statusFilter.value >= 0) merged = merged.filter(r => r._type === 'consult' && r.status === statusFilter.value)

    total.value = merged.length
    const start = (page - 1) * 20
    list.value = merged.slice(start, start + 20)
  } finally { loading.value = false }
}

const onPageChange = (page) => { currentPage.value = page; loadData(page) }

const openDetail = (row) => {
  currentConsult.value = { ...row._raw, ...row }
  followNote.value = row.follow_up_note || ''
  consultDialog.value = true
}
const updateConsult = async (status) => {
  await axios.patch(`/api/admin/consults/${currentConsult.value._id}`, { status, follow_up_note: followNote.value })
  currentConsult.value.status = status
  ElMessage.success('状态已更新'); loadData()
}
const saveConsult = async () => {
  await axios.patch(`/api/admin/consults/${currentConsult.value._id}`, { status: currentConsult.value.status, follow_up_note: followNote.value })
  ElMessage.success('保存成功'); consultDialog.value = false; loadData()
}

onMounted(() => loadData())
</script>
