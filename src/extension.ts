import {
  window,
  commands,
  workspace,
  Uri,
  Range,
  ExtensionContext,
  TextEditorDecorationType,
  TextEditor,
  TreeView,
  ConfigurationChangeEvent,
} from 'vscode'
import * as path from 'path'

import { SlideExplorer, HelpAndFeedbackExplorer } from './explorers'
import { registerCommand } from './registerCommand'
import { ProjectPlayingStatusBar } from './projectPlayingStatusBar'
import {
  wacthEditorSelectionChange,
  watchActiveTextEditorChange,
} from './watchers'

let slideTreeView: SlideExplorer | null = null
let projectPlayingStatusBar: ProjectPlayingStatusBar | null = null

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "code-slides" is now active!')
  let style: TextEditorDecorationType

  slideTreeView = new SlideExplorer(context)
  projectPlayingStatusBar = new ProjectPlayingStatusBar()
  new HelpAndFeedbackExplorer(context)

  registerCommand(context, slideTreeView)

  wacthEditorSelectionChange(context)
  watchActiveTextEditorChange(context)

  context.subscriptions.push(
    commands.registerCommand('code-slides.codeSlides', async () => {
      window.showInformationMessage('Message from Code Slides!')
      // src/app.js
      const filePath = path.join(workspace.rootPath + '', 'src/app.js')
      let uri = Uri.file(filePath)
      await commands.executeCommand('vscode.openFolder', uri)
      console.log('xxx', 1)
      // await vscode.commands.executeCommand('editorScroll', {to: 'up', by: 'line', value: 10, revealCursor: true});
      // await vscode.commands.executeCommand('vscode.executeDocumentHighlights', 10);
      // let success = await vscode.commands.executeCommand('vscode.open', uri);

      // set color
      let activeEditor: TextEditor | undefined = window.activeTextEditor
      let ranges: Range[] = []
      style = window.createTextEditorDecorationType({
        color: 'rgba(255, 255, 255, 0.2)',
      })
      setLineHighlight()

      function setLineHighlight() {
        if (activeEditor) {
          ranges.push(activeEditor.document.lineAt(1).range)
          ranges.push(new Range(3, 0, 1000, 0))
          activeEditor.setDecorations(style, ranges)
          console.log('xxx has', activeEditor.document)
        }
      }

      window.onDidChangeActiveTextEditor(
        (editor) => {
          activeEditor = editor
          setLineHighlight()
        },
        null,
        context.subscriptions,
      )
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('code-slides.stopPresentation', async () => {
      window.showInformationMessage('stopPresentation from Code Slides!')
      // remove color
      let activeEditor: TextEditor | undefined = window.activeTextEditor
      let ranges: Range[] = []
      style.dispose()
    }),
  )
}

export function deactivate() {}
