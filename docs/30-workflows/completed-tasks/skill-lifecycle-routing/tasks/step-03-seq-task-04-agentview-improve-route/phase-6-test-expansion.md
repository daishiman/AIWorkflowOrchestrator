# Phase 6: テスト拡充

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| フェーズ | Phase 6                              |
| 機能名   | agentview-improve-route              |
| 作成日   | 2026-03-17                           |
| 依存     | Phase 5 成果物（outputs/phase-5/）   |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、境界値・異常系テストを追加してカバレッジ基準を充足させる。

## 実行タスク

### Task 1: カバレッジレポート取得

- [ ] `pnpm --filter @repo/desktop exec vitest run --coverage` を実行
- [ ] Line / Branch / Function の各カバレッジ値を記録
- [ ] カバレッジ不足箇所をリストアップ（80% / 60% / 80% 未満の箇所）

### Task 2: 境界値テスト追加

#### AgentView — CTA バナー表示条件

- [ ] `isExecutionComplete=true` かつ `selectedSkillName` が非空文字列 → バナー表示
- [ ] `isExecutionComplete=false` かつ `selectedSkillName` が非空文字列 → バナー非表示
- [ ] `isExecutionComplete=true` かつ `selectedSkillName=null` → バナー非表示
- [ ] `isExecutionComplete=true` かつ `selectedSkillName=undefined` → バナー非表示
- [ ] `isExecutionComplete=true` かつ `selectedSkillName=""` （空文字列）→ バナー非表示
- [ ] `isExecutionComplete=true` かつ `selectedSkillName="   "` （スペースのみ）→ バナー非表示（P42対策）

#### SkillAnalysisView — ナビゲーションコールバック

- [ ] `onNavigateBack` が未定義（省略）→ 戻るボタンが描画されない、またはクリック時エラーにならない
- [ ] `onNavigateToAgent` が未定義（省略）→ エージェントへ進むボタンが描画されない、またはクリック時エラーにならない
- [ ] `onNavigateBack` 呼び出し → 正しく1回だけ呼ばれることを検証
- [ ] `onNavigateToAgent` 呼び出し → 正しく1回だけ呼ばれることを検証

### Task 3: アニメーションテスト追加

- [ ] CTA バナーの mount 時アニメーションクラスが付与されること（CSS クラスの存在検証）
- [ ] `isExecutionComplete` が `false → true` に変化したとき、バナーが正しく現れること（アニメーション状態遷移）
- [ ] happy-dom 環境制約を考慮し `fireEvent` を使用（P39対策）
- [ ] `userEvent` は使用禁止（P39対策）

### Task 4: P31 対策テスト追加

- [ ] 個別セレクタ（`useIsExecutionComplete`, `useSelectedSkillName` 等）が useEffect 依存配列に含まれても無限ループしないことを検証
- [ ] `renderHook` でタイムアウトが発生しないことを確認（P48対策）

### Task 5: エラー境界テスト

- [ ] `onNavigateToAgent` が例外をスローした場合の UI フォールバック挙動を検証
- [ ] `selectedSkillName` に特殊文字（`<script>`, `/`, `..`）が含まれる場合のサニタイズ検証

## 参照資料

- Phase 5 実装: `outputs/phase-5/`
- known-pitfalls: `.claude/rules/06-known-pitfalls.md`（P31, P39, P42, P48）
- カバレッジ基準: `.claude/rules/02-code-quality.md`

## 実行手順

1. `pnpm --filter @repo/desktop exec vitest run --coverage` でレポート取得
2. 不足箇所を特定して `*.test.tsx` に追記
3. テストが全 PASS することを確認
4. カバレッジが基準値以上であることを確認 → Phase 7 へ

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

```
outputs/phase-6/
  coverage-report-before.txt   # 追加前のカバレッジ数値
  coverage-report-after.txt    # 追加後のカバレッジ数値
  test-additions.md            # 追加したテストケース一覧
```

## 完了条件

- [ ] 境界値テスト（`selectedSkillName=null/undefined/""/"   "`）が全 PASS
- [ ] アニメーションテストが全 PASS
- [ ] P31/P48 無限ループテストが全 PASS
- [ ] カバレッジ数値が Phase 7 基準（Line 80%+, Branch 60%+, Function 80%+）に近づいていること
- [ ] **本Phase内の全タスクを100%実行完了**

## 次 Phase

→ Phase 7: カバレッジ確認
