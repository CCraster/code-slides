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
import * as path from 'path'
import { CodeSlidesConfig } from '../shared/slideConfig'
import { events } from '../shared/utils'
import { GlobalState } from '../shared/globalState'
import { ProjectTreeItem } from '../shared/projectTreeItem'

export class SlideProvider implements TreeDataProvider<any> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>()
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event

  constructor() {
    workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
      this.refresh()
    })
    events.on('updatePlayingStatusInfo', () => this.refresh())
    events.on('updateCurrentOptProjectId', () => this.refresh())
    events.on('updateCurrentOptSlide', () => this.refresh())
  }

  getChildren(
    element: ProjectTreeItem,
  ): ProjectTreeItem[] | Thenable<ProjectTreeItem[]> {
    const slides = CodeSlidesConfig.getProjectsConfig()

    if (!element) {
      return slides
    } else {
      return element.children || []
    }
  }

  getTreeItem(element: ProjectTreeItem): TreeItem {
    const playingStatusInfo = GlobalState.getInPlayingStatusInfo()
    const currentOptProjectId = GlobalState.getCurrentOptProjectId()
    const currentOptSlide = GlobalState.getCurrentOptSlide()

    if (!element.isProject) {
      return {
        ...element,
        label: element.title,
        iconPath:
          element.parentId === playingStatusInfo?.inPlayingNode?.id &&
          playingStatusInfo?.inPlayingNode?.children[
            playingStatusInfo?.currentSlideIndex
          ]?.id === element.id
            ? {
                light: path.join(
                  __filename,
                  '..',
                  '..',
                  'images',
                  'light',
                  'current.svg',
                ),
                dark: path.join(
                  __filename,
                  '..',
                  '..',
                  'images',
                  'dark',
                  'current.svg',
                ),
              }
            : undefined,
      }
    } else {
      return {
        ...element,
        label: element.title,
        iconPath:
          element.id === currentOptProjectId
            ? {
                light: path.join(
                  __filename,
                  '..',
                  '..',
                  'images',
                  'light',
                  'focus.svg',
                ),
                dark: path.join(
                  __filename,
                  '..',
                  '..',
                  'images',
                  'dark',
                  'focus.svg',
                ),
              }
            : undefined,
        collapsibleState:
          element.id === currentOptProjectId
            ? TreeItemCollapsibleState.Expanded
            : TreeItemCollapsibleState.Collapsed,
        command: undefined,
        contextValue:
          element.id === playingStatusInfo?.inPlayingNode?.id
            ? 'project-playing'
            : element.id === currentOptSlide?.parentId
            ? 'project-adding'
            : 'project',
      }
    }
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined)
  }
}
