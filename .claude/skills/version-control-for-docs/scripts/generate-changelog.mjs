#!/usr/bin/env node
/**
 * Changelog生成スクリプト
 *
 * 使用方法: node generate-changelog.mjs [options]
 *
 * オプション:
 *   --since <tag|date>  指定以降のコミットを対象
 *   --output <file>     出力ファイル（デフォルト: stdout）
 *   --append            既存ファイルに追記
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";

const CATEGORIES = {
  docs: { section: "Added", order: 1 },
  update: { section: "Changed", order: 2 },
  fix: { section: "Fixed", order: 3 },
  remove: { section: "Removed", order: 4 },
  refactor: { section: "Changed", order: 2 },
  translate: { section: "Added", order: 1 },
  style: { section: "Changed", order: 2, hidden: true },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    since: null,
    output: null,
    append: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--since" && args[i + 1]) {
      options.since = args[++i];
    } else if (args[i] === "--output" && args[i + 1]) {
      options.output = args[++i];
    } else if (args[i] === "--append") {
      options.append = true;
    }
  }

  return options;
}

function getCommits(since) {
  let cmd = 'git log --pretty=format:"%s|%h|%an|%ad" --date=short';

  if (since) {
    cmd += ` --since="${since}"`;
  } else {
    // 最後のタグから
    try {
      const lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null", {
        encoding: "utf-8",
      }).trim();
      cmd += ` ${lastTag}..HEAD`;
    } catch {
      // タグがない場合は直近30日
      cmd += ' --since="30 days ago"';
    }
  }

  try {
    const output = execSync(cmd, { encoding: "utf-8" });
    return output.split("\n").filter((line) => line.trim());
  } catch {
    return [];
  }
}

function parseCommit(commitLine) {
  const [message, hash, author, date] = commitLine.split("|");

  // コミットメッセージをパース: type(scope): description
  const match = message.match(
    /^(docs|update|fix|remove|refactor|translate|style)\(([^)]+)\):\s*(.+)/i,
  );

  if (!match) return null;

  const [, type, scope, description] = match;
  const category = CATEGORIES[type.toLowerCase()];

  if (!category || category.hidden) return null;

  // Issue番号を抽出
  const issueMatch = description.match(/#(\d+)/);
  const issue = issueMatch ? issueMatch[1] : null;

  return {
    type: type.toLowerCase(),
    scope,
    description,
    hash,
    author,
    date,
    issue,
    section: category.section,
    order: category.order,
  };
}

function groupBySection(commits) {
  const sections = {};

  for (const commit of commits) {
    if (!commit) continue;

    if (!sections[commit.section]) {
      sections[commit.section] = {
        order: commit.order,
        entries: [],
      };
    }

    sections[commit.section].entries.push(commit);
  }

  return sections;
}

function formatEntry(commit) {
  let entry = `- ${commit.description}`;

  if (commit.scope !== "all") {
    entry = `- **${commit.scope}**: ${commit.description.charAt(0).toLowerCase() + commit.description.slice(1)}`;
  }

  if (commit.issue) {
    entry += ` (#${commit.issue})`;
  }

  return entry;
}

function generateChangelog(commits) {
  const parsed = commits.map(parseCommit).filter((c) => c);
  const sections = groupBySection(parsed);

  // セクションをorder順にソート
  const sortedSections = Object.entries(sections).sort(
    (a, b) => a[1].order - b[1].order,
  );

  let output = "## [Unreleased]\n\n";

  for (const [sectionName, section] of sortedSections) {
    output += `### ${sectionName}\n`;

    // 重複を除去してエントリを追加
    const uniqueEntries = [...new Set(section.entries.map(formatEntry))];
    output += uniqueEntries.join("\n") + "\n\n";
  }

  return output;
}

function main() {
  const options = parseArgs();
  const commits = getCommits(options.since);

  if (commits.length === 0) {
    console.log("No commits found matching the criteria.");
    process.exit(0);
  }

  const changelog = generateChangelog(commits);

  if (options.output) {
    if (options.append && existsSync(options.output)) {
      // 既存ファイルに挿入
      const existing = readFileSync(options.output, "utf-8");
      const insertPoint = existing.indexOf("## [Unreleased]");

      if (insertPoint !== -1) {
        // [Unreleased]セクションを置き換え
        const beforeUnreleased = existing.substring(0, insertPoint);
        const afterUnreleased = existing.substring(insertPoint);
        const nextSection = afterUnreleased.indexOf("\n## [", 1);

        if (nextSection !== -1) {
          const newContent =
            beforeUnreleased +
            changelog +
            afterUnreleased.substring(nextSection + 1);
          writeFileSync(options.output, newContent);
        } else {
          writeFileSync(options.output, beforeUnreleased + changelog);
        }
      } else {
        // [Unreleased]がない場合は先頭に追加
        writeFileSync(options.output, changelog + "\n" + existing);
      }

      console.log(`Updated: ${options.output}`);
    } else {
      writeFileSync(options.output, changelog);
      console.log(`Created: ${options.output}`);
    }
  } else {
    console.log(changelog);
  }
}

main();
