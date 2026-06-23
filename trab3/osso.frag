#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vViewPos;

out vec4 fragColor;
//pseudorandom
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
//O noise usado para perturbar a mistura das cores
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
//Mistura das cores
void main() {
    vec3 fix = vNormal * 0.0 + vViewPos * 0.0;
    vec2 uv = vTexCoord;

    vec2 noiseDomain = uv * vec2(6.0, 30.0);

    float n = noise(noiseDomain)       * 0.30
            + noise(noiseDomain * 2.5) * 0.10;

    float grain = sin(uv.x * 18.0 + n * 6.0);
    float t = (grain + 1.0) * 0.5;
    t = smoothstep(0.45, 0.55, t);

    float age = noise(uv * vec2(3.0, 2.0));
    float yellowShift = smoothstep(0.3, 0.7, age) * 0.06;

    vec3 lightBone = vec3(0.96, 0.93, 0.84);
    vec3 darkBone  = vec3(0.80, 0.76, 0.65);

    vec3 color = mix(darkBone, lightBone, t);
    color += vec3(yellowShift, yellowShift * 0.5, 0.0);

    fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}