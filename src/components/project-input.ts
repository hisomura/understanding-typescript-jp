import { Component } from './base-components'
import { Validatable, validate } from '../util/validation'
import { autoBind } from '../decorators/auto-bind'
import { projectState } from '../state/project-state'

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  mandayInputElement: HTMLInputElement

  constructor() {
    super('project-input', 'app', true, 'user-input')
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.mandayInputElement = this.element.querySelector('#manday') as HTMLInputElement
    this.configure()
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value
    const enteredDescription = this.descriptionInputElement.value
    const enteredManday = this.mandayInputElement.value

    const titleValidatable: Validatable = { value: enteredTitle }
    const descriptionValidatable: Validatable = { value: enteredDescription, required: true, minLength: 5 }
    const mandayValidatable: Validatable = { value: +enteredManday, required: true, min: 1, max: 1000 }

    if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(mandayValidatable)) {
      alert('入力値が正しくありません')
      return
    } else {
      return [enteredTitle, enteredDescription, +enteredManday]
    }
  }

  private clearInput() {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.mandayInputElement.value = ''
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault()
    const userInput = this.gatherUserInput()
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput
      projectState.addProject(title, desc, manday)
      this.clearInput()
    }
  }

  protected renderContent() {}

  protected configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this))
  }
}
