# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 9                                        |
| 機能名     | UT-SC-02-005-preload-execute-type-update |
| 作成日     | 2026-03-25                               |
| ステータス | PENDING                                  |

---

## 目的

定義された品質基準をすべて満たすことを検証する。
Preload 型更新・Renderer 側型ナロイング追加が、既存機能を破壊せず品質ゲートを通過することを確認する。

---

## 品質ゲート

| ゲート                   | コマンド / 基準                                      | 合格基準                    |
| ------------------------ | ---------------------------------------------------- | --------------------------- |
| 機能検証                 | `pnpm --filter @repo/desktop test`                   | 全テスト PASS               |
| コード品質（Lint）       | `pnpm lint`                                          | エラー 0 件                 |
| コード品質（型チェック） | `pnpm typecheck`                                     | エラー 0 件                 |
| テスト網羅性             | カバレッジ基準（変更ファイルのカバレッジが既存以上） | 基準達成                    |
| セキュリティ             | 重大な脆弱性の不在                                   | CRITICAL / HIGH 脆弱性 0 件 |

### IPC契約ドリフト検証【Phase 9 品質ゲート】

IPC 3層の型契約がドリフトしていないことを検証する:

```bash
# IPC契約整合性チェック（スクリプト存在時）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only

# スクリプト未存在時の代替
grep -rn "RuntimeSkillCreatorExecuteResponse" apps/desktop/src/preload/ apps/desktop/src/main/ apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
```

---

## 実行タスク

### 品質チェックリスト

#### 1. 機能検証

- [ ] `pnpm --filter @repo/desktop test` が全件 PASS する
- [ ] skill-creator-api.ts の executePlan 戻り値型が `IpcResult<RuntimeSkillCreatorExecuteResponse>` に更新されている
- [ ] SkillLifecyclePanel.tsx で `"type" in result.data` による型ナロイングが正しく動作する
- [ ] planSkill → executePlan のフロー全体がランタイムエラーなく動作する

#### 2. コード品質

- [ ] `pnpm lint` がエラー 0 件で完了する
- [ ] `pnpm typecheck` がエラー 0 件で完了する
- [ ] 不要な `// @ts-ignore` や `as any` が残っていない
- [ ] IPC 3層（Main → Preload → Renderer）の型契約が完全一致している

#### 3. テスト網羅性

- [ ] 変更対象ファイルに対応するテストが存在する
- [ ] 型ナロイングのブランチ（terminal_handoff あり / なし）がテストでカバーされている
- [ ] カバレッジが既存水準を下回っていない

#### 4. セキュリティ

- [ ] IPC チャネル経由で意図しないデータが漏洩しない
- [ ] Preload の contextBridge 公開 API に不要なメソッドが追加されていない
- [ ] 重大な脆弱性（CRITICAL / HIGH）が検出されない

---

## 統合テスト連携【必須】

本 Phase の品質ゲート結果は、Phase 10（最終レビューゲート）の判定入力として使用される。
品質ゲートが 1 つでも FAIL の場合、Phase 10 へ進むことはできない。

| 連携先 Phase | 連携内容                                             |
| ------------ | ---------------------------------------------------- |
| Phase 10     | 品質ゲート合否結果を最終レビュー判定に反映           |
| Phase 11     | 機能検証結果を手動テストシナリオの前提条件として使用 |

---

## 参照資料

| 参照資料           | パス                                                | 内容                     |
| ------------------ | --------------------------------------------------- | ------------------------ |
| Phase 5 Green結果  | `outputs/phase-5/green-state-verification.md`       | 実装後の回帰結果         |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`                | カバレッジ基準達成状況   |
| Phase 8 リファクタ | `outputs/phase-8/refactoring-log.md`                | リファクタリング実施記録 |
| IPC/Preload 教訓   | `references/lessons-learned-ipc-preload-runtime.md` | P44/P45 修正パターン     |

---

## 成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` |

### quality-report.md 記載項目

- 各品質ゲートの実行結果（PASS / FAIL）
- 実行コマンドと出力サマリ
- 検出された問題と対処状況
- 総合判定（PASS / FAIL）

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

---

## 完了条件

- [ ] 全品質ゲートが PASS している
- [ ] quality-report.md が作成されている
- [ ] 検出問題が 0 件、または全件対処済みである
- [ ] 総合判定が PASS である

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

- [ ] 品質チェックリストの全項目を実行した
- [ ] 品質ゲートのコマンドを実際に実行し、結果を記録した
- [ ] 成果物を所定パスに出力した
- [ ] 完了条件を全て満たした

---

## 次Phase

Phase 10: 最終レビューゲート → `phase-10-final-review.md`
