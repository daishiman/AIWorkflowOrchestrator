# usePortalMenuカスタムHook抽出 - タスク指示書

## メタ情報

```yaml
issue_number: 711
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-PORTAL-HOOK-001                           |
| タスク名     | usePortalMenuカスタムHook抽出                  |
| 分類         | リファクタリング                               |
| 対象機能     | Portal Menu UI                                 |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | Phase 12 - AUTH-UI-002                         |
| 発見日       | 2026-02-05                                     |
| 親タスク     | AUTH-UI-002（アバター編集メニューz-index修正） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-002タスクでReact Portalを使用したメニュー実装を行った。現在、Portal関連のロジック（state管理、イベントハンドリング、位置計算、ARIA属性）がAccountSection/index.tsxに直接記述されている。

**関連システム仕様書**:

- `ui-ux-portal-patterns.md` - Portal実装パターン

### 1.2 問題点・課題

| 現状                                             | 問題点                             |
| ------------------------------------------------ | ---------------------------------- |
| Portal機能がコンポーネント内に直接実装           | 再利用時にコピペが必要             |
| 他のコンポーネントでPortalメニューを実装する場合 | 同じロジックを再実装する必要がある |
| テスト対象がコンポーネント全体                   | Hook単体テストができない           |

### 1.3 放置した場合の影響

| 影響                                      | 重大度 |
| ----------------------------------------- | ------ |
| 現時点では影響なし（1箇所のみ使用）       | 低     |
| 将来、複数のPortalメニュー実装時にDRY違反 | 中     |
| コードの重複によるメンテナンス性低下      | 中     |

### 1.4 実施判断基準

以下の**いずれか**の条件を満たした場合に実施を検討：

- [ ] 他のコンポーネントでPortalメニューを実装する必要が発生した
- [ ] リファクタリングスプリントが計画された
- [ ] 共通コンポーネントライブラリの整備が開始された

---

## 2. 何を達成するか（What）

### 2.1 目的

Portal Menu機能を再利用可能なカスタムHookとして抽出し、DRY原則に準拠した実装を実現する。

### 2.2 最終ゴール

```typescript
// 使用例
const { isOpen, menuPosition, triggerRef, menuRef, openMenu, closeMenu } =
  usePortalMenu<HTMLButtonElement>({
    onClose: () => console.log("closed"),
    closeOnEscape: true,
    closeOnOutsideClick: true,
  });
```

### 2.3 スコープ

#### 含むもの

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| Hook本体     | usePortalMenu.ts                           |
| 型定義       | UsePortalMenuOptions, UsePortalMenuReturn  |
| テスト       | usePortalMenu.test.ts（80%以上カバレッジ） |
| ドキュメント | JSDoc + ui-ux-portal-patterns.md更新       |

#### 含まないもの

| 項目                     | 理由                   |
| ------------------------ | ---------------------- |
| AccountSection.tsxの修正 | 抽出後に別タスクで置換 |
| 他コンポーネントへの適用 | 個別タスクで対応       |
| アニメーション機能       | 現状不要               |

### 2.4 成果物

| 成果物                | 配置先                           |
| --------------------- | -------------------------------- |
| usePortalMenu.ts      | `packages/ui/src/hooks/`         |
| usePortalMenu.test.ts | `packages/ui/src/hooks/`         |
| 型定義                | `packages/ui/src/hooks/types.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AUTH-UI-002が完了していること
- AccountSection/index.tsxのPortal実装が動作確認済みであること

### 3.2 依存タスク

| タスクID    | タスク名                        | ステータス |
| ----------- | ------------------------------- | ---------- |
| AUTH-UI-002 | アバター編集メニューz-index修正 | ✅ 完了    |

### 3.3 必要な知識

| 知識領域              | 参照先                   |
| --------------------- | ------------------------ |
| React Hooks           | React公式ドキュメント    |
| React Portal          | React公式ドキュメント    |
| WAI-ARIA Menu Pattern | W3C WAI-ARIA             |
| カスタムHook設計      | ui-ux-portal-patterns.md |

### 3.4 推奨アプローチ

1. AccountSection/index.tsxからPortal関連コードを抽出
2. ジェネリクスでトリガー要素の型を柔軟に
3. オプションオブジェクトパターンで設定を渡す
4. テストファーストで開発

### 3.5 システム仕様書参照

| 仕様書                                  | 参照セクション                         |
| --------------------------------------- | -------------------------------------- |
| ui-ux-portal-patterns.md                | 基本実装パターン、イベントハンドリング |
| architecture-implementation-patterns.md | React Hookパターン                     |
| testing-component-patterns.md           | Hook テストパターン                    |

### 3.6 苦戦箇所と対策（AUTH-UI-002からの学び）

