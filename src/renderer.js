
const XLSX = require('xlsx');
const { ipcRenderer } = require('electron');
let previewData = [];

function adicionarDadosAoPreview() {
    const nome = document.getElementById('nome').value;
    const num_serie = document.getElementById('num_serie').value;
    const ativar = document.getElementById('ativar').value;
    const motivo = document.getElementById('motivo').value;
    const data_inicial = document.getElementById('data_inicial').value;
    const data_final = document.getElementById('data_final').value;

    if (!nome || !num_serie || !ativar || !motivo || !data_inicial || !data_final) {
        Swal.fire('Atenção!', 'Preencha todos os campos!', 'warning');
        return;
    }

    const newRow = [nome, num_serie, ativar, motivo, data_inicial, data_final];
    previewData.push(newRow);
    renderPreviewTable();

    // Removemos a escrita no arquivo CSV temporário
    // const linha = newRow.join(';') + '\n';
    // fs.appendFileSync(csvPath, linha, 'utf8');

    document.getElementById('form-dados').reset();
    document.getElementById('nome').focus(); // Melhora a usabilidade
}

function renderPreviewTable() {
    const tableBody = document.getElementById('previewTableBody');
    tableBody.innerHTML = '';
    previewData.forEach(rowData => {
        const tr = document.createElement('tr');
        rowData.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function sairAplicativo() {
    Swal.fire({
        title: 'Sair do aplicativo?',
        text: 'Tem certeza que deseja sair?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff6b6b',
        cancelButtonColor: '#667eea',
        confirmButtonText: 'Sim, sair',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.close();
        }
    });
}

function limparPreview() {
    previewData = [];
    renderPreviewTable();
    // Não precisamos mais limpar o arquivo CSV
    // if (fs.existsSync(csvPath)) { ... }
    Swal.fire('Limpou!', 'A pré-visualização e os dados em memória foram limpos.', 'success');
}

async function baixarXLSX() {
    if (previewData.length === 0) {
        Swal.fire('Vazio!', 'Nenhum dado foi adicionado para gerar o arquivo.', 'info');
        return;
    }

    // 1. Prepara os dados e cabeçalhos
    const headers = ['Nome Completo', 'Número de Série', 'Ativar', 'Motivo', 'Data Inicial', 'Data Final'];
    const todosDados = [headers, ...previewData];

    // 2. Cria a planilha e o workbook em memória
    const ws = XLSX.utils.aoa_to_sheet(todosDados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Certificados');

    // 3. Gera o buffer do arquivo XLSX
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // 4. Envia o buffer para o processo principal salvar o arquivo
    const result = await ipcRenderer.invoke('show-save-dialog-and-save', buffer);

    // 5. Trata o resultado retornado pelo processo principal
    if (result.success) {
        limparPreview();
        Swal.fire('Sucesso!', `Arquivo salvo em: ${result.path}`, 'success');
    } else {
        // Apenas mostra erro se não for um cancelamento do usuário
        if (result.error !== 'Operação de salvamento cancelada.') {
            Swal.fire('Erro ao Salvar', `Ocorreu um erro: ${result.error}`, 'error');
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Não precisamos mais chamar initializeCsvPath()
    renderPreviewTable();

    document.getElementById('exit-button').addEventListener('click', sairAplicativo);
    document.getElementById('add-data-button').addEventListener('click', adicionarDadosAoPreview);
    document.getElementById('generate-xlsx-button').addEventListener('click', baixarXLSX);
    document.getElementById('clear-preview-button').addEventListener('click', limparPreview);
});