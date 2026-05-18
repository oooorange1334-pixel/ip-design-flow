// 便捷 hook：读取当前项目数据，避免每个组件都写 currentProject()
import useIPStore from './useIPStore'

export default function useProject() {
  const store = useIPStore()
  const proj  = store.currentProject()
  return {
    // 当前项目数据
    proj,
    ipContext:       proj?.ipContext       ?? {},
    workflowPhase:   proj?.workflowPhase   ?? 'moodboard',
    activeStep:      proj?.activeStep      ?? 0,
    moodboard:       proj?.moodboard       ?? { searchQuery: '', isSearching: false },
    materialLibrary: proj?.materialLibrary ?? { form: [], cmf: [], motif: [] },
    knowledgeGraph:  proj?.knowledgeGraph  ?? { isExtracting: false, sourceLabel: '', uploadedFiles: [] },
    lockedElements:  proj?.lockedElements  ?? [],
    historyNodes:    proj?.historyNodes    ?? [],
    rfNodes:         proj?.rfNodes         ?? [],
    rfEdges:         proj?.rfEdges         ?? [],
    // store actions（直接透传）
    ...store,
  }
}
