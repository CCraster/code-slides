import { ExtensionContext } from 'vscode'

import { SlideExplorer, HelpAndFeedbackExplorer } from './explorers'
import { registerCommand } from './registerCommand'
import { ProjectPlayingStatusBar } from './codeSlidesStatusBar'
import {
  wacthEditorSelectionChange,
  watchActiveTextEditorChange,
  watchDataFileChange,
} from './watchers'
import { CodeSlidesProjectData } from './shared/dataHelper'

let slideTreeView: SlideExplorer | null = null
let projectPlayingStatusBar: ProjectPlayingStatusBar | null = null

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "code-slides" is now active!')

  CodeSlidesProjectData.dataReload(context)

  slideTreeView = new SlideExplorer(context)
  new HelpAndFeedbackExplorer(context)

  projectPlayingStatusBar = new ProjectPlayingStatusBar()

  registerCommand(context, slideTreeView)

  wacthEditorSelectionChange(context)
  watchActiveTextEditorChange(context)
  watchDataFileChange(context)
}

export function deactivate() {}
