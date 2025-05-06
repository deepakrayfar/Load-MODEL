var AssetLoader = pc.createScript('assetLoader');

// Attribute to assign the lysosome entity in the Editor
AssetLoader.attributes.add('lysosome', { type: 'entity', title: 'lysosome' });

AssetLoader.prototype.initialize = function () {
    this.assets = [];
    this.materialAssets = [];
    console.log(this.lysosome);

    for (let i = 0; i < this.lysosome.children.length; i++) {
        let child = this.lysosome.children[i];
        let renderComponent = child.render;

        if (renderComponent) {
            console.log('Render Component:', renderComponent);

            if (renderComponent.meshInstances) {
                renderComponent.meshInstances.forEach(meshInstance => {
                    let material = meshInstance.material;

                    if (material) {
                        console.log(`Material found for ${child.name}:`, material);
                        this.materialAssets.push(material);

                        const textureSlots = [
                            'diffuseMap', 'normalMap', 'specularMap',
                            'ambientMap', 'emissiveMap', 'sheenMap'
                        ];

                        textureSlots.forEach(slot => {
                            if (material[slot]) {
                                console.log(`    ${slot}:`, material[slot]);
                            } else {
                                console.log(`    No ${slot}`);
                            }
                        });
                    } else {
                        console.log(`No material found for mesh instance in ${child.name}`);
                    }
                });
            }

            if (renderComponent.asset) {
                this.assets.push(renderComponent.asset);
                console.log(`Asset ID ${renderComponent.asset} added from child ${child.name}`);
            }
        } else {
            console.log(`No render component found for ${child.name}`);
        }
    }

    console.log("Assets array:", this.assets);
};

AssetLoader.prototype.update = function (dt) {
    if (this.app.keyboard.wasReleased(pc.KEY_V)) {
        this.unloadAssets();
    }

    if (this.app.keyboard.wasReleased(pc.KEY_C)) {
        this.loadAssets();
    }
};

AssetLoader.prototype.unloadAssets = function () {
    const gd = this.app.graphicsDevice;

    this.assets.forEach(assetId => {
        let asset = this.app.assets.get(assetId);
        if (!asset) {
            console.warn(`Model asset with ID ${assetId} not found`);
            return;
        }

        // Unload material textures
        this.materialAssets.forEach(material => {
            if (!material) return;

            const textureSlots = [
                { slot: 'diffuseMap', name: 'Diffuse' },
                { slot: 'normalMap', name: 'Normal' },
                { slot: 'specularMap', name: 'Specular' },
                { slot: 'ambientMap', name: 'Ambient' },
                { slot: 'emissiveMap', name: 'Emissive' },
                { slot: 'sheenMap', name: 'Sheen' }
            ];

            textureSlots.forEach(({ slot, name }) => {
                const texture = material[slot];
                if (texture && texture.destroy) {
                    material[slot] = null; // Remove reference
                    texture.destroy();
                    console.log(`${name} texture destroyed`);
                }
            });

            // Destroy material (optional, if you don't plan to reuse it)
            material.destroy();
            console.log(`Material ${material.name} destroyed`);
        });

        // Unbind materials from meshInstances
        asset.resource?.meshInstances?.forEach(mi => {
            mi.material = null;
        });

        // Destroy and unload the model asset
        if (asset.resource) {
            asset.resource.destroy();
            console.log(`Model asset ${asset.name} resource destroyed`);
        }

        asset.unload();
        console.log(`Model asset ${asset.name} unloaded`);
    });

    // Optionally remove render components from entities
    for (let i = 0; i < this.lysosome.children.length; i++) {
        let child = this.lysosome.children[i];
        if (child.render) {
            child.removeComponent('render');
            console.log(`Render component removed from ${child.name}`);
        }
    }

    // Clean up references
    this.materialAssets = [];
    this.assets = [];

    // Flush GPU
    gd.flush();
    gd.present();

    console.log('Assets and GPU memory unloaded and flushed.');
};

AssetLoader.prototype.loadAssets = function () {
    this.assets.forEach(assetId => {
        let asset = this.app.assets.get(assetId);
        if (asset) {
            this.app.assets.load(asset);
            console.log(`Model asset ${asset.name} loaded`);
        } else {
            console.warn(`Model asset with ID ${assetId} not found`);
        }
    });

    console.warn("Material reloading is not fully implemented. Reassignment to meshInstances is required.");
};
