# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 11                     |
| Phase名    | 手動テスト             |
| 前提Phase  | Phase 10               |
| 後続Phase  | Phase 12               |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

実際のElectronアプリケーション環境でIPCエンドポイントを手動テストし、E2E動作を確認する。

## 背景

最終レビューが完了し、自動テストは全て成功している。実際のアプリケーション環境での動作を確認し、品質を最終確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト環境準備

**目的**: 手動テスト用の環境を準備する

**実行手順**:

1. アプリケーションをビルドする:

```bash
pnpm --filter @repo/desktop build
```

2. 開発モードでアプリを起動する:

```bash
pnpm --filter @repo/desktop dev
```

3. DevToolsを開く（Cmd+Option+I / Ctrl+Shift+I）

4. テスト用スキルディレクトリを準備する:

```bash
# テスト用ディレクトリ作成
mkdir -p ~/test-skills/test-skill-1
mkdir -p ~/test-skills/test-skill-2
```

5. テスト用SKILL.mdを作成する:

```markdown
## <!-- ~/test-skills/test-skill-1/SKILL.md -->

name: Test Skill 1
slug: test-skill-1
description: A test skill for manual testing

---

## Overview

This is a test skill for manual testing.

## Anchors

- Test Anchor 1 / 適用: テスト / 目的: テスト用

## Trigger

test, manual, テスト
```

**期待される成果物**:

- テスト環境の準備完了
- `outputs/phase-11/test-environment.md`

---

### タスク2: スキルスキャンIPCテスト

**目的**: `agent:scan-available-skills` IPCエンドポイントをテストする

**実行手順**:

1. DevToolsのConsoleで以下を実行する:

```javascript
// スキルスキャンをテスト
const result = await window.electronAPI.agent.scanAvailableSkills(
  "/Users/username/test-skills",
);
console.log("Scan result:", result);
```

2. 以下を確認する:

| 確認項目           | 期待値                                 | 結果 |
| ------------------ | -------------------------------------- | ---- |
| レスポンスが返る   | 配列が返る                             | ✓/✗  |
| スキル数           | 2（test-skill-1, test-skill-2）        | ✓/✗  |
| スキル情報の形式   | Skill型に準拠                          | ✓/✗  |
| SKILL.mdなしは除外 | SKILL.mdがないディレクトリは含まれない | ✓/✗  |
| 応答時間           | 3秒以内                                | ✓/✗  |

3. エラーケースをテストする:

```javascript
// 存在しないパス
const errorResult =
  await window.electronAPI.agent.scanAvailableSkills("/nonexistent/path");
console.log("Error result:", errorResult);
```

**期待される成果物**:

- `outputs/phase-11/scan-test-result.md`

---

### タスク3: スキルインポートIPCテスト

**目的**: `agent:import-skills` IPCエンドポイントをテストする

**実行手順**:

1. DevToolsのConsoleで以下を実行する:

```javascript
// スキルをインポート
const importResult = await window.electronAPI.agent.importSkills([
  "test-skill-1",
]);
console.log("Import result:", importResult);
```

2. 以下を確認する:

| 確認項目         | 期待値               | 結果 |
| ---------------- | -------------------- | ---- |
| レスポンスが返る | success: true        | ✓/✗  |
| インポートが完了 | importedCount: 1     | ✓/✗  |
| 永続化される     | アプリ再起動後も維持 | ✓/✗  |

3. 重複インポートをテストする:

```javascript
// 同じスキルを再度インポート
const duplicateResult = await window.electronAPI.agent.importSkills([
  "test-skill-1",
]);
console.log("Duplicate result:", duplicateResult);
```

**期待される成果物**:

- `outputs/phase-11/import-test-result.md`

---

### タスク4: インポート済みスキル取得IPCテスト

**目的**: `agent:get-imported-skills` IPCエンドポイントをテストする

**実行手順**:

1. DevToolsのConsoleで以下を実行する:

```javascript
// インポート済みスキルを取得
const importedSkills = await window.electronAPI.agent.getImportedSkills();
console.log("Imported skills:", importedSkills);
```

2. 以下を確認する:

| 確認項目             | 期待値                 | 結果 |
| -------------------- | ---------------------- | ---- |
| レスポンスが返る     | 配列が返る             | ✓/✗  |
| インポート済みを含む | test-skill-1が含まれる | ✓/✗  |
| スキル情報の形式     | Skill型に準拠          | ✓/✗  |

**期待される成果物**:

- `outputs/phase-11/get-imported-test-result.md`

---

### タスク5: スキル詳細取得IPCテスト

**目的**: `agent:get-skill-detail` IPCエンドポイントをテストする

**実行手順**:

1. DevToolsのConsoleで以下を実行する:

```javascript
// スキル詳細を取得
const skillDetail =
  await window.electronAPI.agent.getSkillDetail("test-skill-1");
console.log("Skill detail:", skillDetail);
```

2. 以下を確認する:

| 確認項目         | 期待値                   | 結果 |
| ---------------- | ------------------------ | ---- |
| レスポンスが返る | Skill オブジェクトが返る | ✓/✗  |
| name             | "Test Skill 1"           | ✓/✗  |
| slug             | "test-skill-1"           | ✓/✗  |
| description      | 説明文が含まれる         | ✓/✗  |
| triggers         | ["test", "manual", ...]  | ✓/✗  |
| anchors          | Anchor配列が含まれる     | ✓/✗  |

3. 存在しないスキルをテストする:

```javascript
// 存在しないスキル
const notFound = await window.electronAPI.agent.getSkillDetail("nonexistent");
console.log("Not found result:", notFound);
```

