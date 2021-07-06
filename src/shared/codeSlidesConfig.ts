import { workspace } from 'vscode'
import { CODE_SLIDES_DEFAULT_CONFIG } from './constants'

export class BaseConfig {
  static getConfig(cfgKey: string, defaultValue?: any): any {
    const config = workspace.getConfiguration()
    const value = config.get(cfgKey)
    return value === undefined ? defaultValue : value
  }

  static setConfig(
    cfgKey: string,
    cfgValue: Array<any> | string | number | Object,
  ) {
    // events.emit('updateConfig:' + cfgKey, cfgValue)
    const config = workspace.getConfiguration()
    return config.update(cfgKey, cfgValue, true)
  }
}

export class CodeSlidesConfig extends BaseConfig {
  constructor() {
    super()
  }

  static getHighlightMode(): string {
    return this.getConfig(
      'code-slides.highlightMode',
      CODE_SLIDES_DEFAULT_CONFIG.highlightMode,
    )
  }
  static setHighlightMode(value: string): any {
    return this.setConfig('code-slides.highlightMode', value)
  }

  static getLineWeakenRenderOptions(): object {
    return this.getConfig(
      'code-slides.lineWeakenRenderOptions',
      CODE_SLIDES_DEFAULT_CONFIG.lineWeakenColor,
    )
  }
  static setLineWeakenRenderOptions(value: object): any {
    return this.setConfig('code-slides.lineWeakenRenderOptions', value)
  }

  static getLineStrengthenRenderOptions(): object {
    return this.getConfig(
      'code-slides.lineStrengthenRenderOptions',
      CODE_SLIDES_DEFAULT_CONFIG.lineStrengthenColor,
    )
  }
  static setLineStrengthenRenderOptions(value: object): any {
    return this.setConfig('code-slides.lineStrengthenRenderOptions', value)
  }

  static getHideStatusBar(): boolean {
    return this.getConfig(
      'code-slides.hideStatusBar',
      CODE_SLIDES_DEFAULT_CONFIG.hideStatusBar,
    )
  }
  static setHideStatusBar(value: boolean): any {
    return this.setConfig('code-slides.hideStatusBar', value)
  }

  static getStatusBarNormalColor(): string {
    return this.getConfig(
      'code-slides.statusBarNormalColor',
      CODE_SLIDES_DEFAULT_CONFIG.statusBarNormalColor,
    )
  }
  static setHStatusBarNormalColor(value: string): any {
    return this.setConfig('code-slides.statusBarNormalColor', value)
  }

  static getStatusBarPlayingColor(): string {
    return this.getConfig(
      'code-slides.statusBarPlayingColor',
      CODE_SLIDES_DEFAULT_CONFIG.statusBarPlayingColor,
    )
  }
  static setHStatusBarPlayingColor(value: string): any {
    return this.setConfig('code-slides.statusBarPlayingColor', value)
  }
}
