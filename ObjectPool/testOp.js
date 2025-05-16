var TestOp = pc.createScript('testOp');

// initialize code called once per entity
TestOp.prototype.initialize = function() {

};

// update code called every frame
TestOp.prototype.update = function(dt) {
    if(this.app.keyboard.isPressed(pc.KEY_X)){
        this.app.fire(
            'ObjectPool:Lysosome',
            function(entity){
                console.log(entity);
                entity.enabled = true;
                entity.rigidbody.teleport(
                    Math.random() * 5,
                    Math.random() * 5,
                    Math.random() * 5
                );
                
            }
        );
    }
};

