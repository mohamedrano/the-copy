import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const agentsDir = path.join(projectRoot, 'agents');

const indexContent = fs.readFileSync(path.join(agentsDir, 'index.ts'), 'utf8');
const taskInstructionsContent = fs.readFileSync(path.join(agentsDir, 'taskInstructions.ts'), 'utf8');
const agentFactoryPath = path.join(projectRoot, 'orchestration', 'agentFactory.ts');
const agentFactoryContent = fs.existsSync(agentFactoryPath) ? fs.readFileSync(agentFactoryPath, 'utf8') : '';

const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
const agentDirs = entries
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .filter(name => name !== 'shared');

const results = agentDirs.map(name => {
  const agentFile = path.join('agents', name, 'agent.ts');
  const instructionsFile = path.join('agents', name, 'instructions.ts');
  const hasAgent = fs.existsSync(path.join(projectRoot, agentFile));
  const hasInstructions = fs.existsSync(path.join(projectRoot, instructionsFile));
  const registeredInIndex = indexContent.includes(`./${name}/agent`);
  const registeredInTaskInstructions = taskInstructionsContent.includes(`./${name}/instructions`);
  const registeredInFactory = agentFactoryContent.includes(name);
  return {
    name,
    hasAgent,
    hasInstructions,
    registeredInIndex,
    registeredInTaskInstructions,
    registeredInFactory
  };
});

console.log(JSON.stringify(results, null, 2));
