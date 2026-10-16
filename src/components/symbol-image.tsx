import { Image } from 'expo-image';
import { memo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { symbolId, symbolSource } from '@/data/symbols';
import { mediaUri } from '@/services/media';
import { useApp } from '@/store/app-store';

export interface SymbolImageProps {
  /** Canonical symbol id (e.g. "1f600"). */
  symbol?: string | null;
  /** Emoji character, converted to an id (handy for UI decoration). */
  emoji?: string;
  photo?: string | null;
  size: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shows a personal photo if there is one, otherwise the bundled 3D symbol. Decorative for screen readers. */
export const SymbolImage = memo(function SymbolImage({ symbol, emoji, photo, size, rounded, style }: SymbolImageProps) {
  const tone = useApp((s) => s.settings.skinTone);
  const uri = photo ? mediaUri(photo) : null;
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: rounded ?? size * 0.22 }, style as object]}
        contentFit="cover"
        transition={120}
        accessible={false}
      />
    );
  }
  const src = symbolSource(symbol ?? (emoji ? symbolId(emoji) : null), tone);
  if (!src) return <View style={[{ width: size, height: size }, style]} />;
  return (
    <Image
      source={src}
      style={[{ width: size, height: size }, style as object]}
      contentFit="contain"
      accessible={false}
    />
  );
});
