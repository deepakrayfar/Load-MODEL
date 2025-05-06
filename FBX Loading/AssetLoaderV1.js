var AssetLoader = pc.createScript('assetLoader');

AssetLoader.attributes.add('lysosome', { type: 'entity', title: 'lysosome' });

AssetLoader.prototype.initialize = function() {
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

                        console.log(`-------------------- Textures for Material (${material.name}):`);

                        // Check for diffuse map
                        if (material.diffuseMap) {
                            console.log(`    Diffuse Map:`, material.diffuseMap);
                        } else {
                            console.log(`    No Diffuse Map`);
                        }

                        // Check for normal map
                        if (material.normalMap) {
                            console.log(`    Normal Map:`, material.normalMap);
                        } else {
                            console.log(`    No Normal Map`);
                        }

                        // Check for specular map
                        if (material.specularMap) {
                            console.log(`    Specular Map:`, material.specularMap);
                        } else {
                            console.log(`    No Specular Map`);
                        }

                        // Check for ambient map
                        if (material.ambientMap) {
                            console.log(`    Ambient Map:`, material.ambientMap);
                        } else {
                            console.log(`    No Ambient Map`);
                        }

                        // Check for emissive map
                        if (material.emissiveMap) {
                            console.log(`    Emissive Map:`, material.emissiveMap);
                        } else {
                            console.log(`    No Emissive Map`);
                        }

                         // Check for sheen map
                         if (material.sheenMap) {
                            console.log(`    Sheen Map:`, material.sheenMap);
                        } else {
                            console.log(`    No Sheen Map`);
                        }
                    } else {
                        console.log(`No material found for mesh instance in ${child.name}`);
                    }

                     console.log(`-------------------------------------------- `);
                });
            } else {
                console.log(`No mesh instances found for ${child.name}`);
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

AssetLoader.prototype.update = function(dt) {
    if (this.app.keyboard.wasReleased(pc.KEY_V)) {
        this.unloadAssets();
    }

    if (this.app.keyboard.wasReleased(pc.KEY_C)) {
        this.loadAssets();
    }
};

AssetLoader.prototype.unloadAssets = function() {
    // Unload model assets
    this.assets.forEach(assetId => {
        let asset = this.app.assets.get(assetId);
        if (asset) {
            // Unload material textures
            this.materialAssets.forEach(material => {
                if (material) {
                    console.log(`Processing material: ${material.name}`);

                    // Function to unload a texture
                    const unloadTexture = (textureSlot, textureName) => {
                        if (material[textureSlot]) {
                            let textureAssetId = material[textureSlot];
                            let textureAsset = this.app.assets.get(textureAssetId);

                        if (textureAsset && textureAsset.resource) {
                                this.app.graphicsDevice.flush();  // Force GPU sync
                                textureAsset.resource.destroy();
                                if (!textureAsset.resource.glTexture) {
                                    console.log(`${textureName} texture ${textureAsset.name} destroyed and unloaded`);
                                    textureAsset.unload();
                                } else {
                                    console.warn(`${textureName} texture ${textureAsset.name} FAILED to destroy!`);
                                }
                        }
                        else {
                                // console.log(`${textureName} texture asset not found for material ${material.name}`);
                            }
                        } else {
                            // console.log(`No ${textureName} texture for material ${material.name}`);
                        }
                    };

                    // Unload textures
                    unloadTexture('diffuseMap', 'Diffuse');
                    unloadTexture('normalMap', 'Normal');
                    unloadTexture('specularMap', 'Specular');
                    unloadTexture('ambientMap', 'Ambient');
                    unloadTexture('emissiveMap', 'Emissive');
                    unloadTexture('sheenMap', 'Sheen');
                }
            });

            if (asset.resource) {
                asset.resource.destroy(); // Destroy the model resource
                console.log(`Model asset ${asset.name} resource destroyed`);
            }

            asset.unload();
            console.log(`Model asset ${asset.name} unloaded`);
        } else {
            console.warn(`Model asset with ID ${assetId} not found`);
        }
    });
};


AssetLoader.prototype.loadAssets = function() {
    // Load model assets
    this.assets.forEach(assetId => {
        let asset = this.app.assets.get(assetId);
        if (asset) {
            this.app.assets.load(asset);
            console.log(`Model asset ${asset.name} loaded`);
        } else {
            console.warn(`Model asset with ID ${assetId} not found`);
        }
    });

    // Reloading material is more complex
    // You would need to reassign the materials to the meshInstances
    // This part requires more context on how you want to handle reloading materials
    // and reassigning them to the render components.
    // A simple reload might not be sufficient, you might need to recreate the materials.
    console.warn("Material reloading is not fully implemented. Requires more context.");
};
