// ==========================================
// OPERADOR TOPOLÓGICO GLOBAL (MANTIDO)
// ==========================================
function mirrorPatch(sourcePatch, targetPatch) {
  for (let i = 0; i <= 3; i++) {
    for (let j = 0; j <= 3; j++) {
      let srcPos = sourcePatch.getPoint(i, j).pos;
      targetPatch.setPoint(i, j, new ControlPoint(-srcPos.x, srcPos.y, srcPos.z));
    }
  }
}

// ==========================================
// MOTORES DE CONSTRUÇÃO TOPOLÓGICA (PARAMETRIZADOS)
// ==========================================

class GuitarShellBuilder {
  static buildFullTop(len = 600) {
    let s = len / 600.0; // Fator escalar
    let ur = new BicubicPatch(); let ul = new BicubicPatch(); 
    let lr = new BicubicPatch(); let ll = new BicubicPatch(); 

    const upperRightCoords = [
      [ [0, 0, 0],    [15, 0, -5],   [30, 0, -5],   [45, 0, 0] ],
      [ [0, 0, 60],   [30, 0, 60],   [65, 0, 65],   [85, 0, 60] ],
      [ [0, 0, 90],   [25, 0, 90],   [45, 0, 90],   [50, 0, 90] ],
      [ [0, 0, 120],  [20, 0, 120],  [35, 0, 120],  [50, 0, 120] ]
    ];

    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        let [x, y, z] = upperRightCoords[i][j];
        ur.setPoint(i, j, new ControlPoint(x * s, y * s, z * s));
      }
    }

    const lowerRightCoords = [
      [ [0, 0, 0],   [0, 0, 0],    [0, 0, 0],    [0, 0, 0] ],
      [ [0, 0, 0],   [0, 0, 0],    [0, 0, 0],    [0, 0, 0] ],
      [ [0, 0, 270], [40, 0, 270], [80, 0, 270], [120, 0, 270] ],
      [ [0, 0, 330], [20, 0, 330], [40, 0, 325], [50, 0, 320] ]
    ];

    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        if (i === 0) {
          lr.setPoint(0, j, ur.getPoint(3, j));
        } else if (i === 1) {
          let p3_upper = ur.getPoint(3, j).pos;
          let p2_upper = ur.getPoint(2, j).pos;
          let dir = p5.Vector.sub(p3_upper, p2_upper);
          let p1_lower = p5.Vector.add(p3_upper, dir);
          lr.setPoint(1, j, new ControlPoint(p1_lower.x, p1_lower.y, p1_lower.z)); // Já está escalado
        } else {
          let [x, y, z] = lowerRightCoords[i][j];
          lr.setPoint(i, j, new ControlPoint(x * s, y * s, z * s));
        }
      }
    }

    mirrorPatch(ur, ul); mirrorPatch(lr, ll);
    return [ur, ul, lr, ll];
  }
}

class GuitarArmBuilder {
  static buildFullArm(len = 600) {
    let s = len / 600.0;
    let ua_top = new BicubicPatch(); let la_top = new BicubicPatch(); 
    let ua_bottom = new BicubicPatch(); let la_bottom = new BicubicPatch(); 
    
    const topCoords = [
      [ [0, -5, 60],   [7.5, -5, 60],   [15, -5, 60],   [18, -5, 60] ],
      [ [0, 0, -80],   [7.5, 0, -80],   [15, 0, -80],   [18, 0, -80] ],
      [ [0, 5, -220],  [7.5, 5, -220],  [15, 5, -220],  [18, 5, -220] ],
      [ [0, 10, -360], [7.5, 10, -360], [15, 10, -360], [18, 10, -360] ]
    ];

    const bottomCoords = [
      [ [0, 15, 60],   [12, 15, 60],   [18, 10, 60],   [18, -5, 60] ],
      [ [0, 20, -80],  [12, 20, -80],  [18, 15, -80],  [18, 0, -80] ],
      [ [0, 25, -220], [12, 25, -220], [18, 20, -220], [18, 5, -220] ],
      [ [0, 30, -360], [12, 30, -360], [18, 25, -360], [18, 10, -360] ]
    ];

    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        let [xt, yt, zt] = topCoords[i][j];
        ua_top.setPoint(i, j, new ControlPoint(xt * s, yt * s, zt * s));

        let invertedJ = 3 - j;
        let [xb, yb, zb] = bottomCoords[i][j];
        ua_bottom.setPoint(i, invertedJ, new ControlPoint(xb * s, yb * s, zb * s));
      }
    }
    mirrorPatch(ua_top, la_top); mirrorPatch(ua_bottom, la_bottom);
    return [ua_top, la_top, ua_bottom, la_bottom];
  }
}

