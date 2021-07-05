import { ExtensionContext } from 'vscode'
import {
  HelpAndFeedbackView,
  Link,
  StandardLinksProvider,
  ProvideFeedbackLink,
  Command,
} from 'vscode-ext-help-and-feedback-view'

export class HelpAndFeedbackExplorer {
  constructor(context: ExtensionContext) {
    const items = new Array<Link | Command>()
    const predefinedProvider = new StandardLinksProvider('Craster.code-slides')
    items.push(predefinedProvider.getGetStartedLink())
    // items.push(new ProvideFeedbackLink('code-slides'))
    items.push(predefinedProvider.getReviewIssuesLink())
    items.push(predefinedProvider.getReportIssueLink())
    // items.push({
    //   icon: 'heart',
    //   title: 'Support',
    //   command: 'codeSlides.supportProjectManager',
    // })
    new HelpAndFeedbackView(context, 'codeSlidesView.feedback', items)
  }
}
