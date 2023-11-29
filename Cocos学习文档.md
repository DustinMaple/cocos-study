# Cocos学习文档

[TOC]

<脚本基础之前的内容需要后面补充>

## 脚本

### 脚本基础

每个组件的类名不能相同，是全局不能相同。

脚本的模板文件存储在：.creator/asset-template/typescript中



#### 装饰器

类似java的注解，用来提供额外信息。

**ccclass**

修饰class为ccclass

提供功能如下：

* 序列化。在序列化的时候会记录类名。反序列化会使用。
* 使用名称，从Node中查找组件。

PS：

两个功能有一定联系。

此处说的序列化是指将编辑的内容保存到xxx.scene文件。



#### 组件类装饰器

**executeInEditMode**

让生命周期在编辑器模式下生效，默认false





**requireComponent**

指定依赖的组件，默认null。当使用了装饰器的组件添加到某个节点上，并且这个节点不存在依赖的组件，引擎会自动添加依赖的组件。

```typescript
@ccclass('Example')
@requireComponent(Sprite)
export class Example extends Component {
  
}
```



**executionOrder**

指定生命周期执行优先级。小于0先执行，大于0后执行。

* 同一节点上的不同组件，数值数值小的先执行，数值相同，按添加顺序。
* 不同节点，按节点数排列的顺序。

该优先级只对onLoad、onEnable、start、update、lateUpdate有效。对onDisable和onDestroy无效。

```typescript
@ccclass('Example')
@executionOrder(3)
xxx
```



**disallowMultiple**

设置该组件不能重复出现在同一个节点上，默认false。



**menu**

让该组件能够出现在Inspector的Add Component按钮中。



**help**

指定某个属性的帮助文档http路径。



#### 属性修饰器

**property**

修饰字段，让该字段能够出现在Inspector界面中。

需要指定type，如果不指定，会根据属性的默认值进行分析。指定的类型必须是CC的内部类型。如CCInteger，CCFloat，CCBoolean，CCString，Node，数组等。

```typescript
@property({
  type: Node,
  visible: true,
})
myNode: Node|null = null;
```



**精简的属性修饰器**

@type(t) -> @property(t)

@integer -> @property(CCInteger)

@float -> @property(CCFloat)



**visible的使用**

因为Inspector默认会根据字段名进行显隐的控制，如字段以`_`开头，则不显示。可以通过visbile来强制控制显隐。



**serializable**

属性默认都会被序列化进场景等资源文件，可以通过这个值强制控制。



**override**

默认子类会继承父类的所有属性，如果想要通过字段名进行覆盖，需要用override控制。



**group**

顾名思义，指定组名。有两种方式

* 直接指定组名，@property({ group: {name}})
* 精准控制，@property({ group: { id, name, displayOrder, style }})
  * id，分组的唯一标识，string类型
  * 名称
  * 展示顺序，升序排列
  * 样式，氛围tab和section两种，默认tab



详细内容可参考https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html



**内置类型**

Color 颜色

RealCurve 曲线

CurveRange 曲线范围

Gradient 渐变色

GradientRange 渐变色范围



### 生命周期

| 生命周期   | 特点                                                         | 适合逻辑                                                     |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| onLoad     | 节点第一次激活时触发，例如所在场景被载入。可以获取场景中其他节点以及节点的资源数据。 | 数据初始化相关                                               |
| onEnable   | 当组件的enabled属性从false变为true的时候，或所在节点的active属性从false变为true的时候，触发。如果节点第一次加载，则在onLoad之后，start之前触发一次。（会重复触发） |                                                              |
| start      | 第一次调用update前调用。                                     | 处理一些每次enable后，都需要做的初始化。主要配合enable和update使用 |
| update     | 每一帧渲染前执行                                             | 更新物体的行为、状态和方位。                                 |
| lateUpdate | 所有动画，动效（动画、粒子、物理）执行后执行。               |                                                              |
| onDisable  | 与onEnable相反。                                             | 通常执行一些与onEnable内的逻辑相反的事情。                   |
| onDestroy  | 当组件或所在节点调用了destroy，会执行。并在当前帧结束时统一回收组件。 |                                                              |



### 注意事项

有一些属性时ReadOnly的，不建议直接操作。通过使用局部变量和set方法间接修改。

```typescript
get worldPosition(): Readonly<math.Vec3>;
set worldPosition(val: Readonly<math.Vec3>);
```

每个平台下执行的结果可能不同，例如在原生平台上，使用this.node.worldPosition.add(xxx)，结果不会更新。

如：position、rotation、scale、worldPosition、worldRotation、worldScale、eulerAngles、worldMatrix。



### 脚本使用

#### 访问节点和组件

this.node 访问当前组件所在节点。



**获取组件**

