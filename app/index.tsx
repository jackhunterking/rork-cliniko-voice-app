import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '@/components/SearchBar';
import { colors, spacing } from '@/constants/colors';
import { patients, formatDate, Patient } from '@/mocks/patients';
import { useNote } from '@/context/NoteContext';

export default function PatientsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const { setPatient } = useNote();

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const query = search.toLowerCase();
    return patients.filter(p => p.name.toLowerCase().includes(query));
  }, [search]);

  const handleSelectPatient = (patient: Patient) => {
    console.log('Selected patient:', patient.name);
    setPatient(patient);
    router.push(`/patient/${patient.id}`);
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientRow}
      onPress={() => handleSelectPatient(item)}
      activeOpacity={0.7}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.lastAppointment}>
          Last visit: {formatDate(item.lastAppointment)}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
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
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
