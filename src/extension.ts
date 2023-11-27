import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EXECUTE_BARREL_FILE } from './constants';
import {
  createBarrelFile,
  getFilesInFolder,
  getPreferredExtension,
  updateBarrelFile
} from './utils';

export function activate(context: vscode.ExtensionContext) {
  console.log('"barrelify" extension is active!');

  const executeBarrelFileDisposable = vscode.commands.registerCommand(
    EXECUTE_BARREL_FILE,
    (uri: vscode.Uri) => executeBarrelFile(uri)
  );

  context.subscriptions.push(executeBarrelFileDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

export const executeBarrelFile = async (uri: vscode.Uri) => {
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
