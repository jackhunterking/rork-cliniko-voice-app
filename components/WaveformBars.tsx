/**
 * WaveformBars Component
 * Animated waveform visualization that reacts to audio amplitude
 * Uses react-native-reanimated for smooth 60fps animations
 */

import React, { useEffect, useMemo } from 'react';
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
  /** Number of bars to display */
  barCount?: number;
  /** Color of the bars */
  barColor?: string;
  /** Custom container style */
  style?: ViewStyle;
}

const BAR_MIN_HEIGHT = 4;
const BAR_MAX_HEIGHT = 32;

export function WaveformBars({
  isRecording,
  amplitude = 0,
  isProcessing = false,
  barCount = 9,
  barColor = colors.primary,
  style,
}: WaveformBarsProps) {
  // Create shared values for each bar
  const barHeights = useMemo(
    () => Array.from({ length: barCount }, () => useSharedValue(BAR_MIN_HEIGHT)),
    [barCount]
  );

  // Processing animation shared value
  const processingPhase = useSharedValue(0);

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
  }, [isRecording, isProcessing, barHeights, processingPhase]);

  // Update bar heights based on amplitude
  useEffect(() => {
    if (!isRecording || isProcessing) {
      return;
    }

    // Create variation for visual interest
    const middleIndex = Math.floor(barCount / 2);
    
    barHeights.forEach((height, index) => {
      // Bars in the middle are taller
      const distanceFromMiddle = Math.abs(index - middleIndex);
      const positionFactor = 1 - (distanceFromMiddle / middleIndex) * 0.4;
      
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
  }, [amplitude, isRecording, isProcessing, barCount, barHeights]);

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
          totalBars={barCount}
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
