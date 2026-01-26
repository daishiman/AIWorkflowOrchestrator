# TASK-3-1-E: rememberChoice機能永続化実装 - メインタスク仕様書

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-3-1-E                                              |
| タイトル   | rememberChoice機能の永続化実装                          |
| 優先度     | 低                                                      |
| 複雑度     | 小規模                                                  |
| 依存タスク | TASK-3-1-C（完了）, TASK-3-1-D（未実施）                |
| 並列タスク | なし                                                    |
| ブロック   | なし                                                    |
| タグ       | backend, main-process, service, permission, persistence |
| ステータス | Phase 12完了（PR作成待ち）                              |
| 作成日     | 2026-01-25                                              |
| 完了日     | 2026-01-26                                              |
| Issue番号  | #510                                                    |

---

## 概要

PermissionResponse型の`rememberChoice`フィールドを使用して、ユーザーの「次回から確認しない」選択を永続化する機能を実装する。electron-storeを使用してアプリ再起動後も設定を維持し、設定画面から許可済みツールの管理を可能にする。

---

## 目的

- ユーザーが「次回から確認しない」を選択した権限設定をelectron-storeに永続化
- アプリ再起動後も許可設定を維持し、許可済みツールの権限ダイアログをスキップ
- 設定画面から許可済みツールの確認・削除機能を提供
- ユーザー体験の向上（頻繁な確認ダイアログによる作業中断の軽減）

---

## 背景

TASK-3-1-C（PermissionRequest Hook統合）で、SkillPermissionResponse型に`rememberChoice`フィールドが定義された。このフィールドは「次回から確認しない」オプションをサポートするためのものだが、現在は永続化機能が未実装であり、以下の問題がある：

1. `rememberChoice: true`を送信してもアプリ再起動後に設定が失われる
2. 毎回同じツールの権限確認ダイアログが表示される
3. UIの期待（「次回から確認しない」）と実際の動作が乖離

---

## 入力

| 入力元     | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| TASK-3-1-C | PermissionRequest Hook実装済みSkillExecutor                  |
| TASK-3-1-D | Renderer側権限ダイアログUI（rememberChoiceチェックボックス） |

---

## 出力

| 成果物                | パス                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| PermissionStore       | `apps/desktop/src/main/services/skill/PermissionStore.ts`                |
| SkillExecutor更新     | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                  |
| PermissionStoreテスト | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts` |
| 設定UIコンポーネント  | `apps/desktop/src/renderer/components/PermissionSettings.tsx`            |
| IPCハンドラー追加     | `apps/desktop/src/main/ipc/skill-handlers.ts`                            |

---

## システム仕様参照（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                            | 内容                                        |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | SkillPermissionResponse型（rememberChoice） |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`    | PermissionResolverパターン                  |
| セキュリティパターン定義  | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | セキュリティ考慮事項                        |

---

## スコープ

### 含むもの

- PermissionStore（永続化ストア）の実装
- SkillExecutorへの永続化連携追加
- 設定画面への「許可済みツール管理」セクション追加
- ユニットテスト・統合テスト

### 含まないもの

- 時間ベースの有効期限設定
- ツール引数ごとの細粒度設定
- 権限レベル（読み取り/書き込み等）の区別

---

## Phase一覧

| Phase | 名称                 | ファイル                            | ステータス |
| ----- | -------------------- | ----------------------------------- | ---------- |
| 1     | 要件定義             | `phase-01-requirements.md`          | ✅ 完了    |
| 2     | 設計                 | `phase-02-design.md`                | ✅ 完了    |
| 3     | 設計レビューゲート   | `phase-03-design-review.md`         | ✅ 完了    |
| 4     | テスト作成           | `phase-04-test-creation.md`         | ✅ 完了    |
| 5     | 実装                 | `phase-05-implementation.md`        | ✅ 完了    |
| 6     | テスト拡充           | `phase-06-test-expansion.md`        | ✅ 完了    |
| 7     | テストカバレッジ確認 | `phase-07-coverage-verification.md` | ✅ 完了    |
| 8     | リファクタリング     | `phase-08-refactoring.md`           | ✅ 完了    |
| 9     | 品質保証             | `phase-09-quality-assurance.md`     | ✅ 完了    |
| 10    | 最終レビューゲート   | `phase-10-final-review.md`          | ✅ 完了    |
| 11    | 手動テスト検証       | `phase-11-manual-testing.md`        | ✅ 完了    |
| 12    | ドキュメント更新     | `phase-12-documentation.md`         | ✅ 完了    |
| 13    | PR作成               | `phase-13-pr-creation.md`           | 未実施     |

---

## 依存関係グラフ

```
TASK-3-1-C (PermissionRequest Hook)     TASK-3-1-D (権限ダイアログUI)
         \                                     /
          \                                   /
           v                                 v
              TASK-3-1-E (本タスク: 永続化)
```

---

## テストカバレッジ目標

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 統合テスト

| 指標                | 目標 |
| ------------------- | ---- |
| PermissionStore API | 100% |
| SkillExecutor連携   | 100% |
| 正常系シナリオ      | 100% |
| 異常系シナリオ      | 80%+ |

---

## 完了条件

- [x] PermissionStoreが作成されている
- [x] 「次回から確認しない」で許可したツールが永続化される
- [x] アプリ再起動後も設定が維持される
- [x] 許可済みツールは権限ダイアログをスキップする
- [x] 設定画面から許可済みツールを削除できる
- [x] ユニットテストカバレッジ80%以上（達成: 96%）
- [x] TypeScript strict PASS
- [x] ESLint PASS
- [x] システム仕様書が更新されている（security-skill-execution.md, ui-ux-settings.md）

---

## リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                         |
| -------------------- | ------ | -------- | -------------------------------------------- |
| 設定ファイル破損     | 中     | 低       | 読み込みエラー時はデフォルト値で初期化       |
| セキュリティ上の懸念 | 高     | 低       | 危険なツールは自動許可対象外にするオプション |
| 設定移行（将来）     | 低     | 中       | バージョン付きスキーマ設計                   |

---

## 変更履歴

| バージョン | 日付       | 変更内容                               |
| ---------- | ---------- | -------------------------------------- |
| 1.1.0      | 2026-01-26 | Phase 1-12完了、システム仕様書更新完了 |
| 1.0.0      | 2026-01-25 | 初版作成                               |
