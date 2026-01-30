/**
 * useUsageStats Hook
 * Tracks user's total recording minutes in Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface UsageStats {
  id: string;
  user_id: string;
  total_minutes_recorded: number;
  last_recording_at: string | null;
  created_at: string;
  updated_at: string;
}

// Query keys for React Query
export const usageStatsKeys = {
  all: ['usage-stats'] as const,
  byUser: (userId: string) => [...usageStatsKeys.all, userId] as const,
};

/**
 * Fetch user's usage stats from Supabase
 */
async function fetchUsageStats(userId: string): Promise<UsageStats | null> {
  const { data, error } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // PGRST116 means no rows returned - user hasn't recorded yet
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[UsageStats] Error fetching stats:', error);
    throw error;
  }

  return data;
}

/**
 * Add recorded minutes to user's total
 */
async function addMinutesToStats(
  userId: string,
  minutesToAdd: number
): Promise<UsageStats> {
  // First, try to get existing stats
  const { data: existing, error: fetchError } = await supabase
    .from('usage_stats')
    .select('total_minutes_recorded')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[UsageStats] Error checking existing stats:', fetchError);
    throw fetchError;
  }

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('usage_stats')
      .update({
        total_minutes_recorded: existing.total_minutes_recorded + minutesToAdd,
        last_recording_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[UsageStats] Error updating stats:', error);
      throw error;
    }

    if (__DEV__) {
      console.log('[UsageStats] Updated stats:', data);
    }

    return data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('usage_stats')
      .insert({
        user_id: userId,
        total_minutes_recorded: minutesToAdd,
        last_recording_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[UsageStats] Error inserting stats:', error);
      throw error;
    }

    if (__DEV__) {
      console.log('[UsageStats] Created stats:', data);
    }

    return data;
  }
}

/**
 * Hook to access and update usage stats
 */
export function useUsageStats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;

  // Query for fetching stats
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: usageStatsKeys.byUser(userId ?? ''),
    queryFn: () => fetchUsageStats(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for adding minutes
  const addMinutesMutation = useMutation({
    mutationFn: (minutes: number) => addMinutesToStats(userId!, minutes),
    onSuccess: (newStats) => {
      // Update the cache with new stats
      queryClient.setQueryData(usageStatsKeys.byUser(userId!), newStats);
    },
    onError: (error) => {
      console.error('[UsageStats] Failed to add minutes:', error);
    },
  });

  /**
   * Add recorded minutes to the user's total
   * @param minutes - Number of minutes to add
   */
  const addRecordedMinutes = async (minutes: number): Promise<void> => {
    if (!userId) {
      console.warn('[UsageStats] Cannot add minutes - no user logged in');
      return;
    }

    if (minutes <= 0) {
      if (__DEV__) {
        console.log('[UsageStats] Skipping - no minutes to add');
      }
      return;
    }

    try {
      await addMinutesMutation.mutateAsync(minutes);
      if (__DEV__) {
        console.log(`[UsageStats] Added ${minutes} minutes`);
      }
    } catch (error) {
      // Error is already logged in mutation
    }
  };

  return {
    /** Total minutes recorded by the user */
    totalMinutes: stats?.total_minutes_recorded ?? 0,
    /** Last recording timestamp */
    lastRecordingAt: stats?.last_recording_at ?? null,
    /** Whether stats are loading */
    isLoading,
    /** Whether there was an error loading stats */
    isError,
    /** Error object if any */
    error,
    /** Add minutes to the user's total */
    addRecordedMinutes,
    /** Whether adding minutes is in progress */
    isAddingMinutes: addMinutesMutation.isPending,
    /** Refetch stats from server */
    refetch,
  };
}
