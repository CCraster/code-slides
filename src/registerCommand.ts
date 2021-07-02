import { ExtensionContext, commands, window } from 'vscode'
import { SlideExplorer } from './explorer/slideExplorer'
import { CodeSlidesConfig } from './shared/slideConfig'
import { GlobalState } from './shared/globalState'
import { PlayingStatusInfo } from './shared/typed'

export function registerCommand(
  context: ExtensionContext,
  slideExplorer: SlideExplorer,
) {
  CodeSlidesConfig.setProjectsConfig([]) // DEV

  /**
   * command about project
   */
  context.subscriptions.push(
    commands.registerCommand('code-slides.addProject', async () => {
      const config = CodeSlidesConfig.getProjectsConfig()

      const result = await window.showInputBox({
        value: '',
        // valueSelection: [2, 4],
        placeHolder: 'For example: code-show. But not be empty string',
        validateInput: (text) => {
          return text.trim() === ''
            ? 'empty string or all blank is illegal'
            : config.findIndex((item: any) => item.id === text) !== -1
            ? 'the project name has been used'
            : null
        },
      })

      if (result !== undefined) {
        CodeSlidesConfig.setProjectsConfig([
          ...config,
          { id: result, title: result, isProject: true, children: [] },
        ])
        window.showInformationMessage(`Project ${result} has been added`)
      }
    }),
  )

  commands.registerCommand('code-slides.renameProject', async (node) => {
    const oldTitle = node.title
    const config = CodeSlidesConfig.getProjectsConfig()

    const result = await window.showInputBox({
      value: oldTitle,
      placeHolder: 'For example: code-show. But not be empty string',
      validateInput: (text) => {
        return text.trim() === ''
          ? 'empty string or all blank is illegal'
          : config.findIndex((item: any) => item.id === text) !== -1
          ? 'the project name has been used'
          : null
      },
    })

    if (result !== undefined) {
      const nodeIndex = config.findIndex((item: any) => item.id === node.id)
      config[nodeIndex].id = result
      config[nodeIndex].title = result
      CodeSlidesConfig.setProjectsConfig(config).then(() => {
        window.showInformationMessage(
          `Project ${oldTitle} has been renamed to ${result}`,
        )
      })
    }
  })

  commands.registerCommand('code-slides.clearProjectSlide', async (node) => {
    const clearText = 'Clear Anyway'
    const optNodeName = node.title
    const config = CodeSlidesConfig.getProjectsConfig()

    const result = await window.showWarningMessage(
      `Are you really want to clear all Project ${optNodeName}'s slides?`,
      { modal: true },
      clearText,
    )

    if (result === clearText) {
      const nodeIndex = config.findIndex((item: any) => item.id === node.id)
      config[nodeIndex].children = []
      CodeSlidesConfig.setProjectsConfig(config).then(() => {
        window.showInformationMessage(`Project ${optNodeName} has been cleared`)
      })
    }
  })

  commands.registerCommand('code-slides.deleteProject', async (node) => {
    const deleteConfirmText = 'Delete Anyway'
    const optNodeName = node.title
    const config = CodeSlidesConfig.getProjectsConfig()

    const result = await window.showWarningMessage(
      `Are you really want to delete Project ${optNodeName}?`,
      { modal: true },
      deleteConfirmText,
    )

    if (result === deleteConfirmText) {
      const nodeIndex = config.findIndex((item: any) => item.id === node.id)
      config.splice(nodeIndex, 1)
      CodeSlidesConfig.setProjectsConfig(config).then(() => {
        window.showInformationMessage(`Project ${optNodeName} has been deleted`)
      })
    }
  })

  /**
   * command about slide
   */
  commands.registerCommand('code-slides.addSlide', async (node) => {
    const config = CodeSlidesConfig.getProjectsConfig()

    const result = await window.showInputBox({
      value: '',
      placeHolder:
        'For example: how to use code-slides 1. But not be empty string',
      validateInput: (text) => {
        return text.trim() === ''
          ? 'empty string or all blank is illegal'
          : node.children.findIndex((item: any) => item.id === text) !== -1
          ? 'the slide name has been used'
          : null
      },
    })

    if (result !== undefined) {
      const slide = {
        id: result,
        parentId: node.id,
        title: result,
        children: [],
      }
      const parentIndex = config.findIndex((item: any) => item.id === node.id)
      config[parentIndex].children.push(slide)
      CodeSlidesConfig.setProjectsConfig(config)
      window.showInformationMessage(
        `Slide ${result} has been added to Project ${node.title}`,
      )
    }
  })

  commands.registerCommand('code-slides.renameSlide', async (node) => {
    const optNodeId = node.id
    const optNodeName = node.title
    const config = CodeSlidesConfig.getProjectsConfig()
    const parentIndex = config.findIndex(
      (item: any) => item.id === node.parentId,
    )

    const result = await window.showInputBox({
      value: optNodeName,
      placeHolder:
        'For example: how to use code-slides 1. But not be empty string',
      validateInput: (text) => {
        return text.trim() === ''
          ? 'empty string or all blank is illegal'
          : config[parentIndex].children.findIndex(
              (item: any) => item.title === text,
            ) !== -1
          ? 'the slide name has been used'
          : null
      },
    })

    if (result !== undefined) {
      const childIndex = config[parentIndex].children.findIndex(
        (item: any) => item.id === optNodeId,
      )
      config[parentIndex].children[childIndex].id = result
      config[parentIndex].children[childIndex].title = result
      CodeSlidesConfig.setProjectsConfig(config)
      window.showInformationMessage(
        `Slide ${optNodeName} has been renamed to ${result}`,
      )
    }
  })

  commands.registerCommand('code-slides.deleteSlide', async (node) => {
    const deleteConfirmText = 'Delete Anyway'
    const optNodeId = node.id
    const optNodeName = node.title
    const config = CodeSlidesConfig.getProjectsConfig()

    const result = await window.showWarningMessage(
      `Are you really want to delete Project ${optNodeName}?`,
      { modal: true },
      deleteConfirmText,
    )

    if (result === deleteConfirmText) {
      const parentIndex = config.findIndex(
        (item: any) => item.id === node.parentId,
      )
      const childIndex = config[parentIndex].children.findIndex(
        (item: any) => item.id === optNodeId,
      )
      config[parentIndex].children.splice(childIndex, 1)
      CodeSlidesConfig.setProjectsConfig(config)
      window.showInformationMessage(`Slide ${optNodeName} has been deleted`)
    }
  })

  /**
   * command about project play
   */
  commands.registerCommand('code-slides.playProjectFromStart', async (node) => {
    const optNodeName = node.title

    if (node.children.length) {
      GlobalState.setInPlayingStatusInfo({
        inPlayingNode: node,
        currentSlideIndex: 0,
      })
      window.showInformationMessage(`Project ${optNodeName} is now playing.`)
    } else {
      window.showWarningMessage(
        `Project ${optNodeName} has no slide yet. Try to add one`,
      )
    }
  })

  commands.registerCommand('code-slides.playProjectFromHere', async (node) => {
    const config = CodeSlidesConfig.getProjectsConfig()
    const optNodeId = node.id
    const optNodeTitle = node.title
    const parentIndex = config.findIndex(
      (item: any) => item.id === node.parentId,
    )
    const childIndex = config[parentIndex].children.findIndex(
      (item: any) => item.id === optNodeId,
    )

    GlobalState.setInPlayingStatusInfo({
      inPlayingNode: config[parentIndex],
      currentSlideIndex: childIndex,
    })
    window.showInformationMessage(`Now is changed to slide ${optNodeTitle}`)
  })

  commands.registerCommand('code-slides.showPreSlide', async () => {
    const playStatusInfo: PlayingStatusInfo | null =
      GlobalState.getInPlayingStatusInfo()
    if (!playStatusInfo) {
      window.showWarningMessage(`No project on playing`)
    } else if (playStatusInfo.currentSlideIndex === 0) {
      window.showWarningMessage(`No Previous slide`)
    } else {
      GlobalState.setInPlayingStatusInfo({
        inPlayingNode: playStatusInfo.inPlayingNode,
        currentSlideIndex: --playStatusInfo.currentSlideIndex,
      })
    }
  })

  commands.registerCommand('code-slides.showNextSlide', async () => {
    const playStatusInfo = GlobalState.getInPlayingStatusInfo()
    if (!playStatusInfo) {
      window.showWarningMessage(`No project on playing`)
    } else if (
      playStatusInfo.currentSlideIndex >=
      playStatusInfo.inPlayingNode.children.length - 1
    ) {
      window.showWarningMessage(`No next slide`)
    } else {
      GlobalState.setInPlayingStatusInfo({
        inPlayingNode: playStatusInfo.inPlayingNode,
        currentSlideIndex: ++playStatusInfo.currentSlideIndex,
      })
    }
  })
}
