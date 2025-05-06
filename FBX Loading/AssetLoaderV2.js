var AssetLoader = pc.createScript('assetLoader');

// === ATTRIBUTES === //
AssetLoader.attributes.add('modelAsset', {
    type: 'asset',
    assetType: 'model',
    title: 'Model Asset'
});

AssetLoader.attributes.add('lysosome', {
    type: 'entity',
    title: 'Target Entity (Empty Holder)'
});

// === STATE === //
AssetLoader.prototype.initialize = function () {
    this.loadedEntities = [];
    this.modelLoaded = false;

    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
};

// === KEYBOARD TOGGLE === //
AssetLoader.prototype.onKeyDown = function (event) {
    if (event.key === pc.KEY_C) {
        this.loadModel();
    }

    if (event.key === pc.KEY_V) {
        this.unloadModel();
    }
};

// === LOAD MODEL === //
AssetLoader.prototype.loadModel = function () {
    if (this.modelLoaded) {
        console.log("Model already loaded.");
        return;
    }

    const asset = this.modelAsset;

    if (!asset) {
        console.error("Model asset not assigned.");
        return;
    }

    // Reload the asset if it's unloaded
    if (!asset.resource) {
        this.app.assets.load(asset);
        asset.once('load', () => this.instantiateModel(asset));
    } else {
        this.instantiateModel(asset);
    }
};

AssetLoader.prototype.instantiateModel = function (asset) {
    const modelEntity = asset.resource.instantiateRenderEntity();
    this.lysosome.addChild(modelEntity);
    this.loadedEntities.push(modelEntity);
    this.modelLoaded = true;

    console.log('Model loaded and instantiated.');
};

// === UNLOAD MODEL === //
AssetLoader.prototype.unloadModel = function () {
    if (!this.modelLoaded) {
        console.log("Model already unloaded.");
        return;
    }

    // Destroy instantiated entities
    this.loadedEntities.forEach(ent => {
        if (ent && ent.destroy) ent.destroy();
    });

    this.loadedEntities = [];

    // Unload from memory
    const asset = this.modelAsset;
    if (asset && asset.resource) {
        this.app.assets.unload(asset);
        console.log('Asset unloaded from memory.');
    }

    this.modelLoaded = false;
};
