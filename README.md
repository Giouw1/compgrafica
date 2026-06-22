# Relatório Técnico: Modelagem paramétrica e Renderização Procedural de um Instrumento de Cordas

Este documento detalha a arquitetura computacional e as formulações matemáticas implementadas no desenvolvimento de um simulador interativo em WebGL, abrangendo desde a gênese topológica das malhas até o pipeline de sombreamento e síntese acústica.

## 1. Modelagem Matemática e Discretização Espacial
A geometria estrutural do objeto não deriva de importações estáticas (arquivos .obj/.gltf), mas de formulações paramétricas nativas. 
* **Superfícies Bicúbicas de Bézier:** O corpo, braço e ferragens são definidos por matrizes de $4 \times 4$ pontos de controle no espaço $\mathbb{R}^3$. 
* **Produto Tensorial:** A avaliação das coordenadas no domínio contínuo $(u, v)$ é regida por polinômios de Bernstein de grau 3. O método iterativo calcula pesos espaciais que interpolam os vértices suavemente.
* **Tesselação (Discretização):** O motor algorítmico amostra essas superfícies contínuas em resoluções arbitrárias (ex: $20 \times 20$), gerando uma malha discreta de triângulos associados aos respectivos vetores normais e coordenadas paramétricas (UV mapping), consolidando as estruturas de dados no `Geometry Buffer` da GPU.

## 2. Pipeline de Transformação e Câmera
As transformações no espaço tridimensional são estritamente regidas por álgebra linear matricial:
* **Espaço do Modelo para o Espaço de Visualização:** O *Vertex Shader* processa os vértices multiplicando-os pela `ModelViewMatrix` ($4 \times 4$).
* **Matriz Normal:** Para garantir a integridade da iluminação sob translações e rotações, as normais da malha são transformadas por uma `NormalMatrix` de dimensão $3 \times 3$, que constitui a transposta da inversa da submatriz linear da *ModelViewMatrix*.
* **Câmera Focal (Arcball):** A navegação espacial substitui matrizes estáticas pela computação de graus de liberdade em coordenadas esféricas (raio, theta, phi), permitindo a orbitagem em torno de um alvo vetorizado (Target Camera) em vez de rotações presas à origem global.

## 3. Sombreamento Analítico (Shading)
O sistema aplica o modelo empírico de iluminação local de **Blinn-Phong** operando no Espaço de Visualização (View Space). O cálculo fragmento a fragmento compreende:
* **Reflexão Difusa:** Resultante do produto interno entre o vetor de incidência da luz e a normal da superfície, governada pela lei dos cossenos de Lambert.
* **Reflexão Especular:** Implementada pelo vetor intermediário (*Half-vector*), reduzindo o custo computacional do vetor de reflexão exato de Phong. Superfícies com alto índice de polimento, como os metais niquelados dos trastes, recebem expoentes de brilho elevados (ex: 128.0), gerando *highlights* nítidos.

## 4. Texturização Procedural na GPU
Com o objetivo de abolir texturas baseadas em bitmaps, os fragment shaders geram materiais em tempo de execução:
* **Funções Estocásticas (Noise):** Utilizou-se algoritmos geradores de ruído randômico interpolado para simular o Movimento Browniano Fracionário (fBm) com múltiplas oitavas. O ruído atua no espaço das coordenadas paramétricas (UV).
* **Anisotropia Simulada:** No sombreamento de materiais orgânicos (madeira, osso), a deformação direcional do ruído ao longo de eixos específicos (escala de frequências) simula fibras e veios longitudinais característicos da biologia do material.
* **Operadores Geométricos de Oclusão:** A boca acústica do instrumento é projetada matematicamente no espaço bidimensional e resolvida pela Equação Euclidiana do Círculo acoplada à função `smoothstep`. Isso anula a necessidade de deformar a topologia poligonal com recortes complexos.

## 5. Simulação Cinemática e Acústica
* **Oscilador Harmônico Amortecido:** A deformação da corda segue equações diferenciais da cinemática. O deslocamento espacial decai exponencialmente em função do tempo ($e^{-\gamma t}$) com perturbações senoidais regidas pela frequência da nota respectiva.
* **Geometria de Cordas:** Utiliza interpolação analítica via curvas de Bézier em vez de malhas poligonais, preservando a coerência visual das ondas estacionárias nos nós corretos quando pressionadas nos trastes.
* **Web Audio API:** Sintetizador aditivo instanciado no domínio computacional. Gera oscilações primárias filtradas por *Lowpass* e um Envelope ADSR algorítmico, operando independentemente da taxa de atualização do monitor e prevenindo corrupção estroboscópica na onda visual.
