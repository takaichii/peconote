const TAG_COLORS: Array<{ backgroundColor: string; color: string }> = [
  { backgroundColor: '#EEF2FF', color: '#4338CA' },
  { backgroundColor: '#FDF2F8', color: '#9D174D' },
  { backgroundColor: '#ECFDF5', color: '#065F46' },
  { backgroundColor: '#FFF7ED', color: '#9A3412' },
  { backgroundColor: '#EFF6FF', color: '#1D4ED8' },
  { backgroundColor: '#FEF9C3', color: '#854D0E' },
  { backgroundColor: '#F0FDF4', color: '#166534' },
  { backgroundColor: '#FDF4FF', color: '#7E22CE' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

export function getTagColor(tag: string) {
  return TAG_COLORS[hashString(tag) % TAG_COLORS.length];
}
