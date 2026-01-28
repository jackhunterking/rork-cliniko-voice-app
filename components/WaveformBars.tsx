/**
 * WaveformBars Component
 * Animated waveform visualization that reacts to audio amplitude
 * Uses react-native-reanimated for smooth 60fps animations
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

interface WaveformBarsProps {
  /** Whether currently recording */
  isRecording: boolean;
  /** Audio amplitude level 0-100 */
  amplitude?: number;
  /** Processing state (shows pulsing animation) */
  isProcessing?: boolean;
  /** Number of bars to display (max 9) */
  barCount?: number;
  /** Color of the bars */
  barColor?: string;
  /** Custom container style */
  style?: ViewStyle;
}

const BAR_MIN_HEIGHT = 4;
const BAR_MAX_HEIGHT = 32;
const MAX_BARS = 9;

export function WaveformBars({
  isRecording,
  amplitude = 0,
  isProcessing = false,
  barCount = 5,
  barColor = colors.primary,
  style,
}: WaveformBarsProps) {
  // Clamp barCount to max 9 bars
  const actualBarCount = Math.min(Math.max(1, barCount), MAX_BARS);
  
  // Create fixed shared values for each possible bar (max 9)
  // This is the correct way to handle dynamic arrays with hooks
  const bar0 = useSharedValue(BAR_MIN_HEIGHT);
  const bar1 = useSharedValue(BAR_MIN_HEIGHT);
  const bar2 = useSharedValue(BAR_MIN_HEIGHT);
  const bar3 = useSharedValue(BAR_MIN_HEIGHT);
  const bar4 = useSharedValue(BAR_MIN_HEIGHT);
  const bar5 = useSharedValue(BAR_MIN_HEIGHT);
  const bar6 = useSharedValue(BAR_MIN_HEIGHT);
  const bar7 = useSharedValue(BAR_MIN_HEIGHT);
  const bar8 = useSharedValue(BAR_MIN_HEIGHT);
  
  // Processing animation shared value
  const processingPhase = useSharedValue(0);

  // Array reference for easier iteration
  const barHeightsRef = useRef([bar0, bar1, bar2, bar3, bar4, bar5, bar6, bar7, bar8]);
  const barHeights = barHeightsRef.current.slice(0, actualBarCount);

  // Handle recording state changes
  useEffect(() => {
    if (isProcessing) {
      // Slow pulse animation for processing state
      processingPhase.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        false
      );
    } else if (!isRecording) {
      // Reset all bars to minimum when not recording
      cancelAnimation(processingPhase);
      processingPhase.value = 0;
      
      barHeights.forEach((height) => {
        height.value = withTiming(BAR_MIN_HEIGHT, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
      });
    }
  }, [isRecording, isProcessing]);

  // Update bar heights based on amplitude
  useEffect(() => {
    if (!isRecording || isProcessing) {
      return;
    }

    // Create variation for visual interest
    const middleIndex = Math.floor(actualBarCount / 2);
    
    barHeights.forEach((height, index) => {
      // Bars in the middle are taller
      const distanceFromMiddle = Math.abs(index - middleIndex);
      const positionFactor = 1 - (distanceFromMiddle / Math.max(middleIndex, 1)) * 0.4;
      
      // Add some randomness for organic feel
      const randomFactor = 0.8 + Math.random() * 0.4;
      
      // Calculate target height based on amplitude
      const normalizedAmplitude = amplitude / 100;
      const targetHeight =
        BAR_MIN_HEIGHT +
        (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT) *
        normalizedAmplitude *
        positionFactor *
        randomFactor;

      // Use spring for natural bouncy feel
      height.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 200,
        mass: 0.5,
      });
    });
  }, [amplitude, isRecording, isProcessing, actualBarCount]);

  return (
    <View style={[styles.container, style]}>
      {barHeights.map((height, index) => (
        <AnimatedBar
          key={index}
          height={height}
          processingPhase={processingPhase}
          isProcessing={isProcessing}
          barColor={barColor}
          index={index}
          totalBars={actualBarCount}
        />
      ))}
    </View>
  );
}

interface AnimatedBarProps {
  height: Animated.SharedValue<number>;
  processingPhase: Animated.SharedValue<number>;
  isProcessing: boolean;
  barColor: string;
  index: number;
  totalBars: number;
}

function AnimatedBar({
  height,
  processingPhase,
  isProcessing,
  barColor,
  index,
  totalBars,
}: AnimatedBarProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (isProcessing) {
      // Processing: wave animation
      const middleIndex = Math.floor(totalBars / 2);
      const distanceFromMiddle = Math.abs(index - middleIndex);
      const delay = distanceFromMiddle * 0.1;
      
      // Create a wave effect
      const phase = (processingPhase.value + delay) % 1;
      const processingHeight = interpolate(
        phase,
        [0, 0.5, 1],
        [BAR_MIN_HEIGHT, BAR_MAX_HEIGHT * 0.6, BAR_MIN_HEIGHT]
      );
      
      return {
        height: processingHeight,
      };
    }

    return {
      height: height.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: barColor },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_MAX_HEIGHT + 8,
    gap: 3,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    minHeight: BAR_MIN_HEIGHT,
  },
});
