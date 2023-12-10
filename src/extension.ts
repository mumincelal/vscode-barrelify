import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
  createBarrelFile,
  getAllSubFolders,
  getFilesInFolder,
  getPreferredExtension,
  isMultiRootWorkspace,
  isSingleRootWorkspace,
  updateBarrelFile
} from './utils';

export function activate(context: vscode.ExtensionContext) {
  register(context, (uri?: vscode.Uri) => executeBarrel(uri), 'executeBarrel');
  register(context, (uri?: vscode.Uri) => executeStepwiseBarrel(uri), 'executeStepwiseBarrel');
  register(context, (uri?: vscode.Uri) => executeWatcherBarrel(uri), 'executeWatcherBarrel');
}

const register = (
  context: vscode.ExtensionContext,
  command: (uri?: vscode.Uri) => Promise<void>,
  commandName: string
) => {
  const proxy = (args: never) => command(args).catch(handleError);
  const disposable = vscode.commands.registerCommand(`barrelify.${commandName}`, proxy);

  context.subscriptions.push(disposable);
};

const handleError = (error: Error) => {
  if (error?.message) {
    vscode.window.showErrorMessage(error.message);
  }

  return error;
};

const executeBarrel = async (uri?: vscode.Uri) => {
  if (uri && uri.scheme === 'file') {
    const entries = await vscode.workspace.fs.readDirectory(uri);

    const fileNames = getFilesInFolder(entries);
    const folderPath = uri.fsPath;
    const preferredExtension = getPreferredExtension(folderPath);
    const barrelFileName = `index${preferredExtension}`;
    const barrelFilePath = path.join(folderPath, barrelFileName);

    fs.existsSync(barrelFilePath)
      ? updateBarrelFile(barrelFileName, barrelFilePath, fileNames)
      : createBarrelFile(fileNames, barrelFilePath);
  }
};

const executeStepwiseBarrel = async (_?: vscode.Uri) => {
  if (isMultiRootWorkspace()) {
    const workspaceFolder = await vscode.window.showWorkspaceFolderPick();

    if (workspaceFolder) {
      const rootPath = workspaceFolder.uri.fsPath;

      const subFolders = getAllSubFolders(rootPath, rootPath).flat();

      const quickPickItems = ['/', ...subFolders].map((subFolder) => ({
        label: subFolder,
        description: path.basename(subFolder) ? '' : '- workspace root'
      }));

      try {
        const selected = await vscode.window.showQuickPick(quickPickItems, {
          placeHolder: 'Select a folder to create a barrel file in'
        });

        if (selected) {
          const folderPath = path.join(rootPath, selected.label);
          const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(folderPath));

          const fileNames = getFilesInFolder(entries);
          const preferredExtension = getPreferredExtension(folderPath);
          const barrelFileName = `index${preferredExtension}`;
          const barrelFilePath = path.join(folderPath, barrelFileName);

          fs.existsSync(barrelFilePath)
            ? updateBarrelFile(barrelFileName, barrelFilePath, fileNames)
            : createBarrelFile(fileNames, barrelFilePath);
        }
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    }
  } else if (isSingleRootWorkspace()) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (workspaceFolder) {
      const rootPath = workspaceFolder.uri.fsPath;

      const subFolders = getAllSubFolders(rootPath, rootPath).flat();

      const quickPickItems = ['/', ...subFolders].map((subFolder) => ({
        label: subFolder,
        description: path.basename(subFolder) ? '' : '- workspace root'
      }));

      try {
        const selected = await vscode.window.showQuickPick(quickPickItems, {
          placeHolder: 'Select a folder to create a barrel file in'
        });

        if (selected) {
          const folderPath = path.join(rootPath, selected.label);
          const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(folderPath));

          const fileNames = getFilesInFolder(entries);
          const preferredExtension = getPreferredExtension(folderPath);
          const barrelFileName = `index${preferredExtension}`;
          const barrelFilePath = path.join(folderPath, barrelFileName);

          fs.existsSync(barrelFilePath)
            ? updateBarrelFile(barrelFileName, barrelFilePath, fileNames)
            : createBarrelFile(fileNames, barrelFilePath);
        }
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    }
  }
};

const executeWatcherBarrel = async (_?: vscode.Uri) => {};
