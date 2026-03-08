# UT-PERSIST-VALIDATION-002: Zustand Persist 全フィールド iterable ガード拡張

## メタ情報

```yaml
issue_number: 1071
```

## メタ情報

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-PERSIST-VALIDATION-002                                                  |
| タスク名     | Zustand Persist 全フィールド iterable ガード拡張                           |
| 分類         | 改善                                                                       |
| 対象機能     | Zustand Store persist state の型安全性                                     |
| 優先度       | 低                                                                         |
| 見積もり規模 | 小規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 Phase 10（最終レビュー）  |
| 発見日       | 2026-03-08                                                                 |
| 関連タスク   | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001, UT-PERSIST-MIGRATION-001 |

## 1. Why（背景）

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001では、`viewHistory`（Array）と`expandedFolders`（Set）に対するiterableガードを実装した。しかし、persist対象のstateには他にも配列やオブジェクト型のフィールドが存在し（例: `recentExecutions`, `importedSkills`, `pinnedSkills`等）、これらが同様の破損リスクを持つ。Phase 10の最終レビューでMINOR判定として指摘された。

## 2. 問題点・課題

1. **ガード範囲の不完全性**: viewHistory/expandedFolders以外のpersist対象フィールドにiterableガードがない
2. **破損パターンの網羅不足**: 配列型フィールドが`null`や`undefined`に破損した場合、`.map()`や`.filter()`で例外が発生する
3. **一貫性の欠如**: 一部フィールドにのみガードがあり、他にはない状態は保守性が低い

## 3. 放置した場合の影響

- `recentExecutions`等の配列フィールドが破損した場合、UIコンポーネントがクラッシュする
- 特にagentSliceのフィールド（`importedSkills`, `availableSkills`等）は頻繁にアクセスされるため影響が大きい

## 4. What（達成目標）

### 4.1 目的

persist対象の全配列/Set型フィールドに対して、customStorage.getItemでの復元時にiterableガードを適用し、破損入力に対する耐性を確保する。

### 4.2 最終ゴール

- persist対象の全配列フィールドに`Array.isArray`ガードが適用されている
- persist対象のSetフィールドに`instanceof Set`ガードが適用されている
- 各ガードに対応するユニットテストが存在する

### 4.3 スコープ

**含むもの:**

- `customStorage.getItem`内で全persist対象フィールドのiterableガード追加
- ガードをヘルパー関数化して再利用可能にする
- 各フィールドの破損テスト追加

**含まないもの:**

- persist対象フィールドの追加・削除
- sliceアクション内のガード追加（既にviewHistoryで実施済みパターンの横展開は含まない）
- UIコンポーネント側のnullish防御

### 4.4 成果物

| 種別   | 成果物                    | 配置先                                                             |
| ------ | ------------------------- | ------------------------------------------------------------------ |
| 実装   | ガードヘルパー関数        | `apps/desktop/src/renderer/store/persist-guards.ts`（新規）        |
| 実装   | customStorage.getItem拡張 | `apps/desktop/src/renderer/store/index.ts`                         |
| テスト | 破損フィールドテスト      | `apps/desktop/src/renderer/store/__tests__/persist-guards.test.ts` |

## 5. How（実行方法）

### 5.1 前提条件

- TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001が完了していること
- customStorage.getItemにviewHistory/expandedFoldersのガードが実装済みであること

### 5.2 推奨アプローチ

```typescript
// persist-guards.ts - 再利用可能なガードヘルパー
export function ensureArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback;
}

export function ensureSet<T>(
  value: unknown,
  fallback: Set<T> = new Set(),
): Set<T> {
  if (value instanceof Set) return value;
  if (Array.isArray(value))
    return new Set(value.filter((v): v is T => v != null));
  return fallback;
}

export function ensureString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

// customStorage.getItem での適用
getItem: (name: string) => {
  // ... 既存のパース処理
  if (parsed.state) {
    parsed.state.viewHistory = ensureArray(parsed.state.viewHistory, [
      "dashboard",
    ]);
    parsed.state.expandedFolders = ensureSet(parsed.state.expandedFolders);
    parsed.state.recentExecutions = ensureArray(parsed.state.recentExecutions);
    parsed.state.importedSkills = ensureArray(parsed.state.importedSkills);
    // ... 他のフィールド
  }
};
```

