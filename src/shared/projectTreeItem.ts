import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { genUniqueId } from '../shared/utils'

export class ProjectTreeItem extends TreeItem {
  id: string = ''
  title: string = ''
  isProject: boolean = false
  children: Array<ProjectTreeItem> = []
  desc: string = ''
  contextValue: string = ''
  parentId: string | undefined
  highlightLines: Array<Array<number>> = [] // for slide item
  slideFilePath: string = '' // for slide item

  constructor(title: string, isProject: boolean, parentId?: string) {
    super(
      title,
      isProject
        ? TreeItemCollapsibleState.Collapsed
        : TreeItemCollapsibleState.None,
    )
    this.id = genUniqueId()
    this.title = title
    this.isProject = isProject
    this.parentId = parentId
  }
}
