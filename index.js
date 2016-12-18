var _stock = {}   // 核心存储容器
var _stockData = {}   //数据容器
var uuid = -1;

function getObjType(object){
    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
}

function uniqueId(prefix){
  if (!prefix) prefix = 'random_'
  uuid++
  return prefix+uuid
}

function extend() {
  var options, name, src, copy, copyIsArray, clone
  , target = arguments[0] || {}
  , i = 1
  , length = arguments.length
  , deep = false;
  //如果第一个值为bool值，那么就将第二个参数作为目标参数，同时目标参数从2开始计数
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }
  // 当目标参数不是object 或者不是函数的时候，设置成object类型的
  // if (typeof target !== "object" && !jQuery.isFunction(target)) {
  if (typeof target !== "object" && typeof target != 'function') {
    target = {};
  }
  //如果extend只有一个函数的时候，那么将跳出后面的操作
  if (length === i) {
    // target = this;
    if (Array.isArray(target)) target = []
    if (getObjType(target) == 'Object') target = {}
    --i;
  }
  for (; i < length; i++) {
    // 仅处理不是 null/undefined values
    if ((options = arguments[i]) != null) {
      // 扩展options对象
      for (name in options) {
        src = target[name];
        copy = options[name];
        // 如果目标对象和要拷贝的对象是恒相等的话，那就执行下一个循环。
        if (target === copy) {
          continue;
        }
        // 如果我们拷贝的对象是一个对象或者数组的话
        if (deep && copy && (getObjType(copy) === 'Object' || (copyIsArray = Array.isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && Array.isArray(src) ? src : [];
          } else {
            clone = src && getObjType(copy) === 'Object' ? src : {};
          }
          //不删除目标对象，将目标对象和原对象重新拷贝一份出来。
          target[name] = extend(deep, clone, copy);
          // 如果options[name]的不为空，那么将拷贝到目标对象上去。
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  // 返回修改的目标对象
  return target;
};

//统计store[name]是否首次执行
var _count = {}
var count = function(name) {
  if (_count[name]) {
    _count[name]++;
    return true;
  } else {
    // 首次执行
    _count[name] = 1;
    return false;
  }
}

var store = function( name, data, act ){
  this.name = name || '';
  this.sdata = data || {};
  this.sact = act||{};
  this.ctx = {"null":null};
  var me = this;

  this.dataer = function(data, key) {
    var keyData;
    if (key) keyData = _stockData[this.name+'.'+key]
    if (!data) data = this.sdata
      if (data || keyData) {
          // this.sdata = data;
          if (getObjType(this.sact) === 'Array') {
              var acts = this.sact;
              var _resault = [];
              acts.map(function(fun) {
                  if (getObjType(fun.args) === 'Array') {
                      if (count(me.name)) {
                        fun.args.pop()
                      }
                      fun.args.push(data||{})
                      if (typeof fun === 'function') {
                        var _tmp = fun.apply(fun.args[0], [fun.args[0], data])
                        _resault.push(_tmp);
                      }
                  } else {
                    if (typeof fun === 'function') {
                      var _tmp = fun.call(me.ctx[me.name||'null'], data);
                      _resault.push(_tmp);
                    }
                    if (getObjType(fun)=='Object') {
                      Object.keys(fun).map(function(item){
                        if (typeof fun[item] == 'function'){
                          var _tmp = fun[item].call(me.ctx[me.name||'null'], data)
                          _resault.push(_tmp)
                        }
                      })
                    }
                  }
              })
              return _resault;
          }
          if (getObjType(this.sact) === 'Object') {
              var sacts = this.sact
              if (key) {
                  if (sacts[key]) {
                      var fun = sacts[key]
                      if (getObjType(fun.args) === 'Array') {
                          if (count(me.name)) {
                              fun.args.pop()
                          }
                          fun.args.push((keyData||data||{}))
                          if (typeof fun === 'function')
                              return fun.apply(fun.args[0], [fun.args[0], (keyData||data)])
                      } else {
                          if (typeof fun === 'function')
                              return fun.call(me.ctx[me.name||'null'], (keyData||data));
                      }
                  }
              } else {
                  for (var item in sacts) {
                    var _keydata = _stockData[me.name+'.'+item]
                      if (typeof sacts[item] === 'function') {
                          var fun = sacts[item]
                          if (getObjType(fun.args) === 'Array') {
                              if (count(me.name)) {
                                fun.args.pop()
                              }
                              fun.args.push((data||_keydata||{}))
                              if (typeof fun === 'function'){
                                return fun.apply(fun.args[0], [fun.args[0], (data||_keydata)])
                              }
                          } else {
                              if (typeof fun === 'function'){
                                return fun.call(me.ctx[me.name||'null'], (data||_keydata));
                              }
                          }
                      }
                  }
              }
          }
      } else {
          if (getObjType(this.sact) === 'Array') {
              var acts = this.sact;
              var _resault = [];
              acts.map(function(fun) {
                  if (getObjType(fun.args) === 'Array') {
                      if (typeof fun === 'function') {
                          var _tmp = fun.apply(fun.args[0], fun.args);
                          _resault.push(_tmp);
                      }
                  } else {
                      if (typeof fun === 'function') {
                          var _tmp = fun.call(me.ctx[me.name||'null']);
                          _resault.push(_tmp);
                      }
                      if (getObjType(fun)=='Object') {
                        Object.keys(fun).map(function(item){
                          if (typeof fun[item] == 'function'){
                            var _tmp = fun[item].call(me.ctx[me.name||'null'])
                            _resault.push(_tmp)
                          }
                        })
                      }
                  }
              })
              return _resault;
          }
          if (getObjType(this.sact) === 'Object') {
              var sacts = this.sact
              if (key) {
                  if (sacts[key]) {
                      var fun = sacts[key]
                      if (getObjType(fun.args) === 'Array') {
                          if (typeof fun === 'function'){
                            return fun.apply(fun.args[0], fun.args)
                          }
                      } else {
                          if (typeof fun === 'function')
                              return fun.call(me.ctx[me.name||'null']);
                      }
                  }
              } else {
                  for (var item in sacts) {
                    var _keydata = _stockData[me.name+'.'+item]
                      if (typeof sacts[item] === 'function') {
                          var fun = sacts[item]
                          if (getObjType(fun.args) === 'Array') {
                              if (typeof fun === 'function')
                                  return fun.apply(fun.args[0], [fun.args[0], _keydata])
                          } else {
                              if (typeof fun === 'function')
                                  return fun.call(me.ctx[me.name||'null'], _keydata);
                          }
                      }
                  }
              }
          }
      }
  }

    this.acter = function( act ){
      if (act) {
        if (typeof this.sact == 'object' && typeof act == 'object') {
          this.sact = extend(true, this.sact, act)
        } else {
          var src = typeof this.sact == 'object' ? this.sact : typeof this.sact == 'function' ? [this.sact] : {}
          var ext = typeof act == 'object' ? act : typeof act == 'function' ? [act] : {}
          this.sact = extend(true, src, ext)
        }
      }
    }

    this.setter = function( data, act ){
      if( data ) this.sdata = data;
      if( act ) this.sact = act;
    };

    this.getter = function( type ){
      if( type === 'action' ) return this.sact;
      if( type === 'data') return this.sdata;
    };

    this.binder = function(ctx) {
      this.ctx[this.name] = ctx
    }
}

var _stock = {}

//like flux
var saxer = {
    append: function(name, dataOrAct, fun){
      if (!name || name == '') return false;

      var save = _stock;

      if (!save[name]) {
        this.set(name, dataOrAct, fun)
        return
      }

      var target;
      var s_type = getObjType(save[name].sdata)
      var d_type = getObjType(dataOrAct)

      switch (s_type) {
        case 'Array':
          if (d_type == 'Array') {
            save[name].sdata = save[name].sdata.concat(dataOrAct)
          } else {
            save[name].sdata.push(dataOrAct)
          }
          break;
        case 'Object':
          switch (d_type) {
            case 'Object':
              save[name].sdata = extend(true, {}, save[name].sdata, dataOrAct)
              break;
            default:
              var _uuid = uniqueId(name+'_')
              save[name].sdata[_uuid] = dataOrAct
          }
          break;
        default:
          save[name].sdata = [save[name].sdata, dataOrAct]
      }
    },

    pop: function(name){
      if (!name || name == '') return false;
      var save = _stock;
      if (save[name]) {
        var tmp = save[name].getter('data')
        if (getObjType(tmp) === 'Array') {
          var popdata = tmp.pop();
          save[name].setter(tmp)
          return [tmp, popdata]
        }
      }
    },

    set: function(name, dataOrAct, fun){
      if (!name || name == '') return false;
      if (!dataOrAct) dataOrAct = {}
      var save = _stock;
      if (!save[name]) {
          var thisStore = new store(name);
          save[name] = thisStore;
      }
      if (dataOrAct && dataOrAct !== "") {
        if (getObjType(dataOrAct) === 'Function') {
          if (getObjType(fun) === 'Array') {
            dataOrAct.args = fun;
          } else {
            if (fun) dataOrAct.args = [fun]
          }
          save[name].acter(dataOrAct);
        } else {
          if (getObjType(dataOrAct) === 'Object' || // 存储 json对象
            getObjType(dataOrAct) === 'String' || // 存储 string
            getObjType(dataOrAct) === 'Boolean') { // 存储 boolean对象
            save[name].setter(dataOrAct);
          }
          else if (getObjType(dataOrAct) === 'Array') {
            var isFuns = true;
            if (!dataOrAct.length) {
              save[name].setter([]);
            } else {
              dataOrAct.map(function(item, i) {
                if (getObjType(item) !== 'Function') isFuns = false;
              })
              if (isFuns) {
                if (getObjType(fun) === 'Array') {
                  dataOrAct.map(function(item, i) {
                    if (getObjType(fun[i]) === 'Array'){
                      item.args = fun[i];
                    } else {
                      if (fun[i]) item.args = [fun[i]]
                    }
                  })
                }
                save[name].acter(dataOrAct);
                // save[name].sact = dataOrAct;
              } else {
                save[name].setter(dataOrAct); //存储array数据
              }
            }
          }
        }
      }

      if (fun) {
        if (getObjType(fun) === 'Function') save[name].acter(fun);

        if (getObjType(fun) === 'Array') {
            var isFuns = true;
            fun.map(function(item, i) {
              if (getObjType(item) !== 'Function') isFuns = false;
            })
            if (isFuns) {
              save[name].acter(fun);
            }
        }

        if (getObjType(fun) === 'Object') {
          save[name].acter(fun)
        }
      }

      return SAX(name)
    },

    get: function(name){
      if(!name||name=='') return;
      var save = _stock;
      if(save[name]){
        return save[name].getter( 'data' )
      } else {
        return false;
      }
    },

    setter: function(name, dataOrAct, fun) {
      this.append(name, dataOrAct, fun)
      return _stock[name].dataer(_stock[name].sdata)
    },

    getter: function(name){
      if(!name||name=='') return;
      var save = _stock;
      if(save[name]){
        var that = save[name]
        function runner(data, key){
          return that.dataer(data, key)
        }
        return {
          run: runner,
          data: save[name].getter( 'data' ),
          action: save[name].getter( 'action' )
        }
      }
    },

    deleter: function( name ){
      if(!name||name=='') return;
      var save = _stock;
      if(save[name]){
        delete save[name];
      }
    },

    runner: function( name, ddd, key, cb ){
      if (!name || name == '') return false
      var save = _stock
      if (save[name]) {
        var that = save[name]

        function _runner(data, key) {
          return that.dataer(data, key)
        }

        var _data = that.getter('data')

        if (key && ddd) {
          var keyofdata = name + '.' + key
          _stockData[keyofdata] = typeof ddd == 'object' ? extend(true, ddd) : ddd
        }
        if (that.sact) return _runner((ddd||_data), key)
      }
    },

    has: function(id, cb){
      var keys = Object.keys(_stock)
      if (keys.indexOf(id)>-1) {
        var that = _stock[id]
        if (typeof cb=='function') {
          var _data = that.getter('data')
          return cb(_data)
        }
        return true
      }
    },

    lister: function(){
      return Object.keys( _stock );
    },

    bind: function(name, ctx) {
      if (!name || name == '') return;
      var save = _stock;
      if (!save[name]) save[name] = new store(name)
      save[name].binder(ctx||null)
    },

    setActions: function(name, acts){
      this.set(name, null, acts)
    }
}
saxer.trigger = saxer.setter
saxer.roll = function(name, key, ddd){
  if (typeof key == 'object') {
    ddd = key
    storeAct.runner(name, ddd)
  } else {
    storeAct.runner(name, ddd, key)
  }
}

function sax(name){
  this.name = name
}
sax.prototype = {
  roll: function(key, data){
    return storeAct.roll(this.name, key, data)
  },
  get: function(){
    return storeAct.get(this.name)
  },
  data: function(){
    return storeAct.get(this.name)
  },
  append: function(data, fun){
    storeAct.append(this.name, data, fun)
  },
  bind: function(ctx){
    storeAct.bind(this.name, ctx)
  },
  has: function(id, cb){
    storeAct.has(id, cb)
  },
  pop: function(){
    storeAct.pop(this.name)
  },
  trigger: function(data){
    storeAct.trigger(this.name, data)
  }
}

function SAX(name, data, funs){
  if (name) {
    var save = _stock;
    if (save[name]) {
      return new sax(name)
    } else {
      storeAct.set(name, data, funs)
      return new sax(name)
    }
  }
}

var _keys = Object.keys(storeAct)
_keys.map(function(item, ii){
  SAX[item] = storeAct[item]
})

module.exports = SAX
