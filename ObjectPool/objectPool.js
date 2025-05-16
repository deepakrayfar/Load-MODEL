var ObjectPool = pc.createScript('objectPool');

ObjectPool.attributes.add('maxCount', { type : 'number', default : 1 });
ObjectPool.attributes.add('sleepTime', { type : 'number', default : 0 });

ObjectPool.prototype.initialize = function() {
    this.entity.enabled = false;
    
    this.index   = 0;
    this.objects = [];
    this.createClones();
    
    this.app.on('ObjectPool:' + this.entity.name, this.onClone, this);
    this.app.on(
        'ObjectPool:' + this.entity.name + '@Clear', 
        this.onClear, 
        this
    );
};

ObjectPool.prototype.onClear = function() {
    for(var index in this.objects){
        var object = this.objects[index];
        
        object.enabled = false;
    }
};

ObjectPool.prototype.createClones = function() {
    for( var i = 0; i < this.maxCount; i++ ){
        var object = this.entity.clone();
            object.script.destroy('objectPool');
            object.enabled = false;

        this.objects.push(object);
    }
    
    this.entity.destroy();
};

ObjectPool.prototype.onClone = function(callback) {
    var object = this.objects[this.index];
    
    if(object){
        object.enabled = true;
        
        if(callback){
            callback(object);
        }
        
        if(this.sleepTime > 0){
            clearTimeout(object.timer);
            object.timer = setTimeout(function(object){
                object.enabled = false;
            }, this.sleepTime * 1000, object);
        }
    }
    
    this.index++;
    
    if(this.index > this.objects.length - 1){
        this.index = 0;
    }
};
