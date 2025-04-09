<template>
  <div v-if="canShowActions" class="relative">
    <button @click="toggleDropdown" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none p-1 -m-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 14.707a1 1 0 01-1.414-1.414L10.586 9 6.293 4.707a1 1 0 011.414-1.414L12.414 9l-4.707 4.707z"/>
            </svg>
            <span>رد</span>
          </button>

          <!-- أزرار التعديل والحذف (فقط للمالك) -->
          <template v-if="isOwner">
            <button
              @click="emitAndClose('edit')"
              class="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path d="M2 15.5A1.5 1.5 0 013.5 14h5.379l1.5 1.5H3.5a1.5 1.5 0 01-1.5-1.5z" />
              </svg>
              <span>تعديل</span>
            </button>
            <button
              @click="emitAndClose('delete')"
              class="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
              role="menuitem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 8a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm-2 5a2 2 0 002 2h8a2 2 0 002-2V6H4v7z" clip-rule="evenodd" />
              </svg>
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