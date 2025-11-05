  実装前後の比較

  変化1: エラー表示の統一とデザイン改善

  実装前

  {/* バラバラな表示方法 */}
  {error && <p className="text-center text-sm text-red-600">{error}</p>}
  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
  - 各フォームでエラー表示のスタイルが微妙に異なる
  - アイコンなし、テキストのみ
  - アクセシビリティ対応なし

  実装後

  {/* 統一された表示 */}
  {error && <ErrorMessage message={error} />}
  <FormError error={errors.email?.message} className="mt-1" />
  - アイコン付き（AlertCircle アイコン）で視認性向上
  - 統一されたデザイン（背景色、ボーダー、パディング）
  - アクセシビリティ対応（role="alert" 属性）
  - 再利用可能なコンポーネント

  ---
  変化2: エラーメッセージの改善

  実装前（src/lib/auth.ts）

  // 汎用的なメッセージのみ
  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }
  - すべてのログインエラーが同じメッセージ
  - ユーザーが問題を特定しにくい

  実装後

  // 詳細なエラーメッセージ
  if (error) {
    return { error: formatAuthError(error) }; // ← エラー内容に応じて変わる
  }

  formatAuthError() の処理例:
  - "Invalid login credentials" → 「メールアドレスまたはパスワードが正しくありません」
  - "Email already registered" → 「このメールアドレスは既に登録されています」
  - "Session not found" → 「セッションが期限切れです。再度ログインしてください」
  - 429 Too Many Requests → 「リクエストが多すぎます。しばらく待ってから再度お試しください」

  ---
  変化3: データベースエラーの適切な処理

  実装前

  if (error) {
    return { error: "プロフィールの更新に失敗しました" }; // 漠然としたメッセージ
  }

  実装後

  if (error) {
    return { error: formatSupabaseError(error) }; // ← エラーコードに応じて変わる
  }

  formatSupabaseError() の処理例:
  - エラーコード 23505 (unique_violation) → 「この値は既に使用されています」
  - エラーコード 23502 (not_null_violation) → 「必須項目が入力されていません」
  - エラーコード 42501 (insufficient_privilege) → 「この操作を行う権限がありません」

  ---
  変化4: コードの保守性向上

  実装前

  // 各フォームで同じようなコードを繰り返し記述
  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
  {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
  {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
  - 30行以上の重複コード
  - デザイン変更時に全ファイルを修正する必要がある

  実装後

  // 1行のシンプルな呼び出し
  <FormError error={errors.email?.message} className="mt-1" />
  <FormError error={errors.password?.message} className="mt-1" />
  <FormError error={errors.username?.message} className="mt-1" />
  - デザイン変更は FormError コンポーネント1箇所を変えるだけ
  - 新しいフォームを作るときも簡単

  ---
  実際のユーザー体験での変化

  シナリオ1: ログイン失敗

  実装前:
  [小さな赤いテキスト]
  メールアドレスまたはパスワードが正しくありません

  実装後:
  ┌─────────────────────────────────────────────┐
  │ 🔴 メールアドレスまたはパスワードが         │
  │    正しくありません                         │
  └─────────────────────────────────────────────┘
  - アイコンとボックスで目立つ
  - 見逃しにくい

  シナリオ2: サインアップ時に既存メールを使用

  実装前:
  アカウントの作成に失敗しました
  ↑ なぜ失敗したか分からない

  実装後:
  ┌─────────────────────────────────────────────┐
  │ 🔴 このメールアドレスは既に登録されています │
  └─────────────────────────────────────────────┘
  ↑ 具体的な理由が明確

  シナリオ3: フォーム入力エラー

  実装前:
  パスワードは6文字以上で入力してください ← テキストのみ

  実装後:
  🔴 パスワードは6文字以上で入力してください ← アイコン付き
  - 小さなアイコンでエラーだと一目で分かる
  - フィールドの近くに表示されて分かりやすい

  ---
  まとめ: 何が良くなったか？

  | 項目       | 実装前           | 実装後             |
  |----------|---------------|-----------------|
  | 視認性      | テキストのみ、見逃しやすい | アイコン＋背景色で目立つ    |
  | 一貫性      | フォームごとにバラバラ   | 全フォームで統一        |
  | エラーの詳細度  | 「失敗しました」のみ    | 具体的な原因を説明       |
  | 保守性      | 重複コードが多い      | 共通コンポーネント化      |
  | アクセシビリティ | なし            | role="alert" 対応 |
  | 開発速度     | 毎回同じコードを書く    | インポートして1行       |

  結論: ユーザーにとってはエラーが分かりやすく、開発者にとっては保守しやすくなりました！🎉