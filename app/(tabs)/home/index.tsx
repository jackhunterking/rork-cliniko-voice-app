import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, FileText, Users, LayoutTemplate, Search, ChevronRight } from 'lucide-react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { patients, Patient } from '@/mocks/patients';
import { useNote } from '@/context/NoteContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { noteData, setPatient } = useNote();
  
  const [showPatientSheet, setShowPatientSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activePatient = noteData.patient;

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p => p.name.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleStartNote = () => {
    console.log('Starting new treatment note, active patient:', activePatient?.name);
    if (activePatient) {
      router.push('/note/setup');
    } else {
      setShowPatientSheet(true);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    console.log('Selected patient:', patient.name);
    setPatient(patient);
    setShowPatientSheet(false);
    setSearchQuery('');
    router.push('/note/setup');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.primaryCard, { marginTop: insets.top + spacing.lg }]}>
          <View style={styles.primaryCardContent}>
            <Text style={styles.primaryCardTitle}>New treatment note</Text>
            <Text style={styles.primaryCardDescription}>
              Start dictation in a Cliniko template.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartNote}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          
          <View style={[styles.quickActionCard, styles.disabledCard]}>
            <View style={styles.quickActionIcon}>
              <FileText size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={[styles.quickActionTitle, styles.disabledText]}>
                Resume last draft
              </Text>
              <Text style={styles.quickActionSubtitle}>Coming soon</Text>
            </View>
          </View>

          <View style={[styles.quickActionCard, styles.disabledCard]}>
            <View style={styles.quickActionIcon}>
              <Users size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={[styles.quickActionTitle, styles.disabledText]}>
                Recent patients
              </Text>
              <Text style={styles.quickActionSubtitle}>Coming soon</Text>
            </View>
          </View>

          <View style={[styles.quickActionCard, styles.disabledCard]}>
            <View style={styles.quickActionIcon}>
              <LayoutTemplate size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={[styles.quickActionTitle, styles.disabledText]}>
                Templates
              </Text>
              <Text style={styles.quickActionSubtitle}>Coming soon</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        visible={showPatientSheet}
        onClose={() => {
          setShowPatientSheet(false);
          setSearchQuery('');
        }}
        maxHeight={500}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Select a patient</Text>
          
          <View style={styles.searchContainer}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ScrollView style={styles.patientList} showsVerticalScrollIndicator={false}>
            {filteredPatients.map((patient, index) => (
              <TouchableOpacity
                key={patient.id}
                style={[
                  styles.patientRow,
                  index === filteredPatients.length - 1 && styles.lastPatientRow,
                ]}
                onPress={() => handleSelectPatient(patient)}
                activeOpacity={0.7}
              >
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientInitial}>
                    {patient.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientEmail}>{patient.email}</Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
            {filteredPatients.length === 0 && (
              <Text style={styles.noResults}>No patients found</Text>
            )}
          </ScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  primaryCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  primaryCardContent: {
    marginBottom: spacing.md,
  },
  primaryCardTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  primaryCardDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  quickActionCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  disabledCard: {
    opacity: 0.5,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sheetContent: {
    paddingHorizontal: spacing.md,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: spacing.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  patientList: {
    maxHeight: 320,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lastPatientRow: {
    borderBottomWidth: 0,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientInitial: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  patientEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noResults: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
