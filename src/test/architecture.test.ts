import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const root = path.resolve('src');
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(file)
      : /\.(ts|tsx)$/.test(file) && !/\.(test|d)\.tsx?$/.test(file)
        ? [file]
        : [];
  });
}
const files = sourceFiles(root);
const fileSet = new Set(files);
const edges = new Map<string, string[]>();
const imports = new Map<string, string[]>();
for (const file of files) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const runtime: string[] = [];
  const all: string[] = [];
  const references: { specifier: string; clause?: ts.ImportClause }[] = [];
  function collect(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      references.push({ specifier: node.moduleSpecifier.text, clause: node.importClause });
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      references.push({ specifier: node.arguments[0].text });
    }
    ts.forEachChild(node, collect);
  }
  collect(source);
  for (const { specifier, clause } of references) {
    const base = specifier.startsWith('@/')
      ? path.join(root, specifier.slice(2))
      : specifier.startsWith('.')
        ? path.resolve(path.dirname(file), specifier)
        : null;
    if (!base) continue;
    const target = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fileSet.has(candidate));
    if (!target) continue;
    all.push(target);
    const bindings = clause?.namedBindings;
    const onlyTypes =
      clause?.isTypeOnly ||
      (!!bindings &&
        ts.isNamedImports(bindings) &&
        !clause?.name &&
        bindings.elements.every((element) => element.isTypeOnly));
    if (!onlyTypes) runtime.push(target);
  }
  imports.set(file, all);
  edges.set(file, runtime);
}
const relative = (file: string) => path.relative(root, file);

describe('frontend dependency boundaries', () => {
  it('keeps shared code independent of app, features, and demo fixtures', () => {
    const violations = [...imports].flatMap(([file, targets]) =>
      relative(file).startsWith('shared/')
        ? targets
            .filter((target) => !relative(target).startsWith('shared/'))
            .map((target) => `${relative(file)} -> ${relative(target)}`)
        : [],
    );
    expect(violations).toEqual([]);
  });
  it('keeps feature code independent of app composition and demo implementations', () => {
    const violations = [...imports].flatMap(([file, targets]) =>
      relative(file).startsWith('features/')
        ? targets
            .filter((target) => /^(app|mocks|test)\//.test(relative(target)))
            .map((target) => `${relative(file)} -> ${relative(target)}`)
        : [],
    );
    expect(violations).toEqual([]);
  });
  it('has no circular runtime imports', () => {
    const visited = new Set<string>();
    const stack: string[] = [];
    const cycles: string[] = [];
    function visit(file: string) {
      if (stack.includes(file)) {
        cycles.push([...stack.slice(stack.indexOf(file)), file].map(relative).join(' -> '));
        return;
      }
      if (visited.has(file)) return;
      visited.add(file);
      stack.push(file);
      for (const target of edges.get(file) ?? []) visit(target);
      stack.pop();
    }
    for (const file of files) visit(file);
    expect(cycles).toEqual([]);
  });
});
