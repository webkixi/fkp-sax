var _stock = {}   // 核心存储容器
var _stockData = {}   //数据容器
var uuid = -1;

function getObjType(object){
  return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
}

function isEmpty(v) {
  switch (typeof v) {
    case 'undefined':
      return true;
    case 'string':
      if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
      break;
    case 'boolean':
      if (!v) return true;
      break;
    case 'number':
      if (0 === v || isNaN(v)) return true;
      break;
    case 'object':
      if (null === v || v.length === 0) return true;
      for (var i in v) {
        return false;
      }
      return true;
  }
  return false;
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
          var _resault = [];
          if (getObjType(this.sact) === 'Array') {
              var acts = this.sact;
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
                          if (typeof fun === 'function'){
                            return fun.call(me.ctx[me.name||'null'], (keyData||data));
                          }
                          if (getObjType(fun)=='Array') {
                            return fun.map(function(_fun){
                              return typeof _fun == 'function' ? _fun.call(me.ctx[me.name||'null'], (keyData||data)) : '';
                            })
                          }
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
                                var _tmp = fun.apply(fun.args[0], [fun.args[0], (data)])
                                _resault.push(_tmp)
                              }
                          } else {
                              if (typeof fun === 'function'){
                                var _tmp = fun.call(me.ctx[me.name||'null'], (data));
                                _resault.push(_tmp)
                              }
                              if (getObjType(fun)=='Array') {
                                _resault = fun.map(function(_fun){
                                  return _fun.call(me.ctx[me.name||'null'], (data));
                                })
                              }
                          }
                      }
                  }
                  return _resault
              }
          }
          if (getObjType(this.sact) === 'Function') {
            var fun = this.sact
            if (Array.isArray(fun.args)) {
              if (count(me.name)) { fun.args.pop() }
              fun.args.push((data||_keydata||{}))
              return typeof fun == 'function' ? fun.apply(fun.args[0], [fun.args[0], data]) : ''
            } else {
              return typeof fun == 'function' ? fun.call(me.ctx[me.name||'null'], (data||_keydata)) : ''
            }
          }
      } else {
        var _resault = [];
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
                            if (typeof fun === 'function'){
                              var _tmp = fun.apply(fun.args[0], [fun.args[0], _keydata])
                              _resault.push(_tmp);
                            }
                        } else {
                            if (typeof fun === 'function'){
                              var _tmp = fun.call(me.ctx[me.name||'null'], _keydata);
                              _resault.push(_tmp);
                            }
                        }
                    }
                }
                return _resault
              }
          }
          if (getObjType(this.sact) === 'Function') {
            var fun = this.sact
            if (Array.isArray(fun.args)) {
              return typeof fun == 'function' ? fun.apply(fun.args[0], fun.args) : ''
            } else {
              return typeof fun == 'function' ? fun.call(me.ctx[me.name||'null']) : ''
            }
          }
      }
  }

    this.acter = function( act, del ){
      var s_type = getObjType(this.sact)
      var a_type = getObjType(act)

      switch (s_type) {
        case 'Object':
          if (typeof act == 'object') {
            var _sact = this.sact
            Object.keys(act).map(function(item){
              var itemVal = act[item]
              if (!itemVal) return
              if (_sact[item]) {
                if (del) {
                  delete _sact[item]
                } else {
                  var _itemVal = _sact[item]
                  switch (typeof _itemVal) {
                    case 'function':
                      _sact[item] = [_itemVal].concat(itemVal)
                      break;
                    case 'object':
                      if (Array.isArray(_itemVal)) {
                        _sact[item] = _itemVal.concat(itemVal)
                      }
                      break;
                  }
                }
              } else {
                !del ? _sact[item] = itemVal : ''
              }
            })
            // this.sact = extend({}, this.sact, act)
          }
          else {
            var _uuid = uniqueId()
            if (typeof act == 'function') this.sact[_uuid] = act
          }
          break;
        case 'Array':
          switch (a_type) {
            case 'Array':
              this.sact = this.sact.concat(act)
              break;
            case 'Object':
              this.sact = extend({}, this.sact, act)
              break;
            case 'Function':
              this.sact = this.sact.push(act)
              break;
          }
          break;
        case 'Function':
          switch (a_type) {
            case 'Array':
              this.sact = act.unshift(this.sact)
              break;
            case 'Object':
              var _uuid = uniqueId()
              this.sact = act[_uuid] = this.sact
              break;
            case 'Function':
              this.sact = [this.sact, act]
              break;
          }
          break;
        default:
          if (typeof act == 'function') this.sact = act
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

//like flux
var storeAct = {
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
              // save[name].sdata = extend(true, {}, save[name].sdata, dataOrAct)
              save[name].sdata = extend({}, save[name].sdata, dataOrAct)
              break;
            default:
              var _uuid = uniqueId(name+'_')
              save[name].sdata[_uuid] = dataOrAct
          }
          break;
        default:
          if (dataOrAct) save[name].sdata = [save[name].sdata, dataOrAct]
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

    update: function(name, target){
      if (!name || name == '') return false;
      if (typeof target != 'object') return false;
      var save = _stock;
      if (!save[name]) return false
      var odata = save[name].getter('data')
      Object.keys(target).map(function(item, ii){
        odata[item] = target[item]
      })
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
      if (dataOrAct) this.append(name, dataOrAct, fun)
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
          _stockData[keyofdata] = typeof ddd == 'object' ? extend({}, ddd) : ddd
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
    }
}
storeAct.trigger = storeAct.setter
storeAct.roll = function(name, key, ddd){
  if (typeof key == 'object') {
    ddd = key
    return storeAct.runner(name, ddd)
  } else {
    return storeAct.runner(name, ddd, key)
  }
}

function sax(name, data, funs){
  this.ctx
  this.name = name
  this.actions = _stock[name].sact
  this.store = _stock[name]
  this.data = _stock[name].sdata
}
sax.prototype = {
  roll: function(key, data){
    return storeAct.roll(this.name, key, data)
  },
  emit: function(key, data){
    return storeAct.roll(this.name, key, data)
  },
  setActions: function(opts){
    this.store.acter(opts)
  },
  on: function(key, onopts, fun){
    var tmp = {}
    if (typeof onopts == 'function') {
      fun = onopts
      onopts = undefined
    }
    if (typeof fun == 'function') {
      if (!fun.guid) fun.guid = uniqueId('event_')
      tmp[key] = fun
      this.store.acter(tmp)
    }
    else 
    if (getObjType(fun) == 'Array') {
      var myFuns = []
      fun.forEach(function(_fun){
        if (typeof _fun == 'function') {
          if (!_fun.guid) _fun.guid = uniqueId('event_')
          myFuns.push(_fun)
        }
      })
      tmp[key] = myFuns
      this.store.acter(tmp)
    }
  },
  hasOn: function(key) {
    var _sact = this.store.sact
    if (_sact && typeof _sact == 'object') {
      return !isEmpty(_sact[key])
    }
  },
  off: function(key, offopts, ccb){
    if (typeof offopts == 'function') {
      ccb = offopts
      offopts = undefined
    }
    if (!ccb) {
      var tmp = {}
      tmp[key] = true
      this.store.acter(tmp, 'del')
    } else {
      if (typeof ccb == 'function') {
        var _sact = this.store.sact
        if (_sact && typeof _sact == 'object') {
          var _sact_vals = _sact[key] 
          if (_sact_vals && typeof _sact_vals == 'object') {
            if (Array.isArray(_sact_vals)) {
              var index = -1
              _sact_vals.forEach(function(val, ii){
                if (val.guid == ccb.guid) index = ii 
                // if (val == ccb) index = ii 
              })
              if (index > -1) _sact_vals.splice(index, 1)
            } else {
              Object.keys(_sact_vals).forEach(function(_key, ii){
                if (_sact_vals[_key].guid == ccb.guid) {
                  delete _sact_vals[_key]
                }
              })
            }
          } else {
            delete _sact[key]
          }
        }
      }
    }
  },
  one: function(key, oneopts, cb) {
    this.off(key)
    this.on(key, oneopts, cb)
  },
  set: function(data, fun){
    storeAct.set(this.name, data, fun)
  },
  get: function(key){
    if (key) return this.data[key]
    return this.store.sdata
  },
  append: function(data, fun){
    storeAct.append(this.name, data, fun)
    this.data = this.store.sdata
    return this.data
  },
  update: function(data){
    return storeAct.update(this.name, data)
  },
  bind: function(ctx){
    storeAct.bind(this.name, ctx)
    this.ctx = ctx
    return this
  },
  has: function(id, cb){
    return storeAct.has(id, cb)
  },
  pop: function(){
    return storeAct.pop(this.name)
  },
  trigger: function(data){
    return storeAct.trigger(this.name, data)
  }
}

var saxInstance = {}
function SAX(name, data, funs){
  if (name) {
    var save = _stock;
    if (save[name]) {
      if (data){
        saxInstance[name].append(data)
      }
      if (funs) {
        saxInstance[name].setActions(funs)
      }
      return saxInstance[name]
    } else {
      storeAct.set(name, data, funs)
      var instance = new sax(name, data, funs)
      saxInstance[name] = instance
      return instance
    }
  }
}

SAX.fn = {
  extend: function(opts){
    var _fn = sax.prototype
    if (getObjType(opts) == 'Object') {
      sax.prototype = extend(_fn, opts)
    }
  }
}

var _keys = Object.keys(storeAct)
_keys.map(function(item, ii){
  SAX[item] = storeAct[item]
})

module.exports = SAX
