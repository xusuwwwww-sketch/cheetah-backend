<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <el-button type="primary" @click="openDialog()">+ 新增活动</el-button>
    </div>
    <el-table :data="list" stripe v-loading="loading">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column label="封面" width="100">
        <template #default="{row}">
          <div style="height:50px;border-radius:6px;overflow:hidden;">
            <img v-if="row.cover_url" :src="row.cover_url" style="width:100%;height:100%;object-fit:cover" />
            <div v-else :style="{background: row.gradient || '#ff6b35', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}">
              <span style="font-size:10px;color:#fff">渐变色</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="type_slug" label="类型" width="80">
        <template #default="{row}"><el-tag size="small">{{ typeMap[row.type_slug] || row.type_slug || '-' }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="start_time" label="开始时间" width="160">
        <template #default="{row}">{{ row.start_time?.replace('T',' ').substring(0,16) }}</template>
      </el-table-column>
      <el-table-column prop="location" label="地点" width="120" />
      <el-table-column label="报名/限额" width="90">
        <template #default="{row}">{{ row.signup_count ?? '-' }}/{{ row.quota || '不限' }}</template>
      </el-table-column>
      <el-table-column label="收藏" width="65">
        <template #default="{row}"><span style="color:#ef4444;font-weight:600">♥ {{ row.fav_count || 0 }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'info' : 'warning'" size="small">
            {{ statusMap[row.status] ?? '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="报名名单" width="120">
        <template #default="{row}">
          <el-button size="small" type="primary" plain @click="viewSignups(row)">
            查看 ({{ row.signup_count || 0 }})
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="210">
        <template #default="{row}">
          <div style="display:flex;gap:4px;flex-wrap:nowrap;align-items:center;">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">{{ row.status === 1 ? '下架' : '上架' }}</el-button>
            <el-button size="small" type="danger" plain @click="deleteRow(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top:16px"
      :total="total"
      :page-size="20"
      :current-page="currentPage"
      @current-change="onPageChange"
      layout="total, prev, pager, next"
    />

    <el-dialog v-model="dialogVisible" :z-index="2000" append-to-body :title="form.id ? '编辑活动' : '新增活动'" width="620px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type_slug">
            <el-option v-for="(v,k) in typeMap" :key="k" :label="v" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面图">
          <div style="display:flex;flex-direction:column;gap:8px;width:100%">
            <el-alert type="info" :closable="false" style="margin-bottom:4px;">
              <template #title>
                <span style="font-size:12px;">推荐尺寸：<strong>750 × 420px</strong>（宽:高 = 16:9），支持 JPG/PNG，建议小于 2MB</span>
              </template>
            </el-alert>
            <el-upload action="/api/upload" :show-file-list="false" accept="image/*" :on-success="onUploadSuccess" :on-error="onUploadError" :before-upload="() => { uploading = true; return true }">
              <el-button :loading="uploading" size="small">{{ uploading ? '上传中...' : '点击上传图片' }}</el-button>
            </el-upload>
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
        <el-form-item label="开始时间"><el-date-picker v-model="form.start_time" type="datetime" format="YYYY-MM-DD HH:mm" /></el-form-item>
        <el-form-item label="结束时间"><el-date-picker v-model="form.end_time" type="datetime" format="YYYY-MM-DD HH:mm" /></el-form-item>
        <el-form-item label="报名截止"><el-date-picker v-model="form.signup_deadline" type="datetime" format="YYYY-MM-DD HH:mm" /></el-form-item>
        <el-form-item label="地点"><el-input v-model="form.location" /></el-form-item>
        <el-form-item label="限额"><el-input-number v-model="form.quota" :min="0" placeholder="0=不限" /></el-form-item>
        <el-form-item label="主办方"><el-input v-model="form.organizer" /></el-form-item>
        <el-form-item label="详情"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
          <span style="font-size:12px;color:#999;margin-left:8px">数字越大越靠前显示</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 报名名单弹窗 -->
    <el-dialog v-model="signupDialog" :title="`报名名单 - ${currentActivity?.title || ''}`" width="700px" :z-index="2000" append-to-body>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:13px;color:#666">共 {{ signupList.length }} 人报名 / 限额 {{ currentActivity?.quota || '不限' }}</span>
        <el-button size="small" @click="exportSignups">导出名单</el-button>
      </div>
      <el-table :data="signupList" stripe v-loading="signupLoading" max-height="400">
        <el-table-column label="#" width="50" type="index" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="company" label="公司" show-overflow-tooltip />
        <el-table-column prop="industry" label="行业" width="110" />
        <el-table-column prop="signup_time" label="报名时间" width="160">
          <template #default="{row}">{{ row.signup_time?.replace('T',' ').substring(0,16) }}</template>
        </el-table-column>
      </el-table>
      <div v-if="!signupList.length && !signupLoading" style="text-align:center;color:#9ca3af;padding:40px">暂无报名记录</div>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
const list = ref([]), total = ref(0), loading = ref(false), dialogVisible = ref(false), uploading = ref(false)
const currentPage = ref(1)
const signupDialog = ref(false), signupList = ref([]), signupLoading = ref(false), currentActivity = ref(null)
const typeMap = { live: '直播', salon: '沙龙', closed: '闭门会', camp: '训练营' }
const statusMap = { 0: '下架', 1: '报名中', 2: '已结束' }
const form = ref({})

const loadData = async (page = currentPage.value) => {
  loading.value = true
  try {
    const res = await axios.get(`/api/admin/activities?page=${page}&size=20`)
    list.value = res.data.data?.list || []
    total.value = res.data.data?.total || 0
  } finally { loading.value = false }
}

const onPageChange = (page) => {
  currentPage.value = page
  loadData(page)
}

const openDialog = (row = {}) => {
  form.value = { ...row, type_slug: row.type_slug || 'live', quota: row.quota || 0, sort_order: row.sort_order || 0 }
  dialogVisible.value = true
}
const save = async () => {
  try {
    if (form.value.id) await axios.put(`/api/admin/activities/${form.value.id}`, form.value)
    else await axios.post('/api/admin/activities', form.value)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } catch(e) { ElMessage.error('保存失败') }
}
const toggleStatus = async (row) => {
  const newStatus = Number(row.status) === 1 ? 0 : 1
  await axios.patch(`/api/admin/activities/${row.id}/status`, { status: newStatus })
  ElMessage.success('操作成功'); loadData()
}
const deleteRow = async (row) => {
  try {
    await ElMessageBox.confirm('确定永久删除该活动吗？', '确认删除', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' })
    await axios.delete(`/api/admin/activities/${row.id}`)
    ElMessage.success('已删除'); loadData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}
const viewSignups = async (row) => {
  currentActivity.value = row
  signupDialog.value = true
  signupLoading.value = true
  signupList.value = []
  try {
    const res = await axios.get(`/api/admin/activities/${row.id}/signups`)
    signupList.value = res.data.data || []
  } catch(e) { ElMessage.error('获取失败') } finally { signupLoading.value = false }
}
const exportSignups = () => {
  if (!signupList.value.length) return ElMessage.warning('暂无报名数据')
  const headers = ['姓名', '手机号', '公司', '行业', '报名时间']
  const rows = signupList.value.map(r => [r.name, r.phone, r.company, r.industry, r.signup_time?.substring(0,16)])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `报名名单_${currentActivity.value?.title || ''}.csv`; a.click()
  URL.revokeObjectURL(url)
}
const onUploadSuccess = (res) => {
  uploading.value = false
  if (res.code === 0) { form.value.cover_url = res.data.url; ElMessage.success('上传成功') }
  else ElMessage.error(res.msg || '上传失败')
}
const onUploadError = () => { uploading.value = false; ElMessage.error('上传失败') }
onMounted(() => loadData())
</script>
