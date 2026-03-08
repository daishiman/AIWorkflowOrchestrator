# UT-PERSIST-MIGRATION-001: Zustand Persist バージョニングとマイグレーション機構

## メタ情報

```yaml
issue_number: 1072
```

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-PERSIST-MIGRATION-001                                  |
| タスク名     | Zustand Persist バージョニングとマイグレーション機構      |
| 分類         | 改善                                                      |
| 対象機能     | Zustand Store persist ミドルウェア                        |
| 優先度       | 中                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 Phase 12 |
| 発見日       | 2026-03-08                                                |
| 関連タスク   | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001          |

---

## 1. Why（背景）

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001で、Zustand persistミドルウェアによって永続化されたstateが破損（null, undefined, 数値, 文字列, オブジェクトなど非配列値）した場合にアプリがクラッシュする問題を修正した。現在は各アクション内で`Array.isArray`ガードを設置しているが、persist stateの「バージョン」管理とマイグレーション機構がないため、将来のstate構造変更時に同様の破損が発生するリスクが残存している。

### 問題点・課題

1. **バージョン管理なし**: persistされたstateにバージョン番号がなく、構造変更を検知できない
2. **マイグレーション未実装**: Zustand persistの`migrate`オプションが未使用。古い構造のstateを新しい構造に変換する仕組みがない
3. **リセット手段なし**: 破損stateを検知した場合に、ユーザー操作でstateをリセットする手段がない

### 放置した場合の影響

- state構造変更（フィールド追加・型変更）時に既存ユーザーのローカルストレージデータが破損し、`object is not iterable`等のランタイムエラーが発生する
- 破損時の復旧にはDevToolsでのlocalStorage手動クリアが必要で、非技術者ユーザーには対応不可

---

## 2. What（達成目標）

### 目的

Zustand persistミドルウェアに`version`と`migrate`オプションを導入し、state構造変更時の安全なマイグレーションを実現する。

### 最終ゴール

- persistされたstateにバージョン番号が付与されている
- バージョン不一致時にマイグレーション関数が実行される
- 破損stateの検知と自動復旧が機能する

### スコープ

**含むもの:**

- `store/index.ts`のpersist設定に`version`オプション追加
- `migrate`関数の実装（現在のstateをv1として定義）
- 破損検知時のフォールバック（デフォルト値へのリセット）
- マイグレーションのユニットテスト

**含まないもの:**

- UIからのstate手動リセット機能（別タスク化）
- 他のelectron-store永続化パターンの変更
- バックエンドとのstate同期

### 成果物

| 種別         | 成果物                      | 配置先                                                         |
| ------------ | --------------------------- | -------------------------------------------------------------- |
| 実装         | persist version/migrate設定 | `apps/desktop/src/renderer/store/index.ts`                     |
| 実装         | マイグレーション関数        | `apps/desktop/src/renderer/store/migrations.ts`（新規）        |
| テスト       | マイグレーションテスト      | `apps/desktop/src/renderer/store/__tests__/migrations.test.ts` |
| ドキュメント | 実装ガイド                  | `outputs/phase-12/implementation-guide.md`                     |

---

## 3. How（実行方法）

### 前提条件

- TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001が完了していること
- `customStorage`のgetItem/setItemにiterableガードが実装済みであること

### 推奨アプローチ

```typescript
// store/index.ts - persist設定にversion/migrateを追加
persist((set, get, api) => ({ ...createAllSlices(set, get, api) }), {
  name: "app-store",
  version: 1, // 現在のstate構造バージョン
  storage: customStorage,
  migrate: (persistedState: unknown, version: number) => {
    // v0 → v1: 初回マイグレーション（既存stateの正規化）
    if (version === 0) {
      const state = persistedState as Record<string, unknown>;
      return {
        ...state,
        viewHistory: Array.isArray(state?.viewHistory)
          ? state.viewHistory
          : ["dashboard"],
        expandedFolders:
          state?.expandedFolders instanceof Set
            ? state.expandedFolders
            : new Set<string>(),
      };
    }
    return persistedState as AppState;
  },
  partialize: (state) => ({
    /* 永続化対象フィールド */
  }),
});
```

### Phase構成

| Phase   | 内容                                              |
| ------- | ------------------------------------------------- |
| Phase 1 | マイグレーション関数の設計・テスト作成（TDD Red） |
| Phase 2 | persist設定への version/migrate 統合（TDD Green） |
| Phase 3 | 既存customStorageガードとの統合テスト             |
| Phase 4 | リファクタリング・品質検証                        |
| Phase 5 | ドキュメント更新                                  |