class GuitarHeelBuilder {
  static buildHeel(len = 600) {
    let s = len / 600.0;
    let rightUpperHeel = new BicubicPatch(); let rightLowerHeel = new BicubicPatch();
    let leftUpperHeel = new BicubicPatch(); let leftLowerHeel = new BicubicPatch();

    const upperCoords = [
      [ [0, 15, -45], [4, 15, -45], [8, 10, -45],  [14, 0, -45] ],
      [ [0, 30, -35], [5, 30, -35], [10, 20, -35], [16, 0, -35] ],
      [ [0, 45, -20], [8, 45, -20], [16, 30, -20], [22, 0, -20] ],
      [ [0, 60, -5],  [12, 60, -5], [20, 40, -5],  [28, 0, -5] ]
    ];

    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        let invertedJ = 3 - j;
        let [x, y, z] = upperCoords[i][j];
        rightUpperHeel.setPoint(i, invertedJ, new ControlPoint(x * s, y * s, z * s));
      }
    }

    const lowerCoords = [
      [ [0, 0, 0],   [0, 0, 0],    [0, 0, 0],    [0, 0, 0] ], 
      [ [0, 70, -2], [15, 70, -2], [25, 50, -2], [32, 0, -2] ],
      [ [0, 78, 0],  [20, 78, 0],  [30, 60, 0],  [38, 0, 0] ],
      [ [0, 80, 0],  [25, 80, 0],  [35, 60, 0],  [40, 0, 0] ] 
    ];

    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        let invertedJ = 3 - j;
        if (i === 0) {
          let seamPoint = rightUpperHeel.getPoint(3, invertedJ).pos;
          rightLowerHeel.setPoint(0, invertedJ, new ControlPoint(seamPoint.x, seamPoint.y, seamPoint.z));
        } else {
          let [x, y, z] = lowerCoords[i][j];
          rightLowerHeel.setPoint(i, invertedJ, new ControlPoint(x * s, y * s, z * s));
        }
      }
    }
    mirrorPatch(rightUpperHeel, leftUpperHeel); mirrorPatch(rightLowerHeel, leftLowerHeel);
    return [rightUpperHeel, leftUpperHeel, rightLowerHeel, leftLowerHeel];
  }
}

