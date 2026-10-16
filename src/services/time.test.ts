import { addMinutes, parseTime, reminderAt, sortByTime, toHHMM } from './time';

describe('times of day', () => {
  it('parses and formats HH:MM', () => {
    expect(parseTime('08:05')).toEqual({ hour: 8, minute: 5 });
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('8:05')).toBeNull();
    expect(toHHMM({ hour: 7, minute: 0 })).toBe('07:00');
  });

  it('wraps round midnight', () => {
    expect(addMinutes({ hour: 23, minute: 50 }, 20)).toEqual({ hour: 0, minute: 10 });
    expect(reminderAt('00:05', 10)).toEqual({ hour: 23, minute: 55 });
    expect(reminderAt('12:30', 0)).toEqual({ hour: 12, minute: 30 });
  });

  it('sorts timed steps first and keeps untimed ones in order', () => {
    const steps = [{ id: 'a', time: null }, { id: 'b', time: '12:00' }, { id: 'c', time: '07:30' }, { id: 'd' }];
    expect(sortByTime(steps).map((s) => s.id)).toEqual(['c', 'b', 'a', 'd']);
  });
});
