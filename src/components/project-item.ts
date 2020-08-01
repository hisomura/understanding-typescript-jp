import { Draggable } from '../models/drag-drop.js'
import { Component } from './base-components.js'
import { Project } from '../models/project.js'
import { autoBind } from '../decorators/auto-bind.js'

export class ProjectItem extends Component<HTMLUListElement, HTMLElement> implements Draggable {
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

  @autoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id)
    event.dataTransfer!.effectAllowed = 'move'
  }

  dragEndHandler(_: DragEvent) {
    console.log('drag end')
  }

  protected configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
  }

  protected renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title
    this.element.querySelector('h3')!.textContent = this.manday
    this.element.querySelector('p')!.textContent = this.project.description
  }
}