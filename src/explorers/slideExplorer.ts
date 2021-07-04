import { ExtensionContext, window, TreeView } from 'vscode'
import { SlideProvider } from './slideProvider'
import { ProjectTreeItem } from '../shared/projectTreeItem'

export class SlideExplorer {
  treeDataProvider: SlideProvider
  treeView: TreeView<ProjectTreeItem>

  constructor(context: ExtensionContext) {
    const treeDataProvider = new SlideProvider()
    const treeView = window.createTreeView('codeSlidesView.projects', {
      treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false,
    })

    this.treeDataProvider = treeDataProvider
    this.treeView = treeView

    context.subscriptions.push(treeView)
  }
}
