# Phase 11: 手動テスト検証

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 11                                        |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001       |
| 機能名   | SkillImportDialog skill.id→skill.name修正 |
| 作成日   | 2026-02-22                                |

## 目的

Electron デスクトップアプリ上でスキルインポート機能が正常に動作し、`skill.id`（ハッシュ値）ではなく `skill.name`（人間可読名）が IPC チャンネルに渡されることを手動で検証する。

## 実行タスク

- 正常インポート確認: 単一スキルのインポートが成功することを確認する
- 複数スキルインポート確認: 2つ以上のスキルを選択してインポートが全て成功することを確認する
- インポート済み表示確認: インポート済みスキルがダイアログ上で正しくマークされることを確認する
- 状態永続性確認: ダイアログの閉じ→再オープン後もインポート状態が維持されることを確認する
- DevTools値確認: IPCに渡されるskillName値がハッシュではなく人間可読名であることをDevToolsで確認する

## 参照資料

| 資料名                    | パス                                      | 説明            |
| ------------------------- | ----------------------------------------- | --------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                 | 依存Phase       |
| Phase 2 設計              | `phase-2-design.md`                       | 依存Phase       |
| Phase 3 設計レビュー      | `phase-3-design-review.md`                | 依存Phase       |
| Phase 4 テスト作成        | `phase-4-test-creation.md`                | 依存Phase       |
| Phase 5 実装              | `phase-5-implementation.md`               | 依存Phase       |
| Phase 6 テスト拡充        | `phase-6-test-expansion.md`               | 依存Phase       |
| Phase 7 カバレッジ確認    | `phase-7-coverage-check.md`               | 依存Phase       |
| Phase 8 リファクタリング  | `phase-8-refactoring.md`                  | 依存Phase       |
| Phase 9 品質保証          | `phase-9-quality-assurance.md`            | 依存Phase       |
| Phase 10 最終レビュー     | `phase-10-final-review.md`                | 依存Phase       |
| Phase 11 手動テスト       | `phase-11-manual-test.md`                 | 本Phase成果物   |
| 要件充足レビュー          | `outputs/phase-10/requirements-review.md` | Phase 10 成果物 |
| 設計準拠レビュー          | `outputs/phase-10/design-review.md`       | Phase 10 成果物 |
| テスト品質レビュー        | `outputs/phase-10/test-quality-review.md` | Phase 10 成果物 |
| コード品質レビュー        | `outputs/phase-10/code-quality-review.md` | Phase 10 成果物 |
| セキュリティ・IPCレビュー | `outputs/phase-10/security-ipc-review.md` | Phase 10 成果物 |
| 最終判定                  | `outputs/phase-10/final-review-result.md` | Phase 10 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                        |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill:import チャンネル契約 |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice設計              |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                              | P39, P40, P44, P45          |
| UI/UX 実行画面             | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | 手動テスト観点              |
| テスト品質                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 手動確認の合格条件          |

## 検証環境の起動手順

1. `apps/desktop` ディレクトリに移動する（P40対策: プロジェクトルートからの実行ではhappy-dom設定が適用されない）
2. `pnpm --filter @repo/desktop dev` を実行してElectronアプリを開発モードで起動する
3. アプリが起動したら、Chrome DevToolsを開く（`Cmd+Option+I` または メニュー > View > Toggle Developer Tools）
4. DevToolsの Console タブを開き、エラー出力を監視できる状態にする

## 実行手順

### テストシナリオ 1: 正常インポート（単一スキル）

**目的**: スキル選択ダイアログで1つのスキルを選択し、インポートが成功することを確認する

**手順**:

1. AgentView画面に遷移する
2. スキルインポートダイアログを開く（「スキルを追加」ボタン または 該当UIを押下）
3. 未インポートのスキルを1つ選択する
4. 「インポート」ボタンを押下する
5. 以下を確認する:
   - [ ] インポート完了の成功フィードバック（トースト通知またはダイアログ内表示）が表示される
   - [ ] DevTools Console に `IMPORT_ERROR` が表示されない
   - [ ] DevTools Console に `VALIDATION_ERROR` が表示されない
   - [ ] インポートしたスキルがスキル一覧に表示される

**合格条件**: 上記4項目すべてにチェックが入ること

### テストシナリオ 2: 複数スキル同時インポート

**目的**: 2つ以上のスキルを選択してインポートし、全スキルが正常にインポートされることを確認する

**手順**:

1. スキルインポートダイアログを開く
2. 未インポートのスキルを2つ以上選択する
3. 「インポート」ボタンを押下する
4. 以下を確認する:
   - [ ] 選択した全てのスキルがインポートされる
   - [ ] DevTools Console にエラーが表示されない
   - [ ] 各スキルがスキル一覧に表示される

