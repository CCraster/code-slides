import {
  ExtensionContext,
  commands,
  window,
  workspace,
  TextEditor,
  TextEditorEdit,
} from 'vscode'
import * as path from 'path'

import { SlideExplorer } from './explorers/slideExplorer'
import { CodeSlidesProjectData } from './shared/dataHelper'
import { GlobalState } from './shared/globalState'
import { PlayingStatusInfo, FocusNodeInfo } from './shared/typed'
import { ProjectTreeItem } from './shared/projectTreeItem'
import {
  highlightEditor,
  unHighlightActiveEditor,
} from './shared/editorHighlight'
import { openNewEditor } from './shared/utils'
import { PROJECT_TAG } from './shared/constants'

// slide click will change it
let focusNodeinfo: FocusNodeInfo | null = null

async function highlightSlide(
  slideExplorer: SlideExplorer,
  slide: ProjectTreeItem,
) {
  focusNodeinfo = { id: slide.id, isHighlight: true }
  slideExplorer.treeView.reveal(slide, {
    expand: true,
    focus: true,
  })
  await openNewEditor(slide.slideFilePath)
  highlightEditor(window.activeTextEditor, slide)
}

async function checkIfDiscardUnsavedSlides() {
  const currentOptSlide = GlobalState.getCurrentOptSlide()
  // check if there is slide does not finish edit
  if (currentOptSlide) {
    const confirmText = 'Discard'
    const discardModal = await window.showWarningMessage(
      `You have unsaved changes in slide does, do you want to discard changes and create a new one?`,
      { modal: true },
      confirmText,
    )
    if (discardModal !== confirmText) {
      return false
    }
    GlobalState.setCurrentOptSlide(null)
    unHighlightActiveEditor()
  }
  return true
}

async function getCurrentOptSlide(projects: Array<ProjectTreeItem>, node?: ProjectTreeItem, ): Promise<number> {
  let optProjectId = GlobalState.getCurrentOptProjectId()
  // ensure there is a opt project when add a slide
  if (node?.id) {
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
      projects.length &&
        window.showWarningMessage(
          `Add slide need to set operation Project first`,
        )
      return -1
    }
  }

  const optProjectIndex = projects.findIndex(
    (item: ProjectTreeItem) => item.id === optProjectId,
  )

  return optProjectIndex
}

