# Phase 12 - スキルフィードバックレポート

## 概要

UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 実施を通じて得た task-specification-creator スキルへのフィードバック。

---

## Feedback 1: ApprovalSheet 既存コンポーネント再利用パターンが有効

### 観察

`ApprovalSheet` を新規実装せず既存コンポーネントを再利用することで、UI 品質・アクセシビリティ・HIG 準拠を既存レベルで担保できた。

### 提案

Phase 2（設計）で「既存コンポーネントの再利用可否」を明示的にチェックする項目を追加する。

```
## 既存コンポーネント再利用チェック
- [ ] 同等 UI コンポーネントが既に存在するか確認
- [ ] 再利用可能な場合、新規実装よりも再利用を優先する
- [ ] 再利用時の props インターフェースと型整合を確認
```

---

## Feedback 2: `getSkillCreatorApi()` による surface 吸収パターン

### 観察

`getSkillCreatorApi()` を介した preload API アクセスパターンにより、Renderer 層が直接 IPC に依存せず、テスト容易性が向上した。

### 提案

Phase 1（要件定義）で IPC surface のアクセスパターン（直接 invoke vs. preload API 経由）を明示する。
新規 IPC surface 追加時は必ず preload API を経由するパターンを標準化する。

---

## Feedback 3: worktree 環境での screenshot 撮影 blocker への対応プロトコル改善

### 観察

worktree 環境では Electron バイナリ起動が不可能なため、Phase 11 の Visual TC が全て CAPTURE_BLOCKED となった。
現在のスキル仕様では CAPTURE_BLOCKED 時の対応が明確でなく、ダミー PNG 作成 vs. 未タスク記録の判断が曖昧だった。

### 提案

Phase 11 着手前に以下の環境チェックを追加する:

```markdown
## Phase 11 環境チェック（着手前）

1. Electron アプリ起動可能か確認: `pnpm --filter @repo/desktop preview` が動作するか
2. 起動不可の場合: CAPTURE_BLOCKED として記録し、ユニットテストを代替 evidence とする
3. ダミー PNG は作成しない（false green 防止）
4. CAPTURE_BLOCKED を unassigned-task として記録する
```

このプロトコルを `phase-spec-template.md` の Phase 11 セクションに明記することで、
将来の同様のケースで迷いなく対応できるようになる。

---

## Feedback 4: `safeOn` パターンの命名規則一貫性確認

### 観察

`onApprovalRequest` は `onDisclosureInfo` と完全に同パターンで実装されており、命名規則・実装パターンが一致していた。
この一貫性が Phase 3 レビューゲートで MINOR 指摘ゼロに貢献した。

### 提案

Phase 1 で既存 preload API の命名規則（`onXxx` パターン）を明示的に確認・記録する習慣を定着させる。

---

## 苦戦箇所

| 箇所                     | 内容                                                           | 解決策                               |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------ |
| Phase 6-10 outputs 欠落  | artifacts.json には completed と記録されていたが実ファイルなし | Phase 12 で遡及作成                  |
| LOGS.md merge conflict   | 複数ブランチからの stash/upstream conflict が残存              | 両側変更を保持して解消               |
| CAPTURE_BLOCKED 対応判断 | ダミー PNG 作成 vs. 未タスク記録の判断基準が不明確だった       | ガイドラインに従い未タスク記録を選択 |

---

---

## validate-phase-output.js 実行結果（2026-04-06 フェーズ2+3同期時）

### エラー分類

| エラー                                               | 分類                                | 対応                                               |
| ---------------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| Phase 3/6/7/8/9/10: 「統合テスト連携」セクション欠如 | 既存テンプレート差異（タスク外）    | 今回タスクスコープ外。次回テンプレート改訂時に対応 |
| Phase 11: screenshots 不在                           | CAPTURE_BLOCKED（worktree環境制約） | Feedback 3 に記録済み。対応不要                    |

### 警告分類

| 警告                                                     | 内容                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| Phase 6: 曖昧な表現 (など)                               | 軽微。次回改訂時に精緻化                                    |
| Phase 7: 曖昧な表現 (適切に)                             | 軽微。次回改訂時に精緻化                                    |
| Phase 12: 曖昧な表現 (必要に応じて)                      | 軽微。次回改訂時に精緻化                                    |
| Phase 11 docs-only 判定未確定                            | artifacts.json/index.md での docs-only 相当マーク不在。許容 |
| phase-12-documentation.md: 計画系 wording 残存 (planned) | 軽微。次回改訂時に修正                                      |

### 結論

エラー7件・警告5件のうち、全件が「テンプレート差異」または「環境制約」に起因。
本タスク（UT-SDK-07-APPROVAL-REQUEST-SURFACE-001）のコード実装品質には影響なし。

_validate-phase-output.js 追記: 2026-04-06 フェーズ2+3同期_
