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

和ccclass一起出现

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

有一些属性是ReadOnly的，不建议直接操作。通过使用局部变量和set方法间接修改。

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
| 更改父节点 | 1. this.node.parent = parentNode;<br />2. this.node.removeFromParent();<br />newParentNode.addChild(this.node); | 移出的时候，会同时移除绑定的事件。<br />新创建的节点，需要设置父节点后，才能正确的完成节点的初始化。 |
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

资源都继承自Asset，如Texture2D、SpriteFrame、AnimationClip、Prefab。他们的加载是自动的，并且关联的资源会被一起加载。

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



模块加载顺序

1. Cocos Creator 3.x 的 引擎模块`cc`
2. 插件脚本：根据以来的关系顺序加载，不存在以来关系的则无序
3. 普通脚本：并发导入，导入时严格遵守由`import`确定的引用关系和执行顺序。



#### 引擎模块

从3.0开始，将不能通过全局变量`cc`的访问引擎功能

从3.0开始，将不能通过全局变量`cc`的访问引擎功能

从3.0开始，将不能通过全局变量`cc`的访问引擎功能



cc中提供的功能是动态的，与 **`项目设置`** 中的 **`功能裁剪`** 设置有关。



**日志输出**

log();



**构建时常量**

`cc/env` 中定义了一些常量，他们表示**执行环境、调试界别、平台标识**等等。

| 名称（都是boolean） | 类型     | 说明                           |
| ------------------- | -------- | ------------------------------ |
| BUILD               | 执行环境 | 构建环境                       |
| PREVIEW             | 执行环境 | 预览环境                       |
| EDITOR              | 执行环境 | 编辑器环境                     |
| DEBUG               | 调试级别 | 调试级别                       |
| DEV                 | 调试级别 | 等同于DEBUG / EDITOR / PREVIEW |

常用操作：

在调试情况下输出日志

```typescript
if(DEV){
    log('some debug info');
}
```





#### 模块规范

Cocos Creator引擎提供的所有功能都以ESM模块的i形式存在。项目中，以.ts作为后缀的文件都是为ESM模块。

对于其他模块格式，CocosCreator选择与Node.js类似的规则类鉴别。一下文件被视为ESM格式：

* 以.mjs 为后缀的文件；
* 以.js为后缀的文件，并且预期最相近的父级 package.json 文件中包含一个顶级的 "type" 字段，其值为"module"

其余文件被视为CommonJS模块格式，包括：

* 以 .cjs为后缀的文件
* 以 .js 为后缀的文件，并且 package.json 中，type="commonjs"
* 不在上述条件下，以.js为后缀的文件。



**模块使用**

使用import和export进行导入导出，from后面的字符串称为**模块说明符**。且模块说明符也可以作为参数，出现在动态导入的import()表达式中。

```typescript
import { Foo } from './foo';
export { Bar } from './bar';
```



模块说明符包括：相对说明符、绝对说明符、裸说明符。其表示的是不同的路径指示方式。

.js的模块导入，说明符必须带有后缀。



#### ESM与CJS交互规则

* CommonJS模块有module.exports导出，在导入CommonJS模块时，可以使用ES模块默认的导入方式或其对应的sugar语法形式导入。

```typescript
import {default as cjs } from 'cjs';// 
import cjsSugar from 'cjs';// 语法糖
```

* ESM模块的 default 导出只想CJS模块的module.exports
* 非 default 部分的导出，Node.js通过静态分析将其作为独立的ES模块提供。



例：

```typescript
// foo.js
module.exports = {
    a: 1,
    b: 2,
}

module.exports.c = 3;

// test.mjs

// default 指向 module.exports
import foo from './foo.js'; // 等价于 import { default as foo } from './foo.js'
console.log(JSON.stringify(foo)); // {"a":1,"b":2,"c":3}

// 导入 foo 模块的所有导出
import * as module_foo from './foo.js'
console.log(JSON.stringify(module_foo)); // {"c":3,"default":{"a":1,"b":2,"c":3}}

import { a } from './foo.js'
console.log(a); // Error: a is not defined

// 根据上方第三点，c 有独立导出
import { c } from './foo.js'
console.log(c); // 3
```



外部模块的使用方式：

1. 获取模块，例如在项目目录下使用npm获取。
2. 找到模块中的package.json，判断格式
   1. 根据main字段，判定入口文件
   2. 根据type字段，判定类型。
