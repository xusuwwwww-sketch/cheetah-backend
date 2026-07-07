<template>
  <div>
    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" @tab-change="onTabChange" style="margin-bottom: 0;">
      <el-tab-pane label="查报告" name="report" />
      <el-tab-pane label="案例库" name="case" />
      <el-tab-pane label="资料库" name="material" />
    </el-tabs>

    <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0;">
      <span style="font-size:14px;color:#666">共 {{ total }} 条{{ tabLabel }}</span>
      <el-button type="primary" @click="openDialog()">+ 新增{{ tabLabel }}</el-button>
    </div>

    <el-table :data="list" stripe v-loading="loading">
      <el-table-column label="序号" width="60" type="index" :index="(i) => (currentPage - 1) * 20 + i + 1" />
      <el-table-column label="封面" width="100">
        <template #default="{row}">
          <div style="height:50px;border-radius:6px;overflow:hidden;">
            <img v-if="row.cover_url" :src="row.cover_url" style="width:100%;height:100%;object-fit:cover" />
            <div v-else :style="{background: row.gradient || '#7c3aed', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}">
              <span style="font-size:10px;color:#fff">渐变色</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="file_size" label="大小" width="90" v-if="activeTab !== 'case'" />
      <el-table-column label="👁 阅读" width="75">
        <template #default="{row}"><span style="color:#6b7280;font-weight:600">{{ row.view_count || 0 }}</span></template>
      </el-table-column>
      <el-table-column label="⬇ 下载" width="75" v-if="activeTab !== 'case'">
        <template #default="{row}"><span style="color:#2563eb;font-weight:600">{{ row.download_count || 0 }}</span></template>
      </el-table-column>
      <el-table-column label="♥ 收藏" width="75">
        <template #default="{row}"><span style="color:#ef4444;font-weight:600">{{ row.fav_count || 0 }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="Number(row.status) ? 'success' : 'info'" size="small">{{ Number(row.status) ? '已发布' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="210">
        <template #default="{row}">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" :type="Number(row.status) ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ Number(row.status) ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteRow(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top:16px" :total="total" :page-size="20" :current-page="currentPage" @current-change="onPageChange" layout="total, prev, pager, next" />

    <!-- 新增/编辑 Dialog -->
    <el-dialog v-model="dialogVisible" :title="form.id ? `编辑${tabLabel}` : `新增${tabLabel}`" width="600px" :z-index="2000" append-to-body>
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="作者"><el-input v-model="form.author" placeholder="如：猎豹研究院" /></el-form-item>
        <el-form-item label="封面图">
          <div style="display:flex;flex-direction:column;gap:8px;width:100%">
            <el-alert type="info" :closable="false" style="margin-bottom:4px;">
              <template #title>
                <span style="font-size:12px;">推荐尺寸：<strong>750 × 420px</strong>（宽:高 = 16:9），支持 JPG/PNG，建议小于 2MB</span>
              </template>
            </el-alert>
            <el-upload action="/api/upload" :show-file-list="false" accept="image/*" :on-success="onUploadCover" :before-upload="() => { uploading = true; return true }">
              <el-button :loading="uploading" size="small">{{ uploading ? '上传中...' : '点击上传封面图' }}</el-button>
            </el-upload>
            <div v-if="form.cover_url" style="position:relative;display:inline-block">
              <img :src="form.cover_url" style="height:70px;border-radius:6px;object-fit:cover;max-width:280px" />
              <el-button size="small" type="danger" circle style="position:absolute;top:-8px;right:-8px;padding:4px" @click="form.cover_url = ''">✕</el-button>
            </div>
            <el-input v-model="form.cover_url" placeholder="或填入图片URL" size="small" />
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
        <el-form-item label="简介"><el-input v-model="form.summary" type="textarea" :rows="2" /></el-form-item>

        <!-- 报告/资料库：文件上传 -->
        <!-- 报告专属字段 -->
        <template v-if="activeTab === 'report'">
          <el-form-item label="来源"><el-input v-model="form.source" placeholder="如：猎豹研究院、eMarketer" /></el-form-item>
          <el-form-item label="年份"><el-input v-model="form.year" placeholder="如：2026" style="width:120px" /></el-form-item>
          <el-form-item label="是否免费">
            <el-switch v-model="form.is_free" :active-value="1" :inactive-value="0" active-text="免费" inactive-text="付费" />
          </el-form-item>
          <el-form-item label="价格" v-if="!form.is_free">
            <el-input-number v-model="form.price" :min="0" :precision="2" />
          </el-form-item>
        </template>

        <!-- 报告/资料库：文件上传 -->
        <template v-if="activeTab !== 'case'">
          <el-form-item label="PDF文件">
            <div style="display:flex;flex-direction:column;gap:8px;width:100%">
              <el-upload action="/api/upload" :show-file-list="false" accept=".pdf,.doc,.docx,.ppt,.pptx" :on-success="onUploadFile" :before-upload="() => { uploadingFile = true; return true }">
                <el-button :loading="uploadingFile" size="small">{{ uploadingFile ? '上传中...' : '点击上传文件' }}</el-button>
              </el-upload>
              <el-input v-model="form.file_url" placeholder="或填入文件URL" size="small" />
              <el-input v-model="form.file_size" placeholder="文件大小，如：PDF · 3.2MB" size="small" />
            </div>
          </el-form-item>
        </template>

        <!-- 案例库：图文内容 -->
        <template v-if="activeTab === 'case'">
          <el-form-item label="案例正文">
            <div style="width:100%">
              <div id="quill-toolbar" style="border:1px solid #e5e7eb;border-radius:6px 6px 0 0;overflow:hidden;"></div>
              <div id="quill-editor" style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;height:280px;overflow-y:auto;"></div>
            </div>
          </el-form-item>
        </template>

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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const list = ref([]), total = ref(0), loading = ref(false)
const dialogVisible = ref(false), currentPage = ref(1)
const activeTab = ref('report')
const form = ref({})
const uploading = ref(false), uploadingFile = ref(false)

