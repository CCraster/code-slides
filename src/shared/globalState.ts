import { commands } from 'vscode'
import { events } from './utils'
import { PlayingStatusInfo } from './typed'
import { ProjectTreeItem } from './projectTreeItem'

export class GlobalState {
  static playStatusInfo: PlayingStatusInfo | null = null
  static currentOptProjectId: string | null = null
  static currentOptSlide: ProjectTreeItem | null = null

  static getInPlayingStatusInfo(): PlayingStatusInfo | null {
    return this.playStatusInfo
  }
  static setInPlayingStatusInfo(
    _playStatusInfo: PlayingStatusInfo | null,
  ): void {
    this.playStatusInfo = _playStatusInfo
    commands.executeCommand(
      'setContext',
      'code-slides.playStatusInfo',
      _playStatusInfo,
    )
    events.emit('updatePlayingStatusInfo', this.playStatusInfo)
  }

  static getCurrentOptProjectId(): string | null {
    return this.currentOptProjectId
  }
  static setCurrentOptProjectId(id: string | null): void {
    this.currentOptProjectId = id
    events.emit('updateCurrentOptProjectId', this.currentOptProjectId)
  }

  static getCurrentOptSlide(): ProjectTreeItem | null {
    return this.currentOptSlide
  }
  static setCurrentOptSlide(slide: ProjectTreeItem | null): void {
    this.currentOptSlide = slide
    commands.executeCommand('setContext', 'code-slides.currentOptSlide', slide)
    events.emit('updateCurrentOptSlide', this.currentOptSlide)
  }
}