3. 在入口文件中，找到导出的写法
4. 确定了模块格式和导出方式，就可以在ts文件中使用了。



此处有以为或报错，可参考https://docs.cocos.com/creator/manual/zh/scripting/modules/example.html



#### 导入映射

在菜单栏中找到，**项目** -> **项目设置** -> **脚本** 中的 **导入映射** ，编辑内容即可开启。



**模块别名**

将复杂的相对模块或绝对模块映射为裸模块。



例：

在项目中创建映射文件 import-map.json

```json
{
    "imports":{
        "foo":"./assets/lib/foo.ts"
    }
}
```

之后可以通过 import * as foo from 'foo';导入foo模块。并且这个方式同样适用于目录。



### 外部代码支持

#### 插件脚本

选中一个脚本，在Inspector中勾选 Import As Plugin，该脚本则变为**插件脚本**。目前仅支持js插件脚本。



## 2D对象





## 资源管理

2.4开始，推出了AssetManager，替代以前的loader。具备加载资源、查找资源、销毁资源、缓存资源、Asset Bundle等功能。

所有方法通过**assetManager**对象访问。类型和美剧则定义在AssetManager类中。



### 资源加载

并没有在场景制作的时候，进行设置，而是需要运行时动态设置，则需要使用动态加载。



**将资源放在resources目录下**，然后使用resources.load等api加载。

```typescript
// 加载prefab
resources.load("test/prefab", Prefab, (err, prefab) =>{
  const newNode = instantiate(prefab);
  this.node.addChild(newNode);
})

// 加载AnimationClip
resources.load("test/anim", AnimationClip, (err, clip)=>{
  this.node.getComponent(Animation).addClip(clip, "anim");
})
```



注意：

resources中的资源，可以引用文件夹外部的其他资源，并且在项目构建时，除了在`构建发布`面板中勾选的场景外，resources文件夹中的所有资源，包括他们关联的资源，都会被到处。

如果一份资源仅仅被resources中的资源以来，二不需要直接被resources.load调用，就**不要**放在resources中，否则会增大config.json的大小，也无法在构建过程中剔除，json的自动合并逻辑也会收到影响。



#### 加载SpriteFrame或Texture2D

必须指定具体路径，才能加载到SpriteFrame，如果只指定到目录，加载到的是一个ImageAsset对象。

Sprite组件需要的是spriteFrame，而SpriteFrame的texture则指向Texture2D



#### 加载图集中的SpriteFrame

必须先加载图集，

```typescript
resources.load("test/sheep", SpriteAtlas, (err, atlas)=>{
  const frame = atlas.getSpriteFrame('sheep_0');
  sprite.spriteFrame = frame;
})
```



#### 加载FBX或gITF模型资源（3D）

将这类资源导入编辑器后，会解析出模型中包含的网格、骨骼、材质、动画等。可以在运行时，加载单一资源。将外部的总资源当作路径即可。例如Monster/anim_run



#### 批量加载

调用resources.loadDir即可，注意接收资源的方法中，第二个参数是一批资源。



#### 预加载

调用resources.preload()即可。



#### 加载远程资源

从服务器上加载资源以及加载用户从其他地方获得的资源（非包内资源），都需要使用这种方式。

assetManager.loadRemote

```typescript
let url = ".../xx.png";
assetManager.loadRemote<ImageAsset>(url, (err, imageAsset)=>{
  const spriteFrame = new SpriteFrame();
  const texture = new Texture2D();
  texture.image = imageAsset;
  spriteFrame.texture = texture;
})

// 不带后缀，加载方法需要带有后缀。
let url2 = "xxx";
assetManager.loadRemote<ImageAsset>(url, {ext: '.png'}, function)

// 使用绝对路径加载相册数据
let path = "/data/picture/xxx.png";

```

这种加载方式的限制：

1. 只支持图片、声音、文本，不支持SpriteFrame、SpriteAtlas、TiledMap等。（可以使用Asset Bundle）
2. 如果对方禁止跨域访问，则会加载失败。



### Asset Bundle

一种资源模块化工具。允许开发者按照项目需求将贴图、脚本、场景等资源划分在多个AssetBundle中，在**游戏运行过程中**按照需求去加载不同的AssetBundle，以**减少启动时需要加载的资源数量，从而减少首次下载和加载游戏所需的时间**。



