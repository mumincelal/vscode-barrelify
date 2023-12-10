import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export const createBarrelFile = async (fileNames: string[], barrelFilePath: string) => {
  try {
    const exportStatements = getExportStatements(fileNames);
    writeFile(barrelFilePath, exportStatements.join('\n'));

    vscode.window.showInformationMessage('Barrel file created successfully.');
  } catch (error) {
    console.error('Error creating barrel file:', error);
    vscode.window.showErrorMessage('Error creating barrel file. Please check the console for details.');
  }
};

export const updateBarrelFile = async (barrelFileName: string, barrelFilePath: string, fileNames: string[]) => {
  try {
    const barrelFileContent = readFile(barrelFilePath);

    const fileNamesExceptBarrelFile = fileNames.filter((fileName) => fileName !== barrelFileName);
    const exportStatements = getExportStatements(fileNamesExceptBarrelFile);
    const currentExportStatements = removeUnusedExports(barrelFileContent, exportStatements);

    const newExportStatements = exportStatements.filter(
      (exportStatement) => !barrelFileContent.includes(exportStatement)
    );

    const updatedBarrelFileContent = [...currentExportStatements, ...newExportStatements].sort().join('\n');

    if (updatedBarrelFileContent !== barrelFileContent) {
      writeFile(barrelFilePath, updatedBarrelFileContent);

      vscode.window.showInformationMessage('Barrel file updated successfully.');
    } else {
      vscode.window.showInformationMessage('Barrel file is up to date.');
    }
  } catch (error) {
    console.error('Error updating barrel file:', error);
    vscode.window.showErrorMessage('Error updating barrel file. Please check the console for details.');
  }
};

const readFile = (filePath: string) => fs.readFileSync(filePath, 'utf8').trim();
const writeFile = (filePath: string, data: string) => fs.writeFileSync(filePath, data);

const getExportStatements = (fileNames: string[]) =>
  fileNames.map((fileName) => `export * from './${fileName.replace(/\.(tsx?|jsx?)$/, '')}';`);

const removeUnusedExports = (fileContent: string, exportStatements: string[]): string[] =>
  fileContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !line.startsWith('export * from') || exportStatements.includes(line))
    .sort();

export const getFilesInFolder = (entries: [string, vscode.FileType][]) => {
  const files = entries.filter(([_, type]) => type === vscode.FileType.File);
  const fileNames = files.map(([fileName]) => fileName);

  return fileNames;
};

export const getPreferredExtension = (folderPath: string) => {
  const entries = fs.readdirSync(folderPath);
  const files = entries.filter((entry) => fs.statSync(path.join(folderPath, entry)).isFile);

  const extensions = files.map((file) => path.extname(file));

  const preferredExtension = getMostRepetitiveValue(extensions);

  return preferredExtension;
};

const getMostRepetitiveValue = (values: string[]) => {
  const frequencyMap: Record<string, number> = values.reduce(
    (acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const [mostRepetitiveValue] = Object.entries(frequencyMap).reduce(
    (max, [value, frequency]) => (frequency > max[1] ? [value, frequency] : max),
    ['', 0]
  );

  return mostRepetitiveValue;
};

export const isMultiRootWorkspace = () =>
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1;
export const isSingleRootWorkspace = () =>
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1;

export const getAllSubFolders = async (directory: string, root: string): Promise<string[]> => {
  const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(directory));

  const subFolders: string[] = [];

  for (const [file, type] of files) {
    if (type === vscode.FileType.Directory) {
      const absolutePath = path.join(directory, file);
      const relativePath = path.relative(root, absolutePath);
      const childFolders = await getAllSubFolders(absolutePath, root);

      subFolders.push(relativePath, ...childFolders);
    }
  }

  return subFolders;
};
