#version 300 es
precision highp float;
//Posições, coordenadas de textura e normais
in vec3 aPosition;
in vec2 aTexCoord;
in vec3 aNormal;
//Modelview, Projeção, matriz de correção de normal
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
//O que saí desse vert shader: as novas posições, normais, e texturas
out vec3 vNormal;
out vec3 vViewPos;
out vec2 vTexCoord;
out vec3 vLocalPos; //Leva posições originais para poder fazer a oclusão: para a boca do violão

void main() {
    vTexCoord = aTexCoord;
    

    vLocalPos = aPosition; 
    
    vec4 viewPos = uModelViewMatrix * vec4(aPosition, 1.0);
    vViewPos = viewPos.xyz;
    
    vNormal = normalize(uNormalMatrix * aNormal);
    
    gl_Position = uProjectionMatrix * viewPos;
}