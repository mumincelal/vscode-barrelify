import * as vscode from 'vscode';
import { createBarrelFile } from './utils';
import { CREATE_BARREL_FILE_COMMAND } from './constants';

export function activate(context: vscode.ExtensionContext) {
  console.log('"barrelify" extension is active!');

  const disposable = vscode.commands.registerCommand(
    CREATE_BARREL_FILE_COMMAND,
    () => createBarrelFile()
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
