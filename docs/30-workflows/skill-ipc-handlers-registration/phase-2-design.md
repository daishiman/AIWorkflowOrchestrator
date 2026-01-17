# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| カテゴリ   | 設計                            |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-16                      |
| 機能名     | skill-ipc-handlers-registration |

---

## 目的

修正方針と実装設計を確定し、既存アーキテクチャとの整合性を確認する。

## 背景

Phase 1で特定した根本原因に対する修正設計を行う。既存のIPCハンドラー登録パターンに従い、スキル管理ハンドラーを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存パターンの分析

**目的**: 既存のIPCハンドラー登録パターンを理解する

**実行手順**:

1. `apps/desktop/src/main/ipc/index.ts` の既存登録パターンを確認する
2. 依存性注入パターンを確認する（例: historyHandlers, authHandlers）
3. SkillServiceの依存関係を確認する

**期待される成果物**:

- 既存パターン分析レポート

---

### タスク2: 修正設計の作成

**目的**: 具体的な修正内容を設計する

**実行手順**:

1. 追加するインポート文を設計する
2. SkillServiceのインスタンス化方法を設計する
3. registerSkillHandlers呼び出しの配置場所を決定する

**期待される成果物**:

- 修正設計書

---

### タスク3: 依存関係の確認

**目的**: 必要な依存関係が正しく解決できることを確認する

**実行手順**:

1. SkillScanner, SkillParser, SkillImportManager, SkillServiceのインポートパスを確認
2. electron-storeの設定を確認
3. skillBasePathの決定（app.getPath('userData')/.claude/skills）

**期待される成果物**:

- 依存関係マップ

---

## 参照資料

| 参照資料              | パス                                                                         | 内容                   |
| --------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| 前Phase成果物         | `docs/30-workflows/skill-ipc-handlers-registration/phase-1-*.md`             | 前Phaseのタスク仕様書  |
| architecture-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | スキル管理サービス構成 |
| security-api-electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC sender検証         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                         | 内容               |
| --------------------- | ---------------------------------------------------------------------------- | ------------------ |
| architecture-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Facadeパターン設計 |

---

## 成果物

| 成果物         | パス                              | 内容         |
| -------------- | --------------------------------- | ------------ |
| 設計レポート   | `outputs/phase-2/design.md`       | 修正設計書   |
| 依存関係マップ | `outputs/phase-2/dependencies.md` | 依存関係分析 |

---

## 統合テスト連携（Phase 1〜11は必須）

IPCハンドラー登録設計を確認:

- 既存の登録パターンとの整合性
- SkillServiceの依存性注入
- sender検証の適用

---

## 完了条件

- [ ] 既存のIPCハンドラー登録パターンを分析した
- [ ] 追加するインポート文を設計した
- [ ] SkillServiceのインスタンス化方法を決定した
- [ ] registerSkillHandlers呼び出しの配置場所を決定した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 設計成果物（期待される修正内容）

### 追加インポート

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

### registerAllIpcHandlers関数への追加

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

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

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

`docs/30-workflows/skill-ipc-handlers-registration/phase-3-design-review.md`
