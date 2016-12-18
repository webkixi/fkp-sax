# FKP-SAX

```
// install
npm install fkp-sax --save
```

## API  

SAX的意思是"store and action X", 在`FKP-JS`和`FKP-RN`项目中均是核心方法，Router、Pager以及like flux mixins for react etc...都依赖于SAX  
SAX is a function like nodejs EventEmitter, maybe better
SAX is a global variable in  `FKP-JS` and `FKP-RN`  
I suggest u set SAX as global variable

| API           | 描述           | 例子  |
| :-------------: |-------------| -----|
| set       | 设置命名空间及参数 |  SAX.set( ID, data, actions )|
| get       | 获取命名空间的数据 |  SAX.get( ID )|
| has       | 是否有该命名空间 |  SAX.get( ID, [callback])|
| append       | 给指定ID的命名空间追加数据 |  SAX.append( ID, data ) |
| setter/trigger       | 设置命名空间并执行该空间中的方法 |  SAX.trigger( ID, data, actions )|
| getter       | 获取指定ID的命名空间的所有属性 |  SAX.getter( ID ) |
| deleter       | 删除指定ID的命名空间 |  SAX.deleter( ID )|
| runner/roll       | 执行指定ID的命名空间 |  SAX.roll( ID, [JSON] )|
| lister       | 列表出所有的命名空间 |  SAX.lister()|
| bind       | 显示绑定命名空间方法的上线文(bind context) |  SAX.bind(id, ctx)|
| setActions       | 设置命名空间的action |  SAX.setActions(id, [fun collections])|

## Instance/实例化
```
import SAX from 'fkp-sax'
const saxer = SAX('uniqueName')  //SAX.set('uniqueName', {}, function)
```
saxer有如下API
saxer have some API function

| API           | 描述           | 例子  |
| :-------------: |-------------| -----|
| get       | get data from uniqueName |  saxer.get()|
| has       | 是否有其他命名空间 |  saxer.has( otherUniqueName, [callback])|
| append       | 追加数据 |  saxer.append( data ) |
| trigger       | performance uniqueName's function with append data |  saxer.trigger( data )|
| roll       | performance uniqueName's function with new data |  saxer.roll( data )|
| bind       | 显示绑定命名空间方法的上下文(bind context) |  saxer.bind(context)|
| pop       | uniqueName's data is array, then pop the last item  |  saxer.pop()|


## 作为内存数据库
as a simple data library in memery      
SAX可以作为简易的内存数据库，来存储页面中的变量  

> Normal operation  
set and get and deleter   

```
// Json
SAX.set('Xyz', {a: 1, b: 2})
SAX.append('Xyz', {c: 3})
SAX.append('Xyz', "ni hao")
SAX.append('Xyz', [1,2,3])
SAX.get('Xyz')
// {a:1, b:2, c:3, [uniqueId]:'ni hao', [uniqueId]:[1,2,3] }  

// Array
SAX.set('Xyz', [1,2,3])
SAX.append('Xyz', 4)
SAX.append('Xyz', 'abc')
SAX.append('Xyz', {x:22})
SAX.get('Xyz')
// [1, 2, 3, 4, 'abc', {x:22}]

// other
SAX.set('Xyz', 'hello')
SAX.append('Xyz', 4)
SAX.append('Xyz', {x:22})
SAX.append('Xyz', [1,2,3])
SAX.get('Xyz')
// ['nihao', 4, {x:22}, [1,2,3]]

SAX.deleter('Xyz')
SAX.lister()
// no Xyz namespace
```

> Instance operation  
simplify working processes

```
const test = SAX('uniqueName', {}, (data)=>{console.log(data)})
test.append({a: 123, b: 234})
test.roll()   // object {a: 123, ...}
test.trigger({a: 111, b: 222})   // object {a: 111, b: 222}
...
```

## 作为触发器  
as a trigger to performance some predefine method, with ajax or delay data, it's Very useful   
SAX可以作为触发器，触发预定义的方法，配合ajax或者延时数据使用  

### 简单方法/simple
```
# Object  
SAX.set('Xyz', {x:3, y:4}, abc)
function abc(data){
  console.log(data)
}

SAX.roll('Xyz')  // print {x:3, y:4}

setTimeout(function(){
  let _data = {a: 1, b: 2}
  SAX.trigger('Xyz', _data)  // only use `trigger`
}, 3000)
// after 3 seconds then print {x:3, y:4, a: 1, b: 2}

# Array
SAX.set('Xyz', [1, 2], abc)
function abc(data){
  console.log(data)
}

SAX.roll('Xyz')   // print [1,2]

setTimeout(function(){
  let _data = [3, 4]
  SAX.trigger('Xyz', _data)  // only use `trigger`
}, 3000)
// after 3 seconds then print [1,2,3,4]
```

### 高级方法/adv
bind context  
SAX可以绑定上下文，及传送一个data的参数  
FKP's Router 和 Pager 使用了这种方式  
[demo](http://www.agzgz.com/app)

```
// 1
let context = {a: 1,b: 2}
SAX.set('Xyz', abc, [context])
function abc(ctx, data){
  console.log(this)
  console.log(ctx)
  console.log(data)
}  

SAX.trigger('Xyz', {x:3,y:4})
// this is : {a:1,b:2}
// ctx is : {a:1,b:2}
// data is : {x:3,y:4}

// 2
NOTE: function abc's arguments[0]

let context = {a: 1,b: 2}
SAX.bind('Xyz', context)
SAX.set('Xyz', {a: 3, b: 4}, abc)
function abc(data){
  console.log(this)
  console.log(data)
}  

SAX.trigger('Xyz', {x:3,y:4})
// this is : {a:1,b:2}
// data is : {x:3,y:4}
```

### 自执行/run again
if ID has action, you can run it again, use `roll`   
roll能够执行已经存在的ID，如果该id有action 方法  

```
// init  
let context = {a: 1,b: 2}
SAX.set('Xyz', context, abc)
function abc(data){
  console.log(data)
}
SAX.roll('Xyz')
// data is : {a: 1,b: 2}
```
