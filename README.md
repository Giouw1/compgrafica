# Overview geral

Um breve resumo do que foi feito.
A ideia do trabalho era montar um violão acústico que fosse capaz de ser utilizável, tocando as cordas, que vibrariam. O ponto do trabalho era usar retalhos de bezier, curvas de bezier e texturas.
#Modelagem.
O violão foi modelado como decidido, usando retalhos de bezier e extrusões para montar sua estrutura, as interpolações foram feitas seguindo o polinômio de bernstein.
#Cordas
As cordas foram feitas com segmentos de bezier, garantindo apenas continuidade C0 para permitir vibração parcial. A vibração foi feita oscilando a posição dos pontos de controle da curva livre (quando aperto uma casa, crio uma curva presa e uma livre). Além disso, apesar de não ser o foco do trabalho, usei uma web audio api que, combinada com as frequências das cordas, permitiu que fosse gerado som.
#Textura
Usei texturas procedurais baseadas em noise para misturar cores e formar detalhes de madeira, metal, e osso/plástico. Realizei também uma oclusão, nesse contexto, para gerar o buraco do violão.
