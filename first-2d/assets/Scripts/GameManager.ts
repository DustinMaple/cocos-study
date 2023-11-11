import {_decorator, CCInteger, Component, instantiate, Node, Prefab} from 'cc';
import {BLOCK_SIZE} from "db://assets/Scripts/PlayerController";

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
}


