# 未タスク指示書: UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001

```yaml
issue_number: 1487
```

## メタ情報

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| タスクID   | UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001                              |
| 由来       | UT-EXECUTION-ENV-TERMINAL-001 30種思考法レビュー AC-5 設計乖離（2026-03-23） |
| ステータス | unassigned                                                                   |
| 優先度     | 中                                                                           |
| 作成日     | 2026-03-23                                                                   |
| 関連仕様書 | docs/30-workflows/execution-env-terminal/phase-2-design.md (Concern C-3)     |

## 目的

Phase 2 設計 Concern C-3 で規定された Renderer 側エラー表示 UI を実装する。Provider/Model 未選択時にユーザーへエラーメッセージを表示し、設定画面への遷移 CTA を提供する。

## 背景

UT-EXECUTION-ENV-TERMINAL-001 では `assertNoSilentFallback()` ガード（Main プロセス側）を実装したが、設計書 C-3 で規定された Renderer 側のエラー表示 UI（`data-testid="terminal-config-error"`）は未実装のまま。テスト T-5 は Main 側ガードのエラーメッセージ文言テストであり、Renderer UI の検証にはなっていない。

## 実行タスク

1. `ExecutionEnvironment/index.tsx` の terminal ケースに Provider/Model 未選択時のエラー表示 UI を追加
2. エラー表示に設定画面への遷移ボタン（CTA）を含める
3. `data-testid="terminal-config-error"` を付与
4. unit test で Renderer エラー UI の表示を検証

## 受入基準

- [ ] Provider/Model 未選択時に Renderer 側でエラーメッセージが表示される
- [ ] 設定画面への遷移 CTA が表示される
- [ ] `data-testid="terminal-config-error"` が DOM に存在する
- [ ] unit test でエラー表示・CTA の動作が検証されている

## 苦戦箇所・知見（親タスクからの引き継ぎ）

- Main プロセスの `assertNoSilentFallback()` と Renderer 側エラー UI は独立した Concern（C-2 と C-3）として設計されたが、AC-5 のテスト（T-5）が Main 側ガードの文言テストのみであったため、Renderer UI の未実装が Phase 10 最終レビューで見逃された
- Renderer 側でエラー状態を検知するには、Main プロセスからの IPC レスポンスのエラーコードを利用するか、Zustand store の `handoffGuidance` slice と連携する必要がある。設計時に IPC エラーの伝搬経路を明確にすること
- `ExecutionEnvironment` コンポーネントは `PLACEHOLDER_CONFIG` を使ったパターンで統一されているため、エラー表示もこのパターンに合わせるとコードの一貫性が保たれる
