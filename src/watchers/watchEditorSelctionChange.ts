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
    const playStatusInfo = GlobalState.getInPlayingStatusInfo()
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
  const slideHighlightLines = new Set<number>()

  // set slideFilePath
  currentOptSlide &&
    window.activeTextEditor?.document.fileName &&
    (currentOptSlide.slideFilePath = window.activeTextEditor?.document.fileName)

  // record line num
  selections.forEach((selection) => {
    for (let i: number = selection.start.line; i <= selection.end.line; i++) {
      slideHighlightLines.add(i)
    }
  })
  currentOptSlide &&
    (currentOptSlide.highlightLines = Array.from(slideHighlightLines))

  highlightEditor(window.activeTextEditor, currentOptSlide)
}

/**
 * project is playing
 */
function handleSlideRelativeSelectionChnage(): void {}
