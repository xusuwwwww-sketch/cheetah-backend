<template>
  <div>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="never" style="text-align:center;padding:20px 0">
          <div style="font-size:32px;font-weight:800;color:#ff6b35">{{ stat.value }}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:6px">{{ stat.label }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card shadow="never" header="最新咨询预约">
      <el-table :data="recentConsults" stripe>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="company" label="公司" />
        <el-table-column prop="topic" label="主题" />
        <el-table-column prop="created_at" label="时间" width="160">
          <template #default="{ row }">{{ row.created_at?.substring(0,16) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : row.status === 1 ? 'primary' : 'success'" size="small">
              {{ ['待处理','已跟进','已完成'][row.status] }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from '../utils/request'
const stats = ref([
  { label: '活动总数', value: 0 },
  { label: '报告总数', value: 0 },
  { label: '用户总数', value: 0 },
  { label: '咨询预约', value: 0 }
])
const recentConsults = ref([])
onMounted(async () => {
  await nextTick()
  try {
    const [statsRes, consults] = await Promise.all([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/consults?page=1&size=10')
    ])
    const d = statsRes.data.data || {}
    stats.value[0].value = d.activities || 0
    stats.value[1].value = d.reports || 0
    stats.value[2].value = d.users || 0
    stats.value[3].value = d.pending_consults || 0
    recentConsults.value = consults.data.data?.list || []
  } catch(e) { console.log(e) }
})
</script>
