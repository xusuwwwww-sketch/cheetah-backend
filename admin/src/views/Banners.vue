<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="font-size:14px;color:#666">共 {{ total }} 条轮播图</span>
      <el-button type="primary" @click="openDialog()">+ 新增轮播图</el-button>
    </div>

    <el-table :data="list" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="预览" width="120">
        <template #default="{row}">
          <div :style="{background: row.gradient || '#ff6b35', borderRadius: '6px', padding: '8px', textAlign:'center'}">
            <span style="font-size:11px;color:#fff;font-weight:600">{{ row.tag || '无标签' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="link_type" label="跳转类型" width="100">
        <template #default="{row}">
          <el-tag size="small" type="info">{{ linkTypeMap[row.link_type] || row.link_type || 'none' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="70" />
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '已发布' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{row}">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" :type="row.status ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px" :total="total" :page-size="20" :current-page="currentPage" @current-change="onPageChange" layout="total, prev, pager, next" />

    <!-- 新增/编辑 Dialog -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑轮播图' : '新增轮播图'" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="如：2026 出海增长峰会" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.tag" placeholder="如：热门活动、限时免费" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" placeholder="副标题文字" /></el-form-item>
        <el-form-item label="渐变色">
          <el-input v-model="form.gradient" placeholder="linear-gradient(135deg, #ff6b35, #ff9a5c)" />
          <div :style="{background: form.gradient, height:'32px', borderRadius:'6px', marginTop:'6px'}"></div>
        </el-form-item>
        <el-form-item label="跳转类型">
          <el-select v-model="form.link_type" style="width:100%">
            <el-option v-for="(v,k) in linkTypeMap" :key="k" :label="v" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联ID" v-if="form.link_type === 'activity' || form.link_type === 'report'">
          <el-input-number v-model="form.link_id" :min="1" placeholder="关联活动/报告ID" />
        </el-form-item>
        <el-form-item label="外链URL" v-if="form.link_type === 'url'">
          <el-input v-model="form.link_url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" placeholder="数字越大越靠前" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const list = ref([]), total = ref(0), loading = ref(false)
const dialogVisible = ref(false), currentPage = ref(1)
const form = ref({})

const linkTypeMap = {
  none: '无跳转',
  activity: '跳转活动',
  report: '跳转报告',
  material: '跳转资料',
  url: '外部链接'
}

const loadData = async (page = currentPage.value) => {
  loading.value = true
  try {
    const res = await axios.get(`/api/admin/banners?page=${page}&size=20`)
    list.value = res.data.data?.list || res.data.data || []
    total.value = res.data.data?.total || list.value.length
  } finally { loading.value = false }
}

const onPageChange = (page) => { currentPage.value = page; loadData(page) }

const openDialog = (row = {}) => {
  form.value = {
    link_type: 'none',
    sort_order: 0,
    ...row
  }
  dialogVisible.value = true
}

const save = async () => {
  if (!form.value.title) return ElMessage.warning('请填写标题')
  try {
    if (form.value.id) {
      await axios.put(`/api/admin/banners/${form.value.id}`, form.value)
    } else {
      await axios.post('/api/admin/banners', form.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { ElMessage.error('保存失败') }
}

const toggleStatus = async (row) => {
  await axios.patch(`/api/admin/banners/${row.id}/status`, { status: row.status ? 0 : 1 })
  ElMessage.success('操作成功')
  loadData()
}

onMounted(() => loadData())
</script>
