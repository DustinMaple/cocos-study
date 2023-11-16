import {_decorator, CCInteger, Component, instantiate, Label, Node, Prefab, Vec3} from 'cc';
import {BLOCK_SIZE, PlayerController} from "db://assets/Scripts/PlayerController";

const {ccclass, property} = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE,
}

enum GameState{
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property({type: Prefab})
    public boxPrefab: Prefab | null = null;

    @property({type: CCInteger})
    public roadLength: number = 50;

    @property({type: Node})
    public startMenu: Node|null = null;
    @property({type: Label})
    public stepLabel: Label|null = null;
    @property({type: PlayerController})
    public playerCtrl: PlayerController|null = null;


    private _road: BlockType[] = [];

    start() {
        this.generateLoad();
    }

    generateLoad() {
        this.node.removeAllChildren();

        this._road = [];
        this._road.push(BlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; ++i) {
            if (this._road[i - 1] == BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this.roadLength; ++j) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(blockType: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }

        let block: Node|null = null;
        switch (blockType){
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }

        return block;
    }

    setCurState(state: GameState){
        switch(state){
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                this.player();
                break;
            case GameState.GS_END:
                this.end();
                break;
        }
    }
    end() {
        console.info("游戏结束")
    }

    player() {
        if(this.startMenu){
            this.startMenu.active = false;
        }

        if(this.stepLabel){
            this.stepLabel.string = "0";
        }

        setTimeout(()=>{
            if(this.playerCtrl){
                this.playerCtrl.setInputActive(true);
            }
        }, 0.1);
    }
    
    init() {
        if(this.startMenu){
            this.startMenu.active = true;
        }

        this.generateLoad();

        if(this.playerCtrl){
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();

        }
    }
}

