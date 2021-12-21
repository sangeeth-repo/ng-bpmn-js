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


@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements OnInit {
  private bpmnJS: BpmnJS;

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
