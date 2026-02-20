# Phase 4: テスト設計仕様

## テストファイル一覧

| ファイル                         | パッケージ    | テスト数 | 目的                                          |
| -------------------------------- | ------------- | -------- | --------------------------------------------- |
| module-resolution.test.ts        | @repo/shared  | 57       | exports/tsup/ソースファイルの整合性検証       |
| shared-module-resolution.test.ts | @repo/desktop | 59       | TypeScript paths と exports の対応検証        |
| vitest-alias-consistency.test.ts | @repo/desktop | 108      | Vitest alias と TypeScript paths の整合性検証 |

## テストケース設計

### module-resolution.test.ts

- T-MR-01: exports の全サブパスが tsup entry に対応する (27テスト)
- T-MR-02: exports types パスとソースファイルの対応 (27テスト)
- T-MR-03: dist/types/ と dist/src/types/ 混在パターン記録 (1テスト)
- T-MR-04: orphaned exports がない (1テスト)
- T-MR-05: exports に未登録の tsup entry 検出 (1テスト)

### shared-module-resolution.test.ts

- T-SMR-01: tsconfig paths に全 exports サブパスが存在する (27テスト)
- T-SMR-02: tsconfig paths が正しいソースファイルを指している (27テスト)
- T-SMR-03: @repo/shared 以外の paths が維持されている (2テスト)
- T-SMR-04: typesVersions の存在と整合性確認 (3テスト)

### vitest-alias-consistency.test.ts

- T-VAC-01: Vitest alias の全エントリが TypeScript paths に存在する (27テスト)
- T-VAC-02: TypeScript paths の @repo/shared エントリが Vitest alias に存在する (27テスト)
- T-VAC-03: alias と paths が同一のソースファイルを指している (27テスト)
- T-VAC-04: 全てのパスが実在するファイルを指している (27テスト)

## TDD Red 確認

テスト作成時点では tsconfig paths が未設定のため、T-SMR-01/02 と T-VAC-02/03 が失敗（Red）状態。Phase 5 の実装により全テスト PASS（Green）となる。
