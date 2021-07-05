import { ExtensionContext } from 'vscode'

import { SlideExplorer, HelpAndFeedbackExplorer } from './explorers'
import { registerCommand } from './registerCommand'
import { ProjectPlayingStatusBar } from './projectPlayingStatusBar'
import {
  wacthEditorSelectionChange,
  watchActiveTextEditorChange,
} from './watchers'
import { CodeSlidesProjectData } from './shared/dataHelper'

let slideTreeView: SlideExplorer | null = null
let projectPlayingStatusBar: ProjectPlayingStatusBar | null = null

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "code-slides" is now active!')

  CodeSlidesProjectData.setContext(context)

  slideTreeView = new SlideExplorer(context)
  new HelpAndFeedbackExplorer(context)

  projectPlayingStatusBar = new ProjectPlayingStatusBar()

  registerCommand(context, slideTreeView)

  wacthEditorSelectionChange(context)
  watchActiveTextEditorChange(context)
}

export function deactivate() {}