// Quill 富文本
let quillInstance = null
const initQuill = () => {
  nextTick(() => {
    const el = document.getElementById('quill-editor')
    if (!el || quillInstance) return
    quillInstance = new Quill(el, {
      theme: 'snow',
      placeholder: '请输入案例内容，支持插入图片...',
      modules: {
        toolbar: {
          container: [
            ['bold', 'italic', 'underline'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        },
        clipboard: { matchVisual: false }
      }
    })
    // 图片上传处理
    quillInstance.getModule('toolbar').addHandler('image', () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.click()
      input.onchange = async () => {
        const file = input.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          if (res.data.code === 0) {
            const range = quillInstance.getSelection()
            quillInstance.insertEmbed(range ? range.index : 0, 'image', res.data.data.url)
          } else { ElMessage.error('图片上传失败') }
        } catch (e) { ElMessage.error('上传异常') }
      }
    })
    // 同步内容到 form.content
    quillInstance.on('text-change', () => {
      let html = quillInstance.root.innerHTML
      // 先清除所有内联尺寸
      html = html.replace(/<img([^>]*)\sstyle="[^"]*"([^>]*)>/gi, '<img$1$2>')
      html = html.replace(/<img([^>]*)\swidth="[^"]*"([^>]*)>/gi, '<img$1$2>')
      html = html.replace(/<img([^>]*)\sheight="[^"]*"([^>]*)>/gi, '<img$1$2>')
      // 加内联样式（微信小程序rich-text不识别外部CSS，必须内联）
      html = html.replace(/<img([^>]*)>/gi, '<img$1 style="max-width:100%;height:auto;display:block;">')
      form.value.content = html
    })
  })
}

const tabLabel = computed(() => ({ report: '报告', case: '案例', material: '资料' }[activeTab.value] || '内容'))

const loadData = async (page = currentPage.value) => {
  loading.value = true
  try {
    let res
    if (activeTab.value === 'report') {
      res = await axios.get(`/api/admin/reports?page=${page}&size=20`)
    } else {
      res = await axios.get(`/api/materials?content_type=${activeTab.value}&page=${page}&size=20`)
    }
    list.value = res.data.data?.list || []
    total.value = res.data.data?.total || 0
  } finally { loading.value = false }
}

const onTabChange = () => { currentPage.value = 1; loadData(1) }
const onPageChange = (page) => { currentPage.value = page; loadData(page) }

const openDialog = (row = {}) => {
  form.value = { content_type: activeTab.value, sort_order: 0, is_free: 1, status: 1, ...row }
  dialogVisible.value = true
  if (activeTab.value === 'case') {
    // 先清除旧实例的 DOM，再重新初始化
    if (quillInstance) {
      quillInstance.off('text-change')
      quillInstance = null
      // 清空容器 DOM
      nextTick(() => {
        const el = document.getElementById('quill-editor')
        if (el) el.innerHTML = ''
      })
    }
    nextTick(() => {
      initQuill()
      nextTick(() => {
        if (quillInstance && row.content) {
          quillInstance.root.innerHTML = row.content
        }
      })
    })
  }
}

const onUploadCover = (res) => {
  uploading.value = false
  if (res.code === 0) { form.value.cover_url = res.data.url; ElMessage.success('封面上传成功') }
  else ElMessage.error(res.msg || '上传失败')
}
const onUploadFile = (res) => {
  uploadingFile.value = false
  if (res.code === 0) { form.value.file_url = res.data.url; ElMessage.success('文件上传成功') }
  else ElMessage.error(res.msg || '上传失败')
}

const save = async () => {
  if (!form.value.title) return ElMessage.warning('请填写标题')
  try {
    const isReport = activeTab.value === 'report'
    const apiBase = isReport ? '/api/admin/reports' : '/api/admin/materials'
    const payload = isReport ? form.value : { ...form.value, content_type: activeTab.value }
    if (form.value.id) {
      await axios.put(`${apiBase}/${form.value.id}`, payload)
    } else {
      await axios.post(apiBase, payload)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) { ElMessage.error('保存失败') }
}

const toggleStatus = async (row) => {
  const apiBase = activeTab.value === 'report' ? '/api/admin/reports' : '/api/admin/materials'
  await axios.patch(`${apiBase}/${row.id}/status`, { status: Number(row.status) ? 0 : 1 })
  ElMessage.success('操作成功'); loadData()
}
const deleteRow = async (row) => {
  try {
    await ElMessageBox.confirm('确定永久删除该内容吗？删除后不可恢复！', '确认删除', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger' })
    const apiBase = activeTab.value === 'report' ? '/api/admin/reports' : '/api/admin/materials'
    await axios.delete(`${apiBase}/${row.id}`)
    ElMessage.success('已删除'); loadData()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

onMounted(() => loadData())
onBeforeUnmount(() => { if (quillInstance) { quillInstance = null } })
</script>
