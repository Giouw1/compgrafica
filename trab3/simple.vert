#version 300 es
precision highp float;

in vec3 aPosition;
in vec2 aTexCoord;
in vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vNormal;
out vec3 vViewPos;
out vec2 vTexCoord;
out vec3 vLocalPos; // NOVO: Tensor posicional no Espaço do Objeto

void main() {
    vTexCoord = aTexCoord;
    
    // Repasse direto das coordenadas originais
    vLocalPos = aPosition; 
    
    vec4 viewPos = uModelViewMatrix * vec4(aPosition, 1.0);
    vViewPos = viewPos.xyz;
    
    vNormal = normalize(uNormalMatrix * aNormal);
    
    gl_Position = uProjectionMatrix * viewPos;
}