this.getComponent(类) 

this.getComponent("类名")

使用node.getComponent同样效果。



**获取其他节点组件**

使用@property，然后在编辑器上赋值。如果字段是Node类型，则使用node.getComponent获取对应组件。



**子节点**

this.node.children

this.node.getChildByName("name")

find("path", this.node)基于第二个参数的节点，使用指定路径进行查询。如果不给第二个参数，默认从根节点开始查询（全局查询）

ps：父子关系都放在node上。猜测，大部分对象相关内容，都是基于node进行实现。功能逻辑，则是实用component实现。



**通过模块访问**

使用

```typescript
import {} from "";
```

可以引入其他组件中定义的export的类，并且可以访问其静态字段。



#### 常用节点和组件接口

| 操作       | 方法                                                         | 注意事项                                                     |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 激活/关闭  | this.node.active = true/false;<br />也可以在编辑器中操作。   | 会触发onEnable和onDisable。<br />节点关闭，组件也会禁用，子节点也会关闭。但是子节点的active值不会改变，所以需要通过activeInHierarchy来拍断是否激活。<br />不在场景中的节点，无法被激活。所以要先添加再设置active。 |
| 更改父节点 | 1. this.node.parent = parentNode;<br />2. this.node.removeFromParent();<br />newParentNode.addChild(this.node); | 移出的时候，会同时移出绑定的时间。<br />新创建的节点，需要设置父节点后，才能正确的完成节点的初始化。 |
| 遍历子节点 | this.node.children返回节点的所有子节点，类型是数组。         | 只会访问直接的子节点，不会递归访问。                         |
| 节点变换   | this.node.position = new Vec3();<br />this.node.setPosition(x, y, z);<br />this.node.setRotation(x, y, z);<br />this.node.setScale(1, 1, 1); | 可以直接通过node，来访问位置、旋转、缩放。                   |



**组件常用接口**

this.enabled：是否每帧执行该组件的update。如果是渲染组件，则控制是否显示。

update：deltaTime是两帧的时间差，单位毫秒。



#### 节点的创建和销毁

let node = new Node('box');//创建一个节点

this.node.addChild(node);// 将节点添加到场景中

instantiate(node);// 使用node创建一个新的node，类似克隆。

instantiate(prefab);// 使用预制体创建一个对象。

node.destroy();// 销毁节点，节点并不会立即移除，而是在当前帧结束后移除。但是其立即进入无效状态



 destroy和removeFromParent的区别：

后者并没有释放，但是出了当前方法，可就访问不到了，直接内存泄漏，所以尽量不要使用。也不要parent = null



#### 计时器

所有计时器的API都在Component中，并且添加的计时器，是以component对象为单位管理的。

this.schedule(function, 5);// 每隔 5秒 执行一次function

this.schedule(function, interval, repeat,delay);// 间隔，重复次数，第一次的延时

this.scheduleOnce(function, 2); // 演示2秒执行，只执行一次

this.unschedule(function); // 取消计时器，这里要保证传递的function是同一个对象。

this.unscheduleAllCallbacks();// 取消当前组件中所有的计时器。



#### 组件

所有继承自Component的类都称为组件类，其实例化出来的对象称为组件。

**组件必须是cc类。**

组件不能通过构造函数创建，不能直接new出来对象。智能通过node.addComponent的方式，添加给某个节点。

```typescript
this.node.addComponent(MyComponent);
```



**初始化顺序**

推荐使用一个总控脚本（如Game.ts），在其中的onLoad方法调用其他脚本的静态方法，来进行精确的初始化顺序控制。

脚本本身是可以给变量进行赋值的。

```typescript
// Game.ts
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Configuration } from './Configuration';
import { GameData } from './GameData';
import { Menu }from './Menu';

@ccclass("Game")
export class Game extends Component {
    private configuration = Configuration;
    private gameData = GameData;
    private menu = Menu;

    onLoad () {
        this.configuration.init();
        this.gameData.init();
        this.menu.init();
    }
}
```



其他方法的调用顺序类似。

同一个节点中的组件，调用顺序与添加顺序一致。可以在Inspector窗口中调整组件的顺序。同时，也可以使用executionOrder装饰器来控制调用顺序。但是，仍然推荐在编辑器中控制，防止第一时间理解错误。



#### 场景控制

director.loadScene("MyScene");// 加载并切换场景

director.loadScene("MyScene", function(err, scene)); // 只加载，并不会立即运行。加载完调用function，如果想运行，则需要再调用director.runScene(scene);

因为第二个回调参数，只能调用当前脚本中方法，所以场景切换的脚本通常挂载在常驻节点上。

director.preloadScene("myScene", function);// 预加载场景，在后台静默加载，之后再次调用loadScene，即可切换。如果调用loadScene的时候，还没有加载完成，会等待加载完成再切换。纯粹的提前开始加载。

