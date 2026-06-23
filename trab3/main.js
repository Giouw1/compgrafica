
class WebGLAdapter {
  static buildP5Geometry(rawMesh) {
    //Cria a "lista" de vertices, faces e uvs
    let geom = new p5.Geometry();
    //Identificador da geometria
    geom.gid = 'mesh_alloc_' + Math.floor(Math.random() * 1000000000).toString(16);
    //Dá os vértices
    geom.vertices = rawMesh.vertices;
    //Dá as faces
    geom.faces = rawMesh.faces;
    
    // Mapeamento de texturas: verifica se é 1 para 1 de fato
    if (rawMesh.uvs && rawMesh.uvs.length === rawMesh.vertices.length) {
        geom.uvs = rawMesh.uvs; 
      
    }
    
    //Cálculo de normal por triangulo/face
    //para normal dos vértices, considera todas as faces que "atingem" o vértice
    geom.computeNormals();
    return geom;
  }
}
function preload() {
  // Preload dos shaders
  woodShader = loadShader('simple.vert', 'casco.frag');
  neckWoodShader = loadShader('metal.vert', 'pesc.frag')
  metalShader = loadShader('metal.vert', 'metal.frag')
  boneShader = loadShader('metal.vert', 'osso.frag')

}

// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
//Capotraste
let globalFret = 0;
//Casas apertadas para cada corda
let localFrets = [0, 0, 0, 0, 0, 0]; // NOVO: Armazena a digitação individual (0 = solta)
//Noção temporal para a vibração das cordas
let lastFrameTime = 0; 
//Todos as meshes de cada um dos conjunto de retalhos: separado por frag shader
let bodyMesh, neckMesh, metalMesh, boneMesh;
let globalScale = 1.0; // Adição do ponteiro global de escala
function setup() {
  //Cria o canvas
  createCanvas(1000, 800, WEBGL);
  //Forçar o color mode, para evitar desvios
  colorMode(RGB, 255, 255, 255, 255);

  let guitarLength = 200; // Tamanho da guitarra: buraco ajuste manual
  //Escala para ajustar todo o resto
  let globalScale = guitarLength / 600.0;
  
  // Instanciação do conjunto de retalhos que formam o corpo e o braço
  let shell = GuitarShellBuilder.buildFullTop(guitarLength);
  let arm = GuitarArmBuilder.buildFullArm(guitarLength);  
  
  // A extrusão, para formar o casco fechado
  let side = TopographyExtruder.buildSides(shell, 80 * globalScale);
  //Detalhe, isso aqui é uma cópia e não extrusão, mas é tudo para fechar
  let bottomshell = TopographyExtruder.buildBackShell(shell, 80 * globalScale);
  let front = TopographyExtruder.buildFronts(shell, 80 * globalScale);
  
  let headAngle = 15;
  //Retalhos da cabeça, pestana (que não é pestana), trastes, cavalete, e afinadores(que não são afinadores)
  let cabeca = GuitarHeadstockBuilder.buildHeadstock(headAngle, guitarLength);
  let pestana = GuitarHardwareBuilder.buildNut(guitarLength);       
  let trastes = GuitarHardwareBuilder.buildFrets(19, guitarLength);   
  let cavalete = GuitarHardwareBuilder.buildBridge(guitarLength);   
  let afinadores = GuitarHardwareBuilder.buildTuners(headAngle, guitarLength);

  // Criação das conjuntos de conjuntos de retalhos: para aplicar os frag shaders
  let bodyGroup  = [...shell, ...side, ...bottomshell, ...front];
  let neckGroup  = [...arm, ...cabeca];
  let metalGroup = [...trastes, ...cavalete, ...afinadores];
  let boneGroup  = [...pestana];

  
  // Merges dos meshes por grupo, e tesselação: criar a núvem de vértices
const processGroup = (group) => {
    let rawMeshes = group.map(patch => MeshTessellator.discretize(patch, 20, 20));
    let finalRawMesh = MeshMerger.merge(rawMeshes);
    return WebGLAdapter.buildP5Geometry(finalRawMesh);
  };

  // Processar por grupo
  bodyMesh = processGroup(bodyGroup);
  neckMesh = processGroup(neckGroup);
  metalMesh = processGroup(metalGroup);
  boneMesh = processGroup(boneGroup);

  // Criar as cordas, leva em consideração o ângulo da cabeça e da guitarlenght
  stringsOrchestrator = new StringOrchestrator(headAngle,guitarLength);
  //Criar o painel interativo
  buildControlPanel();
  //Setar a câmera para um valor inicial agradável
  camera(0, 0, 400, 0, 0, 0, 0, 1, 0);
}

