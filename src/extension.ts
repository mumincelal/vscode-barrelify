import * as vscode from 'vscode';
import { WATCH_BARREL_FILE_WITH_EXPLORER_CONTEXT } from './constants';
import { watchBarrelFile } from './utils';

export function activate(context: vscode.ExtensionContext) {
  console.log('"barrelify" extension is active!');

  const watchBarrelFileWithExplorerContext = vscode.commands.registerCommand(
    WATCH_BARREL_FILE_WITH_EXPLORER_CONTEXT,
    (uri: vscode.Uri) => watchBarrelFile(uri)
  );

  context.subscriptions.push(watchBarrelFileWithExplorerContext);
}

// This method is called when your extension is deactivated
export function deactivate() {}
