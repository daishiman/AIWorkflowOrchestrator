# Phase 5: 実装

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 5                                   |
| 機能名    | task-050-ui-00-ui-design-foundation |
| タスクID  | TASK-UI-00-DESIGN-FOUNDATION        |
| 作成日    | 2026-03-04                          |
| 前提Phase | Phase 4（テスト作成）               |
| 後続Phase | Phase 6（テスト拡充）               |

## 目的

Phase 4のRedテストをGreenに転換する。UI共通基盤のコードを責務別に実装し、後続タスク（053〜061）が直接利用できる共通資産へ仕上げる。

## 実行タスク

- Tokens実装: `light` / `dark` を Apple HIG 配色へ反映する
- Atoms/Molecules/Organisms実装: 仕様化されたPropsと挙動を実装する
- UI指針実装: レスポンシブ、アクセシビリティ、UX文言、エラーUIを反映する
- Green化: Phase 4のRedケースを全件Greenにする

## 参照資料

| 資料名               | パス                                                                             | 説明             |
| -------------------- | -------------------------------------------------------------------------------- | ---------------- |
| Phase 4成果物        | `outputs/phase-4/test-specification.md`                                          | 実装対象ID       |
| Phase 2成果物        | `outputs/phase-2/architecture-design.md`                                         | 実装設計         |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`  | 実装契約         |
| 状態管理規約         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | props駆動設計    |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`            | UIエラー表示契約 |
| セキュリティ入力検証 | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力境界         |
| red-test-report      | `outputs/phase-4/red-test-report.md`                                             | Phase 4 成果物   |
| test-case-matrix     | `outputs/phase-4/test-case-matrix.md`                                            | Phase 4 成果物   |

## 実行手順

### ステップ1: 並列実装（SubAgent Team）

- SubAgent A: `tokens.css` とテーマ差分実装
- SubAgent B: Atoms + Molecules 実装
- SubAgent C: Organisms + Responsive実装
- SubAgent D: A11y + UX文言 + エラーUI実装

### ステップ2: 直列統合

A/B/C/D 実装を統合し、命名競合とProps差分を解消する。

### ステップ3: Green判定

Phase 4のテストを再実行し、すべてGreen化する。

## 統合テスト連携

- テーマ切替で配色が期待値どおりである
- コンポーネント組み合わせ（CardGrid + SearchFilterList）が期待どおりである
- キーボード操作でフォーカス遷移が期待どおりである
- オフライン時のバナーと制限表示が期待どおりである

## 成果物

| 成果物       | パス                                        | 説明         |
| ------------ | ------------------------------------------- | ------------ |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装差分一覧 |
| 実装対応表   | `outputs/phase-5/implementation-mapping.md` | TC-ID対応表  |
| Green結果    | `outputs/phase-5/green-test-report.md`      | Green化結果  |

## 完了条件

- [ ] Task 1〜6に紐づく実装が完了している
- [ ] SubAgent A/B/C/Dの成果が統合済みである
- [ ] Phase 4のRedテストが全件Greenである
- [ ] 後続タスクが利用する共通部品APIが固定されている
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

Phase 6: テスト拡充
