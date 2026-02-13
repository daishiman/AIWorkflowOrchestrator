# Phase 11: 手動テスト

## メタ情報

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | UT-9B-H-003                                   |
| Phase    | 11                                            |
| タスク名 | SkillCreator IPCセキュリティ強化 - 手動テスト |
| 作成日   | 2026-02-12                                    |

## 目的

Electronデスクトップアプリの開発モードで、セキュリティ強化が実際のIPC通信環境で正しく動作することを手動で検証する。

## 実行タスク

- Task 1: パストラバーサル手動検証: DevToolsから攻撃パターンを送信して拒否を確認する。
- Task 2: エラーサニタイズ手動検証: 内部情報がRendererへ露出しないことを確認する。
- Task 3: schemaName手動検証: 許可/拒否ケースの挙動を確認する。
- Task 4: 旧API非露出確認: 公開API面を確認する。

## 前提条件

- 本タスクはIPCハンドラーの修正のみでUI変更はないため、手動テストはDevToolsコンソール経由で実施する
- Electronアプリが開発モードで起動していること
- DevTools（Ctrl+Shift+I / Cmd+Option+I）が開いていること

## テスト環境

| 項目             | 内容                   |
| ---------------- | ---------------------- |
| プラットフォーム | macOS (Darwin)         |
| 実行モード       | Electron 開発モード    |
| テスト手法       | DevToolsコンソール経由 |
| 必要ツール       | Chrome DevTools        |

## テストシナリオ

### シナリオ 1: パストラバーサル手動検証

#### 1-1. `../` パターン拒否

```javascript
// DevToolsコンソールで実行
await window.electronAPI.skillCreator.executeTasks({
  tasksDir: "../../etc/passwd",
  outputDir: "./output",
  schemaName: "skill-spec",
});
// 期待結果: { success: false, error: "無効なパスが指定されました: tasksDir" } 相当のエラー
```

- [ ] エラーが返却されること
- [ ] エラーメッセージにファイルパスが含まれないこと

#### 1-2. `..\` パターン拒否（Windows形式）

```javascript
await window.electronAPI.skillCreator.executeTasks({
  tasksDir: "..\\Windows\\System32",
  outputDir: "./output",
  schemaName: "skill-spec",
});
// 期待結果: エラーが返却されること
```

- [ ] エラーが返却されること

#### 1-3. NULLバイト拒否

```javascript
await window.electronAPI.skillCreator.executeTasks({
  tasksDir: "./skills\x00/evil",
  outputDir: "./output",
  schemaName: "skill-spec",
});
// 期待結果: エラーが返却されること
```

- [ ] エラーが返却されること

#### 1-4. 正常パス許可

```javascript
await window.electronAPI.skillCreator.executeTasks({
  tasksDir: "./skills/my-skill",
  outputDir: "./output",
  schemaName: "skill-spec",
});
// 期待結果: パスバリデーションは通過（後続処理のエラーは別問題）
```

- [ ] パストラバーサルエラーではないこと（後続のビジネスロジックエラーは許容）

### シナリオ 2: エラーサニタイズ手動検証

#### 2-1. 存在しないディレクトリでのエラー

```javascript
await window.electronAPI.skillCreator.executeTasks({
  tasksDir: "./nonexistent-dir-12345",
  outputDir: "./output",
  schemaName: "skill-spec",
});
```

- [ ] エラーメッセージにファイルパス（`/Users/...` 形式）が含まれないこと
- [ ] エラーメッセージにスタックトレースが含まれないこと
- [ ] エラーメッセージがユーザーにとって理解可能であること

#### 2-2. サービスエラーのサニタイズ確認

```javascript
// 意図的に不正な引数で呼び出す
await window.electronAPI.skillCreator.validateSchema(null, null);
```

- [ ] 内部エラーの詳細情報（ファイルパス等）がRenderer側に露出しないこと

### シナリオ 3: schemaName手動検証

#### 3-1. 不正なschemaName拒否

```javascript
await window.electronAPI.skillCreator.validateSchema("evil-schema", {});
// 期待結果: { success: false, error: "..." } schemaName不正エラー
```

- [ ] エラーが返却されること
- [ ] ALLOWED_SCHEMA_NAMES（`task-spec`, `skill-spec`, `mode`）に含まれないスキーマ名が拒否されること

#### 3-2. 空文字schemaName拒否

```javascript
await window.electronAPI.skillCreator.validateSchema("", {});
```

- [ ] エラーが返却されること

#### 3-3. SQLインジェクション的文字列拒否

```javascript
await window.electronAPI.skillCreator.validateSchema(
  "'; DROP TABLE skills; --",
  {},
);
```

- [ ] エラーが返却されること
- [ ] エラーメッセージに入力値がそのまま含まれないこと

#### 3-4. 正常なschemaName許可

```javascript
await window.electronAPI.skillCreator.validateSchema("skill-spec", {});
// 期待結果: schemaNameバリデーションは通過（後続処理のエラーは別問題）
```

- [ ] schemaName不正エラーではないこと

### シナリオ 4: 旧API非露出確認

```javascript
// DevToolsコンソールで確認
console.log(typeof window.skillCreatorAPI);
// 期待結果: "undefined"（旧APIが存在しないこと）
```

- [ ] 旧APIが `undefined` であること（該当する場合のみ）

## 注意事項

- DevToolsコンソールでの手動テストは、IPC通信のセキュリティを検証する目的で実施する
- UIの見た目やユーザー操作フローの検証は本タスクの対象外
- 手動テストで発見した問題はPhase 10のレビュー結果に追記する
- テスト結果のスクリーンショットは必須ではないが、エラーメッセージの内容は記録する

## 参照資料

| 資料                      | パス                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義          | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-1-requirements.md          |
| Phase 2 設計              | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-2-design.md                |
| Phase 5 実装              | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-5-implementation.md        |
| Phase 6 テスト拡充        | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-6-test-expansion.md        |
| Phase 7 カバレッジ確認    | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-7-coverage-check.md        |
| Phase 8 リファクタリング  | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-8-refactoring.md           |
| Phase 9 品質検証          | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-9-quality-assurance.md     |
| Phase 10 レビュー結果     | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-10/final-review.md |
| IPC セキュリティ仕様      | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                        |
| API/Electron セキュリティ | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                        |
| エラーハンドリング仕様    | .claude/skills/aiworkflow-requirements/references/error-handling.md                               |
| Skill Creator IPC型定義   | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                                |
| セキュリティルール        | .claude/rules/04-electron-security.md                                                             |

## 統合テスト連携

| 層                   | テスト内容                                                          |
| -------------------- | ------------------------------------------------------------------- |
| バックエンド（Main） | 手動入力で各ハンドラーの防御ロジックが機能することを確認する        |
| IPC通信              | DevTools からの呼び出しで戻り値形式とメッセージサニタイズを確認する |
| Preload/セキュリティ | 旧API非露出と公開API境界が維持されていることを確認する              |

## 成果物

| 成果物         | パス                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| 手動テスト結果 | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-11/manual-test-report.md |

## 完了条件

- [ ] シナリオ1（パストラバーサル）の全テスト項目をチェック済み
- [ ] シナリオ2（エラーサニタイズ）の全テスト項目をチェック済み
- [ ] シナリオ3（schemaName）の全テスト項目をチェック済み
- [ ] シナリオ4（旧API非露出）を確認済み（該当する場合）
- [ ] 手動テスト結果レポートが作成済み
- [ ] 発見した問題が記録されていること（0件でも記録必須）

## 次Phase

Phase 12: ドキュメント → `phase-12-documentation.md`
