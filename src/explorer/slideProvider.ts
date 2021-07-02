import {
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeItem,
  MarkdownString,
  TreeItemCollapsibleState,
  workspace,
  ConfigurationChangeEvent,
} from 'vscode'
import { CodeSlidesConfig } from '../shared/slideConfig'
import { events } from '../shared/utils'
import { GlobalState } from '../shared/globalState'

export class SlideProvider implements TreeDataProvider<any> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>()
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event

  constructor() {
    workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
      this.refresh()
    })
    events.on('updatePlayingStatusInfo', () => this.refresh())
  }

  getChildren(element: any): any[] | Thenable<any[]> {
    const slides = CodeSlidesConfig.getProjectsConfig()
    console.log('xxx getChildren', element)

    if (!element) {
      return slides
    } else {
      return element.children || []
    }
  }

  getTreeItem(element: any): TreeItem {
    console.log('xxx getTreeItem', element)
    const playingStatusInfo = GlobalState.getInPlayingStatusInfo()

    if (!element.isProject) {
      return {
        ...element,
        label: `${
          element.parentId === playingStatusInfo?.inPlayingNode?.id &&
          playingStatusInfo?.inPlayingNode?.children[
            playingStatusInfo?.currentSlideIndex
          ]?.id === element.id
            ? '> '
            : ''
        }${element.title}`,
      }
    } else {
      return {
        ...element,
        label: `${
          element.id === playingStatusInfo?.inPlayingNode?.id ? '📺 ' : ''
        }${element.title}`,
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        command: undefined,
        contextValue: 'project',
      }
    }
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined)
  }
}
