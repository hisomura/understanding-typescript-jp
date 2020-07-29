enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void

class State<T> {
  protected listeners: Listener<T>[] = []

  addListener(listener: Listener<T>) {
    this.listeners.push(listener)
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = []
  private static instance: ProjectState

  private constructor() {
    super()
  }

  static getInstance() {
    if (!this.instance) this.instance = new ProjectState()
    return this.instance
  }

  addProject(title: string, description: string, manday: number) {
    const newProject = new Project(Math.random().toString(), title, description, manday, ProjectStatus.Active)
    this.projects.push(newProject)
    for (const listener of this.listeners) {
      listener(this.projects.slice())
    }
  }
}

const projectState = ProjectState.getInstance()

interface Validatable {
  value: string | number
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

function validate(input: Validatable) {
  let isValid = true
  if (input.required) {
    isValid = isValid && input.value.toString().trim().length !== 0
  }
  if (input.minLength != null && typeof input.value === 'string') {
    isValid = isValid && input.value.length >= input.minLength
  }
  if (input.maxLength != null && typeof input.value === 'string') {
    isValid = isValid && input.value.length <= input.maxLength
  }
  if (input.min != null && typeof input.value === 'number') {
    isValid = isValid && input.value >= input.min
  }
  if (input.max != null && typeof input.value === 'number') {
    isValid = isValid && input.value <= input.max
  }

  return isValid
}

// auto-bind decorator
function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this)
    },
  }

  return adjDescriptor
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement
  hostElement: T
  element: U

  constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
    this.templateElement = document.getElementById(templateId) as HTMLTemplateElement
    this.hostElement = document.getElementById(hostElementId) as T
    const importNode = document.importNode(this.templateElement.content, true)
    this.element = importNode.firstElementChild as U

    if (newElementId) {
      this.element.id = newElementId
    }
    this.attach(insertAtStart)
  }

  protected abstract configure(): void
  protected abstract renderContent(): void

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
  }
}

class ProjectItem extends Component<HTMLUListElement, HTMLElement> {
  private project: Project

  get manday() {
    if (this.project.manday < 20) {
      return this.project.manday.toString() + '人日'
    } else {
      return (this.project.manday / 20).toString() + '人月'
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id)
    this.project = project
    this.configure()
    this.renderContent()
  }

  protected configure() {}

  protected renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title
    this.element.querySelector('h3')!.textContent = this.manday
    this.element.querySelector('p')!.textContent = this.project.description
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[] = []

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`)
    this.configure()
    this.renderContent()
  }

  private renderProject() {
    const listEl = document.getElementById(`${this.type}-projects-list`)!
    listEl.innerHTML = ''
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(listEl.id, prjItem)
    }
  }

  protected configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active
        }
        return prj.status === ProjectStatus.Finished
      })
      this.assignedProjects = relevantProjects
      this.renderProject()
    })
  }

  protected renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent = this.type === 'active' ? '実行中プロジェクト' : '完了プロジェクト'
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const projectInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')
