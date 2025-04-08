<template>
  <div
    class="flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
    :class="sizeClasses"
  >
    <img
      v-if="avatarUrl && !showInitial"
      :src="avatarUrl"
      :alt="altText"
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
    <div
      v-else-if="initial"
      :class="[
        'w-full h-full flex items-center justify-center font-semibold',
        initialBgColor,
        initialTextColor,
      ]"
    >
      {{ initial }}
    </div>
    <!-- أيقونة افتراضية كخيار أخير -->
    <div
      v-else
      :class="[
        'w-full h-full flex items-center justify-center',
        initialBgColor,
        initialTextColor,
      ]"
    >
      <Icon name="heroicons:user-20-solid" class="w-2/3 h-2/3" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  avatarUrl: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
  },
  initialBgColor: {
    type: String,
    default: 'bg-gray-200 dark:bg-gray-700', // لون افتراضي للخلفية
  },
  initialTextColor: {
    type: String,
    default: 'text-gray-600 dark:text-gray-300', // لون افتراضي للنص
  },
})

const showInitial = ref(!props.avatarUrl)

const initial = computed(() => {
  return props.name?.trim()?.[0]?.toUpperCase() || null
})

const altText = computed(() => {
  return props.name ? `${props.name}'s avatar` : 'User avatar'
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8 text-sm'
    case 'lg':
      return 'w-12 h-12 text-lg'
    case 'md':
    default:
      return 'w-10 h-10 text-base'
  }
})

// إعادة تعيين حالة showInitial عند تغيير avatarUrl
watch(() => props.avatarUrl, (newUrl) => {
  showInitial.value = !newUrl;
});

const handleImageError = () => {
  console.warn('Failed to load avatar:', props.avatarUrl);
  showInitial.value = true;
}
</script>