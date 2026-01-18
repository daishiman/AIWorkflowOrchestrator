# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 11                      |
| Phase名    | 手動テスト検証          |
| 前提Phase  | Phase 10                |
| 後続Phase  | Phase 12                |
| ステータス | 未実施                  |
| 作成日     | 2026-01-17              |
| 機能名     | claude-cli-renderer-api |

---

## 目的

UX・実環境での動作確認を行い、ユーザー視点での品質を検証する。

## 背景

自動テストだけでは検証できないUX面や実環境での動作を確認する。Electronアプリとしての統合動作を検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 関連する自動テストの実行確認

**目的**: 自動テストが全てパスしていることを確認する

**実行手順**:

1. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 全テストがパスすることを確認する
3. カバレッジを確認する:
   ```bash
   pnpm --filter @repo/desktop test --coverage
   ```

**期待される成果物**:

- テスト実行結果

---

### タスク2: 機能テスト（正常系）

**目的**: claudeCliAPIの各機能が正常に動作することを確認する

**実行手順**:

1. Electronアプリを起動する（開発モード）:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. DevToolsを開き、Console上で以下のAPIを実行する:
   - `window.claudeCliAPI.checkInstallation()` - CLI存在確認
   - `window.claudeCliAPI.listSkills()` - スキル一覧取得
   - `window.claudeCliAPI.listSessions()` - セッション一覧取得
3. 各APIが期待通りのレスポンスを返すことを確認する
4. 結果を記録する

**期待される成果物**:

- 機能テスト結果

---

### タスク3: エラーハンドリングテスト（異常系）

**目的**: エラーケースが適切に処理されることを確認する

**実行手順**:

1. DevTools Console上で以下の異常系テストを実行する:
   - 存在しないスキルIDで`getSkillDetail()`を呼び出す
   - 存在しないセッションIDで`getSession()`を呼び出す
   - 不正な引数で各APIを呼び出す
2. エラーが適切に返されることを確認する
3. アプリがクラッシュしないことを確認する

**期待される成果物**:

- エラーハンドリングテスト結果

---

### タスク4: ストリーミングイベントテスト

**目的**: ストリーミングイベントが正常に動作することを確認する

**実行手順**:

1. DevTools Console上で以下のテストを実行する:
   ```javascript
   const unsubscribeOutput = window.claudeCliAPI.onSessionOutput((event) => {
     console.log("Output event:", event);
   });
   const unsubscribeStatus = window.claudeCliAPI.onSessionStatus((event) => {
     console.log("Status event:", event);
   });
   ```
2. スクリプトを実行して出力イベントが受信されることを確認する
3. セッション状態変更イベントが受信されることを確認する
4. `unsubscribeOutput()`と`unsubscribeStatus()`でイベント購読が解除されることを確認する

**期待される成果物**:

- ストリーミングイベントテスト結果

---

### タスク5: 統合シナリオテスト

**目的**: UI→Preload→Main→Preload→UIの往復動作を確認する

**実行手順**:

1. 以下の統合シナリオを実行する:
   - スキル一覧取得 → スキル詳細取得 → スクリプト実行
   - セッション開始 → 出力監視 → セッション終了
2. 各シナリオが正常に動作することを確認する
3. データの往復が正しく行われることを確認する

**期待される成果物**:

- 統合シナリオテスト結果

---

### タスク6: 手動テスト結果レポートの作成

**目的**: 手動テスト結果をレポートにまとめる

**実行手順**:

1. `outputs/phase-11/manual-test-result.md`に以下の内容でレポートを作成する:

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| TC-ID  | 機能              | 期待結果             | 結果 | 備考 |
| ------ | ----------------- | -------------------- | ---- | ---- |
| TC-001 | checkInstallation | CLI存在状況を返却    | PASS |      |
| TC-002 | listSkills        | スキル一覧を返却     | PASS |      |
| TC-003 | getSkillDetail    | スキル詳細を返却     | PASS |      |
| TC-004 | listSessions      | セッション一覧を返却 | PASS |      |
| TC-005 | getSession        | セッション詳細を返却 | PASS |      |

### エラーハンドリングテスト（異常系）

| TC-ID  | 状況                   | 期待結果             | 結果 | 備考 |
| ------ | ---------------------- | -------------------- | ---- | ---- |
| TC-101 | 存在しないスキルID     | エラーレスポンス返却 | PASS |      |
| TC-102 | 存在しないセッションID | エラーレスポンス返却 | PASS |      |

### ストリーミングイベントテスト

| TC-ID  | イベント        | 期待結果             | 結果 | 備考 |
| ------ | --------------- | -------------------- | ---- | ---- |
| TC-201 | onSessionOutput | 出力イベント受信     | PASS |      |
| TC-202 | onSessionStatus | 状態変更イベント受信 | PASS |      |
| TC-203 | unsubscribe     | イベント購読解除     | PASS |      |
```

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`（手動テスト結果レポート）

---

### タスク7: 発見課題の記録

**目的**: 手動テストで発見された課題を記録する

**実行手順**:

1. 手動テストで発見された課題を`outputs/phase-11/discovered-issues.md`に記録する
2. 各課題について以下の情報を記録する:
   - 課題ID
   - 課題の説明
   - 重要度（高/中/低）
   - 対応方針
3. 課題がない場合は「発見課題なし」と記載する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`（発見課題レポート）

---

## 参照資料

| 参照資料             | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Phase 10レビュー結果 | `outputs/phase-10/final-review-result.md` | 最終レビュー結果 |
| 既存実装             | `apps/desktop/src/preload/index.ts`       | claudeCliAPI実装 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容     |
| -------- | --------------------------------------------------------------------------- | -------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

---

## 成果物

| 成果物                 | パス                                     | 内容           |
| ---------------------- | ---------------------------------------- | -------------- |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-result.md` | テスト結果     |
| 発見課題レポート       | `outputs/phase-11/discovered-issues.md`  | 発見された課題 |

---

## 統合テスト連携（Phase 1〜11は必須）

手動でUI→Preload→Main→Preload→UIの往復動作を確認する。具体的には:

- claudeCliAPIの各メソッドが正常に動作すること
- ストリーミングイベントが正常に受信されること
- エラーハンドリングが適切に行われること

---

## 完了条件

- [ ] 関連する自動テストが全てパスすることを確認した
- [ ] 機能テスト（正常系）を完了した
- [ ] エラーハンドリングテスト（異常系）を完了した
- [ ] ストリーミングイベントテストを完了した
- [ ] 統合シナリオテストを完了した
- [ ] 手動テスト結果レポート（`outputs/phase-11/manual-test-result.md`）を作成した
- [ ] 発見課題レポート（`outputs/phase-11/discovered-issues.md`）を作成した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/claude-cli-renderer-api/phase-12-documentation.md`
