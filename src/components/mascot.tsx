/**
 * "Vo", Voca's mascot: a friendly speech bubble with a soft 3D clay look.
 *
 * Motion is gentle and slow (float, blink, talk). With reduced motion the
 * character is still; nothing flashes.
 */
import { memo, useEffect, useId } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { lighten, mix, useTheme } from '@/theme';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BODY =
  'M100 29 C140 29 172 58 172 95 C172 133 140 161 100 161 C92 161 84 160 77 158 L52 178 C49 180 45 178 46 175 L57 150 C38 137 28 117 28 95 C28 58 60 29 100 29 Z';

export interface MascotProps {
  size?: number;
  talking?: boolean;
  /** Override body colour (defaults to the theme primary). */
  color?: string;
  edgeColor?: string;
  float?: boolean;
  sparkle?: boolean;
}

export const Mascot = memo(function Mascot({
  size = 160,
  talking = false,
  color,
  edgeColor,
  float = true,
  sparkle = true,
}: MascotProps) {
  const theme = useTheme();
  const reduced = theme.reducedMotion;
  const base = color ?? theme.colors.primary;
  const edge = edgeColor ?? theme.colors.primaryEdge;
  const light = lighten(base, 0.55);
  const mid = lighten(base, 0.12);
  const ink = '#1F1B4D';
  // Gradient ids are global on web; keep them unique per instance.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `vo-${name}-${uid}`;

  const lift = useSharedValue(0);
  const eyes = useSharedValue(1);
  const mouth = useSharedValue(0);
  const twinkle = useSharedValue(1);

  useEffect(() => {
    if (reduced || !float) {
      cancelAnimation(lift);
      lift.set(0);
      return;
    }
    const ease = Easing.bezier(0.45, 0, 0.55, 1);
    lift.set(
      withRepeat(withSequence(withTiming(1, { duration: 1800, easing: ease }), withTiming(0, { duration: 1800, easing: ease })), -1),
    );
    return () => cancelAnimation(lift);
  }, [reduced, float, lift]);

  useEffect(() => {
    // Blinking is kept even with reduced motion: it is tiny and makes the character feel alive.
    eyes.set(
      withRepeat(
        withSequence(withDelay(3400, withTiming(0.08, { duration: 90 })), withTiming(1, { duration: 120 })),
        -1,
      ),
    );
    if (!reduced && sparkle) {
      twinkle.set(withRepeat(withSequence(withTiming(0.55, { duration: 1300 }), withTiming(1, { duration: 1300 })), -1));
    }
    return () => {
      cancelAnimation(eyes);
      cancelAnimation(twinkle);
    };
  }, [eyes, twinkle, reduced, sparkle]);

  useEffect(() => {
    if (talking) {
      mouth.set(
        withRepeat(withSequence(withTiming(1, { duration: 150 }), withTiming(0.35, { duration: 150 })), -1, true),
      );
    } else {
      cancelAnimation(mouth);
      mouth.set(withTiming(0, { duration: 160 }));
    }
  }, [talking, mouth]);

  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -lift.get() * size * 0.05 }] }));
  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 - lift.get() * 0.14 }],
    opacity: 0.22 - lift.get() * 0.06,
  }));

  const leftEye = useAnimatedProps(() => ({ ry: 17 * eyes.get() }));
  const rightEye = useAnimatedProps(() => ({ ry: 17 * eyes.get() }));
  const leftPupil = useAnimatedProps(() => ({ ry: 9.5 * eyes.get() }));
  const rightPupil = useAnimatedProps(() => ({ ry: 9.5 * eyes.get() }));
  const glintL = useAnimatedProps(() => ({ opacity: eyes.get() > 0.6 ? 1 : 0 }));
  const glintR = useAnimatedProps(() => ({ opacity: eyes.get() > 0.6 ? 1 : 0 }));
  const mouthOpen = useAnimatedProps(() => ({ ry: 2 + mouth.get() * 9, opacity: mouth.get() > 0.02 ? 1 : 0 }));
  const smile = useAnimatedProps(() => ({ opacity: mouth.get() > 0.02 ? 0 : 1 }));
  const waves = useAnimatedProps(() => ({ opacity: mouth.get() * 0.9 }));
  const star = useAnimatedProps(() => ({ opacity: twinkle.get() }));

  return (
    <View style={{ width: size, height: size * 1.08, alignItems: 'center' }} accessible={false} importantForAccessibility="no-hide-descendants">
      <Animated.View style={bodyStyle}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id={id('body')} cx="38%" cy="30%" r="78%">
              <Stop offset="0" stopColor={light} />
              <Stop offset="0.55" stopColor={mid} />
              <Stop offset="1" stopColor={edge} />
            </RadialGradient>
            <RadialGradient id={id('cheek')} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FF7FA8" stopOpacity="0.75" />
              <Stop offset="1" stopColor="#FF7FA8" stopOpacity="0" />
            </RadialGradient>
            <ClipPath id={id('clip')}>
              <Path d={BODY} />
            </ClipPath>
            <RadialGradient id={id('shade')} cx="55%" cy="100%" r="60%">
              <Stop offset="0" stopColor={mix(edge, '#000000', 0.25)} stopOpacity="0.55" />
              <Stop offset="1" stopColor={mix(edge, '#000000', 0.25)} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={id('eye')} cx="45%" cy="40%" r="60%">
              <Stop offset="0" stopColor="#FFFFFF" />
              <Stop offset="1" stopColor="#E9E6FA" />
            </RadialGradient>
          </Defs>

          {/* body */}
          <Path d={BODY} fill={`url(#${id('body')})`} />
          {/* soft inner shade along the bottom, clipped to the body, for a clay-like 3D form */}
          <G clipPath={`url(#${id('clip')})`}>
            <Ellipse cx="112" cy="170" rx="92" ry="46" fill={`url(#${id('shade')})`} />
          </G>
          {/* specular highlights */}
          <Ellipse cx="70" cy="56" rx="22" ry="11" fill="#FFFFFF" opacity={0.5} transform="rotate(-28 70 56)" />
          <Circle cx="96" cy="42" r="4.5" fill="#FFFFFF" opacity={0.65} />

          {/* sound waves while talking */}
          <AnimatedPath animatedProps={waves} d="M181 78 Q190 95 181 112" stroke={light} strokeWidth={6} strokeLinecap="round" fill="none" />
          <AnimatedPath animatedProps={waves} d="M192 68 Q206 95 192 122" stroke={light} strokeWidth={5} strokeLinecap="round" fill="none" />

          {/* cheeks */}
          <Ellipse cx="58" cy="117" rx="14" ry="9" fill={`url(#${id('cheek')})`} />
          <Ellipse cx="142" cy="117" rx="14" ry="9" fill={`url(#${id('cheek')})`} />

          {/* eyes */}
          <G>
            <AnimatedEllipse animatedProps={leftEye} cx="76" cy="92" rx="15" ry="17" fill={`url(#${id('eye')})`} />
            <AnimatedEllipse animatedProps={rightEye} cx="124" cy="92" rx="15" ry="17" fill={`url(#${id('eye')})`} />
            <AnimatedEllipse animatedProps={leftPupil} cx="79" cy="95" rx="9" ry="9.5" fill={ink} />
            <AnimatedEllipse animatedProps={rightPupil} cx="127" cy="95" rx="9" ry="9.5" fill={ink} />
            <AnimatedCircle animatedProps={glintL} cx="83" cy="90" r="3.6" fill="#FFFFFF" />
            <AnimatedCircle animatedProps={glintR} cx="131" cy="90" r="3.6" fill="#FFFFFF" />
            <AnimatedCircle animatedProps={glintL} cx="75.5" cy="99" r="1.6" fill="#FFFFFF" />
            <AnimatedCircle animatedProps={glintR} cx="123.5" cy="99" r="1.6" fill="#FFFFFF" />
          </G>

          {/* mouth */}
          <AnimatedPath animatedProps={smile} d="M86 115 Q100 133 114 115 Q100 123 86 115 Z" fill={ink} />
          <AnimatedEllipse animatedProps={mouthOpen} cx="100" cy="121" rx="10" ry="6" fill={ink} />

          {/* sparkle */}
          {sparkle ? (
            <AnimatedPath
              animatedProps={star}
              d="M162 30 L166 41 L177 45 L166 49 L162 60 L158 49 L147 45 L158 41 Z"
              fill="#FFD25A"
            />
          ) : null}
        </Svg>
      </Animated.View>
      <Animated.View
        style={[
          {
            width: size * 0.52,
            height: size * 0.07,
            borderRadius: size,
            backgroundColor: theme.mode === 'dark' ? '#000' : edge,
            marginTop: -size * 0.04,
          },
          shadowStyle,
        ]}
      />
    </View>
  );
});
