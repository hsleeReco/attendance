<template>
  <div class="space-y-6">
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
            <p v-if="hasCheckedOut" class="text-2xl font-semibold text-blue-600">
              {{ calculateWorkHours() }}
            </p>
            <p v-else-if="hasCheckedIn" class="text-2xl font-semibold text-gray-600">계산 중</p>
            <p v-else class="text-2xl font-semibold text-gray-600">-</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Remote Work List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">나의 재택근무 목록</h3>
        <div class="overflow-x-auto">
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
                      'bg-yellow-100 text-yellow-800': request.status === 'pending',
                      'bg-green-100 text-green-800': request.status === 'approved',
                      'bg-red-100 text-red-800': request.status === 'rejected'
                    }"
                  >
                    {{ getStatusText(request.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    v-if="request.status === 'pending'"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Attendance, RemoteWork, Leave, User } from '@/lib/supabase'
import { format, differenceInHours, differenceInMinutes } from 'date-fns'

const authStore = useAuthStore()
const todayAttendance = ref<Attendance | null>(null)
const remoteWorkUsers = ref<User[]>([])
const leaveUsers = ref<User[]>([])
const myRemoteWorkRequests = ref<(RemoteWork & { approver: User })[]>([])

const hasCheckedIn = ref(false)
const hasCheckedOut = ref(false)

const formatTime = (date: string | null | undefined) => {
  if (!date) return '-'
  return format(new Date(date), 'HH:mm')
}

const formatDate = (date: string) => {
  return format(new Date(date), 'yyyy-MM-dd')
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '대기 중'
    case 'approved':
      return '승인됨'
    case 'rejected':
      return '거절됨'
    default:
      return status
  }
}

const calculateWorkHours = () => {
  if (!todayAttendance.value?.check_in || !todayAttendance.value?.check_out) return '-'
  const hours = differenceInHours(new Date(todayAttendance.value.check_out), new Date(todayAttendance.value.check_in))
  const minutes = differenceInMinutes(new Date(todayAttendance.value.check_out), new Date(todayAttendance.value.check_in)) % 60
  return `${hours}시간 ${minutes}분`
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
  } catch (error) {
    console.error('Error checking out:', error)
  }
}

const requestLeave = () => {
  // TODO: Implement leave request
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

const fetchTodayAttendance = async () => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', authStore.user?.id)
      .gte('check_in', format(new Date(), 'yyyy-MM-dd'))
      .lte('check_in', format(new Date(), 'yyyy-MM-dd 23:59:59'))
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
    const { data, error } = await supabase
      .from('remote_work')
      .select('*, users(*)')
      .eq('status', 'approved')
      .eq('date', format(new Date(), 'yyyy-MM-dd'))

    if (error) throw error
    remoteWorkUsers.value = data.map((rw: any) => rw.users)
  } catch (error) {
    console.error('Error fetching remote work users:', error)
  }
}

const fetchLeaveUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('leave')
      .select('*, users(*)')
      .eq('status', 'approved')
      .lte('start_date', format(new Date(), 'yyyy-MM-dd'))
      .gte('end_date', format(new Date(), 'yyyy-MM-dd'))

    if (error) throw error
    leaveUsers.value = data.map((l: any) => l.users)
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

onMounted(async () => {
  await Promise.all([
    fetchTodayAttendance(),
    fetchRemoteWorkUsers(),
    fetchLeaveUsers(),
    fetchMyRemoteWorkRequests()
  ])
})
</script> 