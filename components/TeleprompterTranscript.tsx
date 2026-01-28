/**
 * TeleprompterTranscript Component
 * Fixed-height auto-scrolling transcript display with streaming text
 * Text streams into view and auto-scrolls to latest content
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
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
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
  /** Fixed height for container (optional, defaults to flex) */
  fixedHeight?: number;
  /** Whether to show in compact mode */
  compact?: boolean;
}

const SCROLL_THRESHOLD = 50;
const AUTOSCROLL_DEBOUNCE = 80;

export function TeleprompterTranscript({
  finalText,
  partialText,
  recordingState,
  placeholder = 'Tap record to start transcribing...',
  fixedHeight,
  compact = false,
}: TeleprompterTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAutoscrollEnabled, setIsAutoscrollEnabled] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  // Animation for new text
  const newTextOpacity = useSharedValue(1);
  const cursorOpacity = useSharedValue(1);

  // Track if user is manually scrolling
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextLengthRef = useRef(0);

  // Cursor blink animation
  useEffect(() => {
    if (recordingState === 'recognizing' || recordingState === 'listening') {
      cursorOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      cursorOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [recordingState, cursorOpacity]);

  // Handle scroll events
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const isAtBottom =
        contentOffset.y >= contentSize.height - layoutMeasurement.height - SCROLL_THRESHOLD;

      // If user scrolled away from bottom while recording
      if (!isAtBottom && isAutoscrollEnabled && 
          (recordingState === 'recognizing' || recordingState === 'listening')) {
        isUserScrollingRef.current = true;
        setIsAutoscrollEnabled(false);
        setShowJumpButton(true);
      }

      // If user scrolled back to bottom
      if (isAtBottom && !isAutoscrollEnabled) {
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
    const currentLength = (finalText + partialText).length;
    const hasNewText = currentLength > lastTextLengthRef.current;
    lastTextLengthRef.current = currentLength;

    if (isAutoscrollEnabled && hasNewText && (finalText || partialText)) {
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
        withTiming(0.7, { duration: 80 }),
        withTiming(1, { duration: 150 })
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
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  const isEmpty = !finalText && !partialText;
  const isIdle = recordingState === 'idle';
  const isRecording = recordingState === 'listening' || recordingState === 'recognizing';
  const isProcessing = recordingState === 'processing';

  // Animated styles
  const finalTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: newTextOpacity.value,
  }));

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <View style={[
      styles.container,
      fixedHeight ? { height: fixedHeight } : { flex: 1 },
    ]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          compact && styles.scrollContentCompact,
        ]}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isEmpty && isIdle ? (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholder, compact && styles.placeholderCompact]}>
              {placeholder}
            </Text>
          </View>
        ) : isEmpty && isRecording ? (
          <View style={styles.listeningContainer}>
            <Animated.View style={[styles.listeningDots]}>
              <View style={styles.listeningDot} />
              <View style={[styles.listeningDot, styles.listeningDotDelay1]} />
              <View style={[styles.listeningDot, styles.listeningDotDelay2]} />
            </Animated.View>
            <Text style={styles.listeningText}>Listening...</Text>
          </View>
        ) : (
          <View style={styles.transcriptContainer}>
            {/* Final (stable) text */}
            {finalText && (
              <Animated.Text 
                style={[
                  styles.finalText, 
                  compact && styles.finalTextCompact,
                  finalTextAnimatedStyle
                ]}
              >
                {finalText}
              </Animated.Text>
            )}
            
            {/* Partial (updating) text */}
            {partialText && (
              <Animated.Text
                entering={FadeIn.duration(100)}
                style={[styles.partialText, compact && styles.partialTextCompact]}
              >
                {finalText ? ' ' : ''}{partialText}
              </Animated.Text>
            )}

            {/* Blinking cursor while recording */}
            {isRecording && (
              <Animated.Text style={[styles.cursor, cursorAnimatedStyle]}>
                |
              </Animated.Text>
            )}
            
            {/* Processing indicator */}
            {isProcessing && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.processingIndicator}
              >
                <Text style={styles.processingText}>Finalizing...</Text>
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
    position: 'relative',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  scrollContentCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  placeholderCompact: {
    fontSize: 15,
    lineHeight: 22,
  },
  listeningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  listeningDots: {
    flexDirection: 'row',
    gap: 8,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  listeningDotDelay1: {
    opacity: 0.6,
  },
  listeningDotDelay2: {
    opacity: 0.8,
  },
  listeningText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  transcriptContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  finalText: {
    fontSize: 19,
    lineHeight: 30,
    color: colors.textPrimary,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  finalTextCompact: {
    fontSize: 16,
    lineHeight: 24,
  },
  partialText: {
    fontSize: 19,
    lineHeight: 30,
    color: colors.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  partialTextCompact: {
    fontSize: 16,
    lineHeight: 24,
  },
  cursor: {
    fontSize: 19,
    lineHeight: 30,
    color: colors.primary,
    fontWeight: '300',
    marginLeft: 1,
  },
  processingIndicator: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
  },
  processingText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
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