function draw() {
  background(30); 
  //Processamento temporal
  let currentTime = millis() / 1000.0;
  let dt = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  orbitControl(); 
//Transformações para ficar de frente.  
  rotateX(-PI / 2); 
  rotateY(-PI / 2);
  translate(0, -100, 0);
  
  // Shader e renderização dos vértices das "nuvens"
  push();
  shader(woodShader);       // madeira escura, veio largo
  woodShader.setUniform('uScale', globalScale);
  model(bodyMesh);
  pop();

  push();
  shader(neckWoodShader);   // madeira diferente, veio mais fino
  model(neckMesh);
  pop();

  push();
  shader(metalShader);      // reflexo, sem veio
  model(metalMesh);
  pop();

  push();
  shader(boneShader);       // marfim/plástico
  model(boneMesh);
  pop();

  resetShader();//retoma ao shader do p5.
  // Execução do pipeline físico e desenho das cordas
  if (stringsOrchestrator) {
    push();
    stringsOrchestrator.updateAndRender(dt);
    pop();
  }
}
//Evento de controle: "escondido", só para testes
function keyPressed() {
  // 1. Controlo de Digitação (Setas Cima / Baixo)
  if (keyCode === UP_ARROW) {
    globalFret = constrain(globalFret + 1, 0, 19);
    updateGlobalFret();
  } else if (keyCode === DOWN_ARROW) {
    globalFret = constrain(globalFret - 1, 0, 19);
    updateGlobalFret();
  }

  // 2. Excitação Potencial das Cordas
  if (key === '1') stringsOrchestrator.pull(0, -6);
  if (key === '2') stringsOrchestrator.pull(1, -6);
  if (key === '3') stringsOrchestrator.pull(2, -6);
  if (key === '4') stringsOrchestrator.pull(3, -6);
  if (key === '5') stringsOrchestrator.pull(4, -6);
  if (key === '6') stringsOrchestrator.pull(5, -6);
}

function keyReleased() {
  // Conversão Cinética
  if (key === '1') stringsOrchestrator.release(0);
  if (key === '2') stringsOrchestrator.release(1);
  if (key === '3') stringsOrchestrator.release(2);
  if (key === '4') stringsOrchestrator.release(3);
  if (key === '5') stringsOrchestrator.release(4);
  if (key === '6') stringsOrchestrator.release(5);
}

