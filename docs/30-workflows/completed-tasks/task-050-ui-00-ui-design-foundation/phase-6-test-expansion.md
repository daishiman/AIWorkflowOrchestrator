# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 6                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 5（実装）                     |
| 後続Phase | Phase 7（テストカバレッジ確認）     |

## 目的

Green化後に試験網を拡張し、テーマ差分・レスポンシブ差分・アクセシビリティ差分の漏れを閉じる。UI基盤が後続画面実装で壊れない状態を作る。

## 実行タスク

- テーマ横断拡充: 3テーマの全主要コンポーネントを検証する
- レスポンシブ拡充: 4ブレークポイントの表示差分を検証する
- a11y拡充: role/aria/keyboard操作の負ケースも検証する
- 回帰拡充: Task 5B/5C/5D の回帰ケースを追加する

## 参照資料

| 資料名                 | パス                                                                           | 説明           |
| ---------------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 5成果物          | `outputs/phase-5/implementation-summary.md`                                    | 実装差分       |
| Phase 5成果物          | `outputs/phase-5/green-test-report.md`                                         | 既存試験状態   |
| UI設計原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | UX・A11y基準   |
| アクセシビリティ試験   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | 試験拡充観点   |
| 品質基準               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 拡充後の目標   |
| red-test-report        | `outputs/phase-4/red-test-report.md`                                           | Phase 4 成果物 |
| test-case-matrix       | `outputs/phase-4/test-case-matrix.md`                                          | Phase 4 成果物 |
| test-specification     | `outputs/phase-4/test-specification.md`                                        | Phase 4 成果物 |
| implementation-mapping | `outputs/phase-5/implementation-mapping.md`                                    | Phase 5 成果物 |

## 実行手順

### ステップ1: 観点別の並列拡充

- SubAgent A: Theme拡充
- SubAgent B: Responsive拡充
- SubAgent C: A11y拡充
- SubAgent D: Error/Interaction/UX文言拡充

### ステップ2: 試験統合

重複ケースを統合し、メンテナンス単位でファイル再編する。

### ステップ3: 拡充結果確認

実行ログと失敗理由を分析し、Phase 7へ引き渡す。

## 統合テスト連携

- 複数コンポーネントを合成した画面レベル試験を追加する
- オフライン復帰シナリオを追加する
- Tab/Enter/Escape/Cmd+K の操作連鎖を追加する

## 成果物

| 成果物             | パス                                       | 説明       |
| ------------------ | ------------------------------------------ | ---------- |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 拡充内容   |
| 試験ケース追加一覧 | `outputs/phase-6/additional-test-cases.md` | 追加ID一覧 |
| 実行ログ           | `outputs/phase-6/test-execution-log.md`    | 実行結果   |

## 完了条件

- [ ] Theme/Responsive/A11y/Errorの拡充ケースが作成済みである
- [ ] 拡充ケースの目的と判定条件が文書化されている
- [ ] 統合試験シナリオが追加されている
- [ ] Phase 7でカバレッジ計測できる状態である
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

Phase 7: テストカバレッジ確認
