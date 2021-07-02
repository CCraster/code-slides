import { events } from './utils'
import { PlayingStatusInfo } from './typed'

export class GlobalState {
  static playStatusInfo: PlayingStatusInfo | null = null

  static getInPlayingStatusInfo(): PlayingStatusInfo | null {
    return this.playStatusInfo
  }
  static setInPlayingStatusInfo(_playingStatusInfo: PlayingStatusInfo): void {
    this.playStatusInfo = _playingStatusInfo
    events.emit('updatePlayingStatusInfo', this.playStatusInfo)
  }
}
