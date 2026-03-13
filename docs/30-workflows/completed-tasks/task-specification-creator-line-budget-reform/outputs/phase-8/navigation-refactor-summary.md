# Phase 8 Output: Navigation Refactor Summary

## navigation 改善点

| 経路                         | 旧状態                                           | 新状態                                                                  |
| ---------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| entrypoint → template detail | `SKILL.md` 内を長くスクロールする必要があった    | `SKILL.md` → `phase-templates.md` → `phase-template-*.md`               |
| entrypoint → Phase 12 detail | `SKILL.md` に埋め込まれた長文を読む必要があった  | `SKILL.md` → `phase-11-12-guide.md` → `phase-12-documentation-guide.md` |
| log → old history            | `LOGS.md` の巨大本文を検索する必要があった       | `LOGS.md` → `logs-archive-index.md` → 月次 archive                      |
| pattern lookup               | `patterns.md` の巨大本文を grep する必要があった | `patterns.md` → 問題種別ごとの family file                              |

## naming 統一

| family      | 採用した naming             |
| ----------- | --------------------------- |
| template    | `phase-template-*`          |
| pattern     | `patterns-*`                |
| spec update | `spec-update-*`             |
| guide       | `phase-11-*` / `phase-12-*` |
| archive     | `logs-archive-*`            |

## reader path 評価

1. quick start から主要 family index までは 1 hop。
2. family index から detail file までは 1 hop。
3. rolling log から過去履歴までは 2 hop。
4. docs-only task は Phase 11 screenshot guide を経由せずに Phase 12 guide へ辿れる。

## 判定

navigation drift は解消済み。以後の blocker は link 欠落ではなく、mirror parity と workflow registry の同期漏れに限定される。
