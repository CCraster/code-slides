import {
  StatusBarAlignment,
  StatusBarItem,
  window,
  workspace,
  ConfigurationChangeEvent,
} from 'vscode'
import { events } from './shared/utils'
import { GlobalState } from './shared/globalState'
import { CodeSlidesConfig } from './shared/codeSlidesConfig'
import { CodeSlidesProjectData } from './shared/dataHelper'
import { CODE_SLIDES_DEFAULT_CONFIG } from './shared/constants'

const normalStatusText = 'No Project in Working'

export class ProjectPlayingStatusBar {
  isEnable: boolean = CODE_SLIDES_DEFAULT_CONFIG.hideStatusBar
  statusBarNormalColor: string = CODE_SLIDES_DEFAULT_CONFIG.statusBarNormalColor
  statusBarPlayingColor: string =
    CODE_SLIDES_DEFAULT_CONFIG.statusBarPlayingColor
  playingStatusBarItem: StatusBarItem | undefined
  unsubscribe: Function = () => {}

  constructor() {
    workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
      this.reload()
    })
    this.init()
  }

  init() {
    this.isEnable = !CodeSlidesConfig.getHideStatusBar()
    this.statusBarNormalColor = CodeSlidesConfig.getStatusBarNormalColor()
    this.statusBarPlayingColor = CodeSlidesConfig.getStatusBarPlayingColor()

    if (this.isEnable) {
      this.playingStatusBarItem = window.createStatusBarItem(
        StatusBarAlignment.Left,
        2,
      )
      this.updatePlayingStatusBarItem()

      const statusBarUpdateHandler = () => {
        this.updatePlayingStatusBarItem()
      }
      events.on('updatePlayingStatusInfo', statusBarUpdateHandler)
      events.on('updateCurrentOptProjectId', statusBarUpdateHandler)
      events.on('dataChange:projects', statusBarUpdateHandler)
      this.unsubscribe = () => {
        events.off('updatePlayingStatusInfo', statusBarUpdateHandler)
        events.off('updateCurrentOptProjectId', statusBarUpdateHandler)
        events.off('dataChange:projects', statusBarUpdateHandler)
      }
    }
  }

  updatePlayingStatusBarItem() {
    const playStatusInfo = GlobalState.getInPlayingStatusInfo()
    const currentOptProjectId = GlobalState.getCurrentOptProjectId()

    if (this.playingStatusBarItem) {
      if (playStatusInfo) {
        this.playingStatusBarItem.text = `📺 ${
          playStatusInfo.inPlayingNode.title
        }: ${playStatusInfo.currentSlideIndex + 1}/${
          playStatusInfo.inPlayingNode.children.length
        }`
        this.playingStatusBarItem.color = this.statusBarPlayingColor
      } else if (currentOptProjectId) {
        const projects = CodeSlidesProjectData.getProjects()
        const optProject = projects.find(
          (item: any) => item.id === currentOptProjectId,
        )
        this.playingStatusBarItem.text = `👀: ${optProject?.title}`
        this.playingStatusBarItem.color = this.statusBarNormalColor
      } else {
        this.playingStatusBarItem.text = normalStatusText
        this.playingStatusBarItem.color = this.statusBarNormalColor
      }
      this.playingStatusBarItem.show()
    }
  }

  reload() {
    const _isEnable = !CodeSlidesConfig.getHideStatusBar()
    const _statusBarNormalColor = CodeSlidesConfig.getStatusBarNormalColor()
    const _statusBarPlayingColor = CodeSlidesConfig.getStatusBarPlayingColor()

    if (
      this.isEnable !== _isEnable ||
      this.statusBarNormalColor !== _statusBarNormalColor ||
      this.statusBarPlayingColor !== _statusBarPlayingColor
    ) {
      this.isEnable = _isEnable
      this.statusBarNormalColor = _statusBarNormalColor
      this.statusBarPlayingColor = _statusBarPlayingColor
      if (_isEnable) {
        this.destroy()
        this.init()
      } else {
        this.destroy()
      }
    }
  }

  destroy() {
    this.unsubscribe()
    this.playingStatusBarItem?.dispose()
  }
}
