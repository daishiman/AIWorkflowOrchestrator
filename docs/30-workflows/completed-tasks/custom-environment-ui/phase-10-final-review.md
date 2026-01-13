# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 10                    |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

全要件との最終整合性確認を行い、実装の完全性を検証する。

## 実行タスク

- 要件網羅確認: Phase 1の全要件が実装されているか確認
- 受け入れ基準検証: Given-When-Thenシナリオの検証
- セキュリティ最終確認: sandbox/CSPの動作検証
- 統合確認: 依存タスクとの統合動作確認

## 参照資料

| 資料名       | パス                                         | 説明            |
| ------------ | -------------------------------------------- | --------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Given-When-Then |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物   |

### システム仕様（aiworkflow-requirements）

> 最終レビュー時に以下のシステム仕様との整合性を確認してください。

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| UIコンポーネントガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design準拠  |
| Zustand Sliceパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | agentSlice拡張方法 |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | CSP/sandbox設定    |

---

## 最終チェックリスト

### 機能要件（FR）

| 要件ID | 要件名                 | 実装 | テスト | 動作確認 |
| ------ | ---------------------- | ---- | ------ | -------- |
| FR-001 | 環境タイプの自動選択   | □    | □      | □        |
| FR-002 | HTMLプレビュー環境     | □    | □      | □        |
| FR-003 | リアルタイム更新       | □    | □      | □        |
| FR-004 | 分割レイアウト         | □    | □      | □        |
| FR-005 | 分割比率の調整         | □    | □      | □        |
| FR-006 | 環境の手動切り替え     | □    | □      | □        |
| FR-007 | Markdownプレビュー環境 | □    | □      | □        |
| FR-008 | 更新のデバウンス       | □    | □      | □        |

### 非機能要件（NFR）

| 要件ID  | 要件名                  | 実装 | テスト | 動作確認 |
| ------- | ----------------------- | ---- | ------ | -------- |
| NFR-001 | セキュリティ（sandbox） | □    | □      | □        |
| NFR-002 | セキュリティ（CSP）     | □    | □      | □        |
| NFR-003 | パフォーマンス          | □    | □      | □        |
| NFR-004 | 拡張性                  | □    | □      | □        |
| NFR-005 | アクセシビリティ        | □    | □      | □        |

---

## 受け入れ基準検証

### シナリオ1: HTMLスキルでHTMLプレビューが表示される

```gherkin
Given ユーザーがHTMLスライド作成スキルを選択している
When エージェントがHTMLコンテンツを生成する
Then 右側パネルにHTMLプレビューが表示される
And プレビューはサンドボックス化されている
```

**検証結果**: □ Pass / □ Fail

### シナリオ2: プレビューがリアルタイムで更新される

```gherkin
Given ユーザーがHTMLプレビュー環境を使用している
When エージェントが追加のHTMLコンテンツを生成する
Then プレビューが自動的に更新される
```

**検証結果**: □ Pass / □ Fail

### シナリオ3: チャットとプレビューが分割表示される

```gherkin
Given ユーザーがカスタム環境対応スキルを実行している
When 実行画面が表示される
Then 画面が左右に分割される
And 左側にチャット、右側にプレビューが表示される
```

**検証結果**: □ Pass / □ Fail

### シナリオ4: 分割比率を調整できる

```gherkin
Given 分割レイアウトが表示されている
When 分割バーをドラッグする
Then 左右のパネル比率が変更される
And 比率が保存される
```

**検証結果**: □ Pass / □ Fail

### シナリオ5: 環境を手動で切り替えられる

```gherkin
Given 複数の環境タイプがサポートされている
When 環境セレクターで別の環境を選択する
Then 右側パネルの環境が切り替わる
```

**検証結果**: □ Pass / □ Fail

### シナリオ6: プレビュー内でスクリプトが隔離されている

```gherkin
Given HTMLプレビューが表示されている
When HTMLに悪意のあるスクリプトが含まれている
Then スクリプトは親ウィンドウにアクセスできない
And アラートやリダイレクトは抑制される
```

**検証結果**: □ Pass / □ Fail

### シナリオ7: Markdownプレビューが表示される

```gherkin
Given ユーザーがMarkdown対応スキルを選択している
When エージェントがMarkdownコンテンツを生成する
Then 右側パネルにレンダリングされたMarkdownが表示される
```

**検証結果**: □ Pass / □ Fail

### シナリオ8: スキルに環境設定がない場合

```gherkin
Given ユーザーが環境設定のないスキルを選択している
When スキルを実行する
Then プレビューパネルは表示されない
And チャットのみのレイアウトになる
```

**検証結果**: □ Pass / □ Fail

---

## 統合テスト連携【必須】

すべての統合ポイントの最終確認を行う:

| 統合ポイント               | 確認事項                               | 結果 |
| -------------------------- | -------------------------------------- | ---- |
| agentSlice拡張             | 既存機能への影響なし、新機能が正常動作 | □    |
| SplitLayout↔親             | 状態伝播が正確、永続化が機能           | □    |
| ExecutionEnvironment       | 全環境タイプで正しくレンダリング       | □    |
| HTMLPreviewEnvironment     | sandbox/CSPが確実に適用                | □    |
| MarkdownPreviewEnvironment | Markdownが正しくレンダリング           | □    |
| AgentExecutionView統合     | 既存UIとの統合が正常                   | □    |

---

## 成果物

| 成果物             | パス                                      | 説明         |
| ------------------ | ----------------------------------------- | ------------ |
| 最終チェックリスト | `outputs/phase-10/final-checklist.md`     | 全項目確認   |
| 受け入れ検証結果   | `outputs/phase-10/acceptance-results.md`  | シナリオ検証 |
| 統合確認結果       | `outputs/phase-10/integration-results.md` | 統合動作確認 |

---

## 完了条件

- [ ] すべての機能要件が実装・テスト・動作確認済み
- [ ] すべての非機能要件が実装・テスト・動作確認済み
- [ ] すべての受け入れ基準がPassしている
- [ ] すべての統合ポイントが確認済み
- [ ] 重大な問題が解決されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 機能要件（FR）の網羅確認
2. 非機能要件（NFR）の網羅確認
3. 受け入れ基準シナリオ1-4の検証
4. 受け入れ基準シナリオ5-8の検証
5. 統合ポイントの最終確認
6. 発見された問題の修正
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 10
```

## 次のPhase

Phase 11: 手動テスト
