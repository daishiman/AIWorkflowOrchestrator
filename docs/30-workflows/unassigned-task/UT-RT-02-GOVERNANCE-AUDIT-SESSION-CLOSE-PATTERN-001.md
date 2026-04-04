# UT-RT-02-GOVERNANCE-AUDIT-SESSION-CLOSE-PATTERN-001

## メタ情報

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| ステータス | 未着手                                                                        |
| 優先度     | Medium                                                                        |
| 起票日     | 2026-04-04                                                                    |
| 起票元     | TASK-RT-02 苦戦箇所記録 — governanceHooks.onSessionEnd() 呼び出し漏れパターン |
| 関連タスク | TASK-RT-02 (stub-response-error-notification), TASK-P0-09 (Governance)        |
| Issue番号  | #1902                                                                         |

## 1. なぜこのタスクが必要か（Why）

TASK-RT-02 の実装中、`plan()` / `improve()` の degraded path（early return）と
`terminal_handoff` path において `governanceHooks.onSessionEnd()` の呼び出しが
漏れていることが Phase 11 の検証で発見された。

`onSessionEnd()` が呼ばれないと audit sink にセッション終了が記録されず、
`getGovernanceState()` の `recentAuditEvents` が不完全になる。
これは audit log の整合性（TASK-P0-09 要件）に違反する。

TASK-RT-02 では修正を行ったが、同様のパターンは他の early return を持つメソッドにも
潜在している可能性がある。パターンを形式化し、lint ルールまたはコードレビューチェック
として定着させることで、将来の断絶を防ぐことが本タスクの目的。

## 2. 何を達成するか（What）

`SkillCreatorGovernanceHooks` の `onSessionStart` / `onSessionEnd` ペアが
すべての実行パス（成功・失敗・early return・例外）で確実に呼ばれることを保証する
仕組みを導入する。

スコープ内:

- `RuntimeSkillCreatorFacade` の全 public メソッドにおける audit session close-out 確認
- `createGovernanceHooks()` を呼ぶすべての箇所で `onSessionEnd` が到達可能か静的解析
- 必要に応じて `try/finally` パターンへのリファクタリング

スコープ外:

- governance policy 自体の変更（TASK-P0-09 スコープ）
- audit sink のストレージ永続化

## 3. どのように実行するか（How）

1. `createGovernanceHooks()` の呼び出し箇所をすべて列挙する
2. 各呼び出しに対し、`onSessionEnd` が全パスで到達可能か追跡する
3. 漏れがある箇所に `try/finally` を適用し `onSessionEnd` を保証する
4. ユニットテストで audit sink に対し `onSessionEnd` 呼び出しを assert するケースを追加する

## 3.5 苦戦箇所と解決策（TASK-RT-02 実装で経験）

| 苦戦箇所                                              | 原因                                                                                     | 解決策                                                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| degraded path の early return で audit が閉じられない | `buildDegradedError()` で即 return するため、`onSessionEnd()` の呼び出しが到達しなかった | 各 degraded path と terminal_handoff path の直前に `onSessionEnd()` を明示的に追加（TASK-RT-02 で修正済み） |
| terminal_handoff path の audit 漏れ                   | terminal_handoff 経路は成功扱いだが audit セッションは開いたまま                         | terminal_handoff 直前に `onSessionEnd()` を追加し、audit 断絶を防止（TASK-RT-02 で修正済み）                |
| 再発防止策が非形式的                                  | コードレビューで口頭指摘するのみで、パターンが明文化されていない                         | `try/finally` ラッパーまたは ESLint カスタムルールによる静的強制を本タスクで形式化する                      |

## 4. 実行手順

1. `grep -n "createGovernanceHooks" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` で呼び出し一覧を取得
2. 各呼び出しの後続コードで `onSessionEnd` への全到達パスをトレースする
3. 漏れがある箇所を `try/finally` パターンで修正する:
   ```typescript
   const governanceHooks = this.createGovernanceHooks(phase);
   governanceHooks.onSessionStart({ sessionId });
   try {
     // ... 処理 ...
   } finally {
     governanceHooks.onSessionEnd({ sessionId, summary });
   }
   ```
4. `SkillCreatorAuditSink` に対して `onSessionEnd` 呼び出し数を assert するテストを追加
5. `pnpm lint` / `pnpm typecheck` を確認

## 5. 完了条件チェックリスト

- [ ] `createGovernanceHooks()` の全呼び出し箇所で `onSessionEnd` が全パスで保証されている
- [ ] `try/finally` または同等の構造が適用されている
- [ ] audit sink に対する `onSessionEnd` 呼び出し回数をアサートするテストが存在する
- [ ] `pnpm lint` / `pnpm typecheck` が通る

## 6. 検証方法

```bash
# governance audit テスト
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/
# audit sink の呼び出し確認
grep -n "onSessionEnd" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

## 7. リスクと対策

| リスク                                     | 影響度 | 対策                                                                    |
| ------------------------------------------ | ------ | ----------------------------------------------------------------------- |
| try/finally 化で既存テストの期待値が変わる | Medium | 変更前にテストを実行し、失敗するケースを特定してから修正する            |
| onSessionEnd が複数回呼ばれる（重複）      | Low    | audit sink 側で idempotency を確保するか、呼び出し前に guard を追加する |

## 8. 参照情報

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/governance.ts`
- `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/outputs/phase-5/implementation-record.md`
- TASK-P0-09 (Governance / Permission / Hooks)

## 9. 備考

TASK-RT-02 では `plan()` / `improve()` / `execute()` の全 degraded path で修正済み。
本タスクは「将来の同種バグを防ぐ構造的改善」として Medium 優先度で backlog 管理する。
`try/finally` パターンは TypeScript 5.2+ の `Symbol.dispose` / `using` 宣言への移行候補でもある。
