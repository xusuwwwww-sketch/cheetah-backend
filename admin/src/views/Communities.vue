<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="font-size:13px;color:#666">共 {{ list.length }} 个社群</span>
      <el-button type="primary" @click="openDialog()">+ 新增社群</el-button>
    </div>

    <el-table :data="list" stripe v-loading="loading">
      <el-table-column label="序号" width="60" type="index" />
      <el-table-column label="社群" min-width="200">
        <template #default="{row}">
          <div style="display:flex;align-items:center;gap:10px">
            <div :style="{width:'36px',height:'36px',borderRadius:'10px',background:row.icon_color||'#fff0ea',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}">
              👥
            </div>
            <div>
              <div style="font-size:14px;font-weight:600;color:#1a1a2e">{{ row.title }}</div>
              <div style="font-size:12px;color:#9ca3af" v-if="row.description">{{ row.description }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="二维码" width="100">
        <template #default="{row}">
          <img v-if="row.qr_url" :src="row.qr_url" style="width:60px;height:60px;border-radius:6px;object-fit:cover" />
          <el-tag v-else size="small" type="info">未配置</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="70" />
      <el-table-column label="操作" width="160">
        <template #default="{row}">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteRow(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :z-index="2000" append-to-body :title="form.id ? '编辑社群' : '新增社群'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="社群名称"><el-input v-model="form.title" placeholder="如：出海交流群" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" placeholder="如：1280人已加入" /></el-form-item>
        <el-form-item label="二维码图片">
          <div style="display:flex;flex-direction:column;gap:8px;width:100%">
            <el-upload action="/api/upload" :show-file-list="false" accept="image/*" :on-success="onUpload" :before-upload="() => { uploading = true; return true }">
              <el-button :loading="uploading" size="small">{{ uploading ? '上传中...' : '上传群二维码' }}</el-button>
            </el-upload>
            <div v-if="form.qr_url" style="position:relative;display:inline-block">
              <img :src="form.qr_url" style="width:120px;height:120px;border-radius:8px;object-fit:cover" />
              <el-button size="small" type="danger" circle style="position:absolute;top:-8px;right:-8px;padding:4px" @click="form.qr_url = ''">✕</el-button>
            </div>
            <el-input v-model="form.qr_url" placeholder="或填入图片URL" size="small" />
          </div>
        </el-form-item>
        <el-form-item label="图标颜色">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <div v-for="c in colorOptions" :key="c"
              :style="{width:'32px',height:'32px',borderRadius:'8px',background:c,cursor:'pointer',border: form.icon_color===c ? '2px solid #ff6b35' : '2px solid transparent'}"
              @click="form.icon_color = c"></div>
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" />
          <span style="font-size:12px;color:#999;margin-left:8px">数字越小越靠前</span>
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
import axios from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([]), loading = ref(false), dialogVisible = ref(false), uploading = ref(false)
const form = ref({})
const colorOptions = ['#fff0ea', '#ebf5ff', '#ecfdf5', '#f5f3ff', '#fffbeb', '#fef2f2', '#f0fdf4', '#eff6ff']

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/communities')
    list.value = res.data.data || []
  } finally { loading.value = false }
}

const openDialog = (row = {}) => {
  form.value = { icon_color: '#fff0ea', sort_order: 0, ...row }
  dialogVisible.value = true
}

const onUpload = (res) => {
  uploading.value = false
  if (res.code === 0) { form.value.qr_url = res.data.url; ElMessage.success('上传成功') }
  else ElMessage.error(res.msg || '上传失败')
}

const save = async () => {
  if (!form.value.title) return ElMessage.warning('请填写社群名称')
  try {
    if (form.value.id) await axios.put(`/api/admin/communities/${form.value.id}`, form.value)
    else await axios.post('/api/admin/communities', form.value)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } catch (e) { ElMessage.error('保存失败') }
}

const deleteRow = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该社群吗？', '确认', { type: 'warning' })
    await axios.delete(`/api/admin/communities/${row.id}`)
    ElMessage.success('已删除'); loadData()
  } catch(e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}
const toggleStatus = async (row) => {
  await axios.patch(`/api/admin/communities/${row.id}/status`, { status: Number(row.status) ? 0 : 1 })
  ElMessage.success('操作成功'); loadData()
}

onMounted(() => loadData())
</script>
