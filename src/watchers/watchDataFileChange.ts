import { ExtensionContext, workspace } from 'vscode'
import { CodeSlidesProjectData } from '../shared/dataHelper'

export function watchDataFileChange(context: ExtensionContext) {
  const projectFileChangeWatcher = workspace.createFileSystemWatcher(
    '**/craster.code-slides/projects.json',
  )
  projectFileChangeWatcher.onDidChange((e) => {
    e.scheme === 'file' && CodeSlidesProjectData.dataReload(context)
  })
}
