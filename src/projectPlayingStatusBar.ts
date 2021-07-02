import { StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { events } from './shared/utils'
import { PlayingStatusInfo } from './shared/typed'

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

    const statusBarUpdateHandler = (data: PlayingStatusInfo) => {
      this.updatePlayingStatusBarItem(data)
    }
    events.on('updatePlayingStatusInfo', statusBarUpdateHandler)
    this.unsubscribe = () => {
      events.off('updatePlayingStatusInfo', statusBarUpdateHandler)
    }
  }

  updatePlayingStatusBarItem(data: PlayingStatusInfo) {
    console.log('xxx updatePlayingStatusBarItem', data)
    if (this.playingStatusBarItem) {
      if (!data) {
        this.playingStatusBarItem.text = noPlayingProjectText
        this.playingStatusBarItem.color = noPlayingColor
      } else {
        this.playingStatusBarItem.text = `📺 ${data.inPlayingNode.title}: ${
          data.currentSlideIndex + 1
        }/${data.inPlayingNode.children.length}`
        this.playingStatusBarItem.color = playingColor
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
