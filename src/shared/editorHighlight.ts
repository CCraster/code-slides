import {
  window,
  Uri,
  commands,
  TextEditor,
  Range,
  TextEditorDecorationType,
} from 'vscode'
import { ProjectTreeItem } from './projectTreeItem'

export let highlightStyle: TextEditorDecorationType =
  window.createTextEditorDecorationType({
    color: 'rgba(255, 255, 255, 0.2)',
  })

export async function highlightEditor(
  editor: TextEditor | undefined = window.activeTextEditor,
  slideItem?: ProjectTreeItem | null,
): Promise<void> {
  if (slideItem) {
    let uri = Uri.file(slideItem.slideFilePath || '')
    let ranges: Range[] = []
    if (slideItem.slideFilePath !== editor?.document.fileName) {
      return
    }
    if (editor && slideItem.slideFilePath === editor?.document.fileName) {
      const ducumentTotalLine = editor.document.lineCount
      const slideHighLines = new Set(slideItem.highlightLines)
      for (let i: number = 0; i < ducumentTotalLine; i++) {
        if (!slideHighLines.has(i)) {
          ranges.push(new Range(i, 0, i + 1, 0))
        }
      }
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
