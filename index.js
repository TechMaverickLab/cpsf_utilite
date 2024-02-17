#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function generateStructure(dirPath, prefix = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let structure = "";

  entries.forEach((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".vscode" ||
        entry.name === ".parcel-cache" ||
        entry.name === ".dist"
      ) {
        structure += `${prefix}${entry.name}/\n`;
      } else {
        structure += `${prefix}${entry.name}/\n`;
        structure += generateStructure(entryPath, `${prefix}  `);
      }
    } else {
      const excludedFiles = ["project-structure.txt", ".DS_Store"];
      if (!excludedFiles.includes(entry.name)) {
        structure += `${prefix}${entry.name}\n`;

        const filesWithoutContent = [
          ".DS_Store",
          ".eslintrc.cjs",
          ".gitignore",
          ".prettierrc",
          "README.md",
          "vite.config.js",
          ".eslintrc.json",
          "package-lock.json",
        ];
        if (!filesWithoutContent.includes(entry.name)) {
          let fileContent = fs.readFileSync(entryPath, "utf8");

          fileContent = fileContent.replace(
            /REACT_APP_UNSPLASH_ACCESS_KEY=[^\n]+/,
            'REACT_APP_UNSPLASH_ACCESS_KEY="MY_UNSPLASH_ACCESS_KEY"',
          );
          structure +=
            fileContent
              .split("\n")
              .map((line) => `${prefix}  ${line}`)
              .join("\n") + "\n";
        }
      }
    }
  });

  return structure;
}

function createProjectStructureFile(basePath) {
  const structure = generateStructure(basePath);
  fs.writeFileSync(path.join(basePath, "project-structure.txt"), structure);
  console.log(
    "The file with the project structure was successfully created: project-structure.txt",
  );
}

function updateGitignore(basePath) {
  const gitignorePath = path.join(basePath, ".gitignore");
  let gitignoreContent = "";

  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
  }

  const filesToAdd = ["project-structure.txt"];

  filesToAdd.forEach((file) => {
    if (!gitignoreContent.includes(file)) {
      gitignoreContent += `\n${file}`;
    }
  });

  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log("The .gitignore file has been successfully updated.");
}

const basePath = ".";
createProjectStructureFile(basePath);
updateGitignore(basePath);

const projectPath = process.cwd();
const packageJsonPath = path.join(projectPath, "package.json");

if (fs.existsSync(packageJsonPath)) {
  const packageJson = require(packageJsonPath);

  if (!packageJson.type) {
    packageJson.type = "commonjs";
  }

  if (!packageJson.bin) {
    packageJson.bin = {
      "generate-structure": "./index.js",
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("The package.json file has been successfully updated.");
} else {
  console.log("The package.json file was not found in the stream project.");
}