配置方案在 **项目设置 -> Bundle配置** 中。



#### 内置Asset Bundle

| 内置Asset Bundle | 功能说明                                                     | 配置                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| main             | 存放所有在 **构建发布** 面板中 **参与构建场景** 中勾选的场景以及依赖资源。 | 通过配置 **构建发布** 面板中的 **珠宝压缩类型** 和 **配置珠宝为远程包** 两项。 |
| resources        | 存放resources目录下的所有资源以及以来资源                    | 通过配置 **资源管理器**  中的 assets -> resources 文件夹     |
| start-scene      | 如果在 **构建发布** 面板中勾选了 **初始场景分包** ，则首场景将会被构建到start-scene中 | 无法配置                                                     |
| internal         | 引擎内置的资源                                               | 无法配置                                                     |

构建完成后，内置的Asset Bundle会根据配置决定他所生成的位置。

内置的Asset Bundle是在application.js中进行加载的。



#### 配置方法

自定义的AssetBundle是以 **文件夹** 为单位进行配置的。选中一个文件夹，在Inspector窗口就会出现 **配置为Bundle** 的选项，勾选后，就会出现更多相关配置。

| 配置项         | 功能说明                                                     |
| -------------- | ------------------------------------------------------------ |
| Bundle名称     | 默认是文件夹名称。                                           |
| Bundle优先级   | 构建时，**从大到小**的顺序，只有20个可配置优先级。           |
| 目标平台       | 不同平台可以使用不同配置，构建时将根据对应平台的设置进行构建。开发者可以通过 **项目设置 -> Bundle配置** 自定义配置方案。 |
| 压缩类型       | 决定输出方式，包括 **合并依赖、无压缩、合并所有JSON、小游戏分包、Zip** ，具体参考[压缩类型](https://docs.cocos.com/creator/manual/zh/asset/bundle.html#%E5%8E%8B%E7%BC%A9%E7%B1%BB%E5%9E%8B) |
| 配置为远程包   | 勾选后，AssetBundle构建后会放在remote文件夹，而不会构建到安装包里，开发者需要将这个**文件夹**放在远程服务器。 |
| Bundle资源过滤 | 过滤掉不想进入Bundle的资源。                                 |
| 构建Bundle     | 针对当前选中的bundle进行构建。                               |

**配置完成后记得点击右上方的绿色勾**

**配置完成后记得点击右上方的绿色勾**

**配置完成后记得点击右上方的绿色勾** 



注意：

1. 不要和4个内置Bundle重名。
2. 小游戏分包不能配置为远程分包。
3. Zip类型是为了降低网络请求数量，如果是本地的包，不需要压缩。
4. 不建议将资源都放在Bundle中。最好是放Scene、Prefab等入口资源或者需要在脚本内动态加载的资源。最后，在构建阶段，会根据依赖关系，到处所有引用的资源来填充整个AssetBundle，这样可以最大限度的减少不必要的资源导出。



#### 优先级

同一个资源，可能因为被多个资源的依赖，导致其出现在多个Bundle中。此时需要使用优先级，来明确资源真正的归属。

* 资源会优先放在优先级高的Bundle中，低优先级的Bundle只会记录一条信息。并且此时，低优先级的Bundle会依赖高优先级的Bundle。
* 当一个资源被多个 **相同优先级** 的Bundle引用时，资源会在每个Bundle中复制一份（不希望出现的）。尽量让共享资源出现在高优先级的Bundle中，从而最小化包体。

内置Bundle优先级别：

| Bundle      | 优先级 |
| ----------- | ------ |
| main        | 7      |
| resources   | 8      |
| start-scene | 20     |
| internal    | 21     |

建议自定义Bundle的优先级 **不要高于** 内置的Bundle。



#### 压缩类型

所有Bundle默认压缩类型为 **合并依赖**，开发者可以设置所有Bundle的压缩类型。



| 压缩类型     | 功能说明                                                     |
| ------------ | ------------------------------------------------------------ |
| 合并依赖     | 构建Bundle时，会将相互依赖的资源的JSON文件合并在一起，从而减少运行时加载次数。 |
| 无压缩       | 没有任何操作                                                 |
| 合并所有JSON | 都合并到一个JSON文件中                                       |
| 小游戏分包   |                                                              |
| Zip          | 将资源文件压缩到一个Zip文件中。                              |



#### Asset Bundle构建

在构建时，配置为AssetBundle的文件夹中的资源（包括场景、代码和其他资源）以及相关依赖，都会合并到同一个AssetBundle文件夹中。

配置为AssetBundle的文件夹中的所有 **代码和资源** 会进行以下处理：

* 代码：所有代码会根据发布平台合并成一个 `index.js` 或 `game.js` 的入口脚本文件。
* 资源：所有资源以及相关依赖都会放到 `import` 或 `native` 目录下。
* 资源配置：所有配置信息，包括路径、类型、版本信息都会合并成一个config.json文件。

构建完成后，该bundle会被打包到对应平台发布包目录下的assets文件夹中。但是有以下两种特殊情况：

1. 配置为远程包，则会放到remote文件夹中。
2. 压缩类型选了 **小游戏分包**， 则会打包到subpackages文件夹下。



#### Asset Bundle中的脚本

所有脚本会被打包到一个js文件中。

注意：

* 有些平台不允许加载远程脚本文件。Creator会将Bundle中的代码拷贝到src/bundle-scriptes目录下。
* 不同bundle中的脚本最好不要相互引用，否则可能会导致在运行时找不到对应脚本。如果需要引用某些类或变量，可以将该类和变量暴露在一个全局命名空间中，从而实现共享。



#### 加载

使用assetManager.loadBundle来加载Asset Bundle，加载时不需要路径，只需要名称即可。

```typescript
assetManager.loadBundle('bundle_name', (err, bundle) => {
  bundle.load('xxx');
})

assetManager.loadBundle('https://xxx/remote/bundle_name', (err, bundle) => {
  bundle.load('xxx');
})
```



也可以使用路径加载用户空间中的资源。

```typescript
assetManager.loadBundle(wx.env.USER_DATA_PATH + 'path/bundle_name', ...);
```



如果配置了远程包，构建时，需要在 **构建发布** 面板中 **资源服务器地址**。

在调用loadBundle时，引擎并没有加载AssetBundle中所有资源，而是加载 **资源清单**，以及包含的 **所有脚本**。



#### bundle对象使用

调用了assetManager.loadBundle()接口后，会获得一个bundle对象，使用这个对象来加载真正的资源。**bundle**对象的使用和resources类似。

bundle可以直接加载场景。与director.loadScene的区别在于，bundle只会加载指定bundle中的场景，且不会运行场景。

```typescript
bundle.loadScene('test', (err, scene) => {
  director.runScene(scene);
})
```

bundle在被加载后，会缓存在assetManager中，可以使用assetManager.getBundle('bundle_name')来直接获取。也可以用assetManager.removeBundle(bundle);来移除。



注意：

移除并不会释放资源。

移除并不会释放资源。

移除并不会释放资源。



**释放**

方法一：

```typescript
bundle.load('image/xx', SpriteFrame, (err, spriteFrame) => {
  assetManager.releaseAsset(spriteFrame);
})
```



方法二：使用bundle，传递路径，释放单个资源

```typescript
bundle.load('image/xx', SpriteFrame, (err, spriteFrame) => {
  assetManager.release('image', spriteFrame);
})
```



方法三：释放该bundle下所有资源

bundle.releaseAll();



### 资源释放

资源缓存可以减少重复加载的情况，但是会增加内存和显存占用。



#### 自动释放

场景可以在Inspector中配置自动释放，在切换场景后，相关资源就会自动被释放。

**建议所有场景都配置为自动释放，除了高频使用的场景**

所有Asset实例都有成员韩式addRef和decRef，用来增加和减少引用计数。一旦计数为零，Creator会对资源进行自动释放。使用案例如下

```typescript
start () {
    resources.load('images/background', Texture2D, (err, texture) => {
        this.texture = texture;
        // 当需要使用资源时，增加其引用
        texture.addRef();
        // ...
    });
}

onDestroy () {
    // 当不需要使用资源时，减少引用
    // Creator 会在调用 decRef 后尝试对其进行自动释放
    this.texture.decRef();
}
```



#### 释放检查和过程

1. 检查引用计数。
2. 一旦被移除，会触发依赖资源的释放检查，并且 **直接** 依赖的资源引用计数都减1.
3. 如果引用计数不为0，进行循环引用检查。



#### 手动释放

assetManager.releaseAsset(texture);直接释放指定资源。不需要关注依赖，会自动处理。



#### 资源的静态引用

