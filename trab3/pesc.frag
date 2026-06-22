#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vViewPos;

out vec4 fragColor;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

void main() {
    vec3 fix = vNormal * 0.0 + vViewPos * 0.0;
    vec2 uv = vTexCoord;

    vec2 noiseDomain = uv * vec2(20.0, 90.0);
    float n = noise(noiseDomain)        * 0.45
            + noise(noiseDomain * 2.3)  * 0.25
            + noise(noiseDomain * 5.1)  * 0.10;

    float rings = sin(uv.y * 60.0 + n * 10.0);
    float t = (rings + 1.0) * 0.5;
    t = smoothstep(0.35, 0.65, t);

    vec3 lightWood = vec3(0.48, 0.22, 0.10);
    vec3 darkWood  = vec3(0.22, 0.09, 0.04);

    fragColor = vec4(mix(darkWood, lightWood, t), 1.0);
}