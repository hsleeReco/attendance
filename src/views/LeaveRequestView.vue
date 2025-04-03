<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-900">연차 신청</h1>

    <div class="space-y-6">
      <!-- Date Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">날짜 선택</label>
        <div class="space-y-4">
          <div v-for="(date, index) in selectedDates" :key="index" class="flex items-center space-x-4">
            <input
              type="date"
              v-model="date.date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
            <select
              v-model="date.startTime"
              class="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option v-for="hour in availableStartHours" :key="hour" :value="hour">
                {{ hour }}:00
              </option>
            </select>
            <span class="text-gray-700">~</span>
            <select
              v-model="date.duration"
              class="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            >
              <option v-for="duration in availableDurations" :key="duration" :value="duration">
                {{ duration }}시간
              </option>
            </select>
            <span class="text-gray-700">(종료: {{ calculateEndTime(date) }})</span>
            <button
              @click="removeDate(index)"
              class="text-red-700 hover:text-red-900"
              v-if="selectedDates.length > 1"
            >
              삭제
            </button>
          </div>
        </div>
        <button
          @click="addDate"
          class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          날짜 추가
        </button>
      </div>

      <!-- Leave Type -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">연차 유형</label>
        <select
          v-model="leaveType"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
        >
          <option value="annual">연차</option>
          <option value="sick">병가</option>
          <option value="other">기타</option>
        </select>
      </div>

      <!-- Total Hours -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900">총 연차 사용 시간</h3>
        <p class="mt-2 text-2xl font-semibold text-blue-700">{{ totalLeaveHours }}시간</p>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end space-x-4">
        <button
          @click="router.push('/')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-900 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          @click="submitRequest"
          :disabled="!isValid"
          class="px-4 py-2 border border-transparent rounded-md text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          신청하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

interface SelectedDate {
  date: string
  startTime: number
  duration: number
}

const selectedDates = ref<SelectedDate[]>([
  {
    date: '',
    startTime: 8,
    duration: 8
  }
])

const leaveType = ref('annual')
const availableStartHours = Array.from({ length: 10 }, (_, i) => i + 8) // 8:00 ~ 17:00
const availableDurations = [2, 4, 6, 8]

const calculateEndTime = (date: SelectedDate) => {
  if (!date.startTime || !date.duration) return '-'
  
  let endTime = date.startTime + date.duration
  // 점심시간(12:00-13:00)을 건너뛰는 경우
  if (date.startTime <= 12 && endTime > 12) {
    endTime += 1
  }
  return `${endTime}:00`
}

const addDate = () => {
  selectedDates.value.push({
    date: '',
    startTime: 8,
    duration: 8
  })
}

const removeDate = (index: number) => {
  selectedDates.value.splice(index, 1)
}

const calculateLeaveHours = (date: SelectedDate) => {
  if (!date.date) return 0
  return date.duration
}

const totalLeaveHours = computed(() => {
  return selectedDates.value.reduce((total, date) => {
    return total + calculateLeaveHours(date)
  }, 0)
})

const isValid = computed(() => {
  return selectedDates.value.every(date => 
    date.date && 
    date.startTime >= 8 && 
    date.startTime <= 17 &&
    calculateEndTime(date) !== '-'
  )
})

const submitRequest = async () => {
  try {
    const requests = selectedDates.value.map(date => {
      const endTime = parseInt(calculateEndTime(date))
      return {
        user_id: authStore.user?.id,
        start_datetime: `${date.date}T${String(date.startTime).padStart(2, '0')}:00:00`,
        end_datetime: `${date.date}T${String(endTime).padStart(2, '0')}:00:00`,
        start_time: date.startTime,
        end_time: endTime,
        type: leaveType.value,
        status: 'PENDING'
      }
    })

    const { error } = await supabase
      .from('leave')
      .insert(requests)

    if (error) throw error
    router.push('/')
  } catch (error) {
    console.error('Error submitting leave request:', error)
  }
}
</script> 