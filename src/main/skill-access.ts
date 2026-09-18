import type { Root } from '../shared/types.js';
import { getConfig } from './config.js';
import { isContained, uniqueRootName } from './sandbox.js';
import { skillsDirectory } from './skills.js';

/** Only the initialized canonical library is a managed root, never its userData parent. */
export function withManagedSkills<T extends { roots: Root[] }>(context: T): T {
  const directory = skillsDirectory();
  const roots = context.roots.filter(root => root.name.toLowerCase() !== 'skills');
  if (directory) roots.push({ name: 'skills', path: directory });
  for (const configured of getConfig().externalSkillsRoots) {
    roots.push({ name: uniqueRootName(configured, roots), path: configured });
  }
  return { ...context, roots };
}

export function isSkillPath(real: string): boolean {
  const directory = skillsDirectory();
  if (directory && isContained(directory, real)) return true;
  return getConfig().externalSkillsRoots.some(root => isContained(root, real));
}

/** The library is reachable explicitly; it can never choose where a task starts. */
export function firstTaskRoot(roots: readonly Root[]): Root | undefined {
  return roots.find(root => root.name.toLowerCase() !== 'skills' && !isSkillPath(root.path));
}
