import { ExtensionContext, window } from 'vscode'
import { SlideProvider } from './slideProvider'

export class SlideExplorer {
  treeDataProvider: SlideProvider

  constructor(context: ExtensionContext) {
    const treeDataProvider = new SlideProvider()

    this.treeDataProvider = treeDataProvider

    context.subscriptions.push(
      window.createTreeView('codeSlidesView.projects', { treeDataProvider }),
    )
  }
}
