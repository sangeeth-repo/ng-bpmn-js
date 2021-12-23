import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { from, Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import customControlsModule from 'src/app/custom-bpmnjs/palette';
import customPropertiesProviderModule from 'src/app/custom-bpmnjs/properties/provider/custom';
import customModdleDescriptor from 'src/app/custom-bpmnjs/properties/descriptors/custom.json';
import taskTemplate from 'src/app/custom-bpmnjs/element-templates/task-template.json';
//import testTemplate from 'src/app/custom-bpmnjs/element-templates/test.json';
//import sampleTemplate from 'camunda-modeler/resources/element-templates/samples.json';

@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements OnInit {
  private bpmnJS: BpmnJS;
  private myTasks: any[];

  @ViewChild('ref', { static: true }) private el!: ElementRef;
  @Output() private importDone: EventEmitter<any> = new EventEmitter();
  @Input() public file: string;

  constructor(
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    /*     this.getServiceTasks().subscribe(data => {
          sessionStorage.setItem("serviceTasks", data);
        });
     */
    this.myTasks = [
      {
        "name": "Task Template",
        "id": "taskTemplate",
        "appliesTo": ["bpmn:ServiceTask"],
        "properties": [
          {
            "label": "Tasks",
            "type": "String",
            "editable": true,
            "binding": {
              "type": "property",
              "name": "camunda:class"
            }
          }
        ]
      }
    ];

    this.initBpmn();
  }

  initBpmn(): void {
    this.bpmnJS = new BpmnJS({
      propertiesPanel: {
        parent: '#properties'
      },
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
        customControlsModule,
        customPropertiesProviderModule
      ],
      elementTemplates: taskTemplate,
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
        custom: customModdleDescriptor
      }
    });

    this.bpmnJS.on('import.done', ({ error }: { error: any }) => {
      if (!error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      }
    });

    this.bpmnJS.on('elementTemplates.errors', function (event) {
      console.log('template load errors', event.errors);
    });
    this.bpmnJS.get('elementTemplatesLoader').reload();

    this.bpmnJS.attachTo(this.el.nativeElement);
    this.loadDiagram(this.file);
  }

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes.file) {
      this.loadDiagram(changes.file.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  loadDiagram(file: string): Subscription {
    return (
      this.http.get('/assets/bpmn/default.bpmn', { responseType: 'text' })
        .pipe(
          switchMap((xml: string) => this.importDiagram(xml)),
          map(result => result.warnings),
        ).subscribe(
          (warnings: any) => {
            this.importDone.emit({
              type: 'success',
              warnings
            });
          },
          (err: any) => {
            this.importDone.emit({
              type: 'error',
              error: err
            });
          }
        )
    );
  }

  private importDiagram(xml: string): Observable<{ warnings: Array<any> }> {
    return from(this.bpmnJS.importXML(xml) as Promise<{ warnings: Array<any> }>);
  }

  getBpmnContent(): Promise<void> {
    return this.bpmnJS.saveXML({ format: true });
  }

  getServiceTasks(): Observable<any> {
    return this.http.get('assets/bpmn/serviceTasks.json');
  }
}
