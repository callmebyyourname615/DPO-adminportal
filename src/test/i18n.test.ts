import { describe, expect, it } from 'vitest';
import { LOCALE_TAG, formatDate, t } from '@/lib/i18n';

describe('Lao locale', () => {
  it('uses Lao translations and date formatting', () => {
    expect(LOCALE_TAG).toBe('lo-LA');
    expect(t('save')).toBe('ບັນທຶກ');
    expect(formatDate('2025-06-15T12:00:00Z')).toBe(new Date('2025-06-15T12:00:00Z').toLocaleDateString('lo-LA', { year: 'numeric', month: 'short', day: 'numeric' }));
    expect(formatDate('invalid')).toBe('—');
  });
});
