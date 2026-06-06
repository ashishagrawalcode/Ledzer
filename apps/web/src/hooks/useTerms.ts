import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getDictionary, getGroupLabel, TermDictionary } from '@/lib/dictionary'

export function useTerms() {
  const mode = usePreferencesStore((s) => s.terminologyMode)
  const dict = getDictionary(mode)

  // t('key') returns the translated string
  const t = (key: keyof TermDictionary) => dict[key]
  
  // group('ASSET') returns the translated group name
  const group = (groupName: string) => getGroupLabel(groupName, mode)

  return { t, group, mode }
}