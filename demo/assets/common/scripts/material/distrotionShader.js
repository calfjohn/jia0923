let shader = {
    name: 'distortionSpriteShader',

    defines: [
        { name: 'HAS_HEART', },
        { name: 'USE_POST_PROCESSING', },
    ],
    vert:
    `
uniform mat4 viewProj;
attribute vec3 a_position;
attribute vec2 a_uv0;
varying vec2 v_texCoord;
void main()
{
vec4 pos = viewProj * vec4(a_position, 1);
gl_Position = vec4(pos.r,pos.g,pos.b,pos.a);
v_texCoord = a_uv0;
}
`,
    flag:
`
precision lowp float;
varying vec2 v_texCoord;
uniform vec4 color;
uniform sampler2D iTexture;
uniform vec2 u_offset;
uniform vec2 u_offset_tiling;
const float PI = 3.14159265359;
void main()
{
    float halfPI = 0.5 * PI;
    float maxFactor = sin(halfPI);
    vec2 uv = v_texCoord;
    vec2 xy = 2.0 * uv.xy - 1.0;
    float d = length(xy);
    if (d < (2.0-maxFactor)) {
        d = length(xy * maxFactor);
        float z = sqrt(1.0 - d * d);
        float r = atan(d, z) / PI;
        float phi = atan(xy.y, xy.x);
        uv.x = r * cos(phi) + 0.5;
        uv.y = r * sin(phi) + 0.5;
    } else {
        discard;
    }
    uv = uv * u_offset_tiling + u_offset;
    uv = fract(uv);
    gl_FragColor = color * texture2D(iTexture, uv);
}
`,
};

cc.game.once(cc.game.EVENT_ENGINE_INITED, function () {
    cc.renderer._forward._programLib.define(shader.name, shader.vert, shader.flag, shader.defines);
});

module.exports = shader;
