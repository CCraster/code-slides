import { workspace } from 'vscode'

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

  static getProjectsConfig(): any {
    return this.getConfig('code-slides.projects', [])
  }

  static setProjectsConfig(value: any): any {
    return this.setConfig('code-slides.projects', value)
  }
}
