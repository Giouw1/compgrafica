// Classe base para garantir a passagem por referência na matriz???
class ControlPoint {
  constructor(x, y, z) {
    this.pos = createVector(x, y, z);
  }
}

// Matriz que representa os pontos
class BicubicPatch {
  constructor() {
    // Matriz 4x4 linearizada (16 pontos)
    this.points = new Array(16);
  }

  // Mapeamento 2D (i, j) para array 1D
  setPoint(i, j, controlPoint) {
    this.points[i * 4 + j] = controlPoint;
  }

  getPoint(i, j) {
    return this.points[i * 4 + j];
  }
}

// Motor de construção e simetria, por enquanto só a parte superior, extender para a parte inferior também

class TensorProductEvaluator {
  static evaluate(matrix, u, v) {
    const bernstein = (i, t) => {
      if (i === 0) return Math.pow(1 - t, 3);
      if (i === 1) return 3 * t * Math.pow(1 - t, 2);
      if (i === 2) return 3 * Math.pow(t, 2) * (1 - t);
      if (i === 3) return Math.pow(t, 3);
      return 0;
    };

    let x = 0, y = 0, z = 0;
    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 3; j++) {
        let weight = bernstein(i, u) * bernstein(j, v);
        let p = matrix.getPoint(i, j).pos;
        x += weight * p.x;
        y += weight * p.y;
        z += weight * p.z;
      }
    }
    return createVector(x, y, z);
  }
}
class MeshTessellator {
  // Retorna um objeto JSON puro contendo vértices e as faces (índices)
  static discretize(matrix, resolutionU, resolutionV) {
    let vertices = [];
    let faces = [];
    let uvs = []

    // 1. Amostragem Discreta do Motor Matemático
    for (let i = 0; i <= resolutionU; i++) {
      let u = i / resolutionU;
      for (let j = 0; j <= resolutionV; j++) {
        let v = j / resolutionV;
        vertices.push(TensorProductEvaluator.evaluate(matrix, u, v));
        uvs.push([u, v]);
      }
    }

    // 2. Construção da Topologia Discreta (Triângulos)
    for (let i = 0; i < resolutionU; i++) {
      for (let j = 0; j < resolutionV; j++) {
        let p00 = i * (resolutionV + 1) + j;
        let p10 = (i + 1) * (resolutionV + 1) + j;
        let p01 = i * (resolutionV + 1) + (j + 1);
        let p11 = (i + 1) * (resolutionV + 1) + (j + 1);
        
        faces.push([p00, p01, p10]);
        faces.push([p10, p01, p11]);
      }
    }

    return { vertices: vertices, faces: faces, uvs:uvs };
  }
}
class MeshMerger {
  static merge(rawMeshes) {
    let mergedVertices = [];
    let mergedFaces = [];
    let vertexOffset = 0;
    let finalUVs = []; // Novo contêiner global
    for (let mesh of rawMeshes) {
      for (let v = 0; v < mesh.vertices.length; v++) {
        mergedVertices.push(mesh.vertices[v]);
        
        // Validação de existência da coordenada paramétrica
        if (mesh.uvs && mesh.uvs[v]) {
          finalUVs.push(mesh.uvs[v]);
        } else {
          // Preenchimento de segurança para vértices sem mapeamento (ex: trastes)
          finalUVs.push([0.0, 0.0]); 
        }
      }
      
      // Translada os índices topológicos e concatena as faces
      for (let face of mesh.faces) {
        mergedFaces.push([
          face[0] + vertexOffset,
          face[1] + vertexOffset,
          face[2] + vertexOffset
        ]);
      }

      // Atualiza o escalar de deslocamento para a próxima iteração
      vertexOffset += mesh.vertices.length;
    }

    return { vertices: mergedVertices, faces: mergedFaces,uvs: finalUVs };
  }
}