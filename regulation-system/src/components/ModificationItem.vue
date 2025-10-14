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
      {{ modification.suggested }}
    </div>

    <div class="reason-box">
      <strong>💡 修改理由：</strong> {{ modification.reason }}
    </div>

    <div v-if="modification.status === 'pending'" class="mod-actions">
      <button class="btn btn-success" @click="accept">✅ 接受</button>
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
const props = defineProps({
  modification: Object,
  policyId: Number
})

const emit = defineEmits(['update-status'])

const accept = () => {
  emit('update-status', {
    modificationId: props.modification.id,
    status: 'accepted'
  })
  console.log('✅ 接受修改建議:', props.modification.id)
}

const reject = () => {
  if (!confirm('確定要拒絕此修改建議嗎？')) {
    return
  }
  
  emit('update-status', {
    modificationId: props.modification.id,
    status: 'rejected'
  })
  console.log('❌ 拒絕修改建議:', props.modification.id)
}
</script>
