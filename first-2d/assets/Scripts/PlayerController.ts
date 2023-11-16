import {_decorator, Component, Node, input, EventMouse, Input, Vec3, Animation, Prefab} from 'cc';

const {ccclass, property} = _decorator;

export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private _startJump: boolean = false;
    private _jumpStep: number = 0;
    private _curJumpTime: number = 0;
    private _jumpTime: number = 0.1;
    private _curJumpSpeed: number = 0;
    private _curPos: Vec3 = new Vec3();
    private _targetPos: Vec3 = new Vec3();
    private _curMoveIndex: number = 0;

    @property(Animation)
    BodyAnim: Animation = null;


    public boxPrefab: Prefab | null = null;

    start() {

    }

    setInputActive(active: boolean){
        if(active){
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }else{
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime >= this._jumpTime) {
                this._startJump = false;
                this.node.setPosition(this._targetPos);

                this.onJumpEnd();
            } else {
                this._curPos.x += this._curJumpSpeed * deltaTime;
                this.node.setPosition(this._curPos)
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);

        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: number) {
        if (this._startJump) {
            return
        }

        if (this.BodyAnim) {
            const flipName = step === 1 ? "OneStep" : "TwoStep";
            const state = this.BodyAnim.getState(flipName);
            this._jumpTime = state.duration;
            this.BodyAnim.play(flipName);
        }

        this._startJump = true;
        this._jumpStep = step * BLOCK_SIZE;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

        this._curMoveIndex += step;
    }

    reset(){
        this._curMoveIndex = 0;
    }

    onJumpEnd(){
        this.node.emit("JumpEnd", this._curMoveIndex);
    }
}

