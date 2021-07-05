import { commands, Uri } from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { EventEmitter } from 'events'

export const events = new EventEmitter()

export const genUniqueId = (length: number = 8): string => {
  return Number(
    Math.random().toString().substr(3, length) + Date.now(),
  ).toString(36)
}

export const openNewEditor = async (path: string) => {
  if (path) {
    const uri = Uri.file(path)
    await commands.executeCommand('vscode.open', uri, { preview: false })
  } else {
    console.log('Code-Slides: Open File Fail! Path is empty')
  }
}

export const readFileIfNotExistCreate = (
  foldPath: string,
  fileName: string,
  defaultValue: any,
): any => {
  const filePath = path.join(foldPath, fileName)
  let fileContent
  if (!fs.existsSync(filePath)) {
    if (!fs.existsSync(foldPath)) {
      fs.mkdirSync(foldPath)
    }
    fs.writeFileSync(filePath, JSON.stringify(defaultValue))
    fileContent = defaultValue
  } else {
    fileContent = JSON.parse(fs.readFileSync(filePath).toString())
  }

  return fileContent
}

export const saveFile = (filePath: string, content: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2))
  } catch (e) {
    console.log('Code-Slides: ', e)
  }
}
