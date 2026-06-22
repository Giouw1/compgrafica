// ==========================================
// MOTOR DE SÍNTESE ACÚSTICA (WEB AUDIO API)
// ==========================================
class AcousticSynthesizer {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  pluck(frequency) {
    // Browsers suspendem o AudioContext até a primeira interação do usuário. 
    // Esta diretiva obriga o destravamento do fluxo na primeira excitação da corda.
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    let t = this.ctx.currentTime;

    // 1. Oscilador Fundamental (Corpo e gravidade do som)
    let oscFundamental = this.ctx.createOscillator();
    oscFundamental.type = 'sine';
    oscFundamental.frequency.value = frequency;

    // 2. Oscilador Harmônico (Textura metálica/ataque)
    let oscHarmonics = this.ctx.createOscillator();
    oscHarmonics.type = 'sawtooth';
    oscHarmonics.frequency.value = frequency;

    let gainFundamental = this.ctx.createGain();
    let gainHarmonics = this.ctx.createGain();
    let masterGain = this.ctx.createGain();

    // Filtro Passa-baixa: Atenua as altas frequências progressivamente, simulando a perda de energia cinética da corda
    let lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(frequency * 4, t);
    lowpass.frequency.exponentialRampToValueAtTime(frequency, t + 1.5);

    // Estrutura de Roteamento de Nós
    oscFundamental.connect(gainFundamental);
    oscHarmonics.connect(lowpass);
    lowpass.connect(gainHarmonics);

    gainFundamental.connect(masterGain);
    gainHarmonics.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    // 3. Aplicação do Filtro Envelope ADSR Exponencial
    // Fundamental decai em 4.0 segundos
    gainFundamental.gain.setValueAtTime(0.8, t);
    gainFundamental.gain.exponentialRampToValueAtTime(0.001, t + 4.0);

    // Harmônicos decaem em 1.5 segundos (fricção no ataque dissipa-se rápido)
    gainHarmonics.gain.setValueAtTime(0.3, t);
    gainHarmonics.gain.exponentialRampToValueAtTime(0.001, t + 1.5); 

    masterGain.gain.setValueAtTime(1.0, t);

    // Ignição e Coleta de Lixo
    oscFundamental.start(t);
    oscHarmonics.start(t);
    oscFundamental.stop(t + 4.0);
    oscHarmonics.stop(t + 4.0);
  }
}

// ==========================================
// MOTOR FÍSICO E GEOMÉTRICO DAS CORDAS
// ==========================================
class DynamicString {
  constructor(index, xPos, visualBaseFreq, audioBaseFreq, headAngleRad, synthesizer, len = 600) {
    this.s = len / 600.0;
    this.index = index;
    this.x = xPos * this.s;
    
    // Dissociação rigorosa dos domínios
    this.visualBaseFreq = visualBaseFreq;
    this.currentVisualFreq = visualBaseFreq;

    this.audioBaseFreq = audioBaseFreq;
    this.currentAudioFreq = audioBaseFreq;

    this.synth = synthesizer;
    
    this.zNut = -360 * this.s;    
    this.yNut = 5 * this.s;       
    this.zBridge = 240 * this.s;  
    this.yBridge = -10 * this.s;  

    this.amplitude = 0;
    this.gamma = 2.5; 
    this.time = 0;
    this.isActive = false;
    this.isPulled = false; 
    this.displacement = 0;
    
    this.frettedNode = 0; 

    const pegXLocal = [-5*this.s, -5*this.s, -5*this.s, 5*this.s, 5*this.s, 5*this.s]; 
    const pegZLocal = [-35*this.s, -65*this.s, -95*this.s, -95*this.s, -65*this.s, -35*this.s]; 
    const pegYLocal = 10 * this.s; 
    
    let pivot = createVector(0, 10 * this.s, -360 * this.s);
    let transformHeadstock = (x, y, z) => {
      let rotY = y * Math.cos(headAngleRad) - z * Math.sin(headAngleRad);
      let rotZ = y * Math.sin(headAngleRad) + z * Math.cos(headAngleRad);
      return createVector(x + pivot.x, rotY + pivot.y, rotZ + pivot.z);
    };

    this.p0_head = transformHeadstock(pegXLocal[this.index], pegYLocal, pegZLocal[this.index]);
  }

  pull(force) {
    this.isPulled = true;
    this.isActive = false;
    this.displacement = force * this.s; 
  }

  release() {
    if (this.isPulled) {
      this.isPulled = false;
      this.amplitude = this.displacement;
      this.time = 0;
      this.isActive = true;

      // Acionamento condicionado da rotina de síntese
      this.synth.pluck(this.currentAudioFreq);
    }
  }

