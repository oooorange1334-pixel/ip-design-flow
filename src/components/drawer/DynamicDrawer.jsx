import useProject from '../../store/useProject'
import SearchPanel from './SearchPanel'
import MaterialLibrary from './MaterialLibrary'

export default function DynamicDrawer() {
  const { workflowPhase } = useProject()

  // 'moodboard' → 搜索面板
  // 'extracting' | 'library' | 'composing' → 素材库
  if (workflowPhase === 'moodboard') {
    return <SearchPanel />
  }
  return <MaterialLibrary />
}
