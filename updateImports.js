/**
 * Script para atualizar automaticamente todos os imports
 * para o novo padrão modular (usando "@/modules" e "@/shared").
 *
 * Execute com:
 *   node updateImports.js
 */

import fs from "fs";
import path from "path";

const SRC_DIR = "./src";
const MODULES = ["auth", "condominio", "financeiro", "projetos"];
const SHARED = ["shared"];

/**
 * Atualiza todos os imports dos arquivos .ts e .tsx
 */
function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let updated = content;

  // Atualizar caminhos relativos dos módulos
  for (const mod of MODULES) {
    const regex = new RegExp(`(['"\`])(?:\\.\\./)*modules/${mod}`, "g");
    updated = updated.replace(regex, `$1@/modules/${mod}`);
  }

  // Atualizar caminhos relativos de shared
  for (const sh of SHARED) {
    const regex = new RegExp(`(['"\`])(?:\\.\\./)*${sh}`, "g");
    updated = updated.replace(regex, `$1@/${sh}`);
  }

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log("✅ Atualizado:", filePath);
  }
}

/**
 * Percorre recursivamente as pastas para encontrar arquivos .ts e .tsx
 */
function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      updateImportsInFile(fullPath);
    }
  }
}

console.log("🚀 Atualizando imports no projeto...");
processDir(SRC_DIR);
console.log("✨ Atualização concluída!");