import { ExtensionContext, commands, window, Uri } from 'vscode'
import { SlideExplorer } from './explorers/slideExplorer'
import { CodeSlidesConfig } from './shared/slideConfig'
import { GlobalState } from './shared/globalState'
import { PlayingStatusInfo } from './shared/typed'
import { ProjectTreeItem } from './shared/projectTreeItem'
import {
  highlightEditor,
  unHighlightActiveEditor,
} from './shared/editorHighlight'
import { openFile } from './shared/utils'

export function registerCommand(
  context: ExtensionContext,
  slideExplorer: SlideExplorer,
) {
  CodeSlidesConfig.setProjectsConfig([]) // DEV

  /**
   * command about project
   */
  commands.registerCommand('code-slides.setOptProject', async () => {
    const projects = CodeSlidesConfig.getProjectsConfig()
    const quickPickItems = projects.map((item: ProjectTreeItem) => {
      return {
        ...item,
        label: item.title,
        description: item.desc,
      }
    })

    if (!quickPickItems.length) {
      window.showWarningMessage(
        `There is no code-slides project. Create project first`,
      )
      return
    }

    const pickedItem = await window.showQuickPick(quickPickItems, {
      placeHolder: 'There is no operation project now. Pick one to continue...',
    })

    return pickedItem
  })

  context.subscriptions.push(
    commands.registerCommand('code-slides.addProject', async () => {
      const projects = CodeSlidesConfig.getProjectsConfig()

      const result = await window.showInputBox({
        value: '',
        // valueSelection: [2, 4],
        placeHolder: 'For example: code-show. But not be empty string',
        validateInput: (text) => {
          return text.trim() === ''
            ? 'empty string or all blank is illegal'
            : projects.findIndex((item: any) => item.id === text) !== -1
            ? 'the project name has been used'
            : null
        },
      })

      if (result !== undefined) {
        CodeSlidesConfig.setProjectsConfig([
          ...projects,
          new ProjectTreeItem(result, true),
        ])
        window.showInformationMessage(`Project ${result} has been added`)
      }
    }),
  )

  commands.registerCommand(
    'code-slides.renameProject',
    async (node: ProjectTreeItem) => {
      const oldTitle = node.title
      const projects = CodeSlidesConfig.getProjectsConfig()

      const result = await window.showInputBox({
        value: oldTitle,
        placeHolder: 'For example: code-show. But not be empty string',
        validateInput: (text) => {
          return text.trim() === ''
            ? 'empty string or all blank is illegal'
            : projects.findIndex((item: any) => item.id === text) !== -1
            ? 'the project name has been used'
            : null
        },
      })

      if (result !== undefined) {
        const nodeIndex = projects.findIndex(
          (item: ProjectTreeItem) => item.id === node.id,
        )
        projects[nodeIndex].title = result
        CodeSlidesConfig.setProjectsConfig(projects).then(() => {
          window.showInformationMessage(
            `Project ${oldTitle} has been renamed to ${result}`,
          )
        })
      }
    },
  )

  commands.registerCommand(
    'code-slides.clearProjectSlide',
    async (node: ProjectTreeItem) => {
      const clearText = 'Clear Anyway'
      const optNodeName = node.title
      const projects = CodeSlidesConfig.getProjectsConfig()

      const result = await window.showWarningMessage(
        `Are you really want to clear all Project ${optNodeName}'s slides?`,
        { modal: true },
        clearText,
      )

      if (result === clearText) {
        const nodeIndex = projects.findIndex(
          (item: ProjectTreeItem) => item.id === node.id,
        )
        projects[nodeIndex].children = []
        CodeSlidesConfig.setProjectsConfig(projects).then(() => {
          window.showInformationMessage(
            `Project ${optNodeName} has been cleared`,
          )
        })
      }
    },
  )

  commands.registerCommand(
    'code-slides.deleteProject',
    async (node: ProjectTreeItem) => {
      const deleteConfirmText = 'Delete Anyway'
      const optNodeName = node.title
      const projects = CodeSlidesConfig.getProjectsConfig()

      const result = await window.showWarningMessage(
        `Are you really want to delete Project ${optNodeName}?`,
        { modal: true },
        deleteConfirmText,
      )

      if (result === deleteConfirmText) {
        const nodeIndex = projects.findIndex(
          (item: ProjectTreeItem) => item.id === node.id,
        )
        projects.splice(nodeIndex, 1)
        CodeSlidesConfig.setProjectsConfig(projects).then(() => {
          window.showInformationMessage(
            `Project ${optNodeName} has been deleted`,
          )
        })
      }
    },
  )

  /**
   * command about slide
   */
  commands.registerCommand(
    'code-slides.addSlideStart',
    async (node: ProjectTreeItem) => {
      const projects = CodeSlidesConfig.getProjectsConfig()
      const currentOptSlide = GlobalState.getCurrentOptSlide()
      let optProjectId = GlobalState.getCurrentOptProjectId()

      // check if there is slide does not finish edit
      if (currentOptSlide) {
        const confirmText = 'Abondon'
        const abondon = await window.showWarningMessage(
          `There is a slide does not finish edit, abondon that and create a new one?`,
          { modal: true },
          confirmText,
        )
        if (abondon !== confirmText) {
          return
        } else {
          GlobalState.setCurrentOptSlide(null)
          unHighlightActiveEditor()
        }
      }

      // ensure there is a opt project when add a slide
      if (node.id) {
        GlobalState.setCurrentOptProjectId(node.id)
        optProjectId = node.id
      } else if (!optProjectId) {
        const selectedOptProject: any = await commands.executeCommand(
          'code-slides.setOptProject',
        )
        if (selectedOptProject) {
          GlobalState.setCurrentOptProjectId(selectedOptProject.id)
          optProjectId = selectedOptProject.id
        } else {
          window.showWarningMessage(
            `Add slide need to set operation Project first`,
          )
          return
        }
      }

      const optProjectIndex = projects.findIndex(
        (item: ProjectTreeItem) => item.id === optProjectId,
      )

      const result = await window.showInputBox({
        value: '',
        placeHolder:
          'For example: how to use code-slides 1. But not be empty string',
        validateInput: (text) => {
          return text.trim() === ''
            ? 'empty string or all blank is illegal'
            : projects[optProjectIndex].children.findIndex(
                (item: any) => item.id === text,
              ) !== -1
            ? 'the slide name has been used'
            : null
        },
      })

      if (result !== undefined) {
        const slide = new ProjectTreeItem(
          result,
          false,
          projects[optProjectIndex].id,
        )
        projects[optProjectIndex].children.push(slide)
        CodeSlidesConfig.setProjectsConfig(projects)
        GlobalState.setCurrentOptSlide(slide)
        slideExplorer.treeView.reveal(slide, {
          expand: true,
          focus: true,
        })
        window.showInformationMessage(
          `Slide ${result} has been created. Now go to record lines you need to highlight`,
        )
      }
    },
  )

  commands.registerCommand(
    'code-slides.addSlideEnd',
    async (node: ProjectTreeItem) => {
      const projects = CodeSlidesConfig.getProjectsConfig()
      const currentOptSlide = GlobalState.getCurrentOptSlide()
      let optProjectId = GlobalState.getCurrentOptProjectId()
      const optProjectIndex = projects.findIndex(
        (item: ProjectTreeItem) => item.id === optProjectId,
      )
      const editSlideIndex = projects[optProjectIndex].children.findIndex(
        (item: ProjectTreeItem) => item.id === currentOptSlide?.id,
      )
      if (editSlideIndex !== -1) {
        projects[optProjectIndex].children[editSlideIndex].highlightLines =
          currentOptSlide?.highlightLines
        projects[optProjectIndex].children[editSlideIndex].slideFilePath =
          currentOptSlide?.slideFilePath
      } else {
        // never in this logic
        projects[optProjectIndex].children.push(currentOptSlide)
      }

      CodeSlidesConfig.setProjectsConfig(projects)
      GlobalState.setCurrentOptSlide(null)
      unHighlightActiveEditor()
      currentOptSlide &&
        slideExplorer.treeView.reveal(currentOptSlide, {
          expand: true,
          focus: true,
        })
      window.showInformationMessage(
        `Slide ${currentOptSlide?.title} has been added to [Project ${projects[optProjectIndex].title}]`,
      )
    },
  )

  commands.registerCommand(
    'code-slides.editSlide',
    async (node: ProjectTreeItem) => {
      const currentOptSlide = GlobalState.getCurrentOptSlide()

      if (node.id === currentOptSlide?.id) {
        return
      }

      // check if there is slide does not finish edit
      if (currentOptSlide) {
        const confirmText = 'Abondon'
        const abondon = await window.showWarningMessage(
          `There is a slide does not finish edit, abondon that and create a new one?`,
          { modal: true },
          confirmText,
        )
        if (abondon !== confirmText) {
          return
        } else {
          GlobalState.setCurrentOptSlide(null)
          unHighlightActiveEditor()
        }
      }

      GlobalState.setCurrentOptProjectId(node.parentId || null)
      GlobalState.setCurrentOptSlide(node)
      await openFile(node.slideFilePath)
      highlightEditor(window.activeTextEditor, node)

      window.showInformationMessage(`[Slide ${node.title}] is in editing`)
    },
  )

  commands.registerCommand(
    'code-slides.renameSlide',
    async (node: ProjectTreeItem) => {
      const optNodeId = node.id
      const optNodeName = node.title
      const projects = CodeSlidesConfig.getProjectsConfig()
      const parentIndex = projects.findIndex(
        (item: ProjectTreeItem) => item.id === node.parentId,
      )

      const result = await window.showInputBox({
        value: optNodeName,
        placeHolder:
          'For example: how to use code-slides 1. But not be empty string',
        validateInput: (text) => {
          return text.trim() === ''
            ? 'empty string or all blank is illegal'
            : projects[parentIndex].children.findIndex(
                (item: any) => item.title === text,
              ) !== -1
            ? 'the slide name has been used'
            : null
        },
      })

      if (result !== undefined) {
        const childIndex = projects[parentIndex].children.findIndex(
          (item: ProjectTreeItem) => item.id === optNodeId,
        )
        projects[parentIndex].children[childIndex].title = result
        CodeSlidesConfig.setProjectsConfig(projects)
        window.showInformationMessage(
          `Slide ${optNodeName} has been renamed to ${result}`,
        )
      }
    },
  )

  commands.registerCommand(
    'code-slides.deleteSlide',
    async (node: ProjectTreeItem) => {
      const deleteConfirmText = 'Delete Anyway'
      const optNodeId = node.id
      const optNodeName = node.title
      const projects = CodeSlidesConfig.getProjectsConfig()

      const result = await window.showWarningMessage(
        `Are you really want to delete Slide ${optNodeName}?`,
        { modal: true },
        deleteConfirmText,
      )

      if (result === deleteConfirmText) {
        const parentIndex = projects.findIndex(
          (item: ProjectTreeItem) => item.id === node.parentId,
        )
        const childIndex = projects[parentIndex].children.findIndex(
          (item: ProjectTreeItem) => item.id === optNodeId,
        )
        projects[parentIndex].children.splice(childIndex, 1)
        CodeSlidesConfig.setProjectsConfig(projects)
        window.showInformationMessage(`Slide ${optNodeName} has been deleted`)
      }
    },
  )

  commands.registerCommand(
    'code-slides.clickSlide',
    async (node: ProjectTreeItem) => {
      await openFile(node.slideFilePath)
      highlightEditor(window.activeTextEditor, node)
    },
  )

  /**
   * command about project play
   */
  commands.registerCommand(
    'code-slides.playProjectFromStart',
    async (node: ProjectTreeItem) => {
      const optNodeName = node.title

      if (node.children.length) {
        GlobalState.setInPlayingStatusInfo({
          inPlayingNode: node,
          currentSlideIndex: 0,
        })
        GlobalState.setCurrentOptProjectId(node.id)
        await openFile(node.children[0].slideFilePath)
        highlightEditor(window.activeTextEditor, node.children[0])
        window.showInformationMessage(`Project ${optNodeName} is now playing`)
      } else {
        window.showWarningMessage(
          `Project ${optNodeName} has no slide yet. Try to add one`,
        )
      }
    },
  )

  commands.registerCommand(
    'code-slides.stopPlayProject',
    async (node: ProjectTreeItem) => {
      const optNodeName = node.title

      GlobalState.setInPlayingStatusInfo(null)
      unHighlightActiveEditor()
      window.showInformationMessage(`code-slides has stoped play mode`)
    },
  )

  commands.registerCommand(
    'code-slides.playProjectFromHere',
    async (node: ProjectTreeItem) => {
      const projects = CodeSlidesConfig.getProjectsConfig()
      const optNodeId = node.id
      const optNodeTitle = node.title
      const parentIndex = projects.findIndex(
        (item: ProjectTreeItem) => item.id === node.parentId,
      )
      const childIndex = projects[parentIndex].children.findIndex(
        (item: ProjectTreeItem) => item.id === optNodeId,
      )

      GlobalState.setInPlayingStatusInfo({
        inPlayingNode: projects[parentIndex],
        currentSlideIndex: childIndex,
      })
      GlobalState.setCurrentOptProjectId(projects[parentIndex].id)
      await openFile(projects[parentIndex].children[childIndex].slideFilePath)
      highlightEditor(
        window.activeTextEditor,
        projects[parentIndex].children[childIndex],
      )
      window.showInformationMessage(`Now is changed to slide ${optNodeTitle}`)
    },
  )

  commands.registerCommand('code-slides.showPreSlide', async () => {
    const playStatusInfo: PlayingStatusInfo | null =
      GlobalState.getInPlayingStatusInfo()
    if (!playStatusInfo) {
      window.showWarningMessage(`No project on playing`)
    } else if (playStatusInfo.currentSlideIndex === 0) {
      window.showWarningMessage(`No Previous slide`)
    } else {
      const preSlideIndex = playStatusInfo.currentSlideIndex - 1
      GlobalState.setInPlayingStatusInfo({
        inPlayingNode: playStatusInfo.inPlayingNode,
        currentSlideIndex: preSlideIndex,
      })
      await openFile(
        playStatusInfo.inPlayingNode.children[preSlideIndex].slideFilePath,
      )
      highlightEditor(
        window.activeTextEditor,
        playStatusInfo.inPlayingNode.children[preSlideIndex],
      )
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
      const nextSlideIndex = playStatusInfo.currentSlideIndex + 1
      GlobalState.setInPlayingStatusInfo({
        inPlayingNode: playStatusInfo.inPlayingNode,
        currentSlideIndex: nextSlideIndex,
      })
      await openFile(
        playStatusInfo.inPlayingNode.children[nextSlideIndex].slideFilePath,
      )
      highlightEditor(
        window.activeTextEditor,
        playStatusInfo.inPlayingNode.children[nextSlideIndex],
      )
    }
  })
}
