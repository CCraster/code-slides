import { ProjectTreeItem } from './projectTreeItem'
export interface PlayingStatusInfo {
  inPlayingNode: ProjectTreeItem
  currentSlideIndex: number
}

export interface FocusNodeInfo {
  id: string
  isHighlight: boolean
}

export interface HighlightOption {
  notRevealEditorRange: boolean
}