| 苦戦箇所                             | 原因                         | 対策                                                               |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------ |
| Phase 12完了タスクセクション追加漏れ | 「参考実装に記載済み」と誤認 | 仕様書更新時は必ず「完了タスク」セクションを追加                   |
| LOGS.md×2更新漏れ                    | 1ファイルのみ更新            | **aiworkflow-requirements + task-specification-creator両方**を更新 |
| SKILL.md変更履歴更新漏れ             | 見落とし                     | SKILL.md×2の変更履歴も更新対象に含める                             |
| topic-map.md再生成漏れ               | 実行忘れ                     | 仕様書変更後は**必ず**`node generate-index.js`実行                 |

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 内容                       |
| ----- | ------------ | -------------------------- |
| 1     | 要件定義     | インターフェース設計       |
| 2     | テスト作成   | TDD-Red                    |
| 3     | 実装         | TDD-Green                  |
| 4     | 検証         | テスト実行・カバレッジ確認 |
| 5     | ドキュメント | 仕様書更新                 |

### Phase 1: 要件定義

#### 目的

usePortalMenuのインターフェースを設計する

#### 手順

1. AccountSection/index.tsxのPortal関連コードを分析
2. 抽出すべき機能を特定：
   - state管理（isOpen, menuPosition）
   - ref管理（triggerRef, menuRef）
   - イベントハンドラ（openMenu, closeMenu）
   - イベントリスナー登録（outsideClick, escape）
3. オプションインターフェースを設計
4. 戻り値インターフェースを設計

#### 成果物

- `outputs/phase-1/interface-design.md`

#### 完了条件

- [ ] UsePortalMenuOptions型が定義されている
- [ ] UsePortalMenuReturn型が定義されている
- [ ] 使用例が記載されている

### Phase 2-5: 省略（標準TDDフロー）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] usePortalMenu.tsが作成されている
- [ ] トリガー要素の型がジェネリクスで指定可能
- [ ] closeOnEscapeオプションが機能する
- [ ] closeOnOutsideClickオプションが機能する
- [ ] onCloseコールバックが呼び出される
- [ ] ARIA属性が適切に管理される

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] TypeScript strict mode準拠
- [ ] ESLint/Prettier準拠

### ドキュメント要件

- [ ] JSDocコメントが完備
- [ ] ui-ux-portal-patterns.md更新
- [ ] LOGS.md×2更新
- [ ] SKILL.md×2変更履歴更新
- [ ] topic-map.md再生成

---

## 6. 検証方法

### テストケース

| #   | テストケース        | 期待結果                                          |
| --- | ------------------- | ------------------------------------------------- |
| 1   | openMenu()呼び出し  | isOpen=true, menuPositionが設定される             |
| 2   | closeMenu()呼び出し | isOpen=false, menuPosition=null                   |
| 3   | Escキー押下         | closeOnEscape=trueならcloseMenu()が呼ばれる       |
| 4   | 外部クリック        | closeOnOutsideClick=trueならcloseMenu()が呼ばれる |
| 5   | unmount時           | イベントリスナーが解除される                      |

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/ui test usePortalMenu

# カバレッジ確認
pnpm --filter @repo/ui test:coverage
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                                             |
| ---------------------- | ------ | -------- | ------------------------------------------------ |
| 既存実装との互換性問題 | 中     | 低       | AccountSection.tsxを変更せず、新規Hookとして作成 |
| テスト環境の違い       | 低     | 低       | jsdom環境でのイベント発火を確認                  |
| 過度な抽象化           | 中     | 中       | 必要最小限の機能のみ抽出                         |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                              | 内容               |
| ----------------------------------------- | ------------------ |
| `ui-ux-portal-patterns.md`                | Portal実装パターン |
| `architecture-implementation-patterns.md` | 実装パターン集     |
| `testing-component-patterns.md`           | テストパターン     |

### 参考資料

| 資料                  | URL                                            |
| --------------------- | ---------------------------------------------- |
| React useRef          | https://react.dev/reference/react/useRef       |
| React useCallback     | https://react.dev/reference/react/useCallback  |
| WAI-ARIA Menu Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/menu/ |

---

## 9. 備考

### 発見元タスクからの教訓

AUTH-UI-002タスク実行時に以下の苦戦箇所があった。本タスク実行時は同じ轍を踏まないこと：

```
Phase 12 Task 2完了チェックリスト:
□ Step 1-A: 対象仕様書に「完了タスク」セクションを追加
□ Step 1-A: aiworkflow-requirements/LOGS.md に完了エントリ追加
□ Step 1-A: task-specification-creator/LOGS.md に完了エントリ追加
□ Step 1-A: aiworkflow-requirements/SKILL.md 変更履歴にバージョン追加
□ Step 1-A: task-specification-creator/SKILL.md 変更履歴にバージョン追加
□ Step 1-D: node generate-index.js でtopic-map.md再生成
□ patterns.md: 苦戦箇所と成功パターンを記録
```

### 補足事項

- 現時点では1箇所のみの使用のため、**緊急性は低い**
- 他のPortalメニュー実装が必要になった時点で着手を検討
- 将来タスク候補としてui-ux-portal-patterns.mdにも記録済み