**期待される成果物**:

- `outputs/phase-11/detail-test-result.md`

---

### タスク6: スキル削除IPCテスト

**目的**: `agent:remove-skill` IPCエンドポイントをテストする

**実行手順**:

1. DevToolsのConsoleで以下を実行する:

```javascript
// スキルを削除
const removeResult = await window.electronAPI.agent.removeSkill("test-skill-1");
console.log("Remove result:", removeResult);
```

2. 以下を確認する:

| 確認項目         | 期待値                       | 結果 |
| ---------------- | ---------------------------- | ---- |
| レスポンスが返る | success: true                | ✓/✗  |
| 削除が完了       | インポート一覧から除外される | ✓/✗  |
| 永続化される     | アプリ再起動後も削除状態維持 | ✓/✗  |

3. 存在しないスキルの削除をテストする:

```javascript
// 存在しないスキルを削除
const removeNotFound =
  await window.electronAPI.agent.removeSkill("nonexistent");
console.log("Remove not found:", removeNotFound);
```

**期待される成果物**:

- `outputs/phase-11/remove-test-result.md`

---

### タスク7: セキュリティテスト

**目的**: セキュリティ対策が機能していることを確認する

**実行手順**:

1. パストラバーサル攻撃をテストする:

```javascript
// パストラバーサル攻撃
const traversal =
  await window.electronAPI.agent.scanAvailableSkills("../../../etc");
console.log("Traversal result:", traversal);
```

2. 以下を確認する:

| 確認項目             | 期待値                 | 結果 |
| -------------------- | ---------------------- | ---- |
| パストラバーサル防止 | エラーが返る           | ✓/✗  |
| 不正なパスは拒否     | エラーメッセージが適切 | ✓/✗  |

3. IPC sender検証をテストする（DevToolsから直接ipcRendererを呼び出す場合）:

```javascript
// 注: 正常なpreloadを経由しない呼び出しは拒否されるべき
// この検証は実装方法に依存
```

**期待される成果物**:

- `outputs/phase-11/security-test-result.md`

---

### タスク8: 永続化テスト

**目的**: データの永続化が正しく機能することを確認する

**実行手順**:

1. スキルをインポートする:

```javascript
await window.electronAPI.agent.importSkills(["test-skill-1", "test-skill-2"]);
```

2. アプリケーションを終了する

3. アプリケーションを再起動する

4. インポート状態を確認する:

```javascript
const persisted = await window.electronAPI.agent.getImportedSkills();
console.log("Persisted skills:", persisted);
```

5. 以下を確認する:

| 確認項目             | 期待値                       | 結果 |
| -------------------- | ---------------------------- | ---- |
| インポート状態が維持 | test-skill-1, 2 が含まれる   | ✓/✗  |
| スキルパス設定が維持 | 設定したパスが保持されている | ✓/✗  |

**期待される成果物**:

- `outputs/phase-11/persistence-test-result.md`

---

### タスク9: 手動テストサマリー作成

**目的**: 全手動テスト結果をまとめる

**実行手順**:

1. 全テスト結果を集約する:

```markdown
## 手動テストサマリー

### テスト結果

| テスト項目         | 結果 |
| ------------------ | ---- |
| スキルスキャン     | PASS |
| スキルインポート   | PASS |
| インポート済み取得 | PASS |
| スキル詳細取得     | PASS |
| スキル削除         | PASS |
| セキュリティ       | PASS |
| 永続化             | PASS |

### 総合判定: PASS

### 備考

（あれば記載）
```

**期待される成果物**:

- `outputs/phase-11/manual-test-summary.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容        |
| -------------------- | ---------------------------------------------------------------------------- | ----------- |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC検証方法 |

---

## 成果物

| 成果物             | パス                                           | 内容                 |
| ------------------ | ---------------------------------------------- | -------------------- |
| テスト環境         | `outputs/phase-11/test-environment.md`         | 環境準備記録         |
| スキャンテスト     | `outputs/phase-11/scan-test-result.md`         | スキャンIPC結果      |
| インポートテスト   | `outputs/phase-11/import-test-result.md`       | インポートIPC結果    |
| インポート済み取得 | `outputs/phase-11/get-imported-test-result.md` | 取得IPC結果          |
| 詳細取得テスト     | `outputs/phase-11/detail-test-result.md`       | 詳細IPC結果          |
| 削除テスト         | `outputs/phase-11/remove-test-result.md`       | 削除IPC結果          |
| セキュリティテスト | `outputs/phase-11/security-test-result.md`     | セキュリティ確認結果 |
| 永続化テスト       | `outputs/phase-11/persistence-test-result.md`  | 永続化確認結果       |
| 手動テストサマリー | `outputs/phase-11/manual-test-summary.md`      | 総合結果             |

---

## 完了条件

- [ ] テスト環境が準備されている
- [ ] スキルスキャンIPCテストが成功
- [ ] スキルインポートIPCテストが成功
- [ ] インポート済みスキル取得IPCテストが成功
- [ ] スキル詳細取得IPCテストが成功
- [ ] スキル削除IPCテストが成功
- [ ] セキュリティテストが成功
- [ ] 永続化テストが成功
- [ ] 手動テストサマリーが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## 手動テスト判定

### テスト結果判定

| 判定     | 条件             | 次のアクション            |
| -------- | ---------------- | ------------------------- |
| PASS     | 全項目でPASS     | Phase 12へ進行            |
| MINOR    | 軽微な指摘あり   | 指摘対応後、Phase 12へ    |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザー確認 |

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後（PASS/MINOR判定の場合）、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-12-documentation.md`
