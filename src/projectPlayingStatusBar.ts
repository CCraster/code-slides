import { StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { events } from './shared/utils'
import { GlobalState } from './shared/globalState'
import { CodeSlidesConfig } from './shared/slideConfig'

const noPlayingProjectText = 'No Playing Project'
const noPlayingColor = '#fff'
const playingColor = '#0f0'

export class ProjectPlayingStatusBar {
  playingStatusBarItem: StatusBarItem | undefined
  unsubscribe: Function = () => {}

  constructor() {
    this.init()
  }

  init() {
    this.playingStatusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Left,
      2,
    )
    this.playingStatusBarItem.text = noPlayingProjectText
    this.playingStatusBarItem.color = noPlayingColor
    this.playingStatusBarItem.show()

    const statusBarUpdateHandler = () => {
      this.updatePlayingStatusBarItem()
    }
    events.on('updatePlayingStatusInfo', statusBarUpdateHandler)
    events.on('updateCurrentOptProjectId', statusBarUpdateHandler)
    this.unsubscribe = () => {
      events.off('updatePlayingStatusInfo', statusBarUpdateHandler)
      events.off('updateCurrentOptProjectId', statusBarUpdateHandler)
    }
  }

  updatePlayingStatusBarItem() {
    const playStatusInfo = GlobalState.getInPlayingStatusInfo()
    const currentOptProjectId = GlobalState.getCurrentOptProjectId()
    // console.log(
    //   'xxx updatePlayingStatusBarItem',
    //   playStatusInfo,
    //   currentOptProjectId,
    // )

    if (this.playingStatusBarItem) {
      if (playStatusInfo) {
        this.playingStatusBarItem.text = `📺 ${
          playStatusInfo.inPlayingNode.title
        }: ${playStatusInfo.currentSlideIndex + 1}/${
          playStatusInfo.inPlayingNode.children.length
        }`
        this.playingStatusBarItem.color = playingColor
      } else if (currentOptProjectId) {
        const projects = CodeSlidesConfig.getProjectsConfig()
        const optProject = projects.find(
          (item: any) => item.id === currentOptProjectId,
        )
        this.playingStatusBarItem.text = `Working on: ${optProject.title}`
        this.playingStatusBarItem.color = noPlayingColor
      } else {
        this.playingStatusBarItem.text = noPlayingProjectText
        this.playingStatusBarItem.color = noPlayingColor
      }
      this.playingStatusBarItem.show()
    }
  }

  reload() {
    this.init()
  }

  destroy() {
    this.unsubscribe()
    this.playingStatusBarItem?.dispose()
  }
}
