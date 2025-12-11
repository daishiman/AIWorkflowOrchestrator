#!/usr/bin/env node

/**
 * Composite Action Validator
 *
 * Validates composite action.yml files for:
 * - Required fields (name, description, runs)
 * - Composite-specific requirements (using: 'composite', shell in run steps)
 * - Best practices (inputs with defaults, outputs with descriptions)
 * - Common mistakes (missing shell, invalid step syntax)
 *
 * Usage:
 *   node validate-action.mjs <path-to-action.yml>
 *   node validate-action.mjs .github/actions/my-action/action.yml
 */

import { readFileSync } from "fs";
import { parse } from "yaml";
import { basename, dirname } from "path";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  addError(message, context = "") {
    this.errors.push({ message, context });
  }

  addWarning(message, context = "") {
    this.warnings.push({ message, context });
  }

  addInfo(message, context = "") {
    this.info.push({ message, context });
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  print() {
    if (this.errors.length > 0) {
      console.log(colorize("\n❌ Errors:", "red"));
      this.errors.forEach(({ message, context }) => {
        console.log(colorize(`  • ${message}`, "red"));
        if (context) {
          console.log(colorize(`    ${context}`, "gray"));
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log(colorize("\n⚠️  Warnings:", "yellow"));
      this.warnings.forEach(({ message, context }) => {
        console.log(colorize(`  • ${message}`, "yellow"));
        if (context) {
          console.log(colorize(`    ${context}`, "gray"));
        }
      });
    }

    if (this.info.length > 0) {
      console.log(colorize("\n💡 Suggestions:", "blue"));
      this.info.forEach(({ message, context }) => {
        console.log(colorize(`  • ${message}`, "blue"));
        if (context) {
          console.log(colorize(`    ${context}`, "gray"));
        }
      });
    }

    if (
      !this.hasErrors() &&
      this.warnings.length === 0 &&
      this.info.length === 0
    ) {
      console.log(
        colorize("\n✅ Validation passed! No issues found.", "green"),
      );
    }
  }
}

function validateCompositeAction(actionPath) {
  const result = new ValidationResult();

  // Read and parse YAML
  let action;
  try {
    const content = readFileSync(actionPath, "utf-8");
    action = parse(content);
  } catch (error) {
    result.addError("Failed to read or parse action.yml", error.message);
    return result;
  }

  // Validate required top-level fields
  if (!action.name) {
    result.addError("Missing required field: name");
  } else {
    result.addInfo(`Action name: "${action.name}"`);
  }

  if (!action.description) {
    result.addError("Missing required field: description");
  } else if (action.description.length < 10) {
    result.addWarning(
      "Description is very short",
      "Consider providing a more detailed description",
    );
  }

  // Validate runs section
  if (!action.runs) {
    result.addError("Missing required field: runs");
    return result;
  }

  if (action.runs.using !== "composite") {
    result.addError(
      `Invalid runs.using: "${action.runs.using}"`,
      'Composite actions must use "composite"',
    );
  }

  if (!action.runs.steps || !Array.isArray(action.runs.steps)) {
    result.addError("Missing or invalid runs.steps", "steps must be an array");
    return result;
  }

  if (action.runs.steps.length === 0) {
    result.addWarning("No steps defined", "Composite action has no steps");
  }

  // Validate steps
  action.runs.steps.forEach((step, index) => {
    const stepContext = `Step ${index + 1}${step.name ? ` (${step.name})` : ""}`;

    // Check for either 'uses' or 'run'
    if (!step.uses && !step.run) {
      result.addError(`${stepContext}: Must have either 'uses' or 'run'`);
    }

    // If 'run' is used, 'shell' is required
    if (step.run && !step.shell) {
      result.addError(
        `${stepContext}: Missing required 'shell' property`,
        "All run steps in composite actions must specify a shell",
      );
    }

    // Validate shell values
    if (step.shell) {
      const validShells = ["bash", "pwsh", "python", "sh", "cmd", "powershell"];
      if (!validShells.includes(step.shell)) {
        result.addWarning(
          `${stepContext}: Unusual shell "${step.shell}"`,
          `Common shells: ${validShells.join(", ")}`,
        );
      }
    }

    // Check for step id
    if (!step.id && step.run) {
      result.addInfo(
        `${stepContext}: Consider adding an 'id'`,
        "IDs are useful for referencing step outputs",
      );
    }

    // Check for name
    if (!step.name) {
      result.addWarning(
        `Step ${index + 1}: Missing 'name'`,
        "Names improve workflow readability",
      );
    }

    // Validate conditional execution
    if (step.if) {
      if (typeof step.if !== "string") {
        result.addError(`${stepContext}: 'if' must be a string expression`);
      }
    }
  });

  // Validate inputs
  if (action.inputs) {
    Object.entries(action.inputs).forEach(([name, input]) => {
      const inputContext = `Input "${name}"`;

      if (!input.description) {
        result.addWarning(`${inputContext}: Missing description`);
      }

      if (input.required === undefined && input.default === undefined) {
        result.addInfo(
          `${inputContext}: Neither required nor default specified`,
          "Consider adding a default value or marking as required",
        );
      }

      if (input.deprecationMessage) {
        result.addInfo(
          `${inputContext}: Marked as deprecated`,
          input.deprecationMessage,
        );
      }
    });
  } else {
    result.addInfo(
      "No inputs defined",
      "Consider if your action needs configurable inputs",
    );
  }

  // Validate outputs
  if (action.outputs) {
    Object.entries(action.outputs).forEach(([name, output]) => {
      const outputContext = `Output "${name}"`;

      if (!output.description) {
        result.addWarning(`${outputContext}: Missing description`);
      }

      if (!output.value) {
        result.addError(`${outputContext}: Missing value`);
      } else if (typeof output.value !== "string") {
        result.addError(`${outputContext}: value must be a string expression`);
      } else if (!output.value.includes("steps.")) {
        result.addWarning(
          `${outputContext}: value doesn't reference a step output`,
          "Outputs typically reference step outputs like ${{ steps.step-id.outputs.name }}",
        );
      }
    });
  } else {
    result.addInfo(
      "No outputs defined",
      "Consider if your action should provide outputs",
    );
  }

  // Validate branding (optional but useful for marketplace)
  if (action.branding) {
    if (!action.branding.icon) {
      result.addWarning("Branding defined but missing icon");
    }
    if (!action.branding.color) {
      result.addWarning("Branding defined but missing color");
    }
  } else {
    result.addInfo(
      "No branding defined",
      "Add branding for better GitHub Marketplace appearance",
    );
  }

  // Best practices checks
  const hasValidation = action.runs.steps.some(
    (step) => step.name && step.name.toLowerCase().includes("validat"),
  );
  if (!hasValidation) {
    result.addInfo(
      "No validation step found",
      "Consider adding input validation for better error messages",
    );
  }

  const hasCleanup = action.runs.steps.some(
    (step) =>
      step.if &&
      (step.if.includes("always()") || step.if.includes("failure()")),
  );
  if (!hasCleanup && action.runs.steps.length > 3) {
    result.addInfo(
      "No cleanup steps found",
      "Consider adding cleanup steps with if: always() for complex actions",
    );
  }

  return result;
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      colorize("Usage: node validate-action.mjs <path-to-action.yml>", "red"),
    );
    console.error(
      colorize(
        "Example: node validate-action.mjs .github/actions/my-action/action.yml",
        "gray",
      ),
    );
    process.exit(1);
  }

  const actionPath = args[0];

  console.log(colorize("\n🔍 Validating Composite Action", "blue"));
  console.log(colorize(`📄 File: ${actionPath}\n`, "gray"));

  const result = validateCompositeAction(actionPath);
  result.print();

  if (result.hasErrors()) {
    console.log(colorize("\n❌ Validation failed\n", "red"));
    process.exit(1);
  } else {
    console.log(colorize("\n✅ Validation successful\n", "green"));
    process.exit(0);
  }
}

main();
