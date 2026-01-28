import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, AlertCircle, WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '@/components/SearchBar';
import { colors, spacing, radius } from '@/constants/colors';
import { useClinikoPatients, isClinikoAuthError, isClinikoNetworkError } from '@/hooks/useCliniko';
import { useNote } from '@/context/NoteContext';
import { AppPatient } from '@/services/cliniko';

function formatDate(dateString: string | null): string {
  if (!dateString) return 'No appointments';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PatientsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const { setPatient } = useNote();

  // Fetch patients from Cliniko
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useClinikoPatients(
    { archived: false },
    { 
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  const patients = data?.patients ?? [];

  // Filter patients locally based on search
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const query = search.toLowerCase();
    return patients.filter(p => p.name.toLowerCase().includes(query));
  }, [search, patients]);

  const handleSelectPatient = useCallback((patient: AppPatient) => {
    console.log('Selected patient:', patient.name);
    // Convert AppPatient to the format expected by NoteContext
    setPatient({
      id: patient.id,
      name: patient.name,
      email: patient.email ?? '',
      phone: patient.phone ?? '',
      dateOfBirth: patient.dateOfBirth ?? '',
      lastAppointment: patient.lastAppointment,
    });
    router.push(`/patient/${patient.id}`);
  }, [setPatient, router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderPatient = useCallback(({ item }: { item: AppPatient }) => (
    <TouchableOpacity
      style={styles.patientRow}
      onPress={() => handleSelectPatient(item)}
      activeOpacity={0.7}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.lastAppointment}>
          {item.dateOfBirth 
            ? `DOB: ${formatDate(item.dateOfBirth)}`
            : item.email ?? 'No contact info'}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  ), [handleSelectPatient]);

  // Loading state
  if (isLoading && !isRefetching) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Patients',
            headerLargeTitle: true,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (isError && error) {
    const isAuthError = isClinikoAuthError(error);
    const isNetworkError = isClinikoNetworkError(error);

    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Patients',
            headerLargeTitle: true,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <View style={styles.centerContent}>
          {isNetworkError ? (
            <WifiOff size={48} color={colors.textSecondary} />
          ) : (
            <AlertCircle size={48} color={colors.error} />
          )}
          <Text style={styles.errorTitle}>
            {isAuthError 
              ? 'Authentication Error'
              : isNetworkError
                ? 'No Connection'
                : 'Failed to Load Patients'}
          </Text>
          <Text style={styles.errorMessage}>
            {isAuthError
              ? 'Your Cliniko API key may be invalid. Please check your settings.'
              : isNetworkError
                ? 'Please check your internet connection and try again.'
                : error.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          {isAuthError && (
            <TouchableOpacity
              style={styles.settingsLink}
              onPress={() => router.push('/settings/api-key')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsLinkText}>Go to Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Patients',
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search patients"
        />
      </View>
      <FlatList
        data={filteredPatients}
        keyExtractor={item => item.id}
        renderItem={renderPatient}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {search.trim() 
                ? 'No patients found matching your search'
                : 'No patients found in your Cliniko account'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          data?.totalEntries && data.totalEntries > patients.length ? (
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Showing {patients.length} of {data.totalEntries} patients
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingTop: spacing.sm,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 17,
    color: colors.textPrimary,
    fontWeight: '400' as const,
  },
  lastAppointment: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  settingsLink: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  settingsLinkText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  paginationInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  paginationText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
