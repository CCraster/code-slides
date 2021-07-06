import {
  ExtensionContext,
  window,
  TextEditorSelectionChangeEvent,
  Selection,
} from 'vscode'
import { highlightEditor } from '../shared/editorHighlight'
import { GlobalState } from '../shared/globalState'

export function wacthEditorSelectionChange(context: ExtensionContext) {
  window.onDidChangeTextEditorSelection((e: TextEditorSelectionChangeEvent) => {
    const currentOptSlide = GlobalState.getCurrentOptSlide()
    if (currentOptSlide) {
      handleSlideRelativeSelectionChange(Array.from(e.selections))
    }
  })
}

/**
 * slide create & change
 */
function handleSlideRelativeSelectionChange(
  selections: Array<Selection>,
): void {
  const currentOptSlide = GlobalState.getCurrentOptSlide()
  const slideHighlightLines: any = []

  // set slideFilePath
  currentOptSlide &&
    window.activeTextEditor?.document.fileName &&
    (currentOptSlide.slideFilePath = window.activeTextEditor?.document.fileName)

  // record line num
  selections.forEach((selection) => {
    slideHighlightLines.push([selection.start.line, selection.end.line])
  })
  currentOptSlide && (currentOptSlide.highlightLines = slideHighlightLines)

  highlightEditor(window.activeTextEditor, currentOptSlide)
}
