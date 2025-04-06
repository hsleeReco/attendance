<template>
  <div class="space-y-6">
    <!-- User Profile Header -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-3 sm:p-4">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <img
              :src="authStore.user?.avatar_url || 'https://ui-avatars.com/api/?name=' + authStore.user?.name"
              :alt="authStore.user?.name"
              class="h-12 w-12 rounded-full"
            />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ authStore.user?.name }}</h2>
            <p class="text-xs text-gray-400">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Banners -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="remoteWorkUsers.length > 0" class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              재택근무 중인 직원: {{ remoteWorkUsers.map(u => u.name).join(', ') }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="leaveUsers.length > 0" class="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              연차 사용 중인 직원: {{ leaveUsers.map(u => u.name).join(', ') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <button
        @click="checkIn"
        :disabled="hasCheckedIn"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        출근하기
      </button>
      <button
        @click="checkOut"
        :disabled="!hasCheckedIn || hasCheckedOut"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        퇴근하기
      </button>
      <button
        @click="$router.push('/remote-work/request')"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
      >
        재택하기
      </button>
      <button
        @click="requestLeave"
        class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        연차쓰기
      </button>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">출근 상태</h3>
          <div class="mt-2">
            <p v-if="hasCheckedIn" class="text-2xl font-semibold text-green-600">
              {{ formatTime(todayAttendance?.check_in) }}
            </p>
            <p v-else class="text-2xl font-semibold text-gray-600">미출근</p>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">퇴근 상태</h3>
          <div class="mt-2">
            <p v-if="hasCheckedOut" class="text-2xl font-semibold text-red-600">
              {{ formatTime(todayAttendance?.check_out) }}
            </p>
            <p v-else-if="hasCheckedIn" class="text-2xl font-semibold text-gray-600">근무 중</p>
            <p v-else class="text-2xl font-semibold text-gray-600">-</p>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">근무 시간</h3>
          <div class="mt-2">
            <p v-if="hasCheckedIn" class="text-2xl font-semibold text-blue-600">
              {{ todayWorkHours }}
            </p>
            <p v-else class="text-2xl font-semibold text-gray-600">-</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Remote Work List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">나의 재택근무 목록</h3>
        <div v-if="myRemoteWorkRequests.length === 0" class="text-center py-4 text-gray-500">
          재택근무 신청 내역이 없습니다.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">승인자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="request in myRemoteWorkRequests" :key="request.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(request.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.approver?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                      'bg-yellow-100 text-yellow-800': request.status === 'PENDING',
                      'bg-green-100 text-green-800': request.status === 'APPROVED',
                      'bg-red-100 text-red-800': request.status === 'REJECTED'
                    }"
                  >
                    {{ getStatusText(request.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    v-if="request.status.toUpperCase() === 'PENDING'"
                    @click="cancelRequest(request.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    취소
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pending Remote Work Requests for Approval -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">승인 대기 중인 재택근무</h3>
        <div v-if="pendingRemoteWorkRequests.length === 0" class="text-center py-4 text-gray-500">
          승인 대기 중인 재택근무 신청이 없습니다.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="request in pendingRemoteWorkRequests" :key="request.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(request.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.user?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex space-x-2">
                    <button
                      @click="approveRequest(request.id)"
                      class="text-green-600 hover:text-green-900"
                    >
                      승인
                    </button>
                    <button
                      @click="rejectRequest(request.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      거절
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Leave List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900">나의 연차 목록</h3>
          <div v-if="myLeaveRequests.length > 0" class="text-sm text-gray-900">
            <div>총 사용: {{ formatTotalLeaveHours }}</div>
            <div class="mt-1">
              <span class="text-blue-600">연차: {{ formatLeaveHoursByType('ANNUAL') }}</span>
              <span class="ml-4 text-red-600">병가: {{ formatLeaveHoursByType('SICK') }}</span>
              <span class="ml-4 text-gray-600">기타: {{ formatLeaveHoursByType('OTHER') }}</span>
            </div>
          </div>
        </div>
        <div v-if="myLeaveRequests.length === 0" class="text-center py-4 text-gray-500">
          연차 신청 내역이 없습니다.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="request in myLeaveRequests" :key="request.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(request.start_datetime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatTime(request.start_datetime) }} ~ {{ formatTime(request.end_datetime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getLeaveTypeText(request.type) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    v-if="request.status.toUpperCase() === 'PENDING'"
                    @click="cancelLeaveRequest(request.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    취소
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Attendance History -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">나의 출퇴근 기록</h3>
        <div v-if="myAttendanceHistory.length === 0" class="text-center py-4 text-gray-500">
          출퇴근 기록이 없습니다.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출근</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">퇴근</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">근무시간</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in myAttendanceHistory" :key="record.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(record.check_in) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatTime(record.check_in) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ record.check_out ? formatTime(record.check_out) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ record.check_out ? formatWorkHours(record) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Attendance, RemoteWork, Leave, User } from '@/lib/supabase'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { useRouter } from 'vue-router'

// Set Korean locale
dayjs.locale('ko')

const authStore = useAuthStore()
const todayAttendance = ref<Attendance | null>(null)
const remoteWorkUsers = ref<User[]>([])
const leaveUsers = ref<User[]>([])
const myRemoteWorkRequests = ref<(RemoteWork & { approver: User })[]>([])
const myLeaveRequests = ref<Leave[]>([])
const myAttendanceHistory = ref<Attendance[]>([])
const pendingRemoteWorkRequests = ref<(RemoteWork & { user: User })[]>([])

const hasCheckedIn = ref(false)
const hasCheckedOut = ref(false)

const router = useRouter()

const formatTime = (date: string | null | undefined) => {
  if(date == null) return "-";
  return dayjs(date).format('HH:mm')
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '대기중'
    case 'APPROVED':
      return '승인됨'
    case 'REJECTED':
      return '거절됨'
    default:
      return status.toUpperCase()
  }
}

const getLeaveTypeText = (type: string) => {
  switch (type) {
    case 'ANNUAL':
      return '연차'
    case 'SICK':
      return '병가'
    case 'other':
      return '기타'
    default:
      return type.toUpperCase()
  }
}

const calculateWorkHours = (checkIn: string, checkOut: string | null = null) => {
  const start = dayjs(checkIn)
  const end = checkOut ? dayjs(checkOut) : dayjs()
  
  let hours = end.diff(start, 'hour')
  const minutes = end.diff(start, 'minute') % 60
  
  // 점심시간(12:00-13:00)을 건너뛰는 경우
  const startHour = start.hour()
  const endHour = end.hour()
  if (startHour <= 12 && endHour > 12) {
    hours -= 1
  }
  
  return `${hours}시간 ${minutes}분`
}

const calculateLeaveHours = (request: Leave) => {
  const start = dayjs(request.start_datetime)
  const end = dayjs(request.end_datetime)
  let hours = end.diff(start, 'hour')
  
  // 점심시간(12:00-13:00)을 건너뛰는 경우
  const startHour = start.hour()
  const endHour = end.hour()
  if (startHour <= 12 && endHour > 12) {
    hours -= 1
  }
  
  return hours
}

const formatLeaveHoursByType = (type: string) => {
  const totalHours = myLeaveRequests.value.reduce((total, request) => {
    if (request.type === type) {
      return total + calculateLeaveHours(request)
    }
    return total
  }, 0)

  const days = Math.floor(totalHours / 8)
  const hours = totalHours % 8

  if (days > 0) {
    return `${days}일 ${hours}시간`
  }
  return `${hours}시간`
}

const formatTotalLeaveHours = computed(() => {
  const totalHours = myLeaveRequests.value.reduce((total, request) => {
    return total + calculateLeaveHours(request)
  }, 0)

  const days = Math.floor(totalHours / 8)
  const hours = totalHours % 8

  if (days > 0) {
    return `${days}일 ${hours}시간`
  }
  return `${hours}시간`
})

const todayWorkHours = computed(() => {
  if (!todayAttendance.value?.check_in) return '-'
  return calculateWorkHours(todayAttendance.value.check_in, todayAttendance.value.check_out)
})

const formatWorkHours = (record: Attendance) => {
  if (!record.check_in) return '-'
  return calculateWorkHours(record.check_in, record.check_out)
}

const checkIn = async () => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([
        {
          user_id: authStore.user?.id,
          check_in: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) throw error
    todayAttendance.value = data
    hasCheckedIn.value = true
    await fetchMyAttendanceHistory()
  } catch (error) {
    console.error('Error checking in:', error)
  }
}

const checkOut = async () => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', todayAttendance.value?.id)
      .select()
      .single()

    if (error) throw error
    todayAttendance.value = data
    hasCheckedOut.value = true
    await fetchMyAttendanceHistory()
  } catch (error) {
    console.error('Error checking out:', error)
  }
}

