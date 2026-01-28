import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Mic, MicOff, X } from 'lucide-react-native';
import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing } from '@/constants/colors';

interface DictationSheetProps {
  visible: boolean;
  onClose: () => void;
  fieldLabel: string;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
}

const mockTranscripts = [
  "Patient presents with lower back pain that started three days ago.",
  " No radiating symptoms. Pain is described as dull and constant.",
  " Pain level rated 6 out of 10. Aggravated by prolonged sitting.",
  " No previous history of back problems.",
];

export function DictationSheet({
  visible,
  onClose,
  fieldLabel,
  onInsert,
  onReplace,
}: DictationSheetProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      setIsRecording(false);
      setTranscript('');
      setTranscriptIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording && transcriptIndex < mockTranscripts.length) {
      interval = setInterval(() => {
        setTranscript(prev => prev + mockTranscripts[transcriptIndex]);
        setTranscriptIndex(prev => prev + 1);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isRecording, transcriptIndex]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
  };

  const handleInsert = () => {
    if (transcript.trim()) {
      onInsert(transcript.trim());
      onClose();
    }
  };

  const handleReplace = () => {
    if (transcript.trim()) {
      onReplace(transcript.trim());
      onClose();
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight={400}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.dictatingLabel}>Dictating into:</Text>
            <Text style={styles.fieldLabel}>{fieldLabel}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.transcriptContainer}>
          <Text style={styles.transcript}>
            {transcript || (isRecording ? 'Listening...' : 'Tap the microphone to start dictating')}
          </Text>
        </ScrollView>

        <View style={styles.controls}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.micButton, isRecording && styles.micButtonActive]}
              onPress={toggleRecording}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <MicOff size={28} color="#FFFFFF" />
              ) : (
                <Mic size={28} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.micLabel}>
            {isRecording ? 'Tap to stop' : 'Tap to record'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleInsert}
            disabled={!transcript.trim()}
          >
            <Text style={[styles.actionText, !transcript.trim() && styles.actionTextDisabled]}>
              Insert
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReplace}
            disabled={!transcript.trim()}
          >
            <Text style={[styles.actionText, !transcript.trim() && styles.actionTextDisabled]}>
              Replace
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  dictatingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  transcriptContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    maxHeight: 140,
    marginBottom: spacing.lg,
  },
  transcript: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  controls: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: colors.error,
  },
  micLabel: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  actionTextDisabled: {
    opacity: 0.4,
  },
  cancelText: {
    color: colors.textSecondary,
  },
});
