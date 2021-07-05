import {
  window,
  Uri,
  commands,
  TextEditor,
  Range,
  TextEditorDecorationType,
  TextEditorRevealType,
} from 'vscode'
import { ProjectTreeItem } from './projectTreeItem'

export let highlightStyle: TextEditorDecorationType =
  window.createTextEditorDecorationType({
    color: 'rgba(255, 255, 255, 0.2)',
  })

export async function highlightEditor(
  editor: TextEditor | undefined = window.activeTextEditor,
  slideItem: ProjectTreeItem | null,
): Promise<void> {
  if (editor && slideItem) {
    unHighlightActiveEditor()
    let ranges: Range[] = []
    if (slideItem.slideFilePath === editor?.document.fileName) {
      const ducumentTotalLine = editor.document.lineCount
      const slideHighlightLines = new Set(slideItem.highlightLines)
      const minLineNum = Math.min(...slideHighlightLines) || 0
      for (let i: number = 0; i < ducumentTotalLine; i++) {
        if (!slideHighlightLines.has(i)) {
          ranges.push(new Range(i, 0, i + 1, 0))
        }
      }
      // scroll highlight code to editor view center
      editor.revealRange(
        new Range(minLineNum, 0, minLineNum + 1, 0),
        TextEditorRevealType.InCenterIfOutsideViewport,
      )
      // highlight lines
      editor.setDecorations(highlightStyle, ranges)
      // style.dispose()
    }
  } else {
  }
}

export function unHighlightActiveEditor() {
  const activeEditor = window.activeTextEditor
  if (activeEditor) {
    activeEditor.setDecorations(highlightStyle, [])
  }
}
