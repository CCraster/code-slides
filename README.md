# CodeSlides

Show you code like slide in vscode

## Features

- Capture code snippets and Highlight them
- Organize multiple code snippets as Slides and store these slides as Project
- Present multiple slides under the chosen project
- Can choose code snippets from different codebase and store them at the same project
- Provide the Side Bar View to visualize, explore, and manage all slides and projects
- Freely switch among different slides

## Getting Started with Code Slides

1. Open `Code Slides` at vscode Side Bar.
2. Create project.
3. Add one Silde into the project.
4. Choose a code snippet you want to highlight in a code file, and click the "Add Slide End" button at Side Bar or Toolbar, so that this code snippet can be saved in the current slide.
5. Click the play button named "Code Slides: Start Play Project" and start your presentation now!

## Configuration

CodeSlides is configurable. Here's a demo and list of settings you can change:

```
{
  "highlightMode": "Weaken Unhighliht Line",
  "lineWeakenColor": {
    "opacity": "0.2",
  },
  "lineStrengthenColor": {
    "backgroundColor": "rgba(255, 0, 0, 0.5)",
  },
  "hideStatusBar": "false",
  "statusBarNormalColor": "#fff",
  "statusBarPlayingColor": "#0f0",
}
```

**`code-slides.highlightMode`:** The highlight mode in presentation. Can choose from 3 values: "Weaken Unhighliht Line", "Strengthen Highliht Line", "Both", and can used with "lineWeakenRenderOptions" and "lineStrengthenRenderOptions" together.

**`code-slides.lineWeakenRenderOptions`:** The [VSCode decoration render options](https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions) for weaken.

**`code-slides.lineStrengthenRenderOptions`:** The [VSCode decoration render options](https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions) for strengthen.

**`code-slides.hideStatusBar`:** Boolean value to hide the status bar(Not very recommended)

**`code-slides.statusBarNormalColor`:** The background color of the status bar when not playing slides. Can be any valid CSS color.

**`code-slides.statusBarPlayingColor`:** The background color of the status bar when playing slides. Can be any valid CSS color.

## Keyboard Shortcuts
|  Name   | Description  | Windows Platform | MacOS Platform |
|  ----  | ----  | ----  | ----  |
| code-slides.addProject | create a project | alt+ctrl+n | alt+cmd+n |
| code-slides.addSlideStart | add a slide under a project | alt+ctrl+a | alt+cmd+a |
| code-slides.playProjectFromStart | start presentation from a project | alt+ctrl+c | alt+cmd+c |
| code-slides.stopPlayProject | stop presentation from a project | alt+ctrl+c | alt+cmd+c |
| code-slides.showPreSlide | switch to the previous slide | alt+ctrl+left | alt+cmd+left |
| code-slides.showNextSlide | switch to the next slide | alt+ctrl+right | alt+cmd+right |

## Acknowledgements

