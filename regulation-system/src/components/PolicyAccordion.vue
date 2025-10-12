<template>
  <div class="policy-accordion">
    <div 
      class="policy-header"
      :class="{ expanded: isExpanded }"
      @click="toggleExpand"
    >
      <div class="policy-info">
        <div class="policy-title">📄 {{ policy.name }}</div>
        <div class="policy-meta">
          <span>相似度: <strong style="color: #ef4444;">{{ policy.similarity }}%</strong></span>
          <span>{{ policy.modificationsCount }} 處建議修改</span>
        </div>
      </div>
      <div class="policy-progress">
        <div :class="progressClass">
          {{ policy.reviewedCount }}/{{ policy.modificationsCount }}
        </div>
        <span class="expand-icon">▼</span>
      </div>
    </div>

    <div class="policy-content" :class="{ expanded: isExpanded }">
      <div class="modifications-list">
        <ModificationItem 
          v-for="mod in policy.modifications"
          :key="mod.id"
          :modification="mod"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ModificationItem from './ModificationItem.vue'

const props = defineProps({
  policy: Object
})

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const progressClass = computed(() => {
  const { reviewedCount, modificationsCount } = props.policy
  if (reviewedCount === 0) return 'progress-circle progress-pending'
  if (reviewedCount < modificationsCount) return 'progress-circle progress-inprogress'
  return 'progress-circle progress-completed'
})
</script>