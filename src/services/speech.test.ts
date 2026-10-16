import { buildSegments } from './speech';

jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn() }));

describe('buildSegments', () => {
  it('joins consecutive words in the same language into one natural utterance', () => {
    const segs = buildSegments(
      [
        { id: 'a', text: 'I want' },
        { id: 'b', text: 'more' },
        { id: 'c', text: 'juice' },
      ],
      'en-GB',
      false,
    );
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({ kind: 'tts', text: 'I want more juice', lang: 'en-GB', ids: ['a', 'b', 'c'], offsets: [0, 7, 12] });
  });

  it('splits when the language changes and keeps the user region for their own language', () => {
    const segs = buildSegments(
      [
        { id: 'a', text: 'hello', lang: 'en' },
        { id: 'b', text: 'abuela', lang: 'es-ES' },
        { id: 'c', text: 'please' },
      ],
      'en-IE',
      false,
    );
    expect(segs.map((s) => (s.kind === 'tts' ? s.lang : 'audio'))).toEqual(['en-IE', 'es-ES', 'en-IE']);
  });

  it('plays recorded clips as their own segment', () => {
    const segs = buildSegments(
      [
        { id: 'a', text: 'I want' },
        { id: 'b', text: 'Grandma', audio: 'aud_1.m4a' },
      ],
      'en-GB',
      false,
    );
    expect(segs.map((s) => s.kind)).toEqual(['tts', 'audio']);
  });

  it('adds a question mark without rewriting the words', () => {
    const segs = buildSegments([{ id: 'a', text: 'more juice' }], 'en-GB', true);
    expect(segs[0]).toMatchObject({ text: 'more juice?' });
  });

  it('keeps repeated words (communication can be repetitive)', () => {
    const segs = buildSegments(
      [
        { id: 'a', text: 'no' },
        { id: 'b', text: 'no' },
        { id: 'c', text: 'no' },
      ],
      'en-GB',
      false,
    );
    expect(segs[0]).toMatchObject({ text: 'no no no' });
  });
});
