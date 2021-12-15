import { Component, ViewChild } from '@angular/core';
import { DiagramComponent } from './diagram/diagram.component';
//import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-bpmn-js';
  diagramFile = 'default.bpmn';
  importError?: Error;

  @ViewChild(DiagramComponent) diagramComponent: DiagramComponent;

  loadWorkflow(workflowFile: string): void {
    this.diagramFile = workflowFile;
  }

  clearEditor(): void {
    this.diagramFile = 'default.bpmn';
  }

  handleImported(event: any) {
    const {
      type,
      error,
      warnings
    } = event;

    if (type === 'success') {
      console.log(`Rendered diagram (%s warnings)`, warnings.length);
    }

    if (type === 'error') {
      console.error('Failed to render diagram', error);
    }

    this.importError = error;
  }

  async saveWorkFlow(navigateTo?: any): Promise<void> {
    try {
      let bpmnContent: any = await this.diagramComponent.getBpmnContent();
      console.log(bpmnContent.xml);

    } catch (err) {
      // console.log(err)
    }
  }
}
