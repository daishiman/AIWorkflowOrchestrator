# リファクタリング計画

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 8                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 概要

Phase 5 で実装した計装コードに対し、型安全性・可読性・拡張性の観点でリファクタリングを実施した。
全テストが Green のまま維持されることを確認済み。

---

## リファクタリング内容

### 1. 型安全な trackEvent への移行（実施済み）

Phase 5 の時点から型安全な実装で開始しているため、本フェーズでの追加変更はなし。

| 項目       | 実装状況                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------- |
| 実装前想定 | `trackEvent(eventName: string, payload: Record<string, unknown>)`                            |
| 実装済み   | `trackEvent<K extends keyof SkillWizardEvents>(eventName: K, payload: SkillWizardEvents[K])` |
| 状態       | Phase 5 の時点で型安全化済み。Phase 8 での追加変更なし                                       |

---

### 2. 計装コードの配置方針（hook 追加なし）

計装コードを custom hook に抽出する案を検討したが、以下の理由で見送り、最小構成を維持する。

| 検討項目                  | 決定                     | 理由                                        |
| ------------------------- | ------------------------ | ------------------------------------------- |
| custom hook への抽出      | 見送り                   | 計装が 5 箇所のみで複雑性が増すメリットなし |
| `trackEvent` 呼び出し集約 | 各処理の直前に配置を維持 | 処理との因果関係が明確になる                |
| テストへの影響            | 変更なし                 | 既存の spy パターンで引き続き確認可能       |

---

### 3. CompleteStep の計装分離（実施済み）

`CompleteStep.tsx` は presentational コンポーネントとして維持し、`trackEvent` 呼び出しを持たない設計を Phase 5 から継続。

| 項目                    | 実装状況                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `CompleteStep.tsx`      | `trackEvent` 呼び出しなし。`onNextAction` コールバックのみ受け取る                         |
| `SkillCreateWizard.tsx` | `handleExecuteNow` / `handleOpenInEditor` / `handleCreateAnother` 内で `trackEvent` を発火 |

---

### 4. コメント整理（実施済み）

`trackEvent.ts` の将来差し替えポイントコメントを明確化。

```typescript
// 将来: execution-centric 基盤とは独立した sink に差し替える
// 例: analyticsAdapter.send(eventName, payload);
```

---

## リファクタリング前後の比較

| 観点                  | Before（Phase 5 実装直後） | After（Phase 8 完了）      |
| --------------------- | -------------------------- | -------------------------- |
| 型安全性              | 型安全（Phase 5 から）     | 型安全（変更なし）         |
| hook 追加             | なし                       | なし（見送り決定を記録）   |
| `CompleteStep` の役割 | presentational             | presentational（変更なし） |
| コメント              | 差し替えポイント記載       | より明確に整理             |

---

## テスト Green 維持確認

リファクタリング後も全 15 テストが Green であることを確認した。

| テストファイル                        | Green |
| ------------------------------------- | ----- |
| `trackEvent.test.ts`                  | 4/4   |
| `SkillCreateWizard.tracking.test.tsx` | 11/11 |

---

## 完了条件チェックリスト

- [x] `trackEvent` が型安全な実装であること（Phase 5 から継続）
- [x] hook 追加なしの方針が記録されていること
- [x] `CompleteStep.tsx` が presentational のままであること
- [x] リファクタリング後に全テストが Green であること
