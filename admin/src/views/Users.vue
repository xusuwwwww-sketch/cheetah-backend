<template>
  <div>
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="留资用户" name="users" />
      <el-tab-pane label="咨询预约" name="consults" />
    </el-tabs>

    <!-- 留资用户 -->
    <template v-if="activeTab === 'users'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0;">
        <div style="display:flex;gap:8px">
          <el-select v-model="levelFilter" placeholder="留资层级" clearable style="width:130px" @change="loadData(1)">
            <el-option label="全部层级" :value="-1" />
            <el-option label="Lv1 微信登录" :value="1" />
            <el-option label="Lv2 基础信息" :value="2" />
            <el-option label="Lv3 深度留资" :value="3" />
          </el-select>
        </div>
        <span style="font-size:13px;color:#666">共 {{ total }} 位用户</span>
      </div>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column label="用户" width="120">
          <template #default="{row}">
            <div style="display:flex;align-items:center;gap:8px">
              <el-avatar :size="32" :src="row.avatar">{{ (row.nickname||'?').slice(0,1) }}</el-avatar>
              <span style="font-size:13px">{{ row.nickname || '未设置' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company" label="公司" show-overflow-tooltip />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column label="留资层级" width="110">
          <template #default="{row}">
            <el-tag :type="row.level === 3 ? 'success' : row.level === 2 ? 'primary' : 'info'" size="small">
              {{ { 1: 'Lv1 登录', 2: 'Lv2 基础', 3: 'Lv3 深度' }[row.level] || 'Lv1' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login_at" label="最后登录" width="150">
          <template #default="{row}">{{ row.last_login_at?.replace('T',' ').substring(0,16) || '-' }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="150">
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
      let url = `/api/admin/users?page=${page}&size=20`
      if (levelFilter.value > 0) url += `&level=${levelFilter.value}`
      const res = await axios.get(url)
      list.value = res.data.data?.list || []
      total.value = res.data.data?.total || 0
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
