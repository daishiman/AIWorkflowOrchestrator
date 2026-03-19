# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 機能名     | skilldetail-action-buttons              |
| Phase      | 10                                      |
| 作成日     | 2026-03-17                              |
| 依存 Phase | Phase 9 成果物（`outputs/phase-9/`）    |

## 目的

TC-01〜TC-08 の受入基準と実装・テスト結果を多角的に照合し、品質・整合性を最終確認する。判定結果に応じて次のアクションを決定する。

## 参照資料

- Phase 1 受入基準: `outputs/phase-1/`（または `phase-1-requirements.md`）
- Phase 2 設計: `outputs/phase-2/`（または `phase-2-design.md`）
- Phase 9 成果物: `outputs/phase-9/`
- タスク実行ルール: `.claude/rules/05-task-execution.md`

## 実行タスク

- タスク 1: AC と TC のトレーサビリティを全件照合する
- タスク 2: 実装・テスト・手動観点の差分をレビュー観点で評価する
- タスク 3: 判定（PASS/MINOR/MAJOR/CRITICAL）を決定し次アクションを確定する
- タスク 4: 最終レビュー成果物を作成し、未タスク化が必要な指摘を切り出す

## TC-01〜TC-08 受入基準照合チェックリスト

以下の各テストケースについて、実装・テスト・動作が受入基準を満たしていることを確認する。

### TC-01: isImported === true 時にボタンが表示される

- [ ] `SkillDetailPanel` に `isImported={true}` を渡したとき、「エディタで開く」ボタンが DOM に存在する
- [ ] `SkillDetailPanel` に `isImported={true}` を渡したとき、「分析する」ボタンが DOM に存在する
- [ ] テストコードで TC-01 に対応するケースが PASS している

### TC-02: isImported === false 時にボタンが非表示になる

- [ ] `SkillDetailPanel` に `isImported={false}` を渡したとき、「エディタで開く」ボタンが DOM に存在しない
- [ ] `SkillDetailPanel` に `isImported={false}` を渡したとき、「分析する」ボタンが DOM に存在しない
- [ ] テストコードで TC-02 に対応するケースが PASS している

### TC-03: 「エディタで開く」ボタンクリックで handleEditSkill が呼ばれる

- [ ] ボタンクリック時に `useSkillCenter` の `handleEditSkill` が1回呼び出される
- [ ] 引数として現在のスキルオブジェクトが渡される
- [ ] テストコードで TC-03 に対応するケースが PASS している

### TC-04: 「分析する」ボタンクリックで handleAnalyzeSkill が呼ばれる

- [ ] ボタンクリック時に `useSkillCenter` の `handleAnalyzeSkill` が1回呼び出される
- [ ] 引数として現在のスキルオブジェクトが渡される
- [ ] テストコードで TC-04 に対応するケースが PASS している

### TC-05: isImported が undefined / null の場合の安全な処理

- [ ] `isImported` が `undefined` のときにエラーが発生しない
- [ ] `isImported` が `undefined` のときボタンが表示されない（falsy 扱い）
- [ ] テストコードで TC-05 に対応するケースが PASS している

### TC-06: handleEditSkill が正しいルート遷移を実行する

- [ ] `handleEditSkill` 呼び出し後にエディタ画面への遷移が行われる
- [ ] 遷移先 URL またはルートパラメータが正しい
- [ ] テストコードで TC-06 に対応するケースが PASS している

### TC-07: handleAnalyzeSkill が正しいルート遷移を実行する

- [ ] `handleAnalyzeSkill` 呼び出し後に分析画面への遷移が行われる
- [ ] 遷移先 URL またはルートパラメータが正しい
- [ ] テストコードで TC-07 に対応するケースが PASS している

### TC-08: アクセシビリティ要件（aria-label, キーボード操作）

- [ ] 各ボタンに適切な `aria-label` が付与されている
- [ ] キーボード（Enter / Space）でボタンを操作できる
- [ ] テストコードで TC-08 に対応するケースが PASS している

## レビュー観点

| 観点             | チェック内容                                             |
| ---------------- | -------------------------------------------------------- |
| 機能要件         | TC-01〜TC-08 が全て充足されているか                      |
| 型安全           | `any` 型・non-null assertion がないか（P19, P48 準拠）   |
| セキュリティ     | IPC 経由のデータに実行時バリデーションがあるか           |
| 状態管理         | Zustand 個別セレクタを使用しているか（P31, P48 準拠）    |
| アクセシビリティ | WCAG 2.1 AA（コントラスト比 4.5:1 以上、キーボード操作） |
| テストカバレッジ | Line 80%+, Branch 60%+, Function 80%+ が維持されているか |

## 判定基準と対応

| 判定     | 条件                         | 対応                                               |
| -------- | ---------------------------- | -------------------------------------------------- |
| PASS     | 全 TC が充足・品質基準クリア | Phase 11 へ進む                                    |
| MINOR    | 軽微な指摘（機能影響なし）   | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 機能要件未充足・設計問題     | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | 受入基準の根本的な未達       | Phase 1 へ戻り要件再確認                           |

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| ファイル                                  | 内容                                      |
| ----------------------------------------- | ----------------------------------------- |
| `outputs/phase-10/final-review-report.md` | TC-01〜TC-08 照合結果と判定               |
| `outputs/phase-10/minor-issues.md`        | MINOR 判定の場合の指摘一覧（0件でも作成） |

## 完了条件

- [ ] TC-01〜TC-08 の受入基準を全て照合している
- [ ] 判定（PASS / MINOR / MAJOR / CRITICAL）を明示している
- [ ] MINOR 判定の場合は未タスク仕様書に変換している（省略不可）
- [ ] MAJOR / CRITICAL 判定の場合は戻り先 Phase を特定している
- [ ] `outputs/phase-10/final-review-report.md` が作成されている

**本Phase内の全タスクを100%実行完了** してから次フェーズへ進むこと。

## 次 Phase

- PASS / MINOR: Phase 11（手動テスト）へ進む
- MAJOR: 影響範囲に応じた Phase へ戻る
- CRITICAL: Phase 1 へ戻る
