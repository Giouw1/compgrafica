# Simulador Paramétrico de Instrumento de Cordas

Projeto desenvolvido para a disciplina de Computação Gráfica, utilizando WebGL e a biblioteca p5.js para renderização de malhas procedurais e síntese de áudio em tempo real.

## 🛠️ Tecnologias e Conceitos Aplicados

- **Modelagem Matemática:** Uso de Superfícies de Bézier Bicúbicas para a construção paramétrica da topologia do violão.
- **Pipeline WebGL 2.0:** Shaders customizados para renderização, utilizando cálculos de iluminação Blinn-Phong e oclusão geométrica procedimental.
- **Síntese de Áudio (Web Audio API):** Motor acústico aditivo com filtro ADSR para simulação da ressonância de cordas.
- **Interação:** Sistema de câmera Focal (Arcball) para controle de órbita e translação em torno do modelo.

## 🚀 Funcionalidades
- **Construção Paramétrica:** O instrumento é gerado em função de uma variável de comprimento (`len`), permitindo escalonamento dinâmico.
- **Iluminação e Materiais:** Shaders procedurais para madeira, osso e metais, com mapeamento de microrriscos anisotrópicos.
- **Simulação Física:** Cordas vibrantes baseadas em osciladores harmônicos amortecidos.
- **Interface de Controle:** Painel DOM integrado para controle individual de digitação em cada corda e acionamento de rasgueio global.

## 💻 Instalação
O projeto é hospedado via GitHub Pages. Clone o repositório e abra o `index.html` em um servidor local (Live Server no VS Code) para desenvolvimento.
