const math = cc.vmath;
var renderEngine;
var renderer;
var gfx;
var Material;

// Require to load the shader to program lib
const DistrotionShader = require('distrotionShader');

function RainMaterial () {
    Material.call(this, false);

    var pass = new renderer.Pass('distortionSpriteShader');
    pass.setDepth(false, false);
    pass.setCullMode(gfx.CULL_NONE);
    pass.setBlend(
        gfx.BLEND_FUNC_ADD,
        gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
        gfx.BLEND_FUNC_ADD,
        gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
    );
    let mainTech = new renderer.Technique(
        ['transparent'],
        [
            { name: 'iTexture', type: renderer.PARAM_TEXTURE_2D },
            { name: 'u_offset', type: renderer.PARAM_FLOAT2 },
            { name: 'u_offset_tiling', type: renderer.PARAM_FLOAT2 },
            {name: 'color', type: renderer.PARAM_COLOR4},
        ],
        [
            pass
        ]
    );
    

    this._texture = null;
    this._offset = math.vec2.create();
    this._tiling = math.vec2.create();
    this._tiling.x = 1;
    this._tiling.y = 1;
    this._color = {r: 1, g: 1, b: 1, a: 1};
    // need _effect to calculate hash
    this._effect = this.effect = new renderer.Effect(
        [
            mainTech,
        ],
        {
            'u_offset': this._offset,
            'u_offset_tiling': this._tiling,
            'color': this._color,
        },
        [
            { name: 'HAS_HEART', value: true },
            { name: 'USE_POST_PROCESSING', value: true }
        ]
    );

    this._mainTech = mainTech;
}

cc.game.once(cc.game.EVENT_ENGINE_INITED, function () {
    renderEngine = cc.renderer.renderEngine;
    renderer = renderEngine.renderer;
    gfx = renderEngine.gfx;
    Material = renderEngine.Material;

    cc.js.extend(RainMaterial, Material);
    cc.js.mixin(RainMaterial.prototype, {
        getTexture () {
            return this._texture;
        },

        setTexture (val) {
            if (this._texture !== val) {
                this._texture = val;
                this._texture.update({
                    // Adapt to shader
                    flipY: true,
                    // For load texture
                    mipmap: true
                });
                this.effect.setProperty('iTexture', val.getImpl());
                this._texIds['iTexture'] = val.getId();

                // this._tiling.x = this._texture.width;
                // this._tiling.y = this._texture.height;
            }
        },

        addY (num) {
            this._offset.y = this._offset.y + num;
            cc.log(this._offset.y);
            this.effect.setProperty('u_offset', this._offset);
        },

        setValue (offset, tiling) {
            this._offset = offset;
            this._tiling = tiling;
            this.effect.setProperty('u_offset', this._offset);
            this.effect.setProperty('u_offset_tiling', this._tiling);
        },
    });
});

module.exports = RainMaterial;