class GuitarHeadstockBuilder {
  static buildHeadstock(angleDegrees, len = 600) {
    let s = len / 600.0;
    let patches = [];
    let length = -120; // Mantém a proporção bruta para o cálculo
    let angleRad = angleDegrees * Math.PI / 180;
    
    let pivot = createVector(0, 10 * s, -360 * s);

    // O transform dimensiona os pontos pela escala ANTES de rotacionar
    let transform = (x, y, z) => {
      x *= s; y *= s; z *= s;
      let rotY = y * Math.cos(angleRad) - z * Math.sin(angleRad);
      let rotZ = y * Math.sin(angleRad) + z * Math.cos(angleRad);
      return new ControlPoint(x + pivot.x, rotY + pivot.y, rotZ + pivot.z);
    };

    const centerCoords = [
      [ [0, 0, 0], [1.3, 0, 0], [2.6, 0, 0], [4, 0, 0] ],
      [ [0, 0, length*0.3], [1.3, 0, length*0.3], [2.6, 0, length*0.3], [4, 0, length*0.3] ],
      [ [0, 0, length*0.7], [1.3, 0, length*0.7], [2.6, 0, length*0.7], [4, 0, length*0.7] ],
      [ [0, 0, length], [1.3, 0, length], [2.6, 0, length], [4, 0, length] ]
    ];

    const railCoords = [
      [ [10, 0, 0], [12.6, 0, 0], [15.3, 0, 0], [18, 0, 0] ],
      [ [10, 0, length*0.3], [13, 0, length*0.3], [18, 0, length*0.3], [20, 0, length*0.3] ],
      [ [10, 0, length*0.7], [13, 0, length*0.7], [18, 0, length*0.7], [18, 0, length*0.7] ],
      [ [10, 0, length], [12, 0, length], [14, 0, length], [16, 0, length] ]
    ];

    const tieBotCoords = [
      [ [4, 0, 0], [6, 0, 0], [8, 0, 0], [10, 0, 0] ],
      [ [4, 0, -8], [6, 0, -8], [8, 0, -8], [10, 0, -8] ],
      [ [4, 0, -16], [6, 0, -16], [8, 0, -16], [10, 0, -16] ],
      [ [4, 0, -25], [6, 0, -25], [8, 0, -25], [10, 0, -25] ]
    ];

    const tieTopCoords = [
      [ [4, 0, length*0.8], [6, 0, length*0.8], [8, 0, length*0.8], [10, 0, length*0.8] ],
      [ [4, 0, length*0.88], [6, 0, length*0.88], [8, 0, length*0.88], [10, 0, length*0.88] ],
      [ [4, 0, length*0.95], [6, 0, length*0.95], [8, 0, length*0.95], [10, 0, length*0.95] ],
      [ [4, 0, length], [6, 0, length], [8, 0, length], [10, 0, length] ]
    ];

    const createBlock = (coords) => {
      let blockPatches = [];
      let top = new BicubicPatch(); let bot = new BicubicPatch();
      let left = new BicubicPatch(); let right = new BicubicPatch();
      let front = new BicubicPatch(); let back = new BicubicPatch();

      for(let i=0; i<=3; i++){
        for(let j=0; j<=3; j++){
          let p = coords[i][j];
          top.setPoint(i, j, transform(p[0], 0, p[2]));
          bot.setPoint(i, 3-j, transform(p[0], 20, p[2])); 
        }
      }
      for(let i=0; i<=3; i++) {
        let pL = coords[i][0]; let pR = coords[i][3];
        for(let k=0; k<=3; k++) {
          let yDepth = k * (20/3);
          left.setPoint(i, k, transform(pL[0], yDepth, pL[2]));
          right.setPoint(i, 3-k, transform(pR[0], yDepth, pR[2]));
        }
      }
      for(let j=0; j<=3; j++) {
        let pF = coords[0][j]; let pB = coords[3][j];
        for(let k=0; k<=3; k++) {
          let yDepth = k * (20/3);
          front.setPoint(k, j, transform(pF[0], yDepth, pF[2]));
          back.setPoint(3-k, j, transform(pB[0], yDepth, pB[2]));
        }
      }
      blockPatches.push(top, bot, left, right, front, back);
      return blockPatches;
    };

    let subParts = [centerCoords, railCoords, tieBotCoords, tieTopCoords];
    for (let partCoords of subParts) {
      let rightFaces = createBlock(partCoords);
      for (let face of rightFaces) {
        let mirroredFace = new BicubicPatch();
        mirrorPatch(face, mirroredFace);
        patches.push(face, mirroredFace);
      }
    }
    return patches;
  }
}

