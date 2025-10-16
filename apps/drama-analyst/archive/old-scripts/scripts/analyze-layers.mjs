import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const graphPath = path.join(projectRoot, 'analysis', 'dependency-graph.json');
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

const layerByPath = new Map(graph.nodes.map(node => [node.path, node.layer]));

const violations = [];

const recordViolation = (edge, severity, explanation) => {
  violations.push({
    from: edge.from,
    to: edge.to,
    fromLayer: layerByPath.get(edge.from) || 'other',
    toLayer: layerByPath.get(edge.to) || 'other',
    severity,
    explanation,
    specifier: edge.specifier
  });
};

for (const edge of graph.edges) {
  const fromLayer = layerByPath.get(edge.from) || 'other';
  const toLayer = layerByPath.get(edge.to) || 'other';
  if (fromLayer === 'ui' && toLayer === 'services') {
    recordViolation(edge, 'high', 'UI importing service directly instead of going through orchestration');
  }
  if (fromLayer === 'services' && toLayer === 'agents') {
    recordViolation(edge, 'medium', 'Service layer depends on agent layer, creating tight coupling');
  }
}

const allowedZeroIncoming = new Set([
  'ui/main.tsx',
  'ui/index.tsx',
  'vite.config.ts',
  'types.d.ts'
]);

const unreferenced = Object.entries(graph.incomingEdges)
  .filter(([filePath, count]) => count === 0 && !allowedZeroIncoming.has(filePath))
  .map(([filePath]) => ({ path: filePath }));

const summary = {
  violationCount: violations.length,
  unreferencedCount: unreferenced.length
};

const result = { summary, violations, unreferenced };

fs.writeFileSync(path.join(projectRoot, 'analysis', 'layer-analysis.json'), JSON.stringify(result, null, 2), 'utf8');
