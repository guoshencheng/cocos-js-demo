/**
 * Created by guoshencheng on 11/3/15.
 */

var MONSTER_WIDTH = 54
var MONSTER_HEIGHT = 80
var FIRE_WIDTH = 40
var FIRE_HEIGHT = 40


Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

var monsters = []
var fires = []

window.onload = function(){
    cc.game.onStart = function(){
        //load resources
        cc.view.enableAutoFullScreen(false)
        cc.view.setDesignResolutionSize(667,375,cc.ResolutionPolicy.NO_BORDER);
        cc.view.resizeWithBrowserSize(true);
        cc.LoaderScene.preload(g_resources, function () {
            var MyScene = cc.Scene.extend({
                onEnter:function () {
                    this._super()
                    var mainLayer = new MainLayer()
                    mainLayer.init()
                    this.addChild(mainLayer)
                }
            })
            cc.director.runScene(new MyScene())
        }, this);
    };
    cc.game.run("gameCanvas")
};

var MainLayer = cc.Layer.extend({
    ctor: function() {
        this._super()
    },
    init: function() {
        this._super()
        var size = cc.director.getWinSize()
        var bg = new cc.Sprite(res.helloBG_png)
        bg.setPosition(size.width / 2, size.height / 2)
        this.addChild(bg, 0)

        var playerLayer = new PlayerLayer()
        playerLayer.init()
        this.addChild(playerLayer)
        this.addMonster();
        this.schedule(this.addMonster, 2, cc.REPEAT_FOREVER, 2)
        this.scheduleUpdate()
        var self = this
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var x = touch._point.x
                var y = touch._point.y
                if (x > size.width / 2) {
                    self.addFire(x, y)
                }
                return true
            }
        }, this)
    },
    update: function() {
        this._super()
        if(monsters.length > 0 && fires.length > 0) {
            for(var km = 0; km < monsters.length; km ++) {
                for(var kf = 0; kf < fires.length; kf ++){
                    var fl = fires[kf]
                    var ml = monsters[km]
                    if(this.checkRush(fl, ml)) {
                        fl.deleteSelf()
                        ml.deleteSelf()
                    }
                }
            }
        }
    },
    addMonster: function() {
        var monsterLayer = new MonsterLayer()
        monsters.push(monsterLayer)
        monsterLayer.init()
        this.addChild(monsterLayer, 0)
    },
    addFire: function(x, y) {
        var fireLayer = new FireLayer()
        fires.push(fireLayer)
        fireLayer.init(x, y)
        this.addChild(fireLayer, 0)
    },
    checkRush: function(layer1, layer2) {
        if(Math.abs((layer1.fire().x - layer2.monster().x)) < (MONSTER_WIDTH / 2 + FIRE_WIDTH / 2)
            && Math.abs((layer1.fire().y - layer2.monster().y)) < (MONSTER_HEIGHT / 2 + FIRE_HEIGHT / 2)){
            return true
        } else {
            return false
        }
    }
})

var FireLayer = cc.Layer.extend({
    ctor: function () {
        this._super()
    },
    init: function(x, y) {
        var self = this
        this._super()
        var size = cc.director.getWinSize()
        var fire = new cc.Sprite(res.projectile_png)
        fire.setPosition(size.width / 2, size.height / 2)
        this.addChild(fire, 0)
        var move
        if (y > fire.y) {
            if (( x - fire.x) / (y - fire.y) < size.width / size.height) {
                var dx = size.height / 2 * (( x - fire.x) / (y - fire.y))
                move = cc.moveTo(2, size.width / 2 + dx, size.height)
            } else {
                var dy = size.width / 2 * ((y - fire.y) / ( x - fire.x))
                move = cc.moveTo(2, size.width, size.height / 2 + dy)
            }
        } else if (y == fire.y) {
            move = cc.moveTo(2.5, size.width, size.height / 2)
        } else {
            if (( x - fire.x) / (fire.y - y) < size.width / size.height) {
                var dx = size.height / 2 * (( x - fire.x) / (fire.y - y))
                move = cc.moveTo(2, size.width / 2 + dx, 0)
            } else {
                var dy = size.width / 2 * ((fire.y - y) / ( x - fire.x))
                move = cc.moveTo(2, size.width, size.height / 2 - dy)
            }
        }
        var cb = new cc.CallFunc(function() {
            self.deleteSelf()
        }, this)
        this.act = new cc.Sequence(move, cb)
        fire.runAction(this.act)
    },
    fire: function() {
        return this._children[0]
    },
    act: null,
    deleteSelf: function() {
        this.removeFromParent()
        if (fires.length > 1) {
            fires.remove(this)
        } else {
            fires = []
        }
    }
})

var PlayerLayer = cc.Layer.extend({
    ctor: function() {
        this._super()
    },
    init: function() {
        this._super()
        var size = cc.director.getWinSize()
        var player = new cc.Sprite(res.player_png)
        player.setPosition(size.width / 2, size.height / 2)
        this.addChild(player, 0)
    }
})

var MonsterLayer = cc.Layer.extend({
    ctor: function() {
        this._super()
    },
    init: function() {
        var self = this
        this._super()
        var monster = new cc.Sprite(res.monster_png)
        var size = cc.director.getWinSize()
        var y1 = Math.random() * size.height
        var y2 = Math.random() * size.height
        monster.setPosition(size.width, y1)
        this.addChild(monster)
        var move = cc.moveTo(5, 0, y2)
        var cb = new cc.CallFunc(function() {
            self.deleteSelf()
        }, this)
        var act = new cc.Sequence(move, cb)
        monster.runAction(act)
    },
    monster: function() {
        return this._children[0]
    },
    deleteSelf: function() {
        this.removeFromParent()
        if (fires.length > 1) {
            monsters.remove(this)
        } else {
            monsters = []
        }
    }
})