class GuitarHardwareBuilder {
  static buildNut(len = 600) {
    let s = len / 600.0;
    let nut = new BicubicPatch();
    const nutCoords = [
      [ [0, 5, -360],  [6, 5, -360],  [12, 5, -360],  [18, 5, -360] ],
      [ [0, 5, -365],  [6, 5, -365],  [12, 5, -365],  [18, 5, -365] ],
      [ [0, 10, -365], [6, 10, -365], [12, 10, -365], [18, 10, -365] ],
      [ [0, 10, -360], [6, 10, -360], [12, 10, -360], [18, 10, -360] ]
    ];
    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        let [x, y, z] = nutCoords[i][j];
        nut.setPoint(i, j, new ControlPoint(x * s, y * s, z * s));
      }
    }
    let leftNut = new BicubicPatch();
    mirrorPatch(nut, leftNut);
    return [nut, leftNut];
  }

  static buildBridge(len = 600) {
    let s = len / 600.0;
    let bridge = new BicubicPatch();
    const bridgeCoords = [
      [ [0, -10, 235], [10, -10, 235], [20, -10, 235], [40, -10, 235] ],
      [ [0, -10, 245], [10, -10, 245], [20, -10, 245], [40, -10, 245] ],
      [ [0, 0, 245],   [10, 0, 245],   [20, 0, 245],   [40, 0, 245] ],
      [ [0, 0, 235],   [10, 0, 235],   [20, 0, 235],   [40, 0, 235] ]
    ];
    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        let [x, y, z] = bridgeCoords[i][j];
        bridge.setPoint(i, j, new ControlPoint(x * s, y * s, z * s));
      }
    }
    let leftBridge = new BicubicPatch();
    mirrorPatch(bridge, leftBridge);
    return [bridge, leftBridge];
  }

  static buildTuners(angleDegrees, len = 600) {
    let s = len / 600.0;
    let tuners = [];
    let angleRad = radians(angleDegrees);
    let pivot = createVector(0, 10 * s, -360 * s);

    let transform = (x, y, z) => {
      x *= s; y *= s; z *= s;
      let rotY = y * Math.cos(angleRad) - z * Math.sin(angleRad);
      let rotZ = y * Math.sin(angleRad) + z * Math.cos(angleRad);
      return new ControlPoint(x + pivot.x, rotY + pivot.y, rotZ + pivot.z);
    };

    let zPositions = [-35, -65, -95]; 
    for (let zPos of zPositions) {
      let pegRight = new BicubicPatch(); let pegLeft = new BicubicPatch();
      for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
          let px = 18 + j * 4;     
          let py = 10;            
          let pz = zPos - 3 + i * 2; 
          pegRight.setPoint(i, j, transform(px, py, pz));
        }
      }
      mirrorPatch(pegRight, pegLeft);
      tuners.push(pegRight, pegLeft);

      let shaftRight = new BicubicPatch(); let shaftLeft = new BicubicPatch();
      for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
          let px = 4 + j * 2; 
          let py = 10;            
          let pz = zPos - 1 + i * 0.5; 
          shaftRight.setPoint(i, j, transform(px, py, pz));
        }
      }
      mirrorPatch(shaftRight, shaftLeft);
      tuners.push(shaftRight, shaftLeft);
    }
    return tuners;
  }

  static buildFrets(numberOfFrets, len = 600) {
    let s = len / 600.0;
    let frets = [];
    let scaleLength = len; 
    let nutZ = -360 * s; 

    for (let n = 1; n <= numberOfFrets; n++) {
      let currentZ = nutZ + scaleLength * (1 - Math.pow(2, -n / 12));
      let fretRight = new BicubicPatch(); let fretLeft = new BicubicPatch();

      const fretCoords = [
        [ [0, -3*s, currentZ],       [6*s, -3*s, currentZ],       [12*s, -3*s, currentZ],       [18*s, -3*s, currentZ] ],
        [ [0, -3*s, currentZ + 1.5*s], [6*s, -3*s, currentZ + 1.5*s], [12*s, -3*s, currentZ + 1.5*s], [18*s, -3*s, currentZ + 1.5*s] ],
        [ [0, 0, currentZ + 1.5*s],  [6*s, 0, currentZ + 1.5*s],  [12*s, 0, currentZ + 1.5*s],  [18*s, 0, currentZ + 1.5*s] ],
        [ [0, 0, currentZ],        [6*s, 0, currentZ],        [12*s, 0, currentZ],        [18*s, 0, currentZ] ]
      ];

      for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
          let [x, y, z] = fretCoords[i][j];
          let originalZ = z / s; // Recupera Z na base para a curvatura do braço
          let originalYOffset = -5 + ((60 - originalZ) * (15 / 420));
          fretRight.setPoint(i, j, new ControlPoint(x, y + (originalYOffset * s), z));
        }
      }
      mirrorPatch(fretRight, fretLeft);
      frets.push(fretRight, fretLeft);
    }
    return frets;
  }
}

