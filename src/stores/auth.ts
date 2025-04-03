import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const signInWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://jxeckmwtwzmidkinsiwg.supabase.co/auth/v1/callback`
        }
      })
      if (signInError) throw signInError
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (session?.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('supabase_manage_id', session.user.id)
          .single()
        if (userError) {
          if(userError.code === "PGRST116") {
            // no data
            const { data: newUserData, error: insertError } = await supabase
              .from('users')
              .insert({
                supabase_manage_id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata.full_name,
                avatar_url: session.user.user_metadata.avatar_url,
                created_at: new Date().toISOString()
              })
              .select()
              .single()
            if (insertError) throw insertError
            user.value = newUserData
          }
        } else {
          user.value = userData
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred during sign in'
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      loading.value = true
      error.value = null
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      user.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred during sign out'
    } finally {
      loading.value = false
    }
  }

  const getSession = async () => {
    try {
      loading.value = true
      error.value = null
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (session?.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('supabase_manage_id', session.user.id)
          .single()
        if (userError) throw userError;
        user.value = userData;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred while getting session'
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    getSession
  }
}) 