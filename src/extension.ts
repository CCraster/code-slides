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
}

export function deactivate() {}
