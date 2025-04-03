<template>
  <div class="max-w-md mx-auto mt-8">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">연차 신청</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-900">날짜</label>
          <input
            type="date"
            v-model="selectedDate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900">시작 시간</label>
          <select
            v-model="startTime"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          >
            <option v-for="time in availableStartTimeOptions" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900">기간</label>
          <select
            v-model="duration"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          >
            <option v-for="duration in availableDurationOptions" :key="duration" :value="duration">
              {{ duration }}시간
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900">종료 시간</label>
          <input
            type="text"
            :value="endTime"
            disabled
            class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900">연차 유형</label>
          <select
            v-model="selectedLeaveType"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          >
            <option v-for="type in leaveTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="router.push('/')"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          취소
        </button>
        <button
          @click="submitLeaveRequest"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

const router = useRouter()
const authStore = useAuthStore()

const startTime = ref('09:00')
const duration = ref(4)

// 가능한 시작 시간 목록
const availableStartTimes = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
]

// 가능한 기간 목록
const availableDurations = [2, 4, 6, 8]

// 선택 가능한 시작 시간 계산
const availableStartTimeOptions = computed(() => {
  const hours = Number(startTime.value.split(':')[0])
  if (hours <= 12) {
    return availableStartTimes.filter(time => {
      const timeHours = Number(time.split(':')[0])
      return timeHours >= hours
    })
  } else {
    return availableStartTimes.filter(time => {
      const timeHours = Number(time.split(':')[0])
      return timeHours >= hours && timeHours <= 17
    })
  }
})

// 선택 가능한 기간 계산
const availableDurationOptions = computed(() => {
  const startHour = Number(startTime.value.split(':')[0])
  let maxDuration = 19 - startHour
  
  // 점심시간을 포함하는 경우 1시간 추가
  if (startHour <= 12) {
    maxDuration += 1
  }
  
  return availableDurations.filter(duration => duration <= maxDuration)
})

const endTime = computed(() => {
  const [hours, minutes] = startTime.value.split(':').map(Number)
  let endHours = Number(hours) + Number(duration.value)
  
  // 점심시간(12:00-13:00)을 포함하는 경우
  if (
    (hours <= 12 && endHours > 12) || // 시작이 점심 전이고 종료가 점심 후
    (hours >= 12 && hours < 13) ||    // 시작이 점심시간 중
    (endHours > 12 && endHours < 13)  // 종료가 점심시간 중
  ) {
    endHours += 1
  }
  
  // 24시간 형식으로 변환
  endHours = endHours % 24
  
  return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

const leaveTypes = [
  { value: 'ANNUAL', label: '연차' },
  { value: 'SICK', label: '병가' },
  { value: 'OTHER', label: '기타' }
]

const selectedLeaveType = ref('ANNUAL')
const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))

const submitLeaveRequest = async () => {
  try {
    const startDateTime = `${selectedDate.value}T${startTime.value}:00`
    const endDateTime = `${selectedDate.value}T${endTime.value}:00`
    
    const { error } = await supabase
      .from('leave')
      .insert([
        {
          user_id: authStore.user?.id,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          type: selectedLeaveType.value,
          status: 'PENDING'
        }
      ])

    if (error) throw error
    router.push('/')
  } catch (error) {
    console.error('Error submitting leave request:', error)
  }
}
</script> 