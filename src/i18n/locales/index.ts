import de from './de';
import en, { type Locale } from './en';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import nl from './nl';
import pl from './pl';
import pt from './pt';
import zh from './zh';

/** All bundled locales. Each must satisfy the English `Locale` shape. */
export const LOCALES: Record<string, Locale> = { en, es, fr, de, it, pt, nl, pl, zh, ja };