其他资源加载内容请参考：https://docs.cocos.com/creator/manual/zh/scripting/scene-managing.html#:~:text=%E5%8F%82%E8%80%83%E6%96%87%E6%A1%A3-,Asset%20Bundle,-%E3%80%82



**常驻节点**

当场景切换后，默认会将场景内所有的节点和实例销毁。如果需要跨场景的节点，用来传递参数，管理跨场景内容的话，需要将该节点标记为 `常驻节点`。方法如下：

```typescript
director.addPersistRootNode(myNode);// 添加
director.removePersistRootNode(myNode);// 移除
```

**需要注意**：

* 目标节点必须位于层级的根节点。
* 移除的时候并不会销毁该节点，只是将他的生命重新归还给场景。



#### 资源的获取和加载

资源都继承自Asset，如Texture2D、SpriteFrame、AnimationClip、Prefab。他们的加载时自动的，并且关联的资源会被一起加载。

一般在组件中定义资源字段，然后在Inpector窗口中赋值。

更多内容请查看 `资源管理->动态加载`



#### 面向对象

**实例化方法（构造方法）**

定义一个类，该类的构造方法命名为constructor，如下：

```typescript
class Foo{
  public bar: Bar = null;
  constructor(){
    this.bar = new Bar();
  }
}
```



**类型判断**

instanceof



**静态变量和方法**

子类可以继承父类的静态变量。继承时，是将父类的变量**浅拷贝**给子类。指向同一个对象。

如果不需要继承，只在局部访问，静态变量可以直接定义在类的外面。



**get/set**

定义属性的get

```typescript
get width(){
  return this._width;
}

@property({type: CCInteger})
private _width = 0;
```

使用了get后，属性不再被序列化，无法使用serializable参数。此时，如果想在Inspector中看到属性，需要在get上添加@property，并且编辑器看到的实际是width，不是_width，并且此时的width是只读的，只能在脚本内部修改\_width，或添加set。set的定义方式和get类似。

```typescript
set width(value){
  this._width = value;
}
```



### 事件系统

#### 监听和发射

使用cc.EventTarget类进行自定义事件的发射和添加监听。

```typescript
import { EventTarget } from 'cc';
const eventTarget = new EventTarget();

eventTarget.on(type, func, target?);
eventTarget.once(type, func, target?);// 执行一次就会关闭
```

type：事件类型的字符串。

func：监听到事件后调用的方法。

target：执行该方法的对象。可以没有，当没有给target时，默认是当前脚本。



不需要监听时，需要手动取消。

```typescript
eventTarget.off(type);//取消所有该类型的监听
eventTarget.off(type, func, target);//取消该回调的监听。
```



**推荐：**

在onEnable中定义监听，在onDisable中取消监听。?如果不在onDisable中取消监听，还会监听到事件嘛？



事件发射

```typescript
eventTarget.emit(type, ...args);
```

这里传递的参数，在监听的回调中，直接定义参数接收即可。



#### 输入

系统内置事件。

3.4之后，提供了一个Input对象，该对象等同于EventTarget的扩展和实现，专门用于处理输入相关内容。

定义监听，input.on(type, callback, target)。可以看到和EventTarget完全一样。只不过不需要单独定义eventTarget对象了，可以直接使用input对象。



**输入事件类型**

| 事件       | type（Input.EventType）                                      | 参数              | 说明                                                         |
| ---------- | ------------------------------------------------------------ | ----------------- | ------------------------------------------------------------ |
| 鼠标       | 按下：MOUSE_DOWN<br />抬起：MOUSE_UP<br />移动：MOUSE_MOVE<br />滚轮：MOUSE_WHEEL | EventMouse        |                                                              |
| 触摸       | 开始：TOUCH_START<br />结束：TOUCH_END<br />移动：TOUCH_MOVE<br />取消：TOUCH_CANCEL | EventTouch        | event.getLocation()获取触碰的位置<br />event.getUILocaltion()获取UI空间的位置 |
| 键盘       | 按下：KEY_DOWN<br />抬起：KEY_UP<br />持续按下：KEY_PRESSING | EventKeyBoard     | 用event.keyCode来判断触发的按键                              |
| 重力传感器 | 定位：DEVICEMOTION                                           | EventAcceleration |                                                              |

更多内容，如各种事件的使用，可参考：https://github.com/cocos/cocos-test-projects/tree/v3.8/assets/cases/event



**3D物体的触摸检测**

2D物体通过UITransform的尺寸信息和位置信息，即可完成触摸检测。

3D物体需要使用射线检测。通过Camera到触点的坐标，生成一条射线，判断射线是否穿过要检测的对象。

