import {
  window,
  TextEditor,
  Range,
  TextEditorDecorationType,
  TextEditorRevealType,
  DecorationRenderOptions,
} from 'vscode'
import { ProjectTreeItem } from './projectTreeItem'
import { CodeSlidesConfig } from './codeSlidesConfig'
import { HIGHLIGHT_MODE_MAP } from '../shared/constants'
import { HighlightOption } from './typed'

let lineWeakenStyle: TextEditorDecorationType =
  window.createTextEditorDecorationType({})
let lineStrengthenStyle: TextEditorDecorationType =
  window.createTextEditorDecorationType({})

export async function highlightEditor(
  editor: TextEditor | undefined = window.activeTextEditor,
  slideItem: ProjectTreeItem | null,
  options: HighlightOption = {
    notRevealEditorRange: false,
  },
): Promise<void> {
  if (
    editor &&
    slideItem &&
    slideItem.slideFilePath === editor?.document.fileName
  ) {
    const highlightMode = CodeSlidesConfig.getHighlightMode()
    const lineWeakenRenderOptions: DecorationRenderOptions =
      CodeSlidesConfig.getLineWeakenRenderOptions()
    const lineStrengthenRenderOptions: DecorationRenderOptions =
      CodeSlidesConfig.getLineStrengthenRenderOptions()
    const ducumentTotalLine = editor.document.lineCount
    let weakenRanges: Range[] = []
    let strengthenRanges: Range[] = []
    let slideHighlightLines = new Set<number>()

    unHighlightActiveEditor()
    lineWeakenStyle = window.createTextEditorDecorationType(
      lineWeakenRenderOptions,
    )
    lineStrengthenStyle = window.createTextEditorDecorationType(
      lineStrengthenRenderOptions,
    )
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
    const topPaddingLineNum = 5
    !options.notRevealEditorRange &&
      editor.revealRange(
        new Range(
          minLineNum > topPaddingLineNum ? minLineNum - topPaddingLineNum : 0,
          0,
          minLineNum + 1,
          0,
        ),
        TextEditorRevealType.AtTop,
      )

    // highlight lines
    if (highlightMode === HIGHLIGHT_MODE_MAP.weaken) {
      editor.setDecorations(lineWeakenStyle, weakenRanges)
    } else if (highlightMode === HIGHLIGHT_MODE_MAP.strengthen) {
      editor.setDecorations(lineStrengthenStyle, strengthenRanges)
    } else {
      editor.setDecorations(lineWeakenStyle, weakenRanges)
      editor.setDecorations(lineStrengthenStyle, strengthenRanges)
    }
  }
}

export function unHighlightActiveEditor() {
  const activeEditor = window.activeTextEditor
  if (activeEditor) {
    lineWeakenStyle.dispose()
    lineStrengthenStyle.dispose()
  }
}
