import {
  ExtensionContext,
  window,
  TextEditorSelectionChangeEvent,
  Selection,
} from 'vscode'
import { ProjectTreeItem } from '../shared/projectTreeItem'
import {
  highlightEditor,
  unHighlightActiveEditor,
} from '../shared/editorHighlight'
import { GlobalState } from '../shared/globalState'

export function watchActiveTextEditorChange(context: ExtensionContext) {
  window.onDidChangeActiveTextEditor((editor) => {
    const playStatusInfo = GlobalState.getInPlayingStatusInfo()
    const currentOptSlide = GlobalState.getCurrentOptSlide()
    if (currentOptSlide) {
      // handleSlideRelativeSelectionChange(Array.from(e.selections))
    } else if (playStatusInfo) {
      const inPlaySlide: ProjectTreeItem =
        playStatusInfo.inPlayingNode.children[playStatusInfo.currentSlideIndex]
      highlightEditor(editor, inPlaySlide)
    }
  })
}
