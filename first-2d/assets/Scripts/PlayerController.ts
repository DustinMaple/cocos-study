import { _decorator, Component, Node, input, EventMouse, Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    start() {
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    update(deltaTime: number) {
        
    }

    onMouseUp(event: EventMouse){
        if (event.getButton() === 0){
            this.jumpByStep(1);
        }else if (event.getButton() === 2){
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: Number){
        
    }
}

