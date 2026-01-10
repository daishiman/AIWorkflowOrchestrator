#!/usr/bin/env node

/**
 * GitHub Actions Workflow Dependency Visualizer
 *
 * Analyzes GitHub Actions workflow files and generates a Mermaid diagram
 * showing job dependencies.
 *
 * Usage:
 *   node visualize-deps.mjs <workflow-file.yml>
 *
 * Example:
 *   node visualize-deps.mjs .github/workflows/ci.yml
 *
 * Output:
 *   - Mermaid flowchart showing job dependencies
 *   - Job execution order analysis
 *   - Critical path identification
 */

import { readFileSync } from "fs";
import { parse } from "yaml";
import { resolve } from "path";

/**
 * Parse workflow file and extract job dependencies
 */
function parseWorkflow(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    const workflow = parse(content);

    if (!workflow.jobs) {
      throw new Error("No jobs found in workflow file");
    }

    return workflow;
  } catch (error) {
    console.error(`Error reading workflow file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Build dependency graph from jobs
 */
function buildDependencyGraph(jobs) {
  const graph = new Map();

  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    const dependencies = jobConfig.needs || [];
    const deps = Array.isArray(dependencies) ? dependencies : [dependencies];

    graph.set(jobName, {
      dependencies: deps,
      condition: jobConfig.if || null,
      runsOn: jobConfig["runs-on"] || "ubuntu-latest",
    });
  }

  return graph;
}

/**
 * Perform topological sort to find execution order
 */
function topologicalSort(graph) {
  const visited = new Set();
  const temp = new Set();
  const order = [];

  function visit(node) {
    if (temp.has(node)) {
      throw new Error(`Circular dependency detected involving: ${node}`);
    }
    if (visited.has(node)) {
      return;
    }

    temp.add(node);

    const nodeData = graph.get(node);
    if (nodeData) {
      for (const dep of nodeData.dependencies) {
        if (graph.has(dep)) {
          visit(dep);
        }
      }
    }

    temp.delete(node);
    visited.add(node);
    order.push(node);
  }

  try {
    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        visit(node);
      }
    }
    return order;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

/**
 * Calculate execution levels (stages)
 */
function calculateLevels(graph) {
  const levels = new Map();

  function getLevel(job) {
    if (levels.has(job)) {
      return levels.get(job);
    }

    const deps = graph.get(job)?.dependencies || [];
    if (deps.length === 0) {
      levels.set(job, 0);
      return 0;
    }

    const maxDepLevel = Math.max(...deps.map((dep) => getLevel(dep)));
    const level = maxDepLevel + 1;
    levels.set(job, level);
    return level;
  }

  for (const job of graph.keys()) {
    getLevel(job);
  }

  return levels;
}

/**
 * Find critical path (longest path through the graph)
 */
function findCriticalPath(graph, levels) {
  const maxLevel = Math.max(...levels.values());
  const path = [];

  // Find jobs at each level that are part of the critical path
  for (let level = maxLevel; level >= 0; level--) {
    const jobsAtLevel = Array.from(levels.entries())
      .filter(([_, l]) => l === level)
      .map(([job]) => job);

    if (jobsAtLevel.length > 0) {
      // Pick the first job at this level (in real scenarios, you might want to consider execution time)
      path.unshift(jobsAtLevel[0]);
    }
  }

  return path;
}

/**
 * Generate Mermaid flowchart
 */
function generateMermaidDiagram(graph, levels) {
  const lines = ["```mermaid", "flowchart TD"];

  // Add job nodes
  for (const [job, data] of graph.entries()) {
    const level = levels.get(job);
    const condition = data.condition
      ? `<br/><small>if: ${data.condition}</small>`
      : "";
    lines.push(`    ${job}["${job}<br/>Level: ${level}${condition}"]`);
  }

  // Add dependencies
  for (const [job, data] of graph.entries()) {
    for (const dep of data.dependencies) {
      if (graph.has(dep)) {
        lines.push(`    ${dep} --> ${job}`);
      }
    }
  }

  // Style nodes by level
  const maxLevel = Math.max(...levels.values());
  for (let level = 0; level <= maxLevel; level++) {
    const jobsAtLevel = Array.from(levels.entries())
      .filter(([_, l]) => l === level)
      .map(([job]) => job);

    if (jobsAtLevel.length > 0) {
      const color = getColorForLevel(level, maxLevel);
      lines.push(`    style ${jobsAtLevel.join(",")} fill:${color}`);
    }
  }

  lines.push("```");
  return lines.join("\n");
}

/**
 * Get color for level (gradient from green to red)
 */
function getColorForLevel(level, maxLevel) {
  if (maxLevel === 0) return "#90EE90";

  const ratio = level / maxLevel;
  const r = Math.round(144 + (255 - 144) * ratio);
  const g = Math.round(238 - (238 - 140) * ratio);
  const b = Math.round(144 - 144 * ratio);

  return `rgb(${r},${g},${b})`;
}

/**
 * Generate analysis report
 */
function generateAnalysisReport(graph, levels, criticalPath) {
  const lines = ["# Workflow Analysis Report\n"];

  // Summary
  lines.push("## Summary");
  lines.push(`- Total jobs: ${graph.size}`);
  lines.push(`- Execution levels: ${Math.max(...levels.values()) + 1}`);
  lines.push(`- Critical path length: ${criticalPath.length}`);
  lines.push("");

  // Jobs by level
  lines.push("## Jobs by Execution Level\n");
  const maxLevel = Math.max(...levels.values());
  for (let level = 0; level <= maxLevel; level++) {
    const jobsAtLevel = Array.from(levels.entries())
      .filter(([_, l]) => l === level)
      .map(([job]) => job);

    lines.push(
      `**Level ${level}** (${jobsAtLevel.length} job${jobsAtLevel.length !== 1 ? "s" : ""}):`,
    );
    for (const job of jobsAtLevel) {
      const deps = graph.get(job)?.dependencies || [];
      const depsStr =
        deps.length > 0
          ? ` (depends on: ${deps.join(", ")})`
          : " (no dependencies)";
      lines.push(`  - ${job}${depsStr}`);
    }
    lines.push("");
  }

  // Critical path
  lines.push("## Critical Path\n");
  lines.push("The longest execution path through the workflow:\n");
  lines.push(criticalPath.map((job, idx) => `${idx + 1}. ${job}`).join("\n"));
  lines.push("");

  // Parallelization opportunities
  lines.push("## Parallelization Analysis\n");
  for (let level = 0; level <= maxLevel; level++) {
    const jobsAtLevel = Array.from(levels.entries())
      .filter(([_, l]) => l === level)
      .map(([job]) => job);

    if (jobsAtLevel.length > 1) {
      lines.push(
        `**Level ${level}**: ${jobsAtLevel.length} jobs run in parallel`,
      );
      lines.push(`  - ${jobsAtLevel.join(", ")}`);
    }
  }
  lines.push("");

  // Recommendations
  lines.push("## Recommendations\n");

  // Check for sequential jobs that could be parallelized
  const sequentialJobs = Array.from(levels.entries()).filter(([job, level]) => {
    const deps = graph.get(job)?.dependencies || [];
    return deps.length === 1 && level > 0;
  });

  if (sequentialJobs.length > 0) {
    lines.push("### Potential Parallelization Opportunities\n");
    lines.push(
      "These jobs have only one dependency and might be parallelizable:\n",
    );
    for (const [job, _] of sequentialJobs) {
      const dep = graph.get(job)?.dependencies[0];
      lines.push(
        `- Consider if \`${job}\` can run in parallel with other jobs after \`${dep}\``,
      );
    }
    lines.push("");
  }

  // Check for jobs with many dependencies
  const complexJobs = Array.from(graph.entries()).filter(
    ([_, data]) => data.dependencies.length > 2,
  );

  if (complexJobs.length > 0) {
    lines.push("### Complex Dependencies\n");
    lines.push(
      "These jobs have multiple dependencies and might benefit from review:\n",
    );
    for (const [job, data] of complexJobs) {
      lines.push(`- \`${job}\` depends on: ${data.dependencies.join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node visualize-deps.mjs <workflow-file.yml>");
    console.error("Example: node visualize-deps.mjs .github/workflows/ci.yml");
    process.exit(1);
  }

  const workflowPath = resolve(args[0]);

  console.log(`Analyzing workflow: ${workflowPath}\n`);

  // Parse workflow
  const workflow = parseWorkflow(workflowPath);
  console.log(`Workflow name: ${workflow.name || "Unnamed"}\n`);

  // Build dependency graph
  const graph = buildDependencyGraph(workflow.jobs);

  // Check for circular dependencies
  const order = topologicalSort(graph);
  if (!order) {
    process.exit(1);
  }

  // Calculate levels
  const levels = calculateLevels(graph);

  // Find critical path
  const criticalPath = findCriticalPath(graph, levels);

  // Generate Mermaid diagram
  console.log("## Dependency Graph\n");
  console.log(generateMermaidDiagram(graph, levels));
  console.log("\n");

  // Generate analysis report
  console.log(generateAnalysisReport(graph, levels, criticalPath));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  parseWorkflow,
  buildDependencyGraph,
  topologicalSort,
  calculateLevels,
  generateMermaidDiagram,
};
