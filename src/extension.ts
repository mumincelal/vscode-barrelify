import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createBarrelFile, getFilesInFolder, getPreferredExtension, updateBarrelFile } from './utils';

export function activate(context: vscode.ExtensionContext) {
  register(context, (uri: vscode.Uri) => executeBarrel(uri), 'executeBarrel');
  register(context, (uri: vscode.Uri) => executeStepwiseBarrel(uri), 'executeStepwiseBarrel');
  register(context, (uri: vscode.Uri) => executeWatcherBarrel(uri), 'executeWatcherBarrel');
}

const register = (
  context: vscode.ExtensionContext,
  command: (uri: vscode.Uri) => Promise<void>,
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

const executeBarrel = async (uri: vscode.Uri) => {
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

const executeStepwiseBarrel = async (_: vscode.Uri) => {};

const executeWatcherBarrel = async (_: vscode.Uri) => {};
