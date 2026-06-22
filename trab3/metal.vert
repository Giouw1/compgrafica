#version 300 es
precision highp float;

// Atributos topológicos de entrada
in vec3 aPosition;
in vec2 aTexCoord;
in vec3 aNormal;

// Matrizes de Transformação
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix; // Restrição bidimensional correta (3x3)

// Vetores de Interpolação para o Fragment Shader
out vec3 vNormal;
out vec3 vViewPos;
out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    
    // Projeção no espaço da câmera
    vec4 viewPos = uModelViewMatrix * vec4(aPosition, 1.0);
    vViewPos = viewPos.xyz;
    
    // Rotação isotrópica da normal espacial
    vNormal = normalize(uNormalMatrix * aNormal);
    
    gl_Position = uProjectionMatrix * viewPos;
}