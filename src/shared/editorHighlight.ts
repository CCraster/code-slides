import {
  window,
  TextEditor,
  Range,
  TextEditorDecorationType,
  TextEditorRevealType,
} from 'vscode'
import { ProjectTreeItem } from './projectTreeItem'
import { CodeSlidesConfig } from './codeSlidesConfig'
import { HIGHLIGHT_MODE_MAP } from '../shared/constants'

let lineWeakenStyle: TextEditorDecorationType =
  window.createTextEditorDecorationType({})
let lineStrengthenStyle: TextEditorDecorationType =
  window.createTextEditorDecorationType({})

export async function highlightEditor(
  editor: TextEditor | undefined = window.activeTextEditor,
  slideItem: ProjectTreeItem | null,
): Promise<void> {
  if (editor && slideItem) {
    const highlightMode = CodeSlidesConfig.getHighlightMode()
    const lineWeakenColor = CodeSlidesConfig.getLineWeakenColor()
    const lineStrengthenColor = CodeSlidesConfig.getLineStrengthenColor()
    let weakenRanges: Range[] = []
    let strengthenRanges: Range[] = []

    unHighlightActiveEditor()
    lineWeakenStyle = window.createTextEditorDecorationType({
      color: lineWeakenColor,
    })
    lineStrengthenStyle = window.createTextEditorDecorationType({
      color: lineStrengthenColor,
    })

    if (slideItem.slideFilePath === editor?.document.fileName) {
      const ducumentTotalLine = editor.document.lineCount
      let slideHighlightLines = new Set<number>()
      slideItem.highlightLines.forEach((item) => {
        for (let i: number = item[0]; i <= item[1]; i++) {
          slideHighlightLines.add(i)
        }
      })
      const minLineNum = Math.min(...slideHighlightLines) || 0
      for (let i: number = 0; i < ducumentTotalLine; i++) {
        if (slideHighlightLines.has(i)) {
          strengthenRanges.push(new Range(i, 0, i + 1, 0))
        } else {
          weakenRanges.push(new Range(i, 0, i + 1, 0))
        }
      }
      // scroll highlight code to editor view center
      editor.revealRange(
        new Range(minLineNum, 0, minLineNum + 1, 0),
        TextEditorRevealType.InCenterIfOutsideViewport,
      )
      // highlight lines
      // setTimeout(() => {
      //   if (highlightMode === HIGHLIGHT_MODE_MAP.weaken) {
      //     editor.setDecorations(lineWeakenStyle, weakenRanges)
      //   } else if (highlightMode === HIGHLIGHT_MODE_MAP.strengthen) {
      //     editor.setDecorations(lineStrengthenStyle, strengthenRanges)
      //   } else {
      //     editor.setDecorations(lineWeakenStyle, weakenRanges)
      //     editor.setDecorations(lineStrengthenStyle, strengthenRanges)
      //   }
      // }, 100)
      if (highlightMode === HIGHLIGHT_MODE_MAP.weaken) {
        editor.setDecorations(lineWeakenStyle, weakenRanges)
      } else if (highlightMode === HIGHLIGHT_MODE_MAP.strengthen) {
        editor.setDecorations(lineStrengthenStyle, strengthenRanges)
      } else {
        editor.setDecorations(lineWeakenStyle, weakenRanges)
        editor.setDecorations(lineStrengthenStyle, strengthenRanges)
      }
      // style.dispose()
    }
  } else {
  }
}

export function unHighlightActiveEditor() {
  const activeEditor = window.activeTextEditor
  if (activeEditor) {
    activeEditor.setDecorations(lineWeakenStyle, [])
    activeEditor.setDecorations(lineStrengthenStyle, [])
  }
}
