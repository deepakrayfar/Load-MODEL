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
};

// Update function called every frame
SceneManager.prototype.update = function (dt) {
    if (this.app.keyboard.wasReleased(pc.KEY_V)) {
        console.log('V key released: loading next scene');
        this.advanceScene(1);
    }
    if (this.app.keyboard.wasReleased(pc.KEY_C)) {
        console.log('C key released: unloading current scene');
        this.unloadCurrentScene();
    }
};

// Helper to move scenes by offset
SceneManager.prototype.advanceScene = function(offset) {
    var names = this.sceneNames.map(function(s) { return s.name; });
    if (!this.currentSceneName && names.length) {
        this.loadScene(names[0]);
        return;
    }
    var idx = names.indexOf(this.currentSceneName);
    var next = (idx + offset + names.length) % names.length;
    this.loadScene(names[next]);
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
    if (templateAsset) {
        // This clears its resource and GPU handles
        templateAsset.unload();

        // Later, to reload the asset from disk/url:
        templateAsset.load();  // re-downloads/decodes the FBX+textures
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
        this.cleanupResources(this.currentSceneEntity);
        this.currentSceneEntity.destroy();
          // unload the asset
        var a = this.app.assets.find(this.currentSceneName, 'template');
        if (a) a.unload();
        this.currentSceneEntity = null;
        this.currentSceneName = null;
        console.log('Unloaded previous scene');
    }
};

// Recursively clean textures and mesh buffers from GPU
SceneManager.prototype.cleanupResources = function (root) {
    var recurse = function (entity) {
        if (entity.model) {
            entity.model.meshInstances.forEach(function (mi) {
                var mat = mi.material;
                if (mat) {
                    ['diffuseMap', 'normalMap', 'specularMap', 'emissiveMap'].forEach(function (slot) {
                        var tex = mat[slot];
                        if (tex && tex instanceof pc.Texture) {
                            this.app.graphicsDevice.destroyTexture(tex);
                            mat[slot] = null;
                        }
                    }.bind(this));
                }
                var mesh = mi.mesh;
                if (mesh) {
                    if (mesh.vertexBuffer) this.app.graphicsDevice.destroyVertexBuffer(mesh.vertexBuffer);
                    if (mesh.indexBuffer) this.app.graphicsDevice.destroyIndexBuffer(mesh.indexBuffer);
                }
            }.bind(this));
        }
        for (var i = 0; i < entity.children.length; i++) {
            recurse(entity.children[i]);
        }
    }.bind(this);
    recurse(root);
};
