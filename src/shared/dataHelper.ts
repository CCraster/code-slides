/**
 * code-slides projects data save and fetch
 */
import { ExtensionContext, workspace, window } from 'vscode'
import * as path from 'path'
import { ProjectTreeItem } from './projectTreeItem'
import { events, readFileIfNotExistCreate, saveFile } from './utils'
import { PROJECT_TAG } from './constants'

export class CodeSlidesProjectData {
  static context: ExtensionContext

  static dataReload(context: ExtensionContext): void {
    this.context = context
    const projectsData = readFileIfNotExistCreate(
      context.globalStorageUri.fsPath,
      `${PROJECT_TAG}.json`,
      [],
    )
    const previousProjects = this.context.globalState.get(PROJECT_TAG)
    if (
      !previousProjects ||
      JSON.stringify(previousProjects) !== JSON.stringify(projectsData)
    ) {
      this.setProjects(projectsData)
    }
  }

  static getProjects(): Array<ProjectTreeItem> {
    const projects: Array<ProjectTreeItem> | undefined =
      this.context.globalState.get(PROJECT_TAG)
    if (!projects) {
      this.context.globalState.update(PROJECT_TAG, [])
    }
    return projects || []
  }
  static setProjects(projects: Array<ProjectTreeItem>): void {
    this.context.globalState.update(PROJECT_TAG, projects)
    saveFile(
      path.join(this.context.globalStorageUri.fsPath, `${PROJECT_TAG}.json`),
      projects,
    )
    events.emit('dataChange:projects', projects)
  }
}
