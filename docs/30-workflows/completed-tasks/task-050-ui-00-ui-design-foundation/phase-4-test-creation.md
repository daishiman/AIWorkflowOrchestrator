# Phase 4: テスト作成

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 4                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 3（設計レビューゲート）       |
| 後続Phase | Phase 5（実装）                     |

## 目的

Phase 5実装前に失敗テストを先行作成し、UI基盤の挙動を仕様で拘束する。テーマ、部品、レスポンシブ、アクセシビリティ、エラーステートの回帰を防ぐ。

## 実行タスク

- テスト土台作成: `renderWithTheme` と共通モックを整備する
- Redテスト作成: Task 1〜6の受け入れ条件を失敗テストで固定する
- SubAgent並列作成: Tokens/Components/A11yを並列で書き分ける
- 失敗確認: 失敗理由が仕様差分と一致することを確認する

## 参照資料

| 資料名                   | パス                                                                              | 説明           |
| ------------------------ | --------------------------------------------------------------------------------- | -------------- |
| Phase 1成果物            | `outputs/phase-1/acceptance-criteria.md`                                          | AC正本         |
| Phase 2成果物            | `outputs/phase-2/architecture-design.md`                                          | テスト設計入力 |
| Phase 3成果物            | `outputs/phase-3/design-review-result.md`                                         | テスト対象ID   |
| テスト実装規約           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト実装基準 |
| a11y試験規約             | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | ARIA/WCAG試験  |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ閾値 |
| Pitfall集                | `.claude/rules/06-known-pitfalls.md`                                              | P39/P40/P9対策 |
| requirements-definition  | `outputs/phase-1/requirements-definition.md`                                      | Phase 1 成果物 |
| scope-definition         | `outputs/phase-1/scope-definition.md`                                             | Phase 1 成果物 |
| integration-design-notes | `outputs/phase-2/integration-design-notes.md`                                     | Phase 2 成果物 |
| subagent-assignment      | `outputs/phase-2/subagent-assignment.md`                                          | Phase 2 成果物 |
| review-findings          | `outputs/phase-3/review-findings.md`                                              | Phase 3 成果物 |

## 実行手順

### ステップ1: SubAgent並列分担

- SubAgent A（Tokens Test）: `tokens.css` の3テーマ定義テスト
- SubAgent B（Component Test）: Atoms/Molecules/OrganismsのPropsテスト
- SubAgent C（A11y/Responsive Test）: role/aria/focusとbreakpointテスト

### ステップ2: 直列統合

A/B/C の失敗ケースIDを重複なしで統合し、CIで再現可能なテストセットに固定する。

### ステップ3: Red確認

全テストを実行し、設計未実装の項目が失敗することを確認する。

## 統合テスト連携

- Theme統合: 3テーマで同一UIケースを反復実行
- Responsive統合: `mobile/tablet/desktop/wide` のレンダリング差分を比較
- Interaction統合: hover/active/success/error を状態遷移で検証
- Error統合: オフラインバナー、インラインエラー、トーストエラー表示を検証

## 成果物

| 成果物           | パス                                    | 説明         |
| ---------------- | --------------------------------------- | ------------ |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | Red試験一覧  |
| Red実行ログ      | `outputs/phase-4/red-test-report.md`    | 失敗確認記録 |
| テストケース台帳 | `outputs/phase-4/test-case-matrix.md`   | TC-ID対応表  |

## 完了条件

- [ ] テストケースがTask 1〜6へ対応付けされている
- [ ] SubAgent A/B/Cの成果が統合済みである
- [ ] Redテストが再現可能である
- [ ] P39/P40/P9対策がテスト手順に反映されている
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                             | 仕様参照先                                                                   |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------- |
| セキュリティ       | 入力検証や権限境界を含む場合         | `.claude/skills/aiworkflow-requirements/references/security-*.md`            |
| UI/UX              | フロントエンド仕様を扱う場合         | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| アーキテクチャ     | 構造や責務分離を扱う場合             | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| API設計            | IPC/API契約に影響する場合            | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| データ整合性       | 永続化や台帳更新を含む場合           | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |
| エラーハンドリング | 失敗時UI/処理を含む場合              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| パフォーマンス     | レンダリングや処理時間要件がある場合 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| アクセシビリティ   | キーボード操作やARIAを扱う場合       | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` |

| 層                         | 適用判断                    | 仕様参照先                                                                   |
| -------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | UI実装時                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| バックエンド（Main）       | サービス連携がある場合      | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| IPC通信                    | Main-Renderer連携がある場合 | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| Preload/セキュリティ       | API公開面がある場合         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |
| ローカルストレージ         | 永続化がある場合            | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成し、完了ごとに更新する。

1. 参照資料確認
2. 実行タスク実施
3. 統合テスト連携（Phase 1〜11）
4. 成果物作成・配置
5. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で完了状態を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js   docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation
```

## 次のPhase

Phase 5: 実装
