// electron-main.js ATUALIZADO E CORRIGIDO
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let splashWindow;

// NÃO PRECISAMOS MAIS DESTE IPC PARA A LÓGICA DO XLSX
// ipcMain.handle('get-user-data-path', async () => { ... });

/**
 * Novo manipulador IPC para salvar o arquivo XLSX.
 * Ele recebe o buffer de dados do arquivo diretamente do renderer.
 */
ipcMain.handle('show-save-dialog-and-save', async (event, buffer) => {
  if (!mainWindow) {
    return { success: false, error: 'Janela principal não encontrada.' };
  }

  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Salvar arquivo XLSX',
    defaultPath: `TemplateSafeID-${Date.now()}.xlsx`,
    filters: [{ name: 'Arquivos Excel', extensions: ['xlsx'] }]
  });

  if (canceled || !filePath) {
    return { success: false, error: 'Operação de salvamento cancelada.' };
  }

  try {
    fs.writeFileSync(filePath, buffer);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Falha ao salvar o arquivo:', error);
    return { success: false, error: error.message };
  }
});

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    backgroundColor: '#060d93',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'src', 'splash.html'));

  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    transparent: false,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, 'src', 'imagem.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true, // Desabilitado por segurança, não é mais necessário
    },
    titleBarStyle: 'default',
    backgroundColor: '#f0f4f8',
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.webContents.once('did-finish-load', () => {
    console.log('Janela principal carregada - aguardando sinal do splash');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('show', () => {
    mainWindow.webContents.executeJavaScript(`
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease-in-out';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 50);
    `);
  });
}

function createWindow() {
  createSplashWindow();
  createMainWindow();
}

ipcMain.on('splash-ready', () => {
  console.log('Splash screen está pronto');
});

ipcMain.on('loading-complete', () => {
  console.log('Carregamento do splash concluído - verificando se app está pronto');
  
  const showMain = () => {
    if (splashWindow) {
      splashWindow.webContents.send('show-completed');
    }
    
    setTimeout(() => {
      if (splashWindow) splashWindow.close();
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    }, 1000);
  };

  if (mainWindow && !mainWindow.webContents.isLoading()) {
    showMain();
  } else if (mainWindow) {
    console.log('App ainda não está pronto, aguardando...');
    mainWindow.webContents.once('did-finish-load', showMain);
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Suas configurações adicionais estão ótimas
app.commandLine.appendSwitch('--disable-gpu-vsync');
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('--disable-renderer-backgrounding');

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  dialog.showErrorBox('Erro Inesperado', `Ocorreu um erro fatal: ${error.message}`);
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});