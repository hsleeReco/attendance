<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">재택근무 신청</h1>
    
    <div class="bg-white shadow rounded-lg p-6 space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">날짜 선택</label>
        <input
          type="date"
          v-model="selectedDate"
          :min="minDate"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">승인자 선택</label>
        <select
          v-model="selectedApprover"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>승인자를 선택하세요</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <div class="flex justify-end space-x-4">
        <button
          @click="$router.push('/dashboard')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          @click="submitRequest"
          :disabled="!selectedDate || !selectedApprover"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          신청하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { format } from 'date-fns'

const router = useRouter()
const users = ref<User[]>([])
const selectedDate = ref('')
const selectedApprover = ref('')

const minDate = format(new Date(), 'yyyy-MM-dd')

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name')

    if (error) throw error
    users.value = data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const submitRequest = async () => {
  try {
    const { error } = await supabase
      .from('remote_work')
      .insert([
        {
          user_id: authStore.user?.id,
          approver_id: selectedApprover.value,
          date: selectedDate.value,
          status: 'pending'
        }
      ])

    if (error) throw error
    router.push('/dashboard')
  } catch (error) {
    console.error('Error submitting request:', error)
  }
}

onMounted(() => {
  fetchUsers()
})
</script> 