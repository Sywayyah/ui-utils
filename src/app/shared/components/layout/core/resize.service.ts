import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type {
  HanderHorSide,
  HanderVertSide,
  HandlerResizeEvent,
  ResizeHandlerType,
} from '../components/resize-handler/resize-handler';

@Injectable()
export class ResizeService {
  readonly resizeSubject$ = new Subject<{
    readonly horSide?: HanderHorSide;
    readonly vertSide?: HanderVertSide;
    readonly type: ResizeHandlerType;
    readonly movementData: HandlerResizeEvent;
  }>();

  readonly click$ = new Subject<{
    readonly horSide?: HanderHorSide;
    readonly vertSide?: HanderVertSide;
    readonly type: ResizeHandlerType;
  }>();
}
