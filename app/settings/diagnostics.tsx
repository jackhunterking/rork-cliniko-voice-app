import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Server,
  User,
  Key,
  Zap,
} from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { useDebugStore, ApiCallRecord } from '@/stores/debug-store';
import { validateClinikoCredentials, ClinikoShard } from '@/services/cliniko';
import { 
  getClinikoApiKey, 
  getClinikoShard, 
  getCoupledUserId,
  isClinikoConfigured,
} from '@/lib/secure-storage';
import { maskSecret, formatDuration, logDebug } from '@/lib/debug';

interface DiagnosticRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: 'success' | 'error' | 'warning' | 'neutral';
}

function DiagnosticRow({ icon, label, value, status = 'neutral' }: DiagnosticRowProps) {
  const statusColor = {
    success: colors.success,
    error: colors.error,
    warning: '#F59E0B',
    neutral: colors.textSecondary,
  }[status];

  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, { color: statusColor }]}>{value}</Text>
      </View>
    </View>
  );
}

function LastApiCallCard({ call }: { call: ApiCallRecord | null }) {
  if (!call) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last API Call</Text>
        <Text style={styles.emptyText}>No API calls recorded yet</Text>
      </View>
    );
  }

  const timestamp = call.timestamp.toLocaleTimeString();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Last API Call</Text>
      <View style={styles.apiCallDetails}>
        <View style={styles.apiCallHeader}>
          <Text style={styles.apiCallMethod}>{call.method}</Text>
          <Text style={styles.apiCallEndpoint}>{call.endpoint}</Text>
        </View>
        <View style={styles.apiCallMeta}>
          <View style={styles.apiCallMetaItem}>
            {call.success ? (
              <CheckCircle size={14} color={colors.success} />
            ) : (
              <XCircle size={14} color={colors.error} />
            )}
            <Text style={[
              styles.apiCallStatus,
              { color: call.success ? colors.success : colors.error }
            ]}>
              {call.status} {call.success ? 'OK' : 'Error'}
            </Text>
          </View>
          <View style={styles.apiCallMetaItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.apiCallDuration}>{formatDuration(call.duration)}</Text>
          </View>
        </View>
        <Text style={styles.apiCallTimestamp}>{timestamp}</Text>
        {call.errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorMessage}>{call.errorMessage}</Text>
          </View>
        )}
        {call.responsePreview && (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Response Preview:</Text>
            <Text style={styles.previewText} numberOfLines={3}>
              {call.responsePreview}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function DiagnosticsScreen() {
  const insets = useSafeAreaInsets();
  const { user, hasClinikoKey } = useAuth();
  const { lastApiCall, apiCallCount, errorCount } = useDebugStore();
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user?: { firstName: string; lastName: string; email: string };
  } | null>(null);
  
  const [clinikoDetails, setClinikoDetails] = useState<{
    hasKey: boolean;
    shard: ClinikoShard | null;
    coupledUserId: string | null;
    isUserMatch: boolean;
  }>({
    hasKey: false,
    shard: null,
    coupledUserId: null,
    isUserMatch: false,
  });

  // Load Cliniko details on mount
  useEffect(() => {
    async function loadClinikoDetails() {
      const [configured, shard, coupledUserId] = await Promise.all([
        isClinikoConfigured(),
        getClinikoShard(),
        getCoupledUserId(),
      ]);

      const isUserMatch = coupledUserId === user?.id || !coupledUserId;

      setClinikoDetails({
        hasKey: configured,
        shard,
        coupledUserId,
        isUserMatch,
      });
    }

    loadClinikoDetails();
  }, [user?.id]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    logDebug('Diagnostics: Testing Cliniko connection...');

    try {
      const apiKey = await getClinikoApiKey();
      const shard = await getClinikoShard();

      if (!apiKey || !shard) {
        setTestResult({
          success: false,
          message: 'Missing API key or region configuration',
        });
        return;
      }

      const result = await validateClinikoCredentials(apiKey, shard);

      if (result.valid && result.user) {
        setTestResult({
          success: true,
          message: 'Connection successful!',
          user: result.user,
        });
        logDebug('Diagnostics: Connection test successful');
      } else {
        setTestResult({
          success: false,
          message: 'Invalid API key or unauthorized access',
        });
        logDebug('Diagnostics: Connection test failed - invalid credentials');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult({
        success: false,
        message: errorMessage,
      });
      logDebug('Diagnostics: Connection test error:', errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Diagnostics',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Supabase Auth Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Supabase Authentication</Text>
          <DiagnosticRow
            icon={<User size={18} color={colors.textSecondary} />}
            label="User ID"
            value={user?.id ? maskSecret(user.id) : 'Not signed in'}
            status={user?.id ? 'success' : 'error'}
          />
          <DiagnosticRow
            icon={<Server size={18} color={colors.textSecondary} />}
            label="Email"
            value={user?.email ?? 'N/A'}
            status={user?.email ? 'success' : 'neutral'}
          />
        </View>

        {/* Cliniko Connection Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cliniko Connection</Text>
          <DiagnosticRow
            icon={<Key size={18} color={colors.textSecondary} />}
            label="API Key Status"
            value={clinikoDetails.hasKey ? 'Connected' : 'Not connected'}
            status={clinikoDetails.hasKey ? 'success' : 'error'}
          />
          <DiagnosticRow
            icon={<Server size={18} color={colors.textSecondary} />}
            label="Region (Shard)"
            value={clinikoDetails.shard?.toUpperCase() ?? 'Not set'}
            status={clinikoDetails.shard ? 'success' : 'warning'}
          />
          <DiagnosticRow
            icon={<User size={18} color={colors.textSecondary} />}
            label="Coupled User"
            value={
              clinikoDetails.coupledUserId 
                ? (clinikoDetails.isUserMatch ? 'Matches current user' : 'Different user!')
                : 'Not coupled'
            }
            status={
              clinikoDetails.coupledUserId
                ? (clinikoDetails.isUserMatch ? 'success' : 'error')
                : 'warning'
            }
          />
        </View>

        {/* Session Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Statistics</Text>
          <DiagnosticRow
            icon={<Zap size={18} color={colors.textSecondary} />}
            label="API Calls This Session"
            value={apiCallCount.toString()}
            status="neutral"
          />
          <DiagnosticRow
            icon={<AlertCircle size={18} color={colors.textSecondary} />}
            label="Errors This Session"
            value={errorCount.toString()}
            status={errorCount > 0 ? 'error' : 'success'}
          />
        </View>

        {/* Last API Call */}
        <LastApiCallCard call={lastApiCall} />

        {/* Test Connection Button */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connection Test</Text>
          <TouchableOpacity
            style={[
              styles.testButton,
              (!clinikoDetails.hasKey || isTestingConnection) && styles.testButtonDisabled,
            ]}
            onPress={handleTestConnection}
            disabled={!clinikoDetails.hasKey || isTestingConnection}
            activeOpacity={0.8}
          >
            {isTestingConnection ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <RefreshCw size={18} color="#FFFFFF" />
                <Text style={styles.testButtonText}>Test Cliniko Connection</Text>
              </>
            )}
          </TouchableOpacity>

          {testResult && (
            <View style={[
              styles.testResultBox,
              testResult.success ? styles.testResultSuccess : styles.testResultError,
            ]}>
              <View style={styles.testResultHeader}>
                {testResult.success ? (
                  <CheckCircle size={20} color={colors.success} />
                ) : (
                  <XCircle size={20} color={colors.error} />
                )}
                <Text style={[
                  styles.testResultMessage,
                  { color: testResult.success ? colors.success : colors.error }
                ]}>
                  {testResult.message}
                </Text>
              </View>
              {testResult.user && (
                <View style={styles.testResultUser}>
                  <Text style={styles.testResultUserLabel}>Cliniko User:</Text>
                  <Text style={styles.testResultUserName}>
                    {testResult.user.firstName} {testResult.user.lastName}
                  </Text>
                  <Text style={styles.testResultUserEmail}>
                    {testResult.user.email}
                  </Text>
                </View>
              )}
            </View>
          )}

          {!clinikoDetails.hasKey && (
            <Text style={styles.testHint}>
              Connect your Cliniko account to test the connection.
            </Text>
          )}
        </View>

        <Text style={styles.footnote}>
          Debug information for troubleshooting. No sensitive data is displayed.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 32,
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  apiCallDetails: {
    marginTop: spacing.xs,
  },
  apiCallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiCallMethod: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  apiCallEndpoint: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'monospace',
    flex: 1,
  },
  apiCallMeta: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  apiCallMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  apiCallStatus: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  apiCallDuration: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  apiCallTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.error + '15',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.error,
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 13,
    color: colors.error,
  },
  previewBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  previewText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  testResultBox: {
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  testResultSuccess: {
    backgroundColor: colors.success + '15',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  testResultError: {
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  testResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testResultMessage: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  testResultUser: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  testResultUserLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  testResultUserName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  testResultUserEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  testHint: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  footnote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