export function registerCommand(
  context: ExtensionContext,
  slideExplorer: SlideExplorer,
) {
  /**
   * command about project
   */
  commands.registerCommand('code-slides.openProjectDataFile', async () => {
    workspace
      .openTextDocument(
        path.join(context.globalStorageUri.fsPath, `${PROJECT_TAG}.json`),
      )
      .then((doc) => {
        window.showTextDocument(doc)
      })
  })

  commands.registerCommand('code-slides.deleteAllProject', async () => {
    const projects = CodeSlidesProjectData.getProjects()
    const deleteAllConfirmText = 'Delete Anyway'
    if (!projects.length) {
      window.showWarningMessage('There is no project')
      return
    }

    const result = await window.showWarningMessage(
      `Are you really want to delete all projects? data can not recover after delete!`,
      { modal: true },
      deleteAllConfirmText,
    )

    if (result === deleteAllConfirmText) {
      CodeSlidesProjectData.setProjects([])
      window.showInformationMessage(`All projects are deleted`)
    }
  })

  commands.registerCommand('code-slides.setOptProject', async () => {
    const projects = CodeSlidesProjectData.getProjects()
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
      const projects = CodeSlidesProjectData.getProjects()

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
        const project = new ProjectTreeItem(result, true)
        CodeSlidesProjectData.setProjects([...projects, project])
        GlobalState.setCurrentOptProjectId(project.id)
        slideExplorer.treeView.reveal(project, {
          expand: true,
          focus: true,
        })
        window.showInformationMessage(`[Project ${result}] has been added`)
      }
    }),
  )

  commands.registerCommand(
    'code-slides.renameProject',
    async (node: ProjectTreeItem) => {
      const { title: optNodeTitle, id: optNodeId } = node
      const projects = CodeSlidesProjectData.getProjects()
      GlobalState.setCurrentOptProjectId(optNodeId)

      const result = await window.showInputBox({
        value: optNodeTitle,
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
        CodeSlidesProjectData.setProjects(projects)
        window.showInformationMessage(
          `[Project ${optNodeTitle}] has been renamed to ${result}`,
        )
      }
    },
  )

  commands.registerCommand(
    'code-slides.clearProjectSlide',
    async (node: ProjectTreeItem) => {
      const clearText = 'Clear Anyway'
      const { title: optNodeTitle, id: optNodeId } = node
      const projects = CodeSlidesProjectData.getProjects()
      GlobalState.setCurrentOptProjectId(optNodeId)

      const result = await window.showWarningMessage(
        `Are you really want to clear all [Project ${optNodeTitle}]'s slides?`,
        { modal: true },
        clearText,
      )

      if (result === clearText) {
        const nodeIndex = projects.findIndex(
          (item: ProjectTreeItem) => item.id === node.id,
        )
        projects[nodeIndex].children = []
        CodeSlidesProjectData.setProjects(projects)
        window.showInformationMessage(
          `[Project ${optNodeTitle}] has been cleared`,
        )
      }
    },
  )

  commands.registerCommand(
    'code-slides.deleteProject',
    async (node: ProjectTreeItem) => {
      const deleteConfirmText = 'Delete Anyway'
      const { title: optNodeTitle, id: optNodeId } = node
      const projects = CodeSlidesProjectData.getProjects()
      const currentOptProjectId = GlobalState.getCurrentOptProjectId()

      const result = await window.showWarningMessage(
        `Are you really want to delete [Project ${optNodeTitle}]?`,
        { modal: true },
        deleteConfirmText,
      )

      if (result === deleteConfirmText) {
        const nodeIndex = projects.findIndex(
          (item: ProjectTreeItem) => item.id === node.id,
        )
        projects.splice(nodeIndex, 1)
        CodeSlidesProjectData.setProjects(projects)
        if (optNodeId === currentOptProjectId) {
          GlobalState.setCurrentOptProjectId(null)
        }
        window.showInformationMessage(
          `[Project ${optNodeTitle}] has been deleted`,
        )
      }
    },
  )

  /**
   * command about slide
   */
  context.subscriptions.push(
    commands.registerCommand(
      'code-slides.addSlideStart',
      async (node?: ProjectTreeItem) => {
        const projects = CodeSlidesProjectData.getProjects()
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
        if (node?.id) {
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
            projects.length &&
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
          // give slide a init filePath
          if (window.activeTextEditor) {
            slide.slideFilePath = window.activeTextEditor.document.fileName
          }
          projects[optProjectIndex].children.push(slide)
          CodeSlidesProjectData.setProjects(projects)
          GlobalState.setCurrentOptSlide(slide)
          slideExplorer.treeView.reveal(slide, {
            expand: true,
            focus: true,
          })
          window.showInformationMessage(
            `[Slide ${result}] has been created. Now go to record lines you need to highlight`,
          )
        }
      },
    ),
  )

  commands.registerCommand('code-slides.addSlideEnd', async () => {
    const projects = CodeSlidesProjectData.getProjects()
    const currentOptSlide = GlobalState.getCurrentOptSlide()
    let optProjectId = GlobalState.getCurrentOptProjectId()
    const optProjectIndex = projects.findIndex(
      (item: ProjectTreeItem) => item.id === optProjectId,
    )
    const editSlideIndex = projects[optProjectIndex].children.findIndex(
      (item: ProjectTreeItem) => item.id === currentOptSlide?.id,
    )

    if (!currentOptSlide) {
      return
    }
    if (editSlideIndex !== -1) {
      projects[optProjectIndex].children[editSlideIndex].highlightLines =
        currentOptSlide?.highlightLines
      projects[optProjectIndex].children[editSlideIndex].slideFilePath =
        currentOptSlide?.slideFilePath
    } else {
      // never in this logic
      projects[optProjectIndex].children.push(currentOptSlide)
    }

    CodeSlidesProjectData.setProjects(projects)
    GlobalState.setCurrentOptSlide(null)
    unHighlightActiveEditor()
    currentOptSlide &&
      slideExplorer.treeView.reveal(currentOptSlide, {
        expand: true,
        focus: true,
      })
    window.showInformationMessage(
      `[Slide ${currentOptSlide?.title}] has been added to [Project ${projects[optProjectIndex].title}]`,
    )
  })

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
      await openNewEditor(node.slideFilePath)
      highlightEditor(window.activeTextEditor, node)
      slideExplorer.treeView.reveal(node, {
        expand: true,
        focus: true,
      })

      window.showInformationMessage(`[Slide ${node.title}] is in editing`)
    },
  )

  commands.registerCommand(
    'code-slides.renameSlide',
    async (node: ProjectTreeItem) => {
      const { title: optNodeTitle, id: optNodeId, parentId: optParentId } = node
      const projects = CodeSlidesProjectData.getProjects()
      const parentIndex = projects.findIndex(
        (item: ProjectTreeItem) => item.id === node.parentId,
      )
      GlobalState.setCurrentOptProjectId(optParentId || null)

      const result = await window.showInputBox({
        value: optNodeTitle,
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
        CodeSlidesProjectData.setProjects(projects)
        slideExplorer.treeView.reveal(node, {
          expand: true,
          focus: true,
        })
        window.showInformationMessage(
          `[Slide ${optNodeTitle}] has been renamed to ${result}`,
        )
      }
    },
  )

  commands.registerCommand(
    'code-slides.deleteSlide',
    async (node: ProjectTreeItem) => {
      const { title: optNodeTitle, id: optNodeId, parentId: optParentId } = node
      const deleteConfirmText = 'Delete Anyway'
      const projects = CodeSlidesProjectData.getProjects()
      GlobalState.setCurrentOptProjectId(optParentId || null)

      const result = await window.showWarningMessage(
        `Are you really want to delete [Slide ${optNodeTitle}]?`,
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
        CodeSlidesProjectData.setProjects(projects)
        window.showInformationMessage(
          `[Slide ${optNodeTitle}] has been deleted`,
        )
      }
    },
  )

  commands.registerCommand(
    'code-slides.clickSlide',
    async (node: ProjectTreeItem) => {
      const playStatusInfo = GlobalState.getInPlayingStatusInfo()
      const currentOptSlide = GlobalState.getCurrentOptSlide()
      const activeEditor = window.activeTextEditor

      slideExplorer.treeView.reveal(node, {
        expand: true,
        focus: true,
      })
      GlobalState.setCurrentOptProjectId(node.parentId || null)

      // not work while slide editing
      if (currentOptSlide) {
        return
      }

      if (
        focusNodeinfo?.id === node.id &&
        focusNodeinfo?.isHighlight &&
        activeEditor?.document.fileName === node.slideFilePath
      ) {
        focusNodeinfo = { id: node.id, isHighlight: false }
        unHighlightActiveEditor()
      } else {
        focusNodeinfo = { id: node.id, isHighlight: true }
        await openNewEditor(node.slideFilePath)
        highlightEditor(window.activeTextEditor, node)
      }
    },
  )

  /**
   * command about project play
   */
  context.subscriptions.push(
    commands.registerCommand(
      'code-slides.playProjectFromStart',
      async (node?: ProjectTreeItem) => {
        let toPlayProjectNode: ProjectTreeItem | undefined
        const projects = CodeSlidesProjectData.getProjects()
        const currentOptProjectId = GlobalState.getCurrentOptProjectId()
        if (node) {
          toPlayProjectNode = node
        } else if (currentOptProjectId) {
          toPlayProjectNode = projects.find(
            (item: ProjectTreeItem) => item.id === currentOptProjectId,
          )
        } else {
          const selectedOptProject: any = await commands.executeCommand(
            'code-slides.setOptProject',
          )
          if (selectedOptProject) {
            GlobalState.setCurrentOptProjectId(selectedOptProject.id)
            toPlayProjectNode = selectedOptProject
          } else {
            projects.length &&
              window.showWarningMessage(
                `You need to set operation Project first`,
              )
            return
          }
        }

        if (toPlayProjectNode) {
          const optNodeName = toPlayProjectNode.title
          if (toPlayProjectNode.children.length) {
            GlobalState.setInPlayingStatusInfo({
              inPlayingNode: toPlayProjectNode,
              currentSlideIndex: 0,
            })
            GlobalState.setCurrentOptProjectId(toPlayProjectNode.id)
            highlightSlide(slideExplorer, toPlayProjectNode.children[0])
            window.showInformationMessage(
              `Project ${optNodeName} is now playing`,
            )
          } else {
            window.showWarningMessage(
              `Project ${optNodeName} has no slide yet. Try to add one`,
            )
          }
        }
      },
    ),
  )

  context.subscriptions.push(
    commands.registerCommand(
      'code-slides.stopPlayProject',
      async (node: ProjectTreeItem) => {
        focusNodeinfo = null
        GlobalState.setInPlayingStatusInfo(null)
        unHighlightActiveEditor()
        window.showInformationMessage(`code-slides has stoped play mode`)
      },
    ),
  )

  commands.registerCommand(
    'code-slides.playProjectFromHere',
    async (node: ProjectTreeItem) => {
      const projects = CodeSlidesProjectData.getProjects()
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
      highlightSlide(slideExplorer, projects[parentIndex].children[childIndex])
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
      highlightSlide(
        slideExplorer,
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
      highlightSlide(
        slideExplorer,
        playStatusInfo.inPlayingNode.children[nextSlideIndex],
      )
    }
  })

  context.subscriptions.push(
    commands.registerTextEditorCommand(
      'code-slides.addIntoSlide',
      async (
        textEditor: TextEditor,
        edit: TextEditorEdit,
        node?: ProjectTreeItem,
      ) => {
        const projects = CodeSlidesProjectData.getProjects()
        let res = await checkIfDiscardUnsavedSlides()
        if (!res) {
          return
        }
        let optProjectIndex = await getCurrentOptSlide(projects, node)

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
          const currentSelection: Array<Array<number>> = []
          textEditor.selections.forEach((selection) => {
            currentSelection.push([selection.start.line, selection.end.line])
          })
          // give slide a init filePath
          slide.slideFilePath = textEditor.document.fileName
          slide.highlightLines = currentSelection
          projects[optProjectIndex].children.push(slide)
          CodeSlidesProjectData.setProjects(projects)
          slideExplorer.treeView.reveal(slide, {
            expand: true,
            focus: true,
          })
          GlobalState.setCurrentOptSlide(null)
          window.showInformationMessage(
            `[Slide ${result}] has been added to [Project ${projects[optProjectIndex].title}]`,
          )
        }
      },
    ),
  )
}
