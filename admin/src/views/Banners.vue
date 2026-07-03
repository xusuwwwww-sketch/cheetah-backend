<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="font-size:14px;color:#666">共 {{ total }} 条轮播图</span>
      <el-button type="primary" @click="openDialog()">+ 新增轮播图</el-button>
    </div>

    <el-table :data="list" stripe v-loading="loading">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column label="预览" width="140">
        <template #default="{row}">
          <div style="border-radius:6px;overflow:hidden;height:50px;">
            <img v-if="row.cover_url" :src="row.cover_url" style="width:100%;height:100%;object-fit:cover" />
            <div v-else :style="{background: row.gradient || '#ff6b35', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}">
              <span style="font-size:11px;color:#fff;font-weight:600">{{ row.tag || '渐变色' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="link_type" label="跳转" width="90">
        <template #default="{row}">
          <el-tag size="small" type="info">{{ linkTypeMap[row.link_type] || 'none' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="60" />
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
    <el-dialog v-model="dialogVisible" :z-index="2000" append-to-body :title="form.id ? '编辑轮播图' : '新增轮播图'" width="580px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="如：2026 出海增长峰会" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="form.tag" placeholder="如：热门活动、限时免费" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>

        <el-form-item label="封面图">
          <div style="display:flex;flex-direction:column;gap:8px;width:100%">
            <el-alert type="info" :closable="false" style="margin-bottom:4px;">
              <template #title>
                <span style="font-size:12px;">推荐尺寸：<strong>750 × 300px</strong>（宽:高 = 5:2），支持 JPG/PNG，建议小于 1MB</span>
              </template>
            </el-alert>
            <!-- 上传 -->
            <el-upload
              action="/api/upload"
              :show-file-list="false"
              accept="image/*"
              :on-success="onUploadSuccess"
              :on-error="onUploadError"
              :before-upload="beforeUpload"
            >
              <el-button :loading="uploading" size="small">
                {{ uploading ? '上传中...' : '点击上传图片' }}
              </el-button>
            </el-upload>
            <!-- 预览 -->
            <div v-if="form.cover_url" style="position:relative;display:inline-block">
              <img :src="form.cover_url" style="height:80px;border-radius:6px;object-fit:cover;max-width:300px" />
              <el-button size="small" type="danger" circle style="position:absolute;top:-8px;right:-8px;padding:4px" @click="form.cover_url = ''">✕</el-button>
            </div>
            <el-input v-model="form.cover_url" placeholder="或直接填入图片URL" size="small" />
          </div>
        </el-form-item>

                <el-form-item label="渐变色">
          <div style="display:flex;flex-direction:column;gap:8px;width:100%">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <div @click="form.gradient='linear-gradient(135deg, #ff6b35, #ff9a5c)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #ff6b35, #ff9a5c)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #ff6b35, #ff9a5c)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #ff6b35, #ff9a5c)"></div>
              <div @click="form.gradient='linear-gradient(135deg, #2563eb, #60a5fa)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #2563eb, #60a5fa)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #2563eb, #60a5fa)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #2563eb, #60a5fa)"></div>
              <div @click="form.gradient='linear-gradient(135deg, #059669, #34d399)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #059669, #34d399)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #059669, #34d399)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #059669, #34d399)"></div>
              <div @click="form.gradient='linear-gradient(135deg, #7c3aed, #a78bfa)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #7c3aed, #a78bfa)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #7c3aed, #a78bfa)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #7c3aed, #a78bfa)"></div>
              <div @click="form.gradient='linear-gradient(135deg, #d97706, #fbbf24)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #d97706, #fbbf24)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #d97706, #fbbf24)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #d97706, #fbbf24)"></div>
              <div @click="form.gradient='linear-gradient(135deg, #ef4444, #f87171)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #ef4444, #f87171)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #ef4444, #f87171)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #ef4444, #f87171)"></div>
              <div @click="form.gradient='linear-gradient(135deg, #1a1a2e, #3f3f5a)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #1a1a2e, #3f3f5a)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #1a1a2e, #3f3f5a)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #1a1a2e, #3f3f5a)"></div>
              <div @click="form.gradient='linear-gradient(135deg, #0f766e, #14b8a6)'" :style="{width:'32px',height:'24px',borderRadius:'4px',background:'linear-gradient(135deg, #0f766e, #14b8a6)',cursor:'pointer',border:form.gradient==='linear-gradient(135deg, #0f766e, #14b8a6)'?'2px solid #409eff':'2px solid transparent'}" title="linear-gradient(135deg, #0f766e, #14b8a6)"></div>
            </div>
            <el-input v-model="form.gradient" placeholder="或手动输入 linear-gradient(...)" size="small" />
            <div v-if="!form.cover_url && form.gradient" :style="{background: form.gradient, height:'28px', borderRadius:'6px'}"></div>
          </div>
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-select v-model="form.link_type" style="width:100%">
            <el-option v-for="(v,k) in linkTypeMap" :key="k" :label="v" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联ID" v-if="form.link_type === 'activity' || form.link_type === 'report' || form.link_type === 'material'">
          <el-input-number v-model="form.link_id" :min="1" />
        </el-form-item>
        <el-form-item label="外链URL" v-if="form.link_type === 'url'">
          <el-input v-model="form.link_url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
          <span style="font-size:12px;color:#999;margin-left:8px">数字越大越靠前</span>
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

const list = ref([]), total = ref(0), loading = ref(false), uploading = ref(false)
const dialogVisible = ref(false), currentPage = ref(1)
const form = ref({})

const linkTypeMap = {
  none: '无跳转',
  activity: '跳活动',
  report: '跳报告',
  material: '跳资料',
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
  form.value = { link_type: 'none', sort_order: 0, ...row }
  dialogVisible.value = true
}

const beforeUpload = (file) => {
  uploading.value = true
  return true
}
const onUploadSuccess = (res) => {
  uploading.value = false
  if (res.code === 0) {
    form.value.cover_url = res.data.url  // 直接用后端返回的完整URL
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}
const onUploadError = () => {
  uploading.value = false
  ElMessage.error('上传失败，请检查后端服务')
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
  await axios.patch(`/api/admin/banners/${row.id}/status`, { status: Number(row.status) ? 0 : 1 })
  ElMessage.success('操作成功'); loadData()
}

onMounted(() => loadData())
</script>