### 3.5 実装課題と解決策（親タスクからの教訓）

#### 課題1: customStorage.getItem での Set/Array 変換境界

| 項目     | 内容                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| 課題     | `expandedFolders`はSetだがJSON永続化時にArrayに変換される。復元時にSetに戻す処理が複数箇所に分散                      |
| 発見経緯 | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001のPhase 5で、customStorage.getItemとsetItemの両方にガードが必要と判明 |
| 解決策   | `migrate`関数に集約し、customStorageのガードはフォールバック専用に限定                                                |
| 教訓     | Set/Array変換は1箇所に集約する。getItemとsetItemに分散すると保守コストが倍増する                                      |
| 参照     | [arch-state-management.md](/.claude/skills/aiworkflow-requirements/references/arch-state-management.md) v3.11.0       |

#### 課題2: canGoBack セレクタの防御漏れ

| 項目     | 内容                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題     | navigationSlice内のガードは完璧でも、store/index.tsの`useCanGoBack`セレクタにArray.isArrayガードがなかった                                       |
| 発見経緯 | SubAgentがnavigationSlice修正を完了した後、メインエージェントがstore/index.tsのセレクタを確認して発見                                            |
| 解決策   | 全アクセスパス（slice内アクション＋外部セレクタ）を網羅的に検証する                                                                              |
| 教訓     | Zustand stateへのアクセスパスはslice内だけでなく、外部セレクタHookにも存在する。`grep -rn "viewHistory" apps/desktop/src/`で全参照を検出すること |
| 参照     | [06-known-pitfalls.md P19](/.claude/rules/06-known-pitfalls.md)（型キャストバイパス）                                                            |

#### 課題3: 多層防御の設計原則

| 項目     | 内容                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | どの層（hydrate/serialize/action）にガードを置くべきか判断が必要                                                                                                     |
| 発見経緯 | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001の設計Phase                                                                                                          |
| 解決策   | 3層全てにガードを設置（Defense in Depth）: Store Hydrate（customStorage.getItem） → Store Serialize（customStorage.setItem） → Navigation Actions（navigationSlice） |
| 教訓     | persist破損は予測不可能なため、1層だけのガードでは不十分。各層で独立して安全性を保証する                                                                             |
| 参照     | [04-electron-security.md](/.claude/rules/04-electron-security.md)（多層防御原則）                                                                                    |

---

## 4. 完了条件チェックリスト

### 機能要件

- [ ] persist設定に`version: 1`が設定されている
- [ ] `migrate`関数がv0→v1のマイグレーションを処理する
- [ ] 破損stateからデフォルト値へのフォールバックが機能する
- [ ] 既存のcustomStorageガードとの共存が正常動作する

### 品質要件

- [ ] マイグレーション関数のユニットテストが全PASS
- [ ] 既存の全テスト（81件+α）が回帰なし
- [ ] TypeScript型エラーなし
- [ ] カバレッジ: Line 80%以上

### ドキュメント要件

- [ ] implementation-guide.md に persist versioning パターンを記載
- [ ] arch-state-management.md にマイグレーション設計を反映

---

## 5. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                         |
| --------------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| 既存ユーザーのstateがv0として扱われない | 高     | 中       | version未設定時はv0とみなすデフォルト動作を確認              |
| migrate関数内の例外でアプリ起動不能     | 高     | 低       | try-catchでデフォルトstateへフォールバック                   |
| customStorageガードとmigrateの二重処理  | 低     | 中       | 責務境界を明確化（migrateは構造変換、customStorageは型安全） |

---

## 6. 参照情報

### 関連ドキュメント

- [arch-state-management.md](/.claude/skills/aiworkflow-requirements/references/arch-state-management.md) - 状態管理パターン
- [06-known-pitfalls.md](/.claude/rules/06-known-pitfalls.md) - P19, P48
- [architecture-implementation-patterns.md](/.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
- TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 outputs/phase-12/implementation-guide.md

### 参考資料

- [Zustand persist middleware - Migration](https://docs.pmnd.rs/zustand/integrations/persisting-store-data#migrate)

---

## 7. 備考

- Zustand persist の `version` オプションは、persistされたstateのバージョンが現在のバージョンより低い場合に `migrate` を自動実行する
- `version` 未指定時のデフォルトは `0` であるため、初回設定で `version: 1` とすれば既存stateは自動的にマイグレーション対象となる
