/**
 * Integrated validation script for fixture-complete-skill
 */
import { EXIT_CODES, getArg } from "./utils.js";
import * as fs from "fs";
import * as path from "path";

const target = getArg("--target") || ".";

try {
  const skillMd = path.join(target, "SKILL.md");
  if (!fs.existsSync(skillMd)) {
    console.log(
      JSON.stringify({ valid: false, errors: ["SKILL.md not found"] }),
    );
    process.exit(EXIT_CODES.FILE_NOT_FOUND);
  }
  console.log(JSON.stringify({ valid: true, errors: [] }));
  process.exit(EXIT_CODES.SUCCESS);
} catch (err) {
  console.log(JSON.stringify({ valid: false, errors: [err.message] }));
  process.exit(EXIT_CODES.ERROR);
}
