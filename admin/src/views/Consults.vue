<template>
  <div>
    <el-table :data="list" stripe v-loading="loading">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column prop="title" label="标题" v-if="hasField('title')" />
      <el-table-column prop="name" label="姓名" width="100" v-if="hasField('name')" />
      <el-table-column prop="phone" label="电话" width="130" v-if="hasField('phone')" />
      <el-table-column prop="company" label="公司" v-if="hasField('company')" />
      <el-table-column prop="email" label="邮箱" v-if="hasField('email')" />
      <el-table-column prop="industry" label="行业" width="100" v-if="hasField('industry')" />
      <el-table-column prop="source" label="来源" width="120" v-if="hasField('source')" />
      <el-table-column prop="author" label="作者" width="120" v-if="hasField('author')" />
      <el-table-column prop="topic" label="主题" v-if="hasField('topic')" />
      <el-table-column prop="created_at" label="时间" width="160">
        <template #default="{row}">{{ row.created_at?.substring(0,16) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80" v-if="hasField('status')">
        <template #default="{row}"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '已发布' : '下架' }}</el-tag></template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px" :total="total" :page-size="20" @current-change="loadData" layout="total, prev, pager, next" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const list = ref([]), total = ref(0), loading = ref(false)
const loadData = async (page = 1) => {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/consults?page=' + page + '&size=20')
    list.value = res.data.data?.list || res.data.data || []
    total.value = res.data.data?.total || list.value.length
  } finally { loading.value = false }
}
const hasField = (field) => list.value.length === 0 || field in (list.value[0] || {})
onMounted(() => loadData())
</script>
