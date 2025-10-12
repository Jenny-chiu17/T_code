<template>
  <div 
    class="modification-item"
    :class="{ 
      accepted: modification.status === 'accepted',
      rejected: modification.status === 'rejected'
    }"
  >
    <div class="mod-header">
      <div>
        <div class="mod-number">修改建議 {{ modification.number }}</div>
        <div class="mod-location">📌 {{ modification.article }}</div>
      </div>
    </div>

    <div class="text-label">📝 原始條文</div>
    <div class="text-box original">{{ modification.original }}</div>

    <div style="text-align: center; margin: 12px 0; color: #3b82f6; font-size: 20px;">↓</div>

    <div class="text-label">✏️ 建議修改為</div>
    <div class="text-box suggested">
      <template v-if="!isEditing">
        {{ displayText }}
      </template>
      <template v-else>
        <textarea v-model="editedText" class="edit-textarea"></textarea>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button class="btn btn-success" @click="saveEdit">💾 儲存並接受</button>
          <button class="btn btn-secondary" @click="cancelEdit">取消</button>
        </div>
      </template>
    </div>

    <div class="reason-box">
      <strong>💡 修改理由：</strong> {{ modification.reason }}
    </div>

    <div v-if="modification.status === 'pending'" class="mod-actions">
      <button class="btn btn-success" @click="accept">✅ 接受</button>
      <button class="btn btn-warning" @click="startEdit">✏️ 編輯後接受</button>
      <button class="btn btn-danger" @click="reject">❌ 拒絕</button>
    </div>

    <div v-else class="mod-actions">
      <span 
        class="status-badge"
        :class="modification.status === 'accepted' ? 'badge-accepted' : 'badge-rejected'"
      >
        {{ modification.status === 'accepted' ? '✅ 已接受' : '❌ 已拒絕' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modification: Object
})

const isEditing = ref(false)
const editedText = ref('')
const displayText = computed(() => 
  props.modification.customText || props.modification.suggested
)

const startEdit = () => {
  isEditing.value = true
  editedText.value = displayText.value
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveEdit = async () => {
  // 🔌 TODO: 呼叫後端 API
  /*
  await fetch(`/api/modifications/${props.modification.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'accepted',
      custom_text: editedText.value
    })
  })
  */

  props.modification.customText = editedText.value
  props.modification.status = 'accepted'
  isEditing.value = false

  console.log('🔌 API呼叫：PATCH /api/modifications/' + props.modification.id, {
    status: 'accepted',
    custom_text: editedText.value
  })
}

const accept = async () => {
  // 🔌 TODO: 呼叫後端 API
  /*
  await fetch(`/api/modifications/${props.modification.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'accepted' })
  })
  */

  props.modification.status = 'accepted'
  console.log('🔌 API呼叫：PATCH /api/modifications/' + props.modification.id)
}

const reject = async () => {
  // 🔌 TODO: 呼叫後端 API
  props.modification.status = 'rejected'
  console.log('🔌 API呼叫：PATCH /api/modifications/' + props.modification.id)
}
</script>