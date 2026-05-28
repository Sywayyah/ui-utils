import { Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import {
  ScriptEditingContext,
  ScriptContextParams,
} from '../../../../core/nodes/editing-context/script';
import { ContextBaseComponent } from './input-components';
import * as monaco from 'monaco-editor';

@Component({
  template: `
    <div class="editor-container">
      <ngx-monaco-editor
        [options]="editorOptions"
        [(ngModel)]="code"
        (onInit)="onEditorInit($event)"
      >
      </ngx-monaco-editor>
    </div>
  `,
  imports: [FormsModule, MonacoEditorModule],
  styles: `
    .editor-container {
      width: 100%;
      height: 500px; /* Обязательно укажите высоту */
      border: 1px solid #444;
      $width: 500px;
      min-width: $width;
      max-width: $width;
    }

    ngx-monaco-editor {
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptEditingComponent extends ContextBaseComponent<
  ScriptEditingContext<ScriptContextParams<string>>
> {
  // todo: improve types, maybe output errors, @defer and optimizations
  readonly code = signal('');
  readonly init = signal(false);
  private editorInstance?: monaco.editor.IStandaloneCodeEditor;

  readonly editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    automaticLayout: true,
    minimap: { enabled: false },
  };

  constructor() {
    super();

    effect(async () => {
      const code = this.code();

      if (!this.init()) return;

      this.context().instance.script.setValue(code);
      const compiled = await this.compileScript();
      this.context().instance.compiled.setValue(compiled);
    });
  }

  ngOnInit(): void {
    this.code.set(this.context().instance.script.getValue());
    this.init.set(true);
  }

  // executed when editor is ready
  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor): void {
    // global monaco object
    const monaco = (window as any).monaco;
    this.editorInstance = editor;

    if (monaco) {
      //  TypeScript (ES2020, strict mode)
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        alwaysStrict: true,
      });

      // Custom type definitions
      const customTypes = this.inputParams().types;

      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        customTypes,
        'ts:filename/global-env.d.ts',
      );
    }
  }

  private async compileScript(): Promise<string> {
    const monaco = (window as any).monaco;
    if (!this.editorInstance || !monaco) return '';

    try {
      // 1. get current worker model
      const model: monaco.editor.ITextModel | null = this.editorInstance.getModel();
      if (!model) return '';
      const worker = await monaco.languages.typescript.getTypeScriptWorker();
      const client = await worker(model.uri);

      // 2. transforming ts into js
      const emitResult = await client.getEmitOutput(model.uri.toString());
      const javascriptCode = emitResult.outputFiles[0].text;
      return javascriptCode;
    } catch (e) {
      return '';
    }
  }
}
