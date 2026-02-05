# Portal位置計算ユーティリティ抽出 - タスク指示書

## メタ情報

```yaml
issue_number: 712
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-PORTAL-UTILS-001                          |
| タスク名     | Portal位置計算ユーティリティ抽出               |
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

AUTH-UI-002タスクでPortalメニューの位置計算ロジック（`calculateMenuPosition`）を実装した。現在、この計算ロジックがAccountSection/index.tsx内に直接記述されている。

**関連システム仕様書**:

- `ui-ux-portal-patterns.md` - Portal実装パターン（位置計算ヘルパー関数セクション）

### 1.2 問題点・課題

| 現状                                 | 問題点                                   |
| ------------------------------------ | ---------------------------------------- |
| 位置計算がコンポーネント内に直接実装 | 他のPortalで再利用不可                   |
| トリガー下配置のロジックのみ         | 他の配置パターン（上、左、右）に対応困難 |
| ビューポート境界判定なし             | 画面端でメニューが見切れる可能性         |

### 1.3 放置した場合の影響

| 影響                                             | 重大度 |
| ------------------------------------------------ | ------ |
| 現時点では影響なし（1箇所のみ、画面端使用なし）  | 低     |
| 将来、複数のPortal使用時にコード重複             | 中     |
| ビューポート境界対応が必要になった場合に大幅改修 | 中     |

### 1.4 実施判断基準

以下の**いずれか**の条件を満たした場合に実施を検討：

- [ ] 複数のPortalメニューで位置計算が必要になった
- [ ] ビューポート境界を考慮した位置計算が必要になった
- [ ] TASK-PORTAL-HOOK-001（usePortalMenu抽出）と同時に実施

---

## 2. 何を達成するか（What）

### 2.1 目的

Portal要素の位置計算ロジックを再利用可能なユーティリティ関数として抽出し、様々な配置パターンに対応できる設計を実現する。

### 2.2 最終ゴール

```typescript
// 使用例
import { calculatePortalPosition } from "@repo/ui/utils/portalPosition";

const position = calculatePortalPosition(triggerRef.current, {
  placement: "bottom-start", // 'top' | 'bottom' | 'left' | 'right' + '-start' | '-end'
  offset: { x: 0, y: 8 },
  boundary: "viewport", // 'viewport' | 'parent' | HTMLElement
  flip: true, // ビューポート外の場合に反転
});
```

### 2.3 スコープ

#### 含むもの

| 項目               | 内容                                                 |
| ------------------ | ---------------------------------------------------- |
| ユーティリティ関数 | calculatePortalPosition.ts                           |
| 型定義             | PortalPlacement, PositionOptions, MenuPosition       |
| テスト             | calculatePortalPosition.test.ts（80%以上カバレッジ） |
| ドキュメント       | JSDoc + ui-ux-portal-patterns.md更新                 |

#### 含まないもの

| 項目                     | 理由                   |
| ------------------------ | ---------------------- |
| AccountSection.tsxの修正 | 抽出後に別タスクで置換 |
| アニメーション           | 別機能                 |
| リサイズ追従             | 将来拡張として検討     |

### 2.4 成果物

| 成果物                          | 配置先                           |
| ------------------------------- | -------------------------------- |
| calculatePortalPosition.ts      | `packages/ui/src/utils/`         |
| calculatePortalPosition.test.ts | `packages/ui/src/utils/`         |
| 型定義                          | `packages/ui/src/utils/types.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AUTH-UI-002が完了していること
- AccountSection/index.tsxの`calculateMenuPosition`が動作確認済みであること

### 3.2 依存タスク

| タスクID    | タスク名                        | ステータス |
| ----------- | ------------------------------- | ---------- |
| AUTH-UI-002 | アバター編集メニューz-index修正 | ✅ 完了    |

### 3.3 必要な知識

| 知識領域                  | 参照先       |
| ------------------------- | ------------ |
| getBoundingClientRect API | MDN Web Docs |
| CSS positioning           | MDN Web Docs |
| Viewport計算              | MDN Web Docs |

