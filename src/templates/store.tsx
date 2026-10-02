import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { createWorkspace } from './data'
import { workspaceSchema, type Workspace } from './schema'
import { usePersistentStore } from './persistent-store'

export const STORAGE_KEY = 'vagabond-template-workspace-v1'
type WorkspaceStore = {
  workspace: Workspace
  setWorkspace: Dispatch<SetStateAction<Workspace>>
  persistent: boolean
}
const WorkspaceContext = createContext<WorkspaceStore | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const {
    data: workspace,
    setData: setWorkspace,
    persistent,
  } = usePersistentStore({
    key: STORAGE_KEY,
    schema: workspaceSchema,
    createDefault: createWorkspace,
  })
  const context = useMemo(
    () => ({ workspace, setWorkspace, persistent }),
    [workspace, setWorkspace, persistent],
  )
  return <WorkspaceContext.Provider value={context}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('Templates must be rendered inside WorkspaceProvider.')
  return context
}
