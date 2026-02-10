# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 11                                 |
| Phase名    | 手動テスト検証                     |
| 前提Phase  | Phase 10 (最終レビューゲート)      |
| 後続Phase  | Phase 12 (ドキュメント更新)        |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| 機能名     | skill:scan IPCハンドラーの新規追加 |

---

## 目的

UX・実環境動作確認を行い、自動テストでカバーできない観点を検証する。

## 背景

`skill:scan` IPCハンドラーが正しく動作することを実環境で確認する。特に、Electron DevTools を使用した IPC 呼び出しの動作確認が必要。

---

## 使用スキル

> このPhaseでは特定のスキルは使用せず、手動テスト作業を行います。

---

## 参照資料

| 参照資料          | パス                                            | 内容                  |
| ----------------- | ----------------------------------------------- | --------------------- |
| タスク指示書      | `tasks/02b-task-fix-17-1-skill-scan-handler.md` | タスク要件・完了条件  |
| IPCハンドラー実装 | `apps/desktop/src/main/ipc/skillHandlers.ts`    | 実装対象ファイル      |
| チャンネル定義    | `apps/desktop/src/preload/channels.ts`          | SKILL_SCAN チャンネル |
| Preload API       | `apps/desktop/src/preload/skill-api.ts`         | Renderer 側 API       |

---

## 成果物

| 成果物         | パス                                                | 内容           |
| -------------- | --------------------------------------------------- | -------------- |
| 手動テスト結果 | `phase-outputs/TASK-FIX-17-1/manual-test-result.md` | テスト実行結果 |

---

## 手動テストシナリオ

### 1. skill:scan 基本動作テスト

| #   | 操作                                                                      | 期待結果                                          |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | Electron DevTools Console から `window.electronAPI.skill.rescan()` を実行 | スキル一覧（配列）が返却される                    |
| 2   | 返却されたスキル一覧の構造を確認                                          | 各スキルに `id`, `name`, `description` が含まれる |
| 3   | エラーが発生していないことを確認                                          | Console にエラーメッセージが表示されない          |

### 2. 新規スキル検出テスト

| #   | 操作                                           | 期待結果                           |
| --- | ---------------------------------------------- | ---------------------------------- |
| 1   | テスト用の SKILL.md を任意のディレクトリに追加 | ファイルが作成される               |
| 2   | `window.electronAPI.skill.rescan()` を実行     | 新しいスキルがスキル一覧に含まれる |
| 3   | テスト用 SKILL.md を削除後、再度 rescan を実行 | 削除されたスキルが一覧から消える   |

### 3. skill:list との差異確認テスト

| #   | 操作                                                            | 期待結果                                      |
| --- | --------------------------------------------------------------- | --------------------------------------------- |
| 1   | `window.electronAPI.skill.list({ forceRefresh: false })` を実行 | キャッシュされたスキル一覧が返る（速い）      |
| 2   | `window.electronAPI.skill.rescan()` を実行                      | 常に最新のスキャン結果が返る（やや遅い）      |
| 3   | 両方の結果を比較                                                | rescan は常に forceRefresh: true と同等の結果 |

---

## 確認方法

### 前提条件

- Electron アプリが開発モードで起動していること
- DevTools が開いていること（`Ctrl+Shift+I` または `Cmd+Option+I`）

### テスト実行手順

```javascript
// 1. DevTools Console を開く

// 2. skill:scan を実行
const scanResult = await window.electronAPI.skill.rescan();
console.log("Scan Result:", scanResult);

// 3. skill:list と比較
const listResult = await window.electronAPI.skill.list({ forceRefresh: false });
console.log("List Result:", listResult);

// 4. 結果の構造を確認
console.log("First skill structure:", scanResult.data?.[0]);
```

---

## 注意事項

> **重要**: Preload API のスタブ解消は TASK-FIX-5-1 で対応予定です。
> 本タスクでは IPC ハンドラーの動作確認が主目的であり、Preload 側がまだスタブの場合は
> Main Process のテスト結果のみで判断してください。

### 既知の制限

| 制限事項                     | 理由                         | 対応タスク   |
| ---------------------------- | ---------------------------- | ------------ |
| Preload API がスタブの可能性 | TASK-FIX-5-1 で解消予定      | TASK-FIX-5-1 |
| `rescan()` が未実装の可能性  | Preload 側のスタブ状態に依存 | TASK-FIX-5-1 |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 11での必須アクション

- [ ] 手動統合テスト（Main Process → SkillService 接続）を確認
- [ ] 実環境に近い条件での動作確認
- [ ] IPC チャンネルの往復通信を確認

---

## 完了条件

- [ ] 全手動テストシナリオを実行完了
- [ ] テスト結果が文書化されている
- [ ] 発見された問題が記録されている（該当する場合）
- [ ] `SKILL_SCAN` ハンドラーが正常に動作することを確認
- [ ] **本Phase内の全作業を100%完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 8, 9, 10 が完了していること
- **後続**: Phase 12 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 手動テスト結果

- 成功シナリオ数: {{数}}/{{総数}}
- 発見された問題: {{数}}

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

`phase-outputs/TASK-FIX-17-1/phase-12-documentation.md`
