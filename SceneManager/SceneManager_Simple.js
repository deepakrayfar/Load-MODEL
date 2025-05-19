var SceneManager = pc.createScript('sceneManager');

// Attributes for optional UI
SceneManager.attributes.add('sceneNames', {
    type: 'json',
    title: 'Scene Names',
    array: true,
    schema: [{ name: 'name', type: 'string' }]
});

// initialize code called once per entity
SceneManager.prototype.initialize = function () {
    this.currentSceneEntity = null;
    this.currentSceneName = null;

    // Optionally load the first scene
    if (this.sceneNames.length > 0) {
        this.loadScene(this.sceneNames[0].name);
    }
};

// Update function called every frame
SceneManager.prototype.update = function (dt) {
    if (this.app.keyboard.wasReleased(pc.KEY_V)) {
        console.log('V key released: loading next scene');
        var index = this.sceneNames.findIndex(function (s) {
            return s.name === this.currentSceneName;
        }.bind(this));
        var next = (index + 1) % this.sceneNames.length;
        this.loadScene(this.sceneNames[next].name);
    }
    if (this.app.keyboard.wasReleased(pc.KEY_C)) {
        console.log('C key released: unloading current scene');
        this.unloadCurrentScene();
    }
};

// Load a template by name
SceneManager.prototype.loadScene = function (sceneName) {
    if (this.currentSceneName === sceneName) return;
    this.unloadCurrentScene();
    var templateAsset = this.app.assets.find(sceneName, 'template');
    if (!templateAsset) {
        console.warn('Template not found: ' + sceneName);
        return;
    }
    var instance = templateAsset.resource.instantiate();
    instance.name = sceneName + '_Instance';
    this.app.root.addChild(instance);
    this.currentSceneEntity = instance;
    this.currentSceneName = sceneName;
    console.log('Loaded scene: ' + sceneName);
};

// Unload the current scene entity and clear GPU memory
SceneManager.prototype.unloadCurrentScene = function () {
    if (this.currentSceneEntity) {
        this.cleanupTextures(this.currentSceneEntity);
        this.currentSceneEntity.destroy();
        this.currentSceneEntity = null;
        this.currentSceneName = null;
        console.log('Unloaded previous scene');
    }
};

// Recursively clean textures and materials from GPU
SceneManager.prototype.cleanupTextures = function (root) {
    var recurse = function (entity) {
        // cleanup this entity
        if (entity.model && entity.model.model && entity.model.model.meshInstances) {
            entity.model.model.meshInstances.forEach(function (mi) {
                var material = mi.material;
                if (material) {
                    ['diffuseMap', 'normalMap', 'specularMap', 'emissiveMap'].forEach(function (slot) {
                        var tex = material[slot];
                        if (tex && tex instanceof pc.Texture) {
                            this.app.graphicsDevice.destroyTexture(tex);
                            material[slot] = null;
                        }
                    }.bind(this));
                }
            }.bind(this));
        }
        // recurse children
        entity.children.forEach(function (child) {
            recurse(child);
        });
    }.bind(this);
    recurse(root);
};
