# Gerador de Planilha (.XLSX) para Habilitação de Certificados

Este projeto é uma aplicação de desktop desenvolvida com **Electron.js** que permite cadastrar dados e gerar uma planilha Excel (.xlsx) para a habilitação de certificados.

## Como funciona

A aplicação utiliza uma interface gráfica construída com HTML, CSS e JavaScript para facilitar o uso.

1.  **Cadastro de Dados em Memória**
    * O usuário preenche um formulário com os dados do certificado (Nome, Número de Série, Ativação, etc.).
    * Cada registro é adicionado a uma tabela de pré-visualização na tela e armazenado temporariamente em memória.

2.  **Geração do Arquivo XLSX**
    * Ao clicar em "Gerar XLSX", a aplicação usa a biblioteca **SheetJS** para criar um arquivo Excel a partir dos dados que estão na pré-visualização.
    * O processo principal do Electron abre uma caixa de diálogo para que o usuário escolha onde salvar o arquivo `.xlsx`.
    * Após o arquivo ser salvo com sucesso, a tabela de pré-visualização e os dados em memória são limpos, preparando a aplicação para um novo lote de registros.

## Estrutura dos Arquivos

-   `electron-main.js`: O processo principal do Electron, responsável por criar as janelas e lidar com operações do sistema, como salvar arquivos.
-   `index.html`: A estrutura da interface principal da aplicação.
-   `renderer.js`: O processo de renderização, que controla a lógica da interface, a interação com o usuário e a geração do conteúdo do arquivo Excel.
-   `index.css`: Estilização da interface.
-   `splash.html`: Tela de carregamento da aplicação.
-   `package.json`: Define as dependências e scripts do projeto.

## Observações

-   O projeto é self-contained e não depende de servidores externos ou banco de dados.
-   A geração do conteúdo do XLSX acontece no lado do cliente (renderer), mas a escrita do arquivo no disco é feita de forma segura pelo processo principal (main), seguindo as boas práticas do Electron.