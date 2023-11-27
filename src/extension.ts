import * as vscode from 'vscode';
import { EXECUTE_BARREL_FILE } from './constants';
import { executeBarrelFile } from './utils';

export function activate(context: vscode.ExtensionContext) {
  console.log('"barrelify" extension is active!');

  const handleBarrelFileWithEC = vscode.commands.registerCommand(
    EXECUTE_BARREL_FILE,
    (uri: vscode.Uri) => executeBarrelFile(uri)
  );

  context.subscriptions.push(handleBarrelFileWithEC);
}

// This method is called when your extension is deactivated
export function deactivate() {}