### 5.3 Phase構成

| Phase   | 内容                                          |
| ------- | --------------------------------------------- |
| Phase 1 | persist対象フィールドの棚卸しとガード関数設計 |
| Phase 2 | ガードヘルパー関数の実装・テスト作成（TDD）   |
| Phase 3 | customStorage.getItemへの統合                 |
| Phase 4 | 品質検証・ドキュメント更新                    |

## 6. 実装課題と解決策（親タスクからの教訓）

### 課題1: 全アクセスパスの網羅

| 項目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 課題     | stateフィールドへのアクセスパスがslice内アクションだけでなく、store/index.tsのセレクタHookにも存在する          |
| 発見経緯 | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001で`useCanGoBack`セレクタにガード漏れを発見                      |
| 解決策   | `grep -rn "フィールド名" apps/desktop/src/renderer/`で全アクセスパスを検出し、ガード適用範囲を決定              |
| 教訓     | customStorage.getItemでガードすればslice/セレクタ側のガードは冗長だが、多層防御として両方維持する               |
| 参照     | [arch-state-management.md](/.claude/skills/aiworkflow-requirements/references/arch-state-management.md) v3.11.0 |

### 課題2: Set/Array 変換の一貫性

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 課題     | `expandedFolders`のgetItem（Array→Set変換）とsetItem（Set→Array変換）が対称でないとデータ損失が発生 |
| 発見経緯 | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001のPhase 5でgetItem/setItem両方の実装が必要と判明    |
| 解決策   | `ensureSet`ヘルパーでArray入力も受け付けるようにし、getItem側のみでSet化を行う                      |
| 教訓     | JSON永続化ではSetは自動的にArrayに変換される。復元パスでのSet化は1箇所に集約する                    |

### 課題3: テスト設計における破損値の選択

| 項目     | 内容                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| 課題     | 破損値として何をテストすべきか（null, undefined, 数値, 文字列, オブジェクト等）                            |
| 発見経緯 | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001のテストで5種類の破損値を使用                              |
| 解決策   | 最低限 null, undefined, 非対象型（数値/文字列/オブジェクト）の3パターンをテスト                            |
| 教訓     | persist破損の最も一般的なケースはnull/undefinedだが、型混在（数値がArrayフィールドに入る等）もカバーすべき |

## 7. 完了条件チェックリスト

### 機能要件

- [ ] persist対象の全配列フィールドに`ensureArray`ガードが適用されている
- [ ] persist対象のSetフィールドに`ensureSet`ガードが適用されている
- [ ] 破損入力時にデフォルト値へフォールバックする

### 品質要件

- [ ] ガードヘルパー関数のユニットテストが全PASS
- [ ] 各フィールドの破損テスト（最低3パターン）が全PASS
- [ ] 既存テストが回帰なし
- [ ] TypeScript型エラーなし

### ドキュメント要件

- [ ] persist-guards.ts のインターフェースがドキュメント化されている
- [ ] arch-state-management.md にガードパターンが記載されている

## 8. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                              |
| -------------------------------- | ------ | -------- | ----------------------------------------------------------------- |
| ガード対象フィールドの見落とし   | 中     | 中       | partialize関数の対象フィールドを全列挙して照合                    |
| ガードによるパフォーマンス低下   | 低     | 低       | getItem時のみ実行されるため影響は起動時のみ                       |
| UT-PERSIST-MIGRATION-001との競合 | 中     | 中       | migration側はバージョン管理、本タスクはフィールド検証と責務を分離 |

## 9. 参照情報

### 関連ドキュメント

- [arch-state-management.md](/.claude/skills/aiworkflow-requirements/references/arch-state-management.md) - customStorage 3段ガードパターン
- [06-known-pitfalls.md](/.claude/rules/06-known-pitfalls.md) - P19（型キャストバイパス）, P48（non-null assertion）
- TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 outputs/phase-12/implementation-guide.md

## 10. 備考

- UT-PERSIST-MIGRATION-001と並行実施可能だが、本タスクが先に完了していることが望ましい（migrate関数がガードヘルパーを利用できる）
- ガードヘルパー関数は将来の新規Sliceフィールド追加時にも再利用可能な設計とする
