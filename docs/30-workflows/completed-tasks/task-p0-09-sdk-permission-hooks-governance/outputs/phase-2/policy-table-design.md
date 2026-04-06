# Phase 2: policy テーブル設計書

## policy テーブル確定版

| Phase   | permissionMode | allowedTools                               | disallowedTools           |
| ------- | -------------- | ------------------------------------------ | ------------------------- |
| plan    | default        | Read, Glob, Grep, Bash, Agent              | Write, Edit, NotebookEdit |
| execute | acceptEdits    | Read, Glob, Grep, Bash, Agent, Write, Edit | NotebookEdit              |
| verify  | default        | Read, Glob, Grep, Bash, Agent              | Write, Edit, NotebookEdit |
| improve | acceptEdits    | Read, Glob, Grep, Bash, Agent, Edit        | Write, NotebookEdit       |

## DESTRUCTIVE_TOOLS 最終リスト

```typescript
const DESTRUCTIVE_TOOLS = ["NotebookEdit"] as const;
```

**理由**: Jupyter Notebook の直接編集は skill ファイル生成に不要であり、
予期しないデータ破壊を引き起こすリスクがあるため全 phase で禁止。

## ツールセット定数

```typescript
const READ_TOOLS = ["Read", "Glob", "Grep", "Bash", "Agent"] as const;
const TEST_TOOLS = ["Read", "Glob", "Grep", "Bash", "Agent"] as const;
const WRITE_TOOLS = [
  "Read",
  "Glob",
  "Grep",
  "Bash",
  "Agent",
  "Write",
  "Edit",
] as const;
const IMPROVE_TOOLS = [
  "Read",
  "Glob",
  "Grep",
  "Bash",
  "Agent",
  "Edit",
] as const;
```

## Object.freeze() 適用

`POLICY_TABLE` は `Object.freeze()` で保護し、実行時の改変を防止する。
テスト TC-RG で `getAllPolicies()` の返り値が frozen であることを検証。

## 既存実装との差分

差分なし。Phase 1 調査の結果、既存実装は設計書と完全に一致。

**作成日**: 2026-04-06
