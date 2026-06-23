#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vViewPos;
in vec2 vTexCoord;

out vec4 fragColor;
//pseudorandom
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
//noise para bagunçar a mistura das cores
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
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vViewPos);

    vec3 L1 = normalize(vec3(0.5,  1.0, 0.8));
    vec3 H1 = normalize(L1 + V);

    vec3 L2 = normalize(vec3(-0.8, 0.4, -0.5));
    vec3 H2 = normalize(L2 + V);

    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0) * 0.3;

    float spec1 = pow(max(dot(N, H1), 0.0), 128.0);
    float spec2 = pow(max(dot(N, H2), 0.0),  48.0) * 0.4;

    float scratch = noise(vTexCoord * vec2(2.0, 200.0)) * 0.08
                  + noise(vTexCoord * vec2(3.0, 400.0)) * 0.04;

    vec3 baseNickel  = vec3(0.70, 0.68, 0.62);
    vec3 specNickel  = vec3(0.95, 0.94, 0.90);

    vec3 ambient  = baseNickel * 0.25;
    vec3 diffuse  = baseNickel * (diff1 + diff2) * 0.45;
    vec3 specular = specNickel * (spec1 + spec2);
    vec3 color = ambient + diffuse + specular - scratch;

    fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}