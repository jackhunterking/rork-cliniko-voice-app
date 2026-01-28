/**
 * TeleprompterTranscript Component
 * Auto-scrolling transcript display with "Jump to live" functionality
 * Mimics iOS Notes with smooth text updates
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { ArrowDown } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/colors';
import { RecordingState } from '@/types/streaming';

interface TeleprompterTranscriptProps {
  /** Stable finalized transcript text */
  finalText: string;
  /** Currently updating partial text */
  partialText: string;
  /** Current recording state */
  recordingState: RecordingState;
  /** Placeholder text when empty */
  placeholder?: string;
}

const SCROLL_THRESHOLD = 50; // Pixels from bottom to consider "at bottom"
const AUTOSCROLL_DEBOUNCE = 100; // ms to wait before auto-scrolling

export function TeleprompterTranscript({
  finalText,
  partialText,
  recordingState,
  placeholder = 'Tap record to start transcribing...',
}: TeleprompterTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAutoscrollEnabled, setIsAutoscrollEnabled] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  // Animation for new text
  const newTextOpacity = useSharedValue(1);

  // Track if user is manually scrolling
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll events
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const isAtBottom =
        contentOffset.y >= contentSize.height - layoutMeasurement.height - SCROLL_THRESHOLD;

      // If user scrolled away from bottom while recording
      if (!isAtBottom && isAutoscrollEnabled && recordingState === 'recognizing') {
        isUserScrollingRef.current = true;
        setIsAutoscrollEnabled(false);
        setShowJumpButton(true);
      }

      // If user scrolled back to bottom
      if (isAtBottom && !isAutoscrollEnabled) {
        // Debounce to avoid flickering
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          if (isUserScrollingRef.current) {
            isUserScrollingRef.current = false;
            setIsAutoscrollEnabled(true);
            setShowJumpButton(false);
          }
        }, 300);
      }
    },
    [isAutoscrollEnabled, recordingState]
  );

  // Auto-scroll when new text arrives
  useEffect(() => {
    if (isAutoscrollEnabled && (finalText || partialText)) {
      const scrollTimeout = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, AUTOSCROLL_DEBOUNCE);

      return () => clearTimeout(scrollTimeout);
    }
  }, [finalText, partialText, isAutoscrollEnabled]);

  // Flash animation when new final text arrives
  useEffect(() => {
    if (finalText) {
      newTextOpacity.value = withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [finalText, newTextOpacity]);

  // Jump to live handler
  const handleJumpToLive = useCallback(() => {
    isUserScrollingRef.current = false;
    setIsAutoscrollEnabled(true);
    setShowJumpButton(false);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Handle content size change
  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    setContentHeight(h);
  }, []);

  // Handle layout
  const handleLayout = useCallback((event: any) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  const isEmpty = !finalText && !partialText;
  const isIdle = recordingState === 'idle';
  const isProcessing = recordingState === 'processing';

  // Animated style for final text
  const finalTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: newTextOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEmpty && isIdle ? (
          <Text style={styles.placeholder}>{placeholder}</Text>
        ) : (
          <View style={styles.transcriptContainer}>
            {/* Final (stable) text */}
            {finalText && (
              <Animated.Text style={[styles.finalText, finalTextAnimatedStyle]}>
                {finalText}
              </Animated.Text>
            )}
            
            {/* Partial (updating) text */}
            {partialText && (
              <Animated.Text
                entering={FadeIn.duration(150)}
                style={styles.partialText}
              >
                {finalText ? ' ' : ''}{partialText}
              </Animated.Text>
            )}
            
            {/* Processing indicator */}
            {isProcessing && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.processingIndicator}
              >
                <Text style={styles.processingText}>Finalizing transcript...</Text>
              </Animated.View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Jump to live button */}
      {showJumpButton && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.jumpButtonContainer}
        >
          <Pressable
            onPress={handleJumpToLive}
            style={({ pressed }) => [
              styles.jumpButton,
              pressed && styles.jumpButtonPressed,
            ]}
          >
            <ArrowDown size={14} color="#FFFFFF" />
            <Text style={styles.jumpButtonText}>Jump to live</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  placeholder: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 60,
  },
  transcriptContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  finalText: {
    fontSize: 20,
    lineHeight: 32,
    color: colors.textPrimary,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  partialText: {
    fontSize: 20,
    lineHeight: 32,
    color: colors.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  processingIndicator: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  processingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  jumpButtonContainer: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  jumpButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  jumpButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