const requestLeave = () => {
  router.push('/leave/request')
}

const cancelRequest = async (requestId: string) => {
  try {
    const { error } = await supabase
      .from('remote_work')
      .delete()
      .eq('id', requestId)

    if (error) throw error
    await fetchMyRemoteWorkRequests()
  } catch (error) {
    console.error('Error canceling request:', error)
  }
}

const cancelLeaveRequest = async (requestId: string) => {
  try {
    const { error } = await supabase
      .from('leave')
      .delete()
      .eq('id', requestId)

    if (error) throw error
    await fetchMyLeaveRequests()
  } catch (error) {
    console.error('Error canceling leave request:', error)
  }
}

const fetchTodayAttendance = async () => {
  try {
    const today = dayjs().format('YYYY-MM-DD')
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', authStore.user?.id)
      .gte('check_in', `${today} 00:00:00`)
      .lte('check_in', `${today} 23:59:59`)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    todayAttendance.value = data
    hasCheckedIn.value = !!data
    hasCheckedOut.value = !!data?.check_out
  } catch (error) {
    console.error('Error fetching attendance:', error)
  }
}

const fetchRemoteWorkUsers = async () => {
  try {
    const today = dayjs().format('YYYY-MM-DD')
    const { data, error } = await supabase
      .from('remote_work')
      .select('*, users(*)')
      .eq('status', 'APPROVED')
      .eq('date', today)

    if (error) throw error
    remoteWorkUsers.value = data.map((rw: { users: User }) => rw.users)
  } catch (error) {
    console.error('Error fetching remote work users:', error)
  }
}

