import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const analysisDir = path.join(projectRoot, 'analysis');
const outputDir = path.join(projectRoot, 'docs');
const dateFolder = fs.readdirSync(outputDir).filter(name => name.startsWith('analysis-')).sort().pop();
const reportDir = path.join(outputDir, dateFolder);

const agentsStatus = JSON.parse(fs.readFileSync(path.join(analysisDir, 'agents-status.json'), 'utf8'));
const indexLines = fs.readFileSync(path.join(projectRoot, 'agents', 'index.ts'), 'utf8').split(/\r?\n/);
const taskInstructionsLines = fs.readFileSync(path.join(projectRoot, 'agents', 'taskInstructions.ts'), 'utf8').split(/\r?\n/);
const layerAnalysis = JSON.parse(fs.readFileSync(path.join(analysisDir, 'layer-analysis.json'), 'utf8'));

const tscErrors = [
  `services/fileReaderService.ts(2,10): error TS2305: Module '"@core/types"' has no exported member 'ProcessedFile'.`,
  `services/geminiService.ts(19,84): error TS2305: Module '"@core/types"' has no exported member 'ProcessedFile'.`,
  `ui/App.tsx(7,3): error TS2305: Module '"@core/types"' has no exported member 'ProcessedFile'.`
];

const viteBuildErrors = [];

const formatPath = (rel) => path.join(projectRoot, rel).replace(/\\/g, '\\\\');

const findLineNumber = (lines, search) => {
  const idx = lines.findIndex(line => line.includes(search));
  return idx === -1 ? null : idx + 1;
};

const agents = agentsStatus.map(agent => {
  const name = agent.name;
  const agentRel = `agents/${name}/agent.ts`;
  const instructionsRel = `agents/${name}/instructions.ts`;
  const agentLines = fs.readFileSync(path.join(projectRoot, agentRel), 'utf8').split(/\r?\n/);
  const exportLineIdx = agentLines.findIndex(line => line.includes('export const'));
  const exportLine = exportLineIdx === -1 ? null : exportLineIdx + 1;
  const indexLine = findLineNumber(indexLines, `./${name}/agent`);
  const instructionsLine = findLineNumber(taskInstructionsLines, `./${name}/instructions`);

  const status = agent.hasAgent && agent.hasInstructions && agent.registeredInIndex && agent.registeredInTaskInstructions ? 'active' : 'inactive';

  const evidence = [];
  if (exportLine) {
    evidence.push(`${formatPath(agentRel)}:${exportLine}: defines ${name} agent config`);
  }
  if (indexLine) {
    evidence.push(`${formatPath('agents/index.ts')}:${indexLine}: included in AGENT_CONFIGS array`);
  }
  if (instructionsLine) {
    evidence.push(`${formatPath('agents/taskInstructions.ts')}:${instructionsLine}: task instructions registered`);
  }
  evidence.push(`${formatPath('services/fileReaderService.ts')}:2: missing ProcessedFile export blocks compilation`);

  return {
    name,
    files: {
      agent: `${formatPath(agentRel)}`,
      instructions: `${formatPath(instructionsRel)}`
    },
    registeredIn: {
      agents_index: !!agent.registeredInIndex,
      taskInstructions: !!agent.registeredInTaskInstructions,
      agentFactory: false
    },
    typeSafety: {
      any_in_public_api: 1,
      notes: [
        `${formatPath('core/types.ts')}:89: placeholder exports default to any for advanced result types`
      ]
    },
    status,
    prod_ready: 'no',
    evidence
  };
});

const services = {
  geminiService: {
    file: `${formatPath('services/geminiService.ts')}`,
    network_error_handling: true,
    typed_requests: false,
    typed_responses: true,
    ui_leak: false,
    prod_ready: 'no',
    evidence: [
      `${formatPath('services/geminiService.ts')}:27: imports agent instructions from services layer`,
      `${formatPath('services/geminiService.ts')}:32: ProcessedFile typing missing from @core/types`
    ]
  },
  fileReaderService: {
    file: `${formatPath('services/fileReaderService.ts')}`,
    path_safety: true,
    prod_ready: 'no',
    evidence: [
      `${formatPath('services/fileReaderService.ts')}:2: depends on missing ProcessedFile export`
    ]
  }
};

const activationMatrix = {
  project: 'Drama-analyst-and-creative-mimic',
  compilation: { tsc_noEmit: 'fail', errors: tscErrors },
  build: { vite_build: viteBuildErrors.length === 0 ? 'pass' : 'fail', errors: viteBuildErrors },
  agents,
  services,
  layer_boundaries: {
    violations: layerAnalysis.violations
  }
};

fs.writeFileSync(path.join(reportDir, 'activation_matrix.json'), JSON.stringify(activationMatrix, null, 2), 'utf8');
