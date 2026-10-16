/**
 * Sending a message to other apps, and reading a copied message.
 *
 * WhatsApp: the app's own `whatsapp://send?text=` link opens WhatsApp with the
 * message filled in, ready to choose a chat. If WhatsApp is not installed we fall
 * back to the system share sheet rather than WhatsApp's web link (wa.me), so the
 * message never goes through a browser.
 */
import * as Clipboard from 'expo-clipboard';
import { Linking, Share } from 'react-native';

export function whatsappUrl(text: string) {
  return `whatsapp://send?text=${encodeURIComponent(text)}`;
}

export async function shareText(text: string) {
  try {
    await Share.share({ message: text });
  } catch {
    // dismissed or unavailable
  }
}

/** Opens WhatsApp with the message; returns false if it had to use the share sheet instead. */
export async function shareToWhatsApp(text: string): Promise<boolean> {
  try {
    await Linking.openURL(whatsappUrl(text));
    return true;
  } catch {
    await shareText(text);
    return false;
  }
}

export async function copyText(text: string) {
  await Clipboard.setStringAsync(text);
}

export async function readClipboard(): Promise<string> {
  try {
    return (await Clipboard.getStringAsync()).trim();
  } catch {
    return '';
  }
}
