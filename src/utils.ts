import * as vscode from 'vscode';
import * as fs from 'fs';

export const watchBarrelFile = async (uri: vscode.Uri) => {
  if (uri && uri.scheme === 'file') {
    const fileNames = await listFiles(uri);
    const folderPath = uri.fsPath;
    const preferredExtension = getPreferredExtension(folderPath);

    if (preferredExtension) {
      const barrelFilePath = `${folderPath}/index.${preferredExtension}`;

      try {
        if (!fs.existsSync(barrelFilePath)) {
          const exportStatements = fileNames.map(
            (fileName) =>
              `export * from './${fileName.replace(/\.(tsx?|jsx?)$/, '')}';`
          );

          fs.writeFileSync(barrelFilePath, exportStatements.join('\n'));

          vscode.window.showInformationMessage(
            `Barrel file (${barrelFilePath}) created successfully.`
          );
        } else {
          updateBarrelFile(uri);
        }
      } catch (error) {
        console.error('Error creating barrel file:', error);
        vscode.window.showErrorMessage(
          'Error creating barrel file. Please check the console for details.'
        );
      }
    } else {
      vscode.window.showInformationMessage(
        'Error creating barrel file. No supported file extensions found.'
      );
    }
  }
};

export const updateBarrelFile = async (uri: vscode.Uri) => {
  if (uri && uri.scheme === 'file') {
    const allFileNames = await listFiles(uri);
    const folderPath = uri.fsPath;
    const preferredExtension = getPreferredExtension(folderPath);

    if (preferredExtension) {
      const barrelFilePath = `${folderPath}/index.${preferredExtension}`;

      try {
        const existingBarrelFileContent = fs
          .readFileSync(barrelFilePath, 'utf8')
          .trim();
        let updatedBarrelFileContent = existingBarrelFileContent;

        const fileNames = allFileNames.filter(
          (fileName) => fileName !== 'index.ts' && fileName !== 'index.js'
        );

        const exportStatements = fileNames.map(
          (fileName) =>
            `export * from './${fileName.replace(/\.(tsx?|jsx?)$/, '')}';`
        );

        const missingExports = exportStatements.filter((exportStatement) => {
          return !existingBarrelFileContent.includes(exportStatement);
        });

        const deletedExports = existingBarrelFileContent
          .split('\n')
          .map((line) => line.trim())
          .filter(
            (line) =>
              line.startsWith('export * from') &&
              !exportStatements.includes(line)
          );

        if (deletedExports.length) {
          updatedBarrelFileContent = existingBarrelFileContent
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => !deletedExports.includes(line))
            .join('\n');
        }

        if (missingExports.length) {
          const combinedExports = [
            ...updatedBarrelFileContent.split('\n'),
            ...missingExports
          ].sort();

          updatedBarrelFileContent = combinedExports.join('\n');
        }

        if (
          updatedBarrelFileContent &&
          updatedBarrelFileContent !== existingBarrelFileContent
        ) {
          fs.writeFileSync(barrelFilePath, updatedBarrelFileContent);

          vscode.window.showInformationMessage(
            `Barrel file (${barrelFilePath}) updated successfully.`
          );
        } else {
          vscode.window.showInformationMessage(
            `Barrel file (${barrelFilePath}) is up to date.`
          );
        }
      } catch (error) {
        console.error('Error updating barrel file:', error);
        vscode.window.showErrorMessage(
          'Error updating barrel file. Please check the console for details.'
        );
      }
    } else {
      vscode.window.showInformationMessage(
        'Error updating barrel file. No supported file extensions found.'
      );
    }
  }
};

const listFiles = async (uri: vscode.Uri) => {
  try {
    const entries = await vscode.workspace.fs.readDirectory(uri);

    const files = entries.filter(([_, type]) => type === vscode.FileType.File);

    const fileNames = files.map(([fileName]) => fileName);

    return fileNames;
  } catch (error) {
    return [];
  }
};

const getPreferredExtension = (folderPath: string) => {
  const extensions = getFileExtensionsInFolder(folderPath);

  const preferredExtension =
    extensions.includes('ts') || extensions.includes('tsx')
      ? 'ts'
      : extensions.includes('jsx') || extensions.includes('js')
        ? 'js'
        : undefined;

  return preferredExtension;
};

const getFileExtensionsInFolder = (folderPath: string) => {
  const entries = fs.readdirSync(folderPath);

  const extensions = entries
    .filter((entry) => fs.statSync(`${folderPath}/${entry}`).isFile)
    .map((entry) => entry.split('.').pop() || '')
    .filter(Boolean);

  return [...new Set(extensions)];
};
