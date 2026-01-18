# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装                            |
| カテゴリ   | TDD-Green                       |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-16                      |
| 機能名     | skill-ipc-handlers-registration |

---

## 目的

IPCハンドラー登録を追加し、テストをGreen状態にする。

## 背景

TDDのRed-Green-Refactorサイクルに従い、最小限の修正でテストを成功させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: インポート文の追加

**目的**: 必要なインポートを追加する

**実行手順**:

1. `apps/desktop/src/main/ipc/index.ts` を開く
2. 以下のインポートを追加:

```typescript
import { registerSkillHandlers } from "./skillHandlers";
import {
  SkillScanner,
  SkillParser,
  SkillImportManager,
  SkillService,
} from "../services/skill";
import Store from "electron-store";
import { app } from "electron";
import path from "path";
```

**期待される成果物**:

- インポート追加完了

---

### タスク2: ハンドラー登録の追加

**目的**: registerSkillHandlersを呼び出す

**実行手順**:

1. `registerAllIpcHandlers` 関数内に以下を追加:

```typescript
// Register Skill Management handlers
const skillBasePath = path.join(app.getPath("userData"), ".claude", "skills");
const skillStore = new Store({ name: "skills" });
const skillScanner = new SkillScanner(skillBasePath);
const skillParser = new SkillParser();
const skillImportManager = new SkillImportManager(skillStore);
const skillService = new SkillService(
  skillScanner,
  skillParser,
  skillImportManager,
);
registerSkillHandlers(mainWindow, skillService);
```

**期待される成果物**:

- ハンドラー登録追加完了

---

### タスク3: Green状態の確認

**目的**: テストが成功することを確認する

**実行手順**:

1. `pnpm --filter @repo/desktop test` を実行する
2. 全テストが成功することを確認する
3. 型エラーがないことを確認する

**期待される成果物**:

- Green状態確認レポート

---

## 参照資料

| 参照資料         | パス                                                             | 内容                  |
| ---------------- | ---------------------------------------------------------------- | --------------------- |
| 前Phase成果物    | `docs/30-workflows/skill-ipc-handlers-registration/phase-4-*.md` | 前Phaseのタスク仕様書 |
| skillHandlers.ts | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | ハンドラー実装        |
| ipc/index.ts     | `apps/desktop/src/main/ipc/index.ts`                             | 修正対象              |
| SkillService     | `apps/desktop/src/main/services/skill/`                          | サービス実装          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                         | 内容           |
| --------------------- | ---------------------------------------------------------------------------- | -------------- |
| architecture-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Facadeパターン |
| security-api-electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | sender検証     |

---

## 成果物

| 成果物            | パス                                   | 内容           |
| ----------------- | -------------------------------------- | -------------- |
| 修正後index.ts    | `apps/desktop/src/main/ipc/index.ts`   | 実装成果物     |
| Green状態レポート | `outputs/phase-5/test-green-status.md` | テスト成功確認 |

---

## 統合テスト連携（Phase 1〜11は必須）

IPCハンドラー登録実装:

- `skill:list-available` ハンドラー登録
- `skill:list-imported` ハンドラー登録
- `skill:import` ハンドラー登録
- `skill:remove` ハンドラー登録
- `skill:get-detail` ハンドラー登録

---

## 完了条件

- [ ] 必要なインポートを追加した
- [ ] registerSkillHandlersを呼び出すコードを追加した
- [ ] 全テストが成功することを確認した
- [ ] 型エラーがないことを確認した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- （記入）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-handlers-registration/phase-6-test-expansion.md`
