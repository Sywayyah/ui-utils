import { Observable } from 'rxjs';
import { UINodesEditor } from '../nodes-editor';
import { UINode } from '../node';
import { BaseEditingContext, EditingContextDeserializeParams, EditingContextParams } from './context-base';
import {
  ContextProperty,
  ContextPropertyConfig,
  SerializedContextProp,
} from '../node-input-context';
import { deserializeToFile, serializeFile } from '../../utils/files';

export type ImageFileValue = {
  readonly image: null | {
    readonly file: File;
    readonly objectUrl: string;
  };
};

export type SerializedImageFileValue = {
  readonly image: { readonly fileName: string; readonly content: string } | null;
};

export type ImageFileParams = EditingContextParams<{
  readonly context: {
    readonly prop: ContextProperty<ImageFileValue, SerializedImageFileValue>;
  };
  readonly sType: {
    readonly value: SerializedContextProp<SerializedImageFileValue>;
  };
  readonly vType: ImageFileValue;
  readonly params: {};
}>;

const imageFilePropConfig = (): ContextPropertyConfig<
  ImageFileValue,
  SerializedImageFileValue
> => ({
  async deserialize({ sVal }) {
    if (!sVal.image?.content) {
      return { image: null };
    }

    const deserializedFile = deserializeToFile(sVal.image.content, sVal.image.fileName);

    return { image: { file: deserializedFile, objectUrl: URL.createObjectURL(deserializedFile) } };
  },
  async serialize({ val }) {
    const file = val.image?.file;

    if (file) {
      return serializeFile(file).then((base64String) => ({
        image: {
          content: base64String,
          fileName: file.name,
        },
      }));
    }

    return { image: null };
  },
  onValueSet({ prevVal }): void {
    const prevImgUrl = prevVal?.image?.objectUrl;

    if (prevImgUrl) {
      URL.revokeObjectURL(prevImgUrl);
    }
  },
  onDestroyed({ value }): void {
    const imgUrl = value?.image?.objectUrl;
    if (imgUrl) {
      URL.revokeObjectURL(imgUrl);
    }
  },
});

export class ImageFileEditingContext<
  const T extends ImageFileParams,
> extends BaseEditingContext<T> {
  override changes(params: { readonly context: T['context'] }): Observable<unknown> {
    return params.context.prop.value.listen();
  }

  static create(): ImageFileEditingContext<ImageFileParams> {
    return new ImageFileEditingContext({});
  }

  override async createContext(params: { readonly parentNode: UINode }): Promise<T['context']> {
    return {
      prop: await ContextProperty.createNew({
        initVal: { image: null },
        propConfig: imageFilePropConfig(),
        parentNode: params.parentNode,
      }),
    };
  }

  override async serialize(params: {
    readonly context: T['context'];
    readonly editor: UINodesEditor;
  }): Promise<T['sType']> {
    return { value: await params.context.prop.serialize({ editor: params.editor }) };
  }

  override async deserialize(params: EditingContextDeserializeParams<T>): Promise<T['context']> {
    return {
      prop: await ContextProperty.deserialize({
        editor: params.editor,
        propConfig: imageFilePropConfig(),
        sProp: params.sVal.value,
        parentNode: params.parentNode
      }),
    };
  }

  override value(params: { readonly context: T['context'] }): T['vType'] {
    return params.context.prop.value.getValue();
  }

  override destroy(params: { readonly context: T['context'] }): void {
    params.context.prop.destroy();
  }
}
