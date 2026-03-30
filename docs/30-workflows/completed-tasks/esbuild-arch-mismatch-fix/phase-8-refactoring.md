# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| Phase        | 8                                  |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| 機能名       | esbuild-arch-mismatch-fix          |
| 種別         | リファクタリング                   |
| 前Phase      | Phase 7                            |
| 次Phase      | Phase 9                            |
| 作成日       | 2026-03-30                         |
| ステータス   | 未実施                             |
| IS_TDD_PHASE | true                               |
| IS_REFACTOR  | true                               |

---

## 目的

本タスクは環境修正（コード変更なし）のため、リファクタリング = ドキュメント整理・重複排除を行う。
予防手順書・タスク仕様書・CLAUDE.md 間の重複を解消し、単一情報源（Single Source of Truth）を確立する。

---

## 実行タスク

### Task 1: 予防ドキュメントの集約

**目的**: タスク仕様書と予防手順書の重複記述を排除する

| 確認対象     | パス                                                    | 確認内容                   |
| ------------ | ------------------------------------------------------- | -------------------------- |
| タスク仕様書 | `completed-tasks/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md` | architecture統一手順の記述 |
| 予防手順書   | `outputs/phase-5/prevention-procedure.md`               | 再発防止手順の記述         |

**実施内容**:

- タスク仕様書内の再発防止記述が予防手順書へのリンク参照になっていることを確認
- 同一内容が2箇所以上に存在する場合、正本を `outputs/phase-5/prevention-procedure.md` に統一
- 他の箇所は正本への参照リンクに置き換え

### Task 2: CLAUDE.md worktree tips の確認・補強

**目的**: worktree運用時のarchitectureミスマッチ防止ガイダンスを確認する

| 確認項目           | 確認内容                                                 |
| ------------------ | -------------------------------------------------------- |
| 既存tip            | 「worktree作成後は `pnpm install` を確認する」記述の有無 |
| arch固有ガイダンス | `process.arch` 確認手順の有無                            |
| 不足時の対応       | arch固有の注意事項を追記                                 |

**確認コマンド**:

```bash
# CLAUDE.md 内の worktree 関連記述を確認
grep -n "worktree\|pnpm install\|arch" CLAUDE.md
```

### Task 3: ドキュメント間の整合性検証

**目的**: 全関連ドキュメントが矛盾なく一貫していることを確認する

| 確認ペア                   | 確認内容                                         |
| -------------------------- | ------------------------------------------------ |
| タスク仕様書 vs 予防手順書 | 手順・コマンドの一致                             |
| 予防手順書 vs CLAUDE.md    | ガイダンスの整合性                               |
| 検証コマンド一覧           | 全ドキュメント間で同一コマンドが使用されているか |

**検証コマンド**（リファクタリング前後で結果が変わらないことを確認）:

```bash
# architecture 検証
node -e "console.log(process.arch)"

# esbuild バイナリ検証
ls node_modules/@esbuild/darwin-x64/

# vitest 起動検証
pnpm vitest run --reporter=verbose 2>&1 | head -20
```

---

## 参照資料

| 資料名       | パス                                                    | 説明                       |
| ------------ | ------------------------------------------------------- | -------------------------- |
| 検証結果     | `outputs/phase-7/coverage-report.md`                    | Phase 7 成果物             |
| 予防手順書   | `outputs/phase-5/prevention-procedure.md`               | Phase 5 成果物（正本候補） |
| タスク仕様書 | `completed-tasks/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md` | 元タスク定義               |

---

## 統合テスト連携【必須】

リファクタリング（ドキュメント整理）後も全検証コマンドが成功することを確認:

```bash
# architecture が x64 であること
node -e "console.assert(process.arch === 'x64', 'Not x64'); console.log('OK:', process.arch)"

# esbuild darwin-x64 バイナリが存在すること
test -d node_modules/@esbuild/darwin-x64 && echo "OK: darwin-x64 exists"

# vitest が esbuild エラーなく起動すること
pnpm vitest run --reporter=verbose 2>&1 | head -5
```

---

## 成果物

| 成果物               | パス                                    | 説明                             |
| -------------------- | --------------------------------------- | -------------------------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | ドキュメント整理・重複排除の記録 |

---

## 完了条件

- [ ] 予防手順の正本が `outputs/phase-5/prevention-procedure.md` に一元化されている
- [ ] 他ドキュメントから正本への参照リンクが正しく設定されている
- [ ] CLAUDE.md の worktree tips に arch 確認ガイダンスが含まれている
- [ ] 全検証コマンドがリファクタリング前後で同一の結果を返す
- [ ] 重複した予防手順記述が存在しない（Single Source of Truth）

---

## 完了時テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

| タスク                             | 結果            | 備考     |
| ---------------------------------- | --------------- | -------- |
| Task 1: 予防ドキュメントの集約     | {{完了/未完了}} | {{備考}} |
| Task 2: CLAUDE.md worktree tips    | {{完了/未完了}} | {{備考}} |
| Task 3: ドキュメント間の整合性検証 | {{完了/未完了}} | {{備考}} |

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}

### 次Phaseへの引き継ぎ事項

- {{HANDOVER_ITEMS}}
```

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 9: 品質保証
