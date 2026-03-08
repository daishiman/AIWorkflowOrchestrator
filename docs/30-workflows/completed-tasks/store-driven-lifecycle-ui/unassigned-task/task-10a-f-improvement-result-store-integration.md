# improvementResult Store統合 - タスク指示書

## メタ情報

```yaml
issue_number: 1039
```

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-10A-F-IMPROVEMENT-RESULT-STORE-INTEGRATION         |
| タスク名     | improvementResult Store統合                           |
| 分類         | 改善                                                  |
| 対象機能     | スキル分析改善結果の状態管理                          |
| 優先度       | 低                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | Phase 12（TASK-10A-F 設計判断: Case B方式の将来課題） |
| 発見日       | 2026-03-07                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F で `useSkillAnalysis.ts` をStore駆動に移行した際、`improvementResult`（改善提案の適用結果）はローカルstate維持とした（Case B方式）。これは `applySkillImprovements` Store actionの戻り値が `Promise<void>` であり、改善結果（ImprovementResult）がStore stateに含まれていないため。

### 1.2 問題点・課題

- `improvementResult` がローカルstateのため、他画面（SkillCenterView等）から改善結果を参照できない
- スキル改善のワークフローが画面遷移をまたぐ場合、結果が失われる
- Store駆動アーキテクチャの一貫性が部分的に崩れている

### 1.3 放置した場合の影響

- 改善結果の画面間共有が必要になった際に、追加のStore拡張が必要
- 現時点では単一画面内の操作完結型のため、機能的な影響は**なし**
- アーキテクチャ上の不整合が残存するが、即座の問題にはならない

---

## 2. 何を達成するか（What）

### 2.1 目的

`improvementResult` を agentSlice のStore stateに追加し、スキル改善結果を画面横断で共有可能にする。

### 2.2 最終ゴール

- `useLastImprovementResult()` 個別セレクタでStore stateから改善結果を取得可能
- `applySkillImprovements` Store action が改善結果をStore stateに保存
- `useSkillAnalysis.ts` のローカル `improvementResult` useState を削除

### 2.3 スコープ

#### 含むもの

- agentSlice に `lastImprovementResult: ImprovementResult | null` state 追加
- `applySkillImprovements` action 内で改善結果をStore stateに保存
- store/index.ts に `useLastImprovementResult()` セレクタ追加
- `useSkillAnalysis.ts` のローカルstate削除・Store参照に置換

#### 含まないもの

- SkillAnalysisView の UI 変更
- ImprovementResult 型の変更
- 他画面での改善結果表示UI追加

### 2.4 成果物

- 拡張済み `agentSlice.ts`
- 更新済み `store/index.ts`
- 更新済み `useSkillAnalysis.ts`
- 更新済みテストファイル

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F が完了していること（完了済み: 2026-03-07）
- 改善結果の画面間共有ニーズが実際に発生していること

### 3.2 依存タスク

| タスクID   | 内容                             | ステータス |
| ---------- | -------------------------------- | ---------- |
| TASK-10A-F | スキルライフサイクルUI Store移行 | 完了       |

### 3.3 必要な知識

- Zustand Store Slice設計（agentSlice の構造）
- ImprovementResult 型定義（`@repo/shared/types/skill-improver`）
- P31/P48 対策パターン

### 3.4 推奨アプローチ

1. agentSlice に `lastImprovementResult` state を追加
2. `applySkillImprovements` action の成功時に `set({ lastImprovementResult: result })` で保存
3. `clearAnalysis` action で `lastImprovementResult` もクリア
4. store/index.ts に `useLastImprovementResult` 個別セレクタを追加
5. useSkillAnalysis.ts のローカル `improvementResult` useState を Store 参照に置換

---

## 4. 実行手順

### Phase構成

小規模タスクのため Phase 4-5-9-12 の4フェーズ構成。

### Phase 4-5: テスト作成→実装

#### 目的

ImprovementResult のStore統合を実装

#### 手順

1. agentSlice に `lastImprovementResult: ImprovementResult | null` を初期値 `null` で追加
2. `applySkillImprovements` action の try ブロック内で `set({ lastImprovementResult: result })` を追加
3. store/index.ts に `useLastImprovementResult` セレクタを追加
4. useSkillAnalysis.ts の `const [improvementResult, setImprovementResult] = useState(null)` を削除し `const improvementResult = useLastImprovementResult()` に置換
5. テストを更新

#### 成果物

修正済みソースコード + テスト

#### 完了条件

- useSkillAnalysis.ts に `improvementResult` の useState がない
- Store 経由で改善結果が取得可能
- テスト全PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useLastImprovementResult()` でStore stateから改善結果を取得可能
- [ ] `applySkillImprovements` 成功時に改善結果がStoreに保存される
- [ ] `clearAnalysis` で改善結果もクリアされる

### 品質要件

- [ ] テスト全PASS
- [ ] TypeScript型チェック PASS
- [ ] P31準拠（個別セレクタ使用）

### ドキュメント要件

- [ ] arch-state-management.md に更新反映
- [ ] lessons-learned.md に教訓追記

---

## 6. 検証方法

### テストケース

- `applySkillImprovements` 成功後に `lastImprovementResult` がnon-nullになること
- `clearAnalysis` 後に `lastImprovementResult` がnullになること
- エラー時に `lastImprovementResult` が変更されないこと

### 検証手順

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx
```

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                               |
| ------------------------------------- | ------ | -------- | -------------------------------------------------- |
| applySkillImprovements の戻り値型変更 | 中     | 中       | IPC ハンドラの戻り値を確認し、型定義を先に整備     |
| Store state肥大化                     | 低     | 低       | ImprovementResult はスカラーに近い単一オブジェクト |

---

## 8. 参照情報

### 関連ドキュメント

- `arch-state-management.md` - TASK-10A-F セクション（Case B方式の設計判断記録、Store/ローカル状態の分類基準テーブル6件、個別セレクタ使用一覧17件）
- `architecture-implementation-patterns.md` - S26（直接IPC→Store移行パターン、7ステップチェックリスト）
- `lessons-learned.md` - TASK-10A-F 苦戦箇所（実装系）#3（improvementResult Store化見送り判断）、再利用手順（Store移行共通）

### 参考資料

- `@repo/shared/types/skill-improver` - ImprovementResult 型定義
- `agentSlice.ts` L840-970 - 既存スキルライフサイクルアクション

---

## 9. 備考

### TASK-10A-F からの教訓（苦戦箇所）

- Case B方式で「ローカルstate維持」と判断した設計根拠: `applySkillImprovements` の戻り値が `Promise<void>` で、改善結果がStore stateに含まれていなかった
- 将来的に改善結果の画面間共有が必要になった場合のみ実施する「条件付き」タスク
- IPC ハンドラ側で `ImprovementResult` を返すように変更が必要な可能性がある（現在は void return）

### 補足事項

- 優先度「低」: 現時点では単一画面内で完結しており、機能的な問題は発生していない
- 実施判断: 改善結果の画面間共有ニーズが実際に発生した時点で実施を検討
