<template>
  <div v-if="canShowActions" class="relative">
    <button @click="toggleDropdown" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none p-1 -m-1 rounded-full">
      <Icon name="heroicons:ellipsis-vertical-20-solid" class="w-5 h-5" />
    </button>

    <!-- القائمة المنسدلة -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownMenu"
        class="origin-top-left absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-20"
        style="left: auto; right: 0;"
      >
        <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          <!-- زر الرد (فقط للتعليقات الرئيسية، وللمستخدم المسجل) -->
          <button
            v-if="itemType === 'comment' && user"
            @click="emitAndClose('reply')"
            class="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700"
            role="menuitem"
          >
             <Icon name="heroicons:arrow-uturn-left-20-solid" class="w-4 h-4" />
             <span>رد</span>
          </button>
          <!-- أزرار التعديل والحذف (فقط للمالك) -->
          <template v-if="isOwner">
            <button
              @click="emitAndClose('edit')"
              class="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700"
              role="menuitem"
            >
               <Icon name="heroicons:pencil-square-20-solid" class="w-4 h-4" />
               <span>تعديل</span>
            </button>
            <button
              @click="emitAndClose('delete')"
              class="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
              role="menuitem"
            >
               <Icon name="heroicons:trash-20-solid" class="w-4 h-4" />
               <span>حذف</span>
            </button>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Database } from '~/types/database.types'

type CommentOrReply = Database['public']['Tables']['comments']['Row']

const props = defineProps<{
  item: CommentOrReply
  itemType: 'comment' | 'reply'
}>()

const emit = defineEmits(['edit', 'delete', 'reply'])

const user = useSupabaseUser()
const isOpen = ref(false)
const dropdownMenu = ref<HTMLElement | null>(null)

const isOwner = computed(() => user.value && user.value.id === props.item.user_id)

// تحديد ما إذا كان يجب إظهار زر النقاط الثلاث أصلاً
const canShowActions = computed(() => {
    if (isOwner.value) return true; // المالك يرى دائماً
    if (props.itemType === 'comment' && user.value) return true; // المستخدم المسجل يرى زر الرد على التعليق
    return false; // غير ذلك (زائر، أو رد ليس ملكه) لا يرى شيئاً
})


const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = (event?: MouseEvent) => {
  // لا تغلق إذا تم النقر داخل القائمة نفسها
  if (dropdownMenu.value && event && dropdownMenu.value.contains(event.target as Node)) {
    return
  }
  // لا تغلق إذا تم النقر على زر الفتح نفسه (لأن toggleDropdown ستتعامل معه)
  const targetElement = event?.target as Element | null;
  if (targetElement && targetElement.closest('button')?.contains(targetElement)) {
    // تحقق مما إذا كان الزر الذي تم النقر عليه هو زر فتح هذه القائمة
     const buttonElement = targetElement.closest('button');
     const parentDiv = buttonElement?.parentElement;
     if (parentDiv === dropdownMenu.value?.parentElement) {
        // تم النقر على زر فتح هذه القائمة، لا تغلقها هنا
         return;
     }
  }
  isOpen.value = false
}


const emitAndClose = (action: 'edit' | 'delete' | 'reply') => {
  emit(action)
  isOpen.value = false
}

onMounted(() => {
  // استخدام الطور العادي (false) قد يكون كافياً هنا
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>