### 3.4 推奨アプローチ

1. AccountSection/index.tsxの`calculateMenuPosition`を基に設計
2. 配置オプション（placement）をenumで定義
3. オフセットとビューポート境界対応をオプション化
4. テストファーストで開発

### 3.5 システム仕様書参照

| 仕様書                                  | 参照セクション             |
| --------------------------------------- | -------------------------- |
| ui-ux-portal-patterns.md                | 位置計算ヘルパー関数       |
| architecture-implementation-patterns.md | ユーティリティ関数パターン |

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

calculatePortalPositionのインターフェースを設計する

#### 手順

1. 既存の`calculateMenuPosition`を分析
2. 必要な配置パターンを洗い出し：
   - bottom-start（現在の実装）
   - bottom-end
   - top-start / top-end
   - left / right（将来拡張）
3. オプションインターフェースを設計
4. 戻り値型（MenuPosition）を設計

#### 成果物

- `outputs/phase-1/interface-design.md`

#### 完了条件

- [ ] PortalPlacement型が定義されている
- [ ] PositionOptions型が定義されている
- [ ] MenuPosition型が定義されている
- [ ] 使用例が記載されている

### Phase 2-5: 省略（標準TDDフロー）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] calculatePortalPosition.tsが作成されている
- [ ] placement指定で配置方向を選択可能
- [ ] offset指定でx/yオフセットを調整可能
- [ ] flip=trueでビューポート外の場合に反転
- [ ] boundary指定で境界判定領域を選択可能

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] TypeScript strict mode準拠
- [ ] ESLint/Prettier準拠
- [ ] 純粋関数として実装（副作用なし）

### ドキュメント要件

- [ ] JSDocコメントが完備
- [ ] ui-ux-portal-patterns.md更新
- [ ] LOGS.md×2更新
- [ ] SKILL.md×2変更履歴更新
- [ ] topic-map.md再生成

---

## 6. 検証方法

### テストケース

| #   | テストケース                     | 期待結果                       |
| --- | -------------------------------- | ------------------------------ |
| 1   | placement='bottom-start'         | トリガー下部左揃えの座標を返す |
| 2   | placement='bottom-end'           | トリガー下部右揃えの座標を返す |
| 3   | offset指定                       | 指定値分だけ座標がずれる       |
| 4   | flip=true + ビューポート下部境界 | 上部に配置変更                 |
| 5   | triggerがnull                    | nullを返す                     |

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/ui test calculatePortalPosition

# カバレッジ確認
pnpm --filter @repo/ui test:coverage
```

---

## 7. リスクと対策

| リスク           | 影響度 | 発生確率 | 対策                                           |
| ---------------- | ------ | -------- | ---------------------------------------------- |
| 計算精度の問題   | 中     | 低       | 既存実装を基にテストで検証                     |
| ブラウザ間の差異 | 低     | 低       | getBoundingClientRectは標準API                 |
| 過度な汎用化     | 中     | 中       | 現在必要な機能のみ実装、将来拡張はオプション化 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                              | 内容               |
| ----------------------------------------- | ------------------ |
| `ui-ux-portal-patterns.md`                | Portal実装パターン |
| `architecture-implementation-patterns.md` | 実装パターン集     |

### 参考資料

| 資料                  | URL                                                                      |
| --------------------- | ------------------------------------------------------------------------ |
| getBoundingClientRect | https://developer.mozilla.org/docs/Web/API/Element/getBoundingClientRect |
| Popper.js placement   | https://popper.js.org/docs/v2/constructors/#options（参考設計）          |

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
- TASK-PORTAL-HOOK-001と組み合わせて実施することを推奨
- 将来タスク候補としてui-ux-portal-patterns.mdにも記録済み

### 関連タスク

| タスクID             | タスク名                      | 関係         |
| -------------------- | ----------------------------- | ------------ |
| TASK-PORTAL-HOOK-001 | usePortalMenuカスタムHook抽出 | 同時実施推奨 |
