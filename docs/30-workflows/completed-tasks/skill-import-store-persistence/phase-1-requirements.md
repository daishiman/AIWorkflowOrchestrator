# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| Phase名    | 要件定義                       |
| 前提Phase  | -                              |
| 後続Phase  | Phase 2                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-22                     |
| 機能名     | skill-import-store-persistence |

---

## 目的

electron-storeを使用したスキルインポート永続化問題の原因を特定し、修正要件を明確化する。

## 背景

skill-import-persistence-bugfixタスクでスキルインポートの永続化機能を実装し、ユニットテスト（28件）は全てPASSしている。しかし、実環境で`skill:list-imported`を呼び出すと、インポート済みスキルが0件として返される現象が発生している。

デバッグログから以下の状況が確認されている：

```
[skillHandlers][DEBUG] skill:list-imported - START
[skillHandlers][DEBUG] skill:list-imported - validation PASSED
[skillHandlers][DEBUG] Calling skillService.getImportedSkills()...
[SkillService][DEBUG] getImportedSkills - START
[SkillService][DEBUG] importedIds: []
[SkillService][DEBUG] getImportedSkills - DONE, returning 0 skills
[skillHandlers][DEBUG] getImportedSkills result: 0 skills
```

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: electron-storeの保存状態調査

**目的**: electron-storeが作成したファイルの存在と内容を確認する

**実行手順**:

1. macOSの場合、以下のパスでストアファイルを確認する
   - `~/Library/Application Support/aiworkflow-orchestrator/`
   - `~/Library/Application Support/Electron/`
2. `skills.json`ファイルが存在するか確認する
3. 存在する場合、ファイルの内容を確認する
4. ファイルのパーミッションと所有者を確認する
5. 調査結果を `outputs/phase-01/store-file-investigation.md` に記録する

**期待される成果物**:

- `outputs/phase-01/store-file-investigation.md`

---

### タスク2: SkillImportManagerのコンストラクタ調査

**目的**: electron-storeの初期化と設定を確認する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillImportManager.ts`を読み込む
2. コンストラクタでのStoreインスタンス生成パラメータを確認する
3. `name`プロパティが`"skills"`に設定されているか確認する
4. `cwd`や`schema`など他の設定を確認する
5. 以下のデバッグログを追加して実行環境でのパスを確認する
   ```typescript
   console.log("[SkillImportManager] Store path:", this.store.path);
   console.log("[SkillImportManager] Raw store data:", this.store.store);
   ```
6. 調査結果を `outputs/phase-01/skill-import-manager-investigation.md` に記録する

**期待される成果物**:

- `outputs/phase-01/skill-import-manager-investigation.md`

---

### タスク3: IPC呼び出しフロー調査

**目的**: Renderer→Main間のIPC通信が正しく行われているか確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts`の`skill:import`ハンドラーを確認する
2. `skill:list-imported`ハンドラーの実装を確認する
3. `SkillService`が`SkillImportManager`を正しく使用しているか確認する
4. Renderer側のコードで`skill:import`が呼び出されているか確認する
5. DevToolsのConsoleでIPC呼び出しログを確認する
6. 調査結果を `outputs/phase-01/ipc-flow-investigation.md` に記録する

**期待される成果物**:

- `outputs/phase-01/ipc-flow-investigation.md`

---

### タスク4: 原因の特定と要件定義

**目的**: 調査結果をもとに問題の原因を特定し、修正要件を定義する

**実行手順**:

1. タスク1-3の調査結果を統合する
2. 以下の可能性のうち該当するものを特定する
   - ストアファイルパスの不一致
   - インポートIPCが呼び出されていない
   - ストアのスキーマ/キー名の不一致
   - electron-storeの初期化タイミング問題
   - ユニットテストのモックと実装の差異
3. 修正要件を定義する
4. 受け入れ基準を明確にする
5. 要件定義書を `outputs/phase-01/requirements.md` に記録する

**期待される成果物**:

- `outputs/phase-01/requirements.md`

---

## 参照資料

| 参照資料                  | パス                                                                             | 内容                       |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| タスク指示書              | `docs/30-workflows/unassigned-task/task-skill-import-store-persistence-issue.md` | 問題の詳細記述             |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`      | skill:\* IPCチャンネル仕様 |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`            | エラー処理パターン         |
| SkillImportManager        | `apps/desktop/src/main/services/skill/SkillImportManager.ts`                     | 実装コード                 |
| SkillImportManagerテスト  | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`      | ユニットテスト             |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容               |
| ------------------------- | --------------------------------------------------------------------------- | ------------------ |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | skill:\* IPC仕様   |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理パターン |

---

## 成果物

| 成果物                         | パス                                                     | 内容                 |
| ------------------------------ | -------------------------------------------------------- | -------------------- |
| ストアファイル調査レポート     | `outputs/phase-01/store-file-investigation.md`           | ストア状態の調査結果 |
| SkillImportManager調査レポート | `outputs/phase-01/skill-import-manager-investigation.md` | コード調査結果       |
| IPCフロー調査レポート          | `outputs/phase-01/ipc-flow-investigation.md`             | IPC通信の調査結果    |
| 要件定義書                     | `outputs/phase-01/requirements.md`                       | 原因特定と修正要件   |

---

## 統合テスト連携（Phase 1〜11は必須）

このPhaseでは統合テスト観点として以下を明記する：

- IPC接続要件: `skill:import`、`skill:list-imported`チャンネルの動作確認
- データフロー要件: Renderer→Main→electron-store→Main→Rendererの往復フロー

---

## 完了条件

- [ ] ストアファイルの存在・内容・場所が確認できている
- [ ] SkillImportManagerの設定が調査できている
- [ ] IPC呼び出しフローが確認できている
- [ ] 問題の原因が特定されている
- [ ] 修正要件と受け入れ基準が定義されている
- [ ] 全ての成果物が`outputs/phase-01/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初期Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-store-persistence/phase-2-design.md`