  pressFret(fretNumber) {
    this.frettedNode = constrain(fretNumber, 0, 19);
    if (this.frettedNode === 0) {
      this.currentVisualFreq = this.visualBaseFreq;
      this.currentAudioFreq = this.audioBaseFreq;
    } else {
      let lengthFactor = 1 - Math.pow(2, -this.frettedNode / 12);
      this.currentVisualFreq = this.visualBaseFreq / (1 - lengthFactor);
      this.currentAudioFreq = this.audioBaseFreq / (1 - lengthFactor);
    }
  }

  update(deltaTime) {
    if (this.isPulled) return;
    if (!this.isActive) return;

    this.time += deltaTime;
    let currentAmp = this.amplitude * Math.exp(-this.gamma * this.time);

    if (Math.abs(currentAmp) < 0.05) {
      this.isActive = false;
      this.amplitude = 0;
      this.displacement = 0;
    } else {
      this.displacement = currentAmp * Math.cos(this.currentVisualFreq * this.time); 
    }
  }

  render() {
    let thinnestBaseWeight = 0.8;
    let computedThinnest = thinnestBaseWeight * this.s;
    
    let hardwareCompensation = 1.0;
    if (computedThinnest < 1.0) {
      hardwareCompensation = 1.0 / computedThinnest;
    }

    let baseWeight = this.index < 3 ? 1.5 : 0.8; 
    let targetWeight = (baseWeight * this.s) * hardwareCompensation;

    stroke(220, 220, 220, 255); 
    strokeWeight(targetWeight); 
    noFill();

    let pNut = createVector(this.x, this.yNut, this.zNut);

    let cpHead1 = p5.Vector.lerp(this.p0_head, pNut, 0.33);
    let cpHead2 = p5.Vector.lerp(this.p0_head, pNut, 0.66);
    bezier(this.p0_head.x, this.p0_head.y, this.p0_head.z, cpHead1.x, cpHead1.y, cpHead1.z, cpHead2.x, cpHead2.y, cpHead2.z, pNut.x, pNut.y, pNut.z);

    let zFulcrum = this.zNut;
    let yFulcrum = this.yNut;

    if (this.frettedNode > 0) {
      let scaleLength = this.zBridge - this.zNut; 
      zFulcrum = this.zNut + scaleLength * (1 - Math.pow(2, -this.frettedNode / 12));
      
      let t = (zFulcrum - this.zNut) / scaleLength;
      yFulcrum = lerp(this.yNut, this.yBridge, t); 

      let pFulcrum = createVector(this.x, yFulcrum, zFulcrum);
      let cpDead1 = p5.Vector.lerp(pNut, pFulcrum, 0.33);
      let cpDead2 = p5.Vector.lerp(pNut, pFulcrum, 0.66);
      
      bezier(pNut.x, pNut.y, pNut.z, cpDead1.x, cpDead1.y, cpDead1.z, cpDead2.x, cpDead2.y, cpDead2.z, pFulcrum.x, pFulcrum.y, pFulcrum.z);
    }

    let pStart = createVector(this.x, yFulcrum, zFulcrum);
    let pBridge = createVector(this.x, this.yBridge, this.zBridge);

    let cpVib1 = p5.Vector.lerp(pStart, pBridge, 0.40); 
    let cpVib2 = p5.Vector.lerp(pStart, pBridge, 0.85); 

    if (this.isActive || this.isPulled) {
      let dX = this.displacement * 0.5; 
      let dY = this.displacement * 0.15; 

      cpVib1.x += dX * 0.4; cpVib1.y += dY * 0.4;
      cpVib2.x += dX * 1.6; cpVib2.y += dY * 1.6;
    }

    bezier(pStart.x, pStart.y, pStart.z, cpVib1.x, cpVib1.y, cpVib1.z, cpVib2.x, cpVib2.y, cpVib2.z, pBridge.x, pBridge.y, pBridge.z);
  }
}

class StringOrchestrator {
  constructor(headAngleDegrees, len = 600) {
    this.strings = [];
    
    // Injeção da dependência acústica que será partilhada entre os objetos cinemáticos
    this.synthesizer = new AcousticSynthesizer();
    
    let headAngleRad = headAngleDegrees * Math.PI / 180;
    
    // Matriz de prevenção contra Aliasing temporal
    const visualFreqs = [15, 20, 25, 30, 38, 50]; 
    // Matriz acústica operando em afinação E2, A2, D3, G3, B3, E4
    const audioFreqs = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];

    for (let i = 0; i < 6; i++) {
      let xPos = -15 + (i * (30 / 5)); 
      this.strings.push(new DynamicString(i, xPos, visualFreqs[i], audioFreqs[i], headAngleRad, this.synthesizer, len));
    }
  }

  updateAndRender(deltaTime) {
    for (let s of this.strings) {
      s.update(deltaTime);
      s.render();
    }
  }

  pull(stringIndex, force) {
    if (stringIndex >= 0 && stringIndex < 6) this.strings[stringIndex].pull(force);
  }

  release(stringIndex) {
    if (stringIndex >= 0 && stringIndex < 6) this.strings[stringIndex].release();
  }
}