# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 3                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

設計のセルフレビューを行い、問題を早期発見する。

## 実行タスク

- 設計一貫性チェック: Phase 1要件との整合性確認
- パターン適合確認: 既存のコードパターンとの適合確認
- セキュリティレビュー: sandbox/CSP設計の妥当性確認
- 依存関係検証: 依存タスク（AGENT-004, AGENT-005）との整合性確認

## 参照資料

| 資料名       | パス                                         | 説明            |
| ------------ | -------------------------------------------- | --------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物   |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物   |
| 型定義       | `outputs/phase-2/type-definitions.md`        | TypeScript型    |
| セキュリティ | `outputs/phase-2/security-design.md`         | sandbox/CSP設計 |

### システム仕様（aiworkflow-requirements）

> レビュー時に必ず以下のシステム仕様との整合性を確認してください。

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| UIコンポーネントガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design準拠  |
| Zustand Sliceパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | agentSlice拡張方法 |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | CSP/sandbox設定    |

---

## チェックリスト

### 要件との整合性

| チェック項目                     | 確認内容                                             |
| -------------------------------- | ---------------------------------------------------- |
| FR-001: 環境タイプの自動選択     | Skill型にenvironmentフィールドが追加されている       |
| FR-002: HTMLプレビュー環境       | HTMLPreviewEnvironmentコンポーネントが設計されている |
| FR-003: リアルタイム更新         | デバウンス付きでsetPreviewContentが呼ばれる設計      |
| FR-004: 分割レイアウト           | SplitLayoutコンポーネントが設計されている            |
| FR-005: 分割比率の調整           | splitRatio状態とonRatioChangeが設計されている        |
| FR-006: 環境の手動切り替え       | EnvironmentSelectorコンポーネントが設計されている    |
| FR-007: Markdownプレビュー環境   | MarkdownPreviewEnvironmentが設計されている           |
| FR-008: 更新のデバウンス         | refreshDebounce設定が型定義に含まれている            |
| NFR-001: セキュリティ（sandbox） | ALLOWED_SANDBOX_FLAGSが設計されている                |
| NFR-002: セキュリティ（CSP）     | CSP_DIRECTIVESが設計されている                       |
| NFR-003: パフォーマンス          | デバウンスとサニタイズ戦略が設計されている           |
| NFR-004: 拡張性                  | EnvironmentType型で新環境追加可能な設計              |
| NFR-005: アクセシビリティ        | キーボード操作対応がProps設計に含まれている          |

### 既存パターンとの適合

| チェック項目             | 確認内容                                          |
| ------------------------ | ------------------------------------------------- |
| Atomic Designパターン    | 新コンポーネントがAtoms/Molecules/Organismsに分類 |
| Zustand Sliceパターン    | agentSlice拡張が既存パターンに準拠                |
| UIコンポーネント命名規則 | PascalCase、意味のある名前が使用されている        |
| Props設計規則            | 必須/オプションが明確、型定義が厳密               |
| ファイル配置規則         | Atomic Designに従ったディレクトリ構造             |

### セキュリティレビュー

| チェック項目         | 確認内容                                       |
| -------------------- | ---------------------------------------------- |
| sandbox属性          | allow-same-originのみ許可、scriptsは無効化     |
| CSP script-src       | 'none'で完全禁止                               |
| CSP connect-src      | 'none'で外部接続禁止                           |
| CSP form-action      | 'none'でフォーム送信禁止                       |
| HTMLサニタイズ       | DOMPurifyでscript/iframe/object/embedを除去    |
| イベントハンドラ除去 | onerror/onload/onclick/onmouseoverが除去される |

### 依存関係検証

| チェック項目                 | 確認内容                                 |
| ---------------------------- | ---------------------------------------- |
| AGENT-004（Skill Registry）  | Skill型拡張がSkill Registryと互換性あり  |
| AGENT-005（Agent Execution） | agentSlice拡張が既存状態管理と互換性あり |
| 既存AgentExecutionView       | 新SplitLayoutが既存ビューと統合可能      |
| 既存AgentChatInterface       | leftPanelとして配置可能                  |

---

## レビュー観点

### 1. 設計の完全性

```
□ すべてのFR/NFRが設計でカバーされている
□ 型定義が完全で曖昧さがない
□ コンポーネント階層が明確
□ データフローが明確に定義されている
```

### 2. 実装可能性

```
□ 設計が実装可能なレベルで詳細化されている
□ 必要なライブラリ/依存関係が特定されている
□ 既存コードとの統合ポイントが明確
□ テスト可能な設計になっている
```

### 3. セキュリティ

```
□ iframe sandboxが適切に設定されている
□ CSPが十分に厳格
□ HTMLサニタイズが適用される
□ XSS対策が考慮されている
```

### 4. パフォーマンス

```
□ 大きなHTMLでも問題ないサニタイズ戦略
□ 適切なデバウンス設定
□ 不要な再レンダリングを防ぐ設計
□ メモリリークの可能性がない
```

---

## 問題発見時の対応

### 軽微な問題

- Phase 2の成果物を直接修正
- 修正内容をレビューログに記録

### 重大な問題

- Phase 1（要件）に遡って確認
- 必要に応じて要件を更新
- 設計を再度実施

---

## 統合テスト連携【必須】

統合ポイントをレビュー観点で確認する:

| 統合ポイント               | レビュー確認項目                              |
| -------------------------- | --------------------------------------------- |
| agentSlice拡張             | 既存フィールドとの競合なし、型定義が正確      |
| SplitLayout↔親             | Props契約が明確、デフォルト値が適切           |
| ExecutionEnvironment       | 環境タイプごとの振り分けロジックが正確        |
| HTMLPreviewEnvironment     | sandbox/CSP設定が安全、サニタイズが適用される |
| MarkdownPreviewEnvironment | 適切なMarkdownパーサーが選定されている        |

---

## 成果物

| 成果物               | パス                                  | 説明           |
| -------------------- | ------------------------------------- | -------------- |
| レビューチェック結果 | `outputs/phase-3/review-checklist.md` | チェック結果   |
| 発見問題リスト       | `outputs/phase-3/issues-found.md`     | 発見された問題 |
| 修正ログ             | `outputs/phase-3/modification-log.md` | 修正履歴       |

---

## 完了条件

- [ ] すべての要件との整合性が確認されている
- [ ] 既存パターンとの適合が確認されている
- [ ] セキュリティ設計がレビューされている
- [ ] 依存タスクとの互換性が確認されている
- [ ] 重大な問題がすべて解決されている
- [ ] 統合ポイントがレビューされている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1要件との整合性確認
2. 既存パターンとの適合確認
3. セキュリティ設計レビュー（sandbox/CSP）
4. 依存タスク（AGENT-004, AGENT-005）との互換性確認
5. 統合ポイントのレビュー
6. 問題の記録と修正
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 3
```

## 次のPhase

Phase 4: テスト作成（Red）
