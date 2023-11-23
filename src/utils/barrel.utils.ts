import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function createBarrelFile() {
  vscode.window
    .showQuickPick(getFolderNames(), {
      placeHolder: 'Select a folder to create a barrel file in',
      canPickMany: false
    })
    .then((selectedFolderName) => {
      const selectedFolder = vscode.workspace.workspaceFolders?.find(
        (folder) => folder.name === selectedFolderName
      );

      if (selectedFolder) {
        const barrelFilePath = path.join(selectedFolder.uri.fsPath, 'index.ts');
        fs.writeFileSync(barrelFilePath, '');

        vscode.window.showInformationMessage(
          `Created barrel file at ${barrelFilePath}`
        );
      }
    });
}

function getFolderNames(): Thenable<string[]> {
  return new Promise((resolve, reject) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
      resolve(workspaceFolders.map((folder) => folder.name));
    } else {
      reject('No workspace folders found');
    }
  });
}