// A classe TopographyExtruder não precisa de ajustes no seu corpo. 
// Você só precisará enviar a "depth" (profundidade) já multiplicada pela escala quando chamar os construtores em main.js.
class TopographyExtruder {
  static buildSides(topPatches, depth) {
    let sidePatches = [];
    for (let patch of topPatches) {
      let side = new BicubicPatch();
      for (let i = 0; i <= 3; i++) {
        let edgePoint = patch.getPoint(i, 3).pos;
        side.setPoint(i, 0, new ControlPoint(edgePoint.x, edgePoint.y, edgePoint.z));
        side.setPoint(i, 1, new ControlPoint(edgePoint.x, edgePoint.y + depth * 0.33, edgePoint.z));
        side.setPoint(i, 2, new ControlPoint(edgePoint.x, edgePoint.y + depth * 0.66, edgePoint.z));
        side.setPoint(i, 3, new ControlPoint(edgePoint.x, edgePoint.y + depth, edgePoint.z));
      }
      sidePatches.push(side);
    }
    return sidePatches;
  }

  static buildFronts(topPatches, depth) {
    let frontPatches = [];
    let topIndices = [0, 1];
    for (let patchIndex of topIndices) {
      let patch = topPatches[patchIndex];
      let cap = new BicubicPatch(); 
      for (let j = 0; j <= 3; j++) {
        let edgePoint = patch.getPoint(0, j).pos;
        cap.setPoint(j, 0, new ControlPoint(edgePoint.x, edgePoint.y, edgePoint.z));
        cap.setPoint(j, 1, new ControlPoint(edgePoint.x, edgePoint.y + depth * 0.33, edgePoint.z));
        cap.setPoint(j, 2, new ControlPoint(edgePoint.x, edgePoint.y + depth * 0.66, edgePoint.z));
        cap.setPoint(j, 3, new ControlPoint(edgePoint.x, edgePoint.y + depth, edgePoint.z));
      }
      frontPatches.push(cap);
    }

    let bottomIndices = [2, 3];
    for (let patchIndex of bottomIndices) {
      let patch = topPatches[patchIndex];
      let cap = new BicubicPatch();
      for (let j = 0; j <= 3; j++) {
        let edgePoint = patch.getPoint(3, j).pos;
        cap.setPoint(j, 0, new ControlPoint(edgePoint.x, edgePoint.y, edgePoint.z));
        cap.setPoint(j, 1, new ControlPoint(edgePoint.x, edgePoint.y + depth * 0.33, edgePoint.z));
        cap.setPoint(j, 2, new ControlPoint(edgePoint.x, edgePoint.y + depth * 0.66, edgePoint.z));
        cap.setPoint(j, 3, new ControlPoint(edgePoint.x, edgePoint.y + depth, edgePoint.z));
      }
      frontPatches.push(cap);
    }
    return frontPatches;
  }

  static buildBackShell(topPatches, depth) {
    let backPatches = [];
    for (let patch of topPatches) {
      let back = new BicubicPatch();
      for (let i = 0; i <= 3; i++) {
        for (let j = 0; j <= 3; j++) {
          let p = patch.getPoint(i, j).pos;
          let invertedJ = 3 - j;
          back.setPoint(i, invertedJ, new ControlPoint(p.x, p.y + depth, p.z));
        }
      }
      backPatches.push(back);
    }
    return backPatches;
  }
}