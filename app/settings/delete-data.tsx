import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Square, CheckSquare } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';

export default function DeleteDataScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    console.log('Deleting user data');
    setShowConfirmModal(false);
    router.push('/settings/delete-data/success' as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Delete my data',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningCard}>
          <View style={styles.warningIconContainer}>
            <AlertTriangle size={28} color={colors.error} />
          </View>
          <Text style={styles.warningTitle}>Delete your data</Text>
          <Text style={styles.warningText}>
            This will delete your Cliniko Voice data stored in this app.
          </Text>
          <Text style={styles.warningText}>
            This does not delete anything in Cliniko.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          {isChecked ? (
            <CheckSquare size={24} color={colors.primary} />
          ) : (
            <Square size={24} color={colors.textSecondary} />
          )}
          <Text style={styles.checkboxLabel}>
            I understand this cannot be undone.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            !isChecked && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          activeOpacity={0.8}
          disabled={!isChecked}
        >
          <Text
            style={[
              styles.deleteButtonText,
              !isChecked && styles.deleteButtonTextDisabled,
            ]}
          >
            Delete my data
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalMessage}>
              This action cannot be undone. All your app data will be permanently deleted.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleConfirmDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  warningIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: spacing.sm + 4,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#FECACA',
  },
  deleteButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  deleteButtonTextDisabled: {
    color: '#FCA5A5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
