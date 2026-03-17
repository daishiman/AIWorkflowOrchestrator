# Phase 10: 最終レビュー

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001           |
| フェーズ | Phase 10                                       |
| 機能名   | agentview-improve-route                        |
| 作成日   | 2026-03-17                                     |
| 依存     | Phase 9 成果物（outputs/phase-9/、全PASS済み） |

## 目的

多角的な観点から品質・整合性を検証し、Phase 1 で定義した受入基準との照合を行う。レビューゲートを通過した場合のみ Phase 11 へ進む。

## レビューゲート判定基準

| 判定     | 対応                                           |
| -------- | ---------------------------------------------- |
| PASS     | Phase 11 へ                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 影響範囲に応じて Phase 1〜5 へ戻る             |
| CRITICAL | Phase 1 へ戻り要件再確認                       |

## 実行タスク

### Task 1: 受入基準照合

Phase 1 の受入基準と実装を対比する。

- [ ] AgentView に改善 CTA バナーが表示されること
  - 表示条件: `isExecutionComplete === true` かつ `selectedSkillName` が非空
  - 非表示条件: `isExecutionComplete === false`、または `selectedSkillName` が null / undefined / 空文字
- [ ] CTA バナーのクリックで SkillAnalysisView へ遷移すること
- [ ] SkillAnalysisView に `onNavigateBack` コールバックが実装されていること
- [ ] SkillAnalysisView に `onNavigateToAgent` コールバックが実装されていること
- [ ] P31 対策として個別セレクタのみを使用していること

### Task 2: セキュリティレビュー

- [ ] XSS 対策: `selectedSkillName` をそのまま `innerHTML` / `dangerouslySetInnerHTML` に渡していないか
- [ ] `contextIsolation: true`、`nodeIntegration: false` の設定が変更されていないか（`04-electron-security.md` 確認）
- [ ] IPC を新規追加した場合、チャンネル名がホワイトリスト管理されているか

### Task 3: アクセシビリティレビュー（WCAG 2.1 AA）

- [ ] CTA バナーに ARIA ラベルが付与されているか
- [ ] コントラスト比が 4.5:1 以上か（通常テキスト）
- [ ] キーボード操作で CTA バナーにアクセスできるか（Tab + Enter）
- [ ] 色だけで情報を伝えていないか（アイコンまたはテキストを併用）

### Task 4: パフォーマンスレビュー

- [ ] 不要な再レンダーが発生していないか
- [ ] `React.memo` / `useCallback` の適用が適切か
- [ ] `useShallow` の適用が必要な派生セレクタに適用されているか（P48 確認）

### Task 5: コード品質レビュー

- [ ] `any` 型・`@ts-ignore` がゼロか
- [ ] non-null assertion（`!`）がゼロか（P48 確認）
- [ ] 未使用 `import` がゼロか
- [ ] boolean 変数名が `is` / `has` / `can` / `should` プレフィックスか

### Task 6: テスト品質レビュー

- [ ] テスト間で状態が共有されていないか（`beforeEach` でリセット）
- [ ] テスト実行順序に依存する設計になっていないか
- [ ] happy-dom 環境で `userEvent` を使用していないか（P39 確認）

### Task 7: ドキュメント整合性確認

- [ ] コンポーネントの Props 型定義がドキュメント（Phase 2 設計書）と一致しているか
- [ ] 変更が Phase 2 設計から逸脱している場合、その理由が記録されているか

### Task 8: レビュー判定

- [ ] 上記 Task 1〜7 の結果を `outputs/phase-10/review-result.md` に記録
- [ ] PASS / MINOR / MAJOR / CRITICAL を判定して記録
- [ ] MINOR 指摘は全て未タスク仕様書候補としてリストアップ

## 参照資料

- Phase 1 要件定義: `outputs/phase-1/`
- Phase 2 設計: `outputs/phase-2/`
- セキュリティルール: `.claude/rules/04-electron-security.md`
- アーキテクチャルール: `.claude/rules/01-architecture.md`（アクセシビリティ）
- known-pitfalls: `.claude/rules/06-known-pitfalls.md`（P31, P39, P48）
- タスク実行ルール: `.claude/rules/05-task-execution.md`（Phase 10 ゲート）

## 実行手順

1. Task 1〜7 を順に実行してチェック
2. 問題があれば重大度を判定（MINOR / MAJOR / CRITICAL）
3. 判定結果を `review-result.md` に記録
4. PASS / MINOR → Phase 11 へ（MINOR は未タスク変換必須）
5. MAJOR / CRITICAL → 該当 Phase へ戻る

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

```
outputs/phase-10/
  review-result.md         # レビュー結果と判定（PASS/MINOR/MAJOR/CRITICAL）
  minor-task-candidates.md # MINOR 指摘の未タスク候補一覧（0件でも作成）
```

## 完了条件

- [ ] 全チェック項目を実施済み
- [ ] 判定が PASS または MINOR
- [ ] MINOR 指摘が全て未タスク仕様書候補に変換されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次 Phase

PASS / MINOR → Phase 11: 手動テスト
MAJOR → 影響範囲の Phase へ戻る
CRITICAL → Phase 1: 要件定義 へ戻る
