<template>
  <div>
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="留资用户" name="users" />
      <el-tab-pane label="咨询预约" name="consults" />
    </el-tabs>

    <!-- 留资用户 -->
    <template v-if="activeTab === 'users'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0;">
        <span style="font-size:13px;color:#666">共 {{ total }} 条留资（含小程序登录 + 咨询提交，已去重）</span>
      </div>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company" label="公司" show-overflow-tooltip />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column prop="budget_info" label="预算" width="110" show-overflow-tooltip />
        <el-table-column label="来源" width="110">
          <template #default="{row}">
            <el-tag :type="row.source === '小程序登录' ? 'primary' : 'warning'" size="small">{{ row.source }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="150">
          <template #default="{row}">{{ row.created_at?.replace('T',' ').substring(0,16) }}</template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 咨询预约 -->
    <template v-if="activeTab === 'consults'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0;">
        <el-radio-group v-model="statusFilter" @change="loadData(1)">
          <el-radio-button :value="-1">全部</el-radio-button>
          <el-radio-button :value="0">待处理</el-radio-button>
          <el-radio-button :value="1">已跟进</el-radio-button>
          <el-radio-button :value="2">已完成</el-radio-button>
        </el-radio-group>
        <span style="font-size:13px;color:#666">共 {{ total }} 条</span>
      </div>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company" label="公司" show-overflow-tooltip />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column prop="budget_info" label="预算" width="110" />
        <el-table-column prop="core_need" label="核心需求" show-overflow-tooltip />
        <el-table-column prop="created_at" label="提交时间" width="150">
          <template #default="{row}">{{ row.created_at?.replace('T',' ').substring(0,16) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{row}">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{row}">
            <el-button size="small" @click="openConsult(row)">跟进</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <el-pagination style="margin-top:16px" :total="total" :page-size="20" :current-page="currentPage" @current-change="onPageChange" layout="total, prev, pager, next" />

    <!-- 咨询跟进弹窗 -->
    <el-dialog v-model="consultDialog" title="咨询详情/跟进" width="560px">
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
import axios from 'axios'
import { ElMessage } from 'element-plus'

const list = ref([]), total = ref(0), loading = ref(false)
const activeTab = ref('users'), currentPage = ref(1)
const levelFilter = ref(-1), statusFilter = ref(-1)
const consultDialog = ref(false), currentConsult = ref(null), followNote = ref('')

const statusLabel = (s) => ({ 0: '待处理', 1: '已跟进', 2: '已完成', 3: '已取消' }[s] ?? '待处理')
const statusType = (s) => ({ 0: 'warning', 1: 'primary', 2: 'success', 3: 'info' }[s] ?? 'warning')

const loadData = async (page = currentPage.value) => {
  loading.value = true
  try {
    if (activeTab.value === 'users') {
      // 合并小程序登录用户 + 咨询提交用户
      const [r1, r2] = await Promise.all([
        axios.get(`/api/admin/users?page=1&size=200`),
        axios.get(`/api/admin/consults?page=1&size=200`)
      ])
      // 小程序登录用户
      const loginUsers = (r1.data.data?.list || []).map(u => ({
        _id: `u_${u.id}`,
        name: u.name || u.nickname || '-',
        phone: u.phone || '-',
        company: u.company || '-',
        industry: u.industry || '-',
        source: '小程序登录',
        level_tag: u.level,
        created_at: u.created_at,
        _raw: u
      }))
      // 咨询提交用户
      const consultUsers = (r2.data.data?.list || r2.data.data || []).map(c => ({
        _id: `c_${c.id}`,
        name: c.name || '-',
        phone: c.phone || '-',
        company: c.company || '-',
        industry: c.industry || '-',
        source: '约咨询表单',
        level_tag: null,
        budget_info: c.budget_info,
        core_need: c.core_need,
        created_at: c.created_at,
        _raw: c
      }))
      // 合并去重（同手机号优先保留小程序登录）
      const phoneSet = new Set(loginUsers.filter(u => u.phone !== '-').map(u => u.phone))
      const dedupedConsult = consultUsers.filter(c => !phoneSet.has(c.phone))
      const merged = [...loginUsers, ...dedupedConsult].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      list.value = merged
      total.value = merged.length
    } else {
      let url = `/api/admin/consults?page=${page}&size=20`
      if (statusFilter.value >= 0) url += `&status=${statusFilter.value}`
      const res = await axios.get(url)
      list.value = res.data.data?.list || res.data.data || []
      total.value = res.data.data?.total || list.value.length
    }
  } finally { loading.value = false }
}

const onTabChange = () => { currentPage.value = 1; loadData(1) }
const onPageChange = (page) => { currentPage.value = page; loadData(page) }

const openConsult = (row) => {
  currentConsult.value = { ...row }
  followNote.value = row.follow_up_note || ''
  consultDialog.value = true
}
const updateConsult = async (status) => {
  await axios.patch(`/api/admin/consults/${currentConsult.value.id}`, { status, follow_up_note: followNote.value })
  currentConsult.value.status = status
  ElMessage.success('状态已更新'); loadData()
}
const saveConsult = async () => {
  await axios.patch(`/api/admin/consults/${currentConsult.value.id}`, { status: currentConsult.value.status, follow_up_note: followNote.value })
  ElMessage.success('保存成功'); consultDialog.value = false; loadData()
}

onMounted(() => loadData())
</script>
