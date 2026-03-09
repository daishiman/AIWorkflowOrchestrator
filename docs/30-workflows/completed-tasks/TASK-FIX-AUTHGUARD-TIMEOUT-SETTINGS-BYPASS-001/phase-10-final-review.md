# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 10                                             |
| Phase名    | 最終レビュー                                   |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 9                                        |
| 後続Phase  | Phase 11                                       |

## 目的

実装の多角的品質・整合性検証を行い、リリース可能かどうかを判定する。

## 実行タスク

- タスク1: 受け入れ基準 AC-1〜AC-8 の最終達成状況を確認する
- タスク2: Settings state-based bypass のセキュリティ影響を最終確認する
- タスク3: 規約・型安全性・アクセシビリティの整合性をレビューする
- タスク4: 差分範囲が意図通りに閉じているか確認する

### タスク1: 受け入れ基準検証

**目的**: Phase 1 の受け入れ基準が全て満たされているか最終確認する

| AC ID | 基準                                                                                            | 検証結果 |
| ----- | ----------------------------------------------------------------------------------------------- | -------- |
| AC-1  | 認証初期化が10秒以内に完了しない場合、タイムアウトフォールバックUIが表示されること              | □        |
| AC-2  | フォールバックUIに「リトライ」ボタンが含まれ、クリックで認証再初期化が実行されること            | □        |
| AC-3  | フォールバックUIに「設定画面へ」ボタンが含まれ、クリックでSettings画面に遷移できること          | □        |
| AC-4  | Settings画面がAuthGuard認証に依存せず `currentView === "settings"` 経由でアクセス可能であること | □        |
| AC-5  | 認証成功時は従来どおり即座にコンテンツが表示されること                                          | □        |
| AC-6  | タイムアウト後に認証が完了した場合、自動的にコンテンツが表示されること                          | □        |
| AC-7  | ダークモード/ライトモード両方でフォールバックUIが正しく表示されること                           | □        |
| AC-8  | 全既存テストがPASSすること                                                                      | □        |

### タスク2: セキュリティ最終確認

**目的**: セキュリティ面での問題がないことを最終確認する

**チェックリスト**:

| 項目               | 確認内容                                                                            | チェック |
| ------------------ | ----------------------------------------------------------------------------------- | -------- |
| AuthGuard バイパス | `currentView === "settings"` の shell のみが AuthGuard 外であること                 | □        |
| 機密データ         | Settings 画面で Renderer に機密データが露出していないこと                           | □        |
| IPC セキュリティ   | Settings からの IPC 呼び出しが Main Process でバリデーションされること              | □        |
| XSS                | ユーザー入力が既存のサニタイズ経路または React の自動エスケープ経路を通っていること | □        |

### タスク3: コード整合性レビュー

**目的**: 実装がプロジェクト規約に準拠しているか最終確認する

**チェックリスト**:

| 項目             | 確認内容                                       | チェック |
| ---------------- | ---------------------------------------------- | -------- |
| P31 準拠         | 個別セレクタ使用、合成Hook不使用               | □        |
| P48 準拠         | 派生セレクタに useShallow 適用（該当する場合） | □        |
| Apple HIG        | CSS 変数使用、8px グリッド、角丸統一           | □        |
| Atomic Design    | 既存 atoms/molecules の再利用                  | □        |
| 型安全性         | any / as / ! 不使用                            | □        |
| アクセシビリティ | ARIA ラベル、role 属性、キーボード操作         | □        |

### タスク4: 差分レビュー

**目的**: 変更差分が最小限かつ意図通りであることを確認する

**手順**:

```bash
git diff --stat
git diff -- apps/desktop/src/renderer/components/AuthGuard/
git diff -- apps/desktop/src/renderer/App.tsx
```

**確認項目**:

- [ ] 変更ファイル数が想定範囲内（6-7ファイル + テストファイル）
- [ ] 不要な変更が含まれていないこと
- [ ] スコープ外の変更がないこと

## レビューゲート判定

| 判定     | 対応                                           |
| -------- | ---------------------------------------------- |
| PASS     | Phase 11 へ                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | Phase 1 へ戻り要件再確認                       |

**MINOR 指摘の取り扱い**:

- 全ての MINOR 指摘は未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- 未タスク仕様書は `docs/30-workflows/unassigned-task/` に配置

## 参照資料

| 参照資料         | パス                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md`            |
| Phase 5 実装     | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-5-implementation.md`    |
| Phase 1 要件     | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-1-requirements.md`      |
| Phase 9 品質検証 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-9-quality-assurance.md` |

### システム仕様（aiworkflow-requirements）

> 最終レビュー時に以下のシステム仕様との整合性を確認してください。

| 参照資料                 | パス                                                                              | 内容                                              |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| セキュリティ設計原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 最小権限・多層防御・フェイルセキュア・完全仲介    |
| ナビゲーション UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | Settings 導線が `navContract.ts` と整合するか確認 |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Settings bypass のセキュリティ影響評価            |
| 状態管理アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31/P48準拠の最終確認                             |
| 認証セキュリティ設計     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | AuthGuard設計仕様との最終整合確認                 |

## 統合テスト連携

- 最終レビューの結果に基づき、Phase 11 の手動テスト項目を調整

## 成果物

| 成果物                                    | パス                                      |
| ----------------------------------------- | ----------------------------------------- |
| 最終レビュー結果                          | `outputs/phase-10/final-review-result.md` |
| MINOR指摘の未タスク仕様書（該当する場合） | `docs/30-workflows/unassigned-task/`      |

## 完了条件

- [ ] 受け入れ基準（AC-1〜AC-8）が全て満たされていること
- [ ] セキュリティ最終確認が完了していること
- [ ] コード整合性レビューが完了していること
- [ ] 差分レビューが完了していること
- [ ] レビューゲート判定が PASS または MINOR であること
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 11: 手動テストへ進む。UIテスト・E2Eシナリオを実行する。