**合格条件**: 上記3項目すべてにチェックが入ること

### テストシナリオ 3: インポート済みスキルの表示

**目的**: 既にインポート済みのスキルがダイアログ上で正しくマーク（disabled/チェック済み）されることを確認する

**手順**:

1. テストシナリオ 1 または 2 でスキルをインポート済みにする
2. スキルインポートダイアログを再度開く
3. 以下を確認する:
   - [ ] インポート済みのスキルが disabled 状態 または チェック済み状態で表示される
   - [ ] インポート済みのスキルを再度選択できない（二重インポート防止）
   - [ ] 未インポートのスキルは通常通り選択可能である

**合格条件**: 上記3項目すべてにチェックが入ること

### テストシナリオ 4: インポート後の状態確認（ダイアログ閉じ→再オープン）

**目的**: インポート完了後にダイアログを閉じ、再度開いた際にインポート済みスキルの状態が維持されていることを確認する

**手順**:

1. テストシナリオ 1 でスキルをインポートする
2. ダイアログを閉じる（「閉じる」ボタン または Escキー）
3. 再度スキルインポートダイアログを開く
4. 以下を確認する:
   - [ ] 先ほどインポートしたスキルがインポート済みとして表示される
   - [ ] インポート済みスキルの表示状態がテストシナリオ 3 と同一である

**合格条件**: 上記2項目すべてにチェックが入ること

### テストシナリオ 5: DevToolsでの値確認（IPC引数検証）

**目的**: IPCチャンネルに渡される `skillName` 値がSHA-256ハッシュ（16文字の英数字文字列）ではなく、人間可読なスキル名であることを確認する

**手順**:

1. DevTools Console タブを開く
2. 以下のコマンドをConsoleに入力して IPC 通信を監視する準備をする:
   ```javascript
   // Main Process のログ出力を確認（electron-log使用時）
   // Console に skill:import 関連のログが出力されることを確認
   ```
3. スキルインポートダイアログを開き、スキルを1つ選択してインポートする
4. Console の出力を確認する:
   - [ ] `skill:import` に渡されている値が人間可読なスキル名（例: `"task-specification-creator"`）である
   - [ ] 渡されている値がハッシュ値（例: `"a1b2c3d4e5f6g7h8"` のような16文字の英数字列）でない
5. Network タブで IPC 通信が確認できる場合はそちらも確認する:
   - [ ] リクエストペイロードの `skillName` フィールドが人間可読名である

**合格条件**: 渡される値がハッシュ値ではなく人間可読なスキル名であること

## 統合テスト連携【必須】

| 観点          | 記録内容                                                         |
| ------------- | ---------------------------------------------------------------- |
| Phase 10 接続 | 最終レビューで指示された手動確認観点の実施                       |
| IPC/API       | skill:import に渡される値が `skill.name`（人間可読名）であること |
| 回帰          | スキル削除（skill:remove）機能が影響を受けていないこと           |
| P44対策確認   | ハンドラ側とPreload側のインターフェース契約が一致していること    |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

1. 参照資料の確認
2. 検証環境の起動
3. テストシナリオ 1-5 の順次実行
4. 統合テスト連携の確認（Phase 1-11 の観点反映）
5. 成果物の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物             | パス                                               | 説明                           |
| ------------------ | -------------------------------------------------- | ------------------------------ |
| 手動テスト実行記録 | `outputs/phase-11/manual-test-execution-record.md` | 5シナリオの実行結果記録        |
| スクリーンショット | `outputs/phase-11/screenshots/`                    | 各シナリオの確認画面キャプチャ |
| DevTools確認結果   | `outputs/phase-11/devtools-verification.md`        | Console/Networkタブの確認結果  |

## 完了条件

- [ ] テストシナリオ 1（正常インポート）の全4項目が合格している
- [ ] テストシナリオ 2（複数スキル同時インポート）の全3項目が合格している
- [ ] テストシナリオ 3（インポート済みスキル表示）の全3項目が合格している
- [ ] テストシナリオ 4（状態確認）の全2項目が合格している
- [ ] テストシナリオ 5（DevTools値確認）でskillNameが人間可読名であることが確認されている
- [ ] DevTools Console に `IMPORT_ERROR` が表示されていない
- [ ] DevTools Console に `VALIDATION_ERROR` が表示されていない
- [ ] 回帰観点（skill:remove機能）の動作確認が完了している
- [ ] artifacts.json の Phase 11 ステータスが `completed` に更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
