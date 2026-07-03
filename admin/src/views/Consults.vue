<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <el-radio-group v-model="filterStatus" @change="loadData(1)">
        <el-radio-button :value="-1">全部</el-radio-button>
        <el-radio-button :value="0">待处理</el-radio-button>
        <el-radio-button :value="1">已跟进</el-radio-button>
        <el-radio-button :value="2">已完成</el-radio-button>
      </el-radio-group>
      <span style="font-size:13px;color:#666">共 {{ total }} 条</span>
    </div>

    <el-table :data="list" stripe v-loading="loading" row-key="id">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column prop="name" label="姓名" width="90" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="company" label="公司" width="130" show-overflow-tooltip />
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
      <el-table-column label="操作" width="160">
        <template #default="{row}">
          <el-button size="small" @click="openDetail(row)">详情/跟进</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px" :total="total" :page-size="20" :current-page="currentPage" @current-change="onPageChange" layout="total, prev, pager, next" />

    <!-- 详情/跟进弹窗 -->
    <el-dialog v-model="dialogVisible" :z-index="2000" append-to-body title="咨询详情" width="580px">
      <el-descriptions :column="2" border size="small" v-if="current">
        <el-descriptions-item label="姓名">{{ current.name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ current.phone }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ current.company }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ current.industry }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ current.position || '-' }}</el-descriptions-item>
        <el-descriptions-item label="月推广预算">{{ current.budget_info }}</el-descriptions-item>
        <el-descriptions-item label="核心需求" :span="2">{{ current.core_need }}</el-descriptions-item>
        <el-descriptions-item label="当前痛点" :span="2">{{ current.pain_point || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ current.created_at?.replace('T',' ').substring(0,16) }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-top:20px">
        <div style="font-size:14px;font-weight:600;color:#1a1a2e;margin-bottom:10px">跟进记录</div>
        <el-input v-model="followNote" type="textarea" :rows="3" placeholder="填写跟进内容..." />
        <div style="display:flex;gap:8px;margin-top:10px">
          <el-button @click="updateStatus(1)" type="primary" plain>标记为已跟进</el-button>
          <el-button @click="updateStatus(2)" type="success" plain>标记为已完成</el-button>
          <el-button @click="updateStatus(3)" type="danger" plain>已取消</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="saveFollow">保存跟进</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const list = ref([]), total = ref(0), loading = ref(false)
const filterStatus = ref(-1), currentPage = ref(1)
const dialogVisible = ref(false), current = ref(null), followNote = ref('')

const statusLabel = (s) => ({ 0: '待处理', 1: '已跟进', 2: '已完成', 3: '已取消' }[s] ?? '待处理')
const statusType = (s) => ({ 0: 'warning', 1: 'primary', 2: 'success', 3: 'info' }[s] ?? 'warning')

const loadData = async (page = currentPage.value) => {
  loading.value = true
  try {
    let url = `/api/admin/consults?page=${page}&size=20`
    if (filterStatus.value >= 0) url += `&status=${filterStatus.value}`
    const res = await axios.get(url)
    list.value = res.data.data?.list || res.data.data || []
    total.value = res.data.data?.total || list.value.length
  } finally { loading.value = false }
}

const onPageChange = (page) => { currentPage.value = page; loadData(page) }

const openDetail = (row) => {
  current.value = { ...row }
  followNote.value = row.follow_up_note || ''
  dialogVisible.value = true
}

const updateStatus = async (status) => {
  try {
    await axios.patch(`/api/admin/consults/${current.value.id}`, { status, follow_up_note: followNote.value })
    current.value.status = status
    ElMessage.success('状态已更新')
    loadData()
  } catch (e) { ElMessage.error('操作失败') }
}

const saveFollow = async () => {
  try {
    await axios.patch(`/api/admin/consults/${current.value.id}`, { status: current.value.status, follow_up_note: followNote.value })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { ElMessage.error('保存失败') }
}

onMounted(() => loadData())
</script>
