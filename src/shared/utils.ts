import { commands, Uri, window } from 'vscode'
import { EventEmitter } from 'events'

export const events = new EventEmitter()

export const genUniqueId = (length: number = 8): string => {
  return Number(
    Math.random().toString().substr(3, length) + Date.now(),
  ).toString(36)
}

export const openFile = async (path: string) => {
  if (path) {
    const uri = Uri.file(path)
    await commands.executeCommand('vscode.openFolder', uri)
  } else {
    console.log('Code-Slides: Open File Fail! Path is empty')
  }
}