// Sub-rotina de propagação do estado topológico
function updateGlobalFret() {
  if (stringsOrchestrator) {
    for (let i = 0; i < 6; i++) {
      stringsOrchestrator.strings[i].pressFret(globalFret);
    }
    // Saída no console para auditoria do estado atual
    console.log(`Capotraste deslocado para a Casa: ${globalFret}`);
  }
}
//Criação da interface de interação
function buildControlPanel() {
  // Container base
  let panel = createDiv('');
  panel.position(20, 20);
  panel.style('position', 'absolute'); 
  panel.style('z-index', '999');       
  panel.style('background', 'rgba(20, 20, 20, 0.85)');
  panel.style('padding', '15px');
  panel.style('border-radius', '8px');
  panel.style('color', '#fff');
  panel.style('font-family', 'sans-serif');
  panel.style('pointer-events', 'auto'); 

  // controle do capotraste
  let fretLabel = createSpan(`Capotraste Global: Casa ${globalFret}`);
  fretLabel.parent(panel);
  fretLabel.style('display', 'block');
  fretLabel.style('margin-bottom', '5px');

  let fretSlider = createSlider(0, 19, 0, 1);
  fretSlider.parent(panel);
  fretSlider.style('width', '100%');
  fretSlider.style('margin-bottom', '20px');
  //Muda a variável globalfret, e, chamando updatestringfrets, muda a lógica da vibração e som também
  fretSlider.input(() => {
    globalFret = fretSlider.value();
    fretLabel.html(`Capotraste Global: Casa ${globalFret}`);
    updateStringFrets(); // Delega a computação da sobreposição
  });

  // Controle por casa
  const stringNames = ["E6", "A5", "D4", "G3", "B2", "E1"];
  
  for (let i = 0; i < 6; i++) {
    // Containeres para guardar essas casas à serem mexidas
    let row = createDiv('');
    row.parent(panel);
    row.style('display', 'flex');
    row.style('align-items', 'center');
    row.style('gap', '10px');
    row.style('margin-bottom', '8px');

    // Rótulo da corda
    let label = createSpan(stringNames[i]);
    label.parent(row);
    label.style('width', '30px');
    label.style('font-weight', 'bold');

    // Seletor da casa individual (Menu Drop-down)
    let localFretSelect = createSelect();
    localFretSelect.parent(row);
    localFretSelect.style('flex-grow', '1');
    localFretSelect.style('padding', '4px');

    // Opções de 0 a 19
    for (let f = 0; f <= 19; f++) {
      localFretSelect.option(f === 0 ? 'Solta (0)' : `Casa ${f}`, f);
    }
    
    // se mudar, muda o valor dos frets e update na corda
    localFretSelect.changed(() => {
      localFrets[i] = parseInt(localFretSelect.value());
      updateStringFrets();
    });

    // Botão de vibrar a corda
    let btn = createButton('Tocar');
    btn.parent(row);
    btn.style('padding', '4px 12px');
    btn.style('background', '#4CAF50');
    btn.style('color', '#fff');
    btn.style('border', 'none');
    btn.style('border-radius', '4px');
    btn.style('cursor', 'pointer');   
 //Se eu apertar, a corda vibra pelo pull/release
  btn.mousePressed(() => {
      if (stringsOrchestrator) {
        stringsOrchestrator.pull(i,-6);stringsOrchestrator.release(i);
      }
    });

  }
  //Botão para tocar todas as cordas
  let strumBtn = createButton('Tocar Todas');
  strumBtn.parent(panel);
  strumBtn.style('display', 'block');
  strumBtn.style('width', '100%');
  strumBtn.style('margin-top', '15px');
  strumBtn.style('padding', '8px');
  strumBtn.style('background', '#2196F3'); // Azul responsivo
  strumBtn.style('color', '#fff');
  strumBtn.style('border', 'none');
  strumBtn.style('border-radius', '4px');
  strumBtn.style('cursor', 'pointer');
  strumBtn.style('font-weight', 'bold');
//Funcionamento do botão
  strumBtn.mousePressed(() => {
    if (stringsOrchestrator) {
      for (let i = 0; i < 6; i++) {
        // Atraso de 45ms entre cada corda para emular a propagação do rasgueio
        setTimeout(() => {
          stringsOrchestrator.pull(i, -6);
          stringsOrchestrator.release(i);
        }, i * 45); 
      }
    }
  });
}
//Muda a casa pressionada com base nos valores de casa apertada, a casa mais perto da base é a que vale mais, sempre.
function updateStringFrets() {
  if (stringsOrchestrator) {
    for (let i = 0; i < 6; i++) {
      // Aplica-se a regra de prevalência do ponto mais interno (maior valor escalar)
      let effectiveFret = Math.max(globalFret, localFrets[i]);
      stringsOrchestrator.strings[i].pressFret(effectiveFret);
    }
  }
}