const fetchLeaveUsers = async () => {
  try {
    const today = dayjs().format('YYYY-MM-DD')
    const { data, error } = await supabase
      .from('leave')
      .select('*, users(*)')
      .eq('status', 'APPROVED')
      .lte('start_datetime', today)
      .gte('end_datetime', today)

    if (error) throw error
    leaveUsers.value = data.map((l: { users: User }) => l.users)
  } catch (error) {
    console.error('Error fetching leave users:', error)
  }
}

const fetchMyRemoteWorkRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('remote_work')
      .select('*, approver:users(*)')
      .eq('user_id', authStore.user?.id)
      .order('date', { ascending: false })

    if (error) throw error
    myRemoteWorkRequests.value = data
  } catch (error) {
    console.error('Error fetching remote work requests:', error)
  }
}

const fetchMyLeaveRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('leave')
      .select('*')
      .eq('user_id', authStore.user?.id)
      .order('start_datetime', { ascending: false })

    if (error) throw error
    myLeaveRequests.value = data
  } catch (error) {
    console.error('Error fetching leave requests:', error)
  }
}

const fetchMyAttendanceHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', authStore.user?.id)
      .order('check_in', { ascending: false })
      .limit(10)

    if (error) throw error
    myAttendanceHistory.value = data
  } catch (error) {
    console.error('Error fetching attendance history:', error)
  }
}

const approveRequest = async (requestId: string) => {
  try {
    const { error } = await supabase
      .from('remote_work')
      .update({ status: 'APPROVED' })
      .eq('id', requestId)

    if (error) throw error
    await Promise.all([
      fetchPendingRemoteWorkRequests(),
      fetchRemoteWorkUsers()
    ])
  } catch (error) {
    console.error('Error approving request:', error)
  }
}

const rejectRequest = async (requestId: string) => {
  try {
    const { error } = await supabase
      .from('remote_work')
      .update({ status: 'REJECTED' })
      .eq('id', requestId)

    if (error) throw error
    await fetchPendingRemoteWorkRequests()
  } catch (error) {
    console.error('Error rejecting request:', error)
  }
}

const fetchPendingRemoteWorkRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('remote_work')
      .select('*, user:users(*)')
      .eq('approver_id', authStore.user?.id)
      .eq('status', 'PENDING')
      .order('date', { ascending: true })

    if (error) throw error
    pendingRemoteWorkRequests.value = data
  } catch (error) {
    console.error('Error fetching pending remote work requests:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    fetchTodayAttendance(),
    fetchRemoteWorkUsers(),
    fetchLeaveUsers(),
    fetchMyRemoteWorkRequests(),
    fetchMyLeaveRequests(),
    fetchMyAttendanceHistory(),
    fetchPendingRemoteWorkRequests()
  ])
})
</script> 