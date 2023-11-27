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