```typescript
@ccclass("Example")
export class Example extends Component{
  @property(Camera)
  readonly cameraCom!: Camera;
  
  @property(Node)
  public targetNode!: Node;
  
  private _ray: geometry.Ran = new geometry.Ray();
  
  onEnable(){
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }
  
  onDisable(){
    input.off(...);
  }
  
  onTouchStart(){
    const touch = event.touch!;
    this.cameraCom.screenPointToRay(touch.getLocationX(), touch.getLocationY(), this._ray);
    
    if(PhysicsSystem.instance.raycast(this._ray)){
      const raycastResults = PhysicsSystem.instance.raycastResults;
      for (let i = 0 ; i < raycastResults.length; i++){
        const item = raycastResults[i];
        if (item.collider.node == this.targetNode){
          console.log('raycast hit the target node');
          break;
        }
      }
    }
  }
}
```





#### 节点事件

也是系统内置事件。

由Node实现了EventTarget，用于监听一些Node.EventType中定义的事件，主要用在UI相关的节点上。

| 事件 | Type(Node.EventType)                                         | 参数       | 说明                                                         |
| ---- | ------------------------------------------------------------ | ---------- | ------------------------------------------------------------ |
| 鼠标 | 按下：MOUSE_DOWN<br />抬起：MOUSE_UP<br />进入：MOUSE_ENTER<br />离开：MOUSE_LEAVE<br />移动：MOUSE_MOVE<br />滚轮：MOUSE_WHEEL | EventMouse |                                                              |
| 触摸 | 开始：<br />停止：<br />移动：<br />取消：                   | EventTouch | 停止是手指在目标区域内离开屏幕，取消是手指在目标区域外离开屏幕，注意这里的内外之分。 |



**事件派发**

Node使用dispatchEvent接口来派发事件。派发的事件会经历下面三个阶段：

* 捕获：从场景根节点，逐级向子节点传递，直到到达目标节点，或者在某个节点的响应函数中中断。
* 目标：事件在目标节点上触发。
* 冒泡：事件有目标节点，逐级向父节点船渡，直到到达根节点或者在某个节点的响应函数中中断。

其中，目标节点，就是调用dispatchEvent的节点。中断，则是执行event.propagationStopped = true。以上三个阶段，是完整的事件派发阶段，捕获阶段，通常用于事件的包装和拦截，注册的方式如下

```typescript
this.node.on(type, callback, target, true);// 第四个参数控制
```



想要派发自定义事件，则需要创建一个类（不需要用ccclass修饰器），继承Event类。

事件对象的重要API：

| 名称                        | 类型     | 意义                                                         |
| --------------------------- | -------- | ------------------------------------------------------------ |
| type                        | String   | 事件的类型（事件类名）                                       |
| target                      | Node     | 接收事件的原始对象                                           |
| currentTarget               | Node     | 当前接受事件的对象，事件在冒泡阶段，当前对象可能与原始对象不同。 |
| getType                     | Function | 获取事件类型                                                 |
| propagationStopped          | Boolean  | 是否停止传递当前事件                                         |
| propagationImmediateStopped | Boolean  | 是否立即停止当前事件的传递，事件甚至不会被分派到锁连接的当前目标。 |

疑问：

* target和currentTarget的实际用途是什么？target，就是调用dispatch的那个节点。
* 立即停止传递有什么区别？propagationStopped不会中断当前节点，例如当前节点中的各个组件会继续执行监听回调。



同级节点只会有一个接收事件。可以通过设置event.preventSwallow = true来让事件能够穿透。



**不同canvas中的触点归属**

所有的canvas之间也存在优先级，默认顺序就是Hierarchy窗口的顺序，也可以通过Camera来设置。而触点归属的判断和统计节点一样。



**捕获阶段**

当希望父节点优先派发（例如ScrollView），就需要将事件定义在捕获阶段。



PS：捕获和冒泡，像是两种相反的事件执行顺序。



**内置的拦截**

当节点身上有**Button、Toggle、BlockInputEvents**组件的时候，会停止事件的冒泡。



**暂停和恢复**

this.node.pauseSystemEvents();

this.node.resumeSystemEvents();



#### 事件API

以下链接列举了大量鼠标和触摸事件的API

https://docs.cocos.com/creator/manual/zh/engine/event/event-api.html



### 模块

cocos中，除了插件脚本，所有的代码都以模块的形式组织。根据来源不同，分为：

* 项目代码，包括**组件脚本**和**项目类（全局脚本）**
* 引擎功能，参考[引擎模块](https://docs.cocos.com/creator/manual/zh/scripting/modules/engine.html)。
* 第三方模块，如npm，参考[外部模块使用案例](https://docs.cocos.com/creator/manual/zh/scripting/modules/example.html)
