import useIPStore from '../../store/useIPStore'
import SearchPanel from './SearchPanel'
import MaterialLibrary from './MaterialLibrary'

export default function DynamicDrawer() {
  const { workflowPhase } = useIPStore()

  // 'moodboard' → 搜索面板
  // 'extracting' | 'library' | 'composing' → 素材库
  if (workflowPhase === 'moodboard') {
    return <SearchPanel />
  }
  return <MaterialLibrary />
}
