#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vViewPos;
in vec3 vLocalPos; 

out vec4 fragColor;

// O vetor de estado injetado pela CPU
uniform float uScale; 

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

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec3 fix = vNormal * 0.0 + vViewPos * 0.0;
    vec2 uv = vTexCoord;
    vec2 noiseDomain = uv * vec2(8.0, 45.0);
    
    float n = noise(noiseDomain) * 0.5 + noise(noiseDomain * 2.0) * 0.25;
    float rings = sin(uv.x * 30.0 + n * 12.0);
    float t = (rings + 1.0) * 0.5;
    t = smoothstep(0.2, 0.8, t);

    vec3 lightWood = vec3(0.65, 0.50, 0.15); 
    vec3 darkWood  = vec3(0.25, 0.15, 0.04);
    vec3 woodColor = mix(darkWood, lightWood, t);

    // -------------------------------------------------------------
    // OPERADOR GEOMÉTRICO DE OCLUSÃO (ESPAÇO CANÔNICO 1:1)
    // -------------------------------------------------------------
    // Restaura as coordenadas comprimidas para a proporção original do motor matemático
    vec3 canonicalPos = vLocalPos / uScale;

    // Alocação rigorosa das âncoras na topologia 1:1 original
    // Z = 90 alinha o orifício sob o fim do espelho (fretboard) e antes do cavalete
    vec2 holeCenter = vec2(0.0, 45.0); 
    float holeRadius = 15.0;

    // A distância agora é computada sem sofrer influência do fator lambda
    float distToCenter = length(canonicalPos.xz - holeCenter);

    // Discriminador de profundidade restabelecido na constante de extrusão bruta
    float isTopShell = 1.0 - step(0.0, canonicalPos.y); 

    // Máscara com antisserrilhamento exato de 1 unidade absoluta
    float holeMask = (1.0 - smoothstep(holeRadius - 1.0, holeRadius, distToCenter)) * isTopShell;

    vec3 holeColor = vec3(0.02, 0.01, 0.005); 
    vec3 finalColor = mix(woodColor, holeColor, holeMask);
    // -------------------------------------------------------------
    
    fragColor = vec4(finalColor, 1.0);
}