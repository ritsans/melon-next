• レビュー結果

  - src/components/posts/CreatePostButton.tsx:22-28 PostForm から渡された images を handleSubmit が受け取っていないた
    め、createPost に画像データが一切届きません。UI で画像アップロードを提供しているのに実際には捨てており、仕様が破綻し
    ています。引数を PostFormData & { images?: File[] } に合わせ、createPost にそのまま渡す必要があります。
  - src/components/posts/ImageUploader.tsx:126-215 と src/components/profile/AvatarUploader.tsx:76-160 では毎回
    URL.createObjectURL を発行していますが、コンポーネントの再レンダー／アンマウント時に URL.revokeObjectURL で解放して
    いません。長時間使うとメモリリークになる典型的な古い書き方なので、useEffect 等でプレビュ―URLを一度だけ生成し、不要に
    なったら確実に破棄してください。
  - src/components/reactions/ReactionPanel.tsx:27-78 で optimisticReaction を useState の初期値として一度だけ設定し
    ているため、reactions prop や currentUserId が変わっても state が同期されません。その結果、投稿一覧再フェッチ後も
    ユーザーの選択状態が古いまま残り、別投稿へのナビゲーションでも前のリアクションがハイライトされたままになります。
    useEffect で userCurrentReaction 変更時に state をリセットする等の同期処理が必要です。
  - src/components/posts/ReplyCard.tsx:35-55 は各トップレベル返信ごとにクライアント側から getReplies サーバーアクション
    を発火し、更に返信作成・削除のたびに同じリクエストを繰り返しています。返信が多い場合は投稿1件につき多数の往復を発生
    させる N+1 パターンになっており非常に非効率です。外側（サーバーコンポーネント）で子返信をまとめて取得して渡す、もし
    くは API を用意してまとめて取得する形に見直してください。
  - src/components/follows/FollowList.tsx:11-54 は viewerFollowStatuses を Map 型として受け取っていますが、サーバー
    コンポーネント (app/(main)/profile/.../connections/page.tsx) からクライアントコンポーネントに Map インスタンスを
    渡すことはシリアライズできず、React Flight の仕様上エラーになります（JSON化されても {} なので .get で落ちます）。
    Array<[id,status]> 等のプレーンな構造で受け取り、クライアント側で new Map し直してください。
  - src/components/notifications/NotificationBell.tsx:22-95 のポーリング effect は (1) SSR が渡した initialUnreadCount
    を無視して即座に余分な getUnreadCount を叩き、(2) デバッグ用の setTimeout を作成したままアンマウント時にクリアし
    ていないため、アンマウント後に setShowDebug(false) が走って React の警告になります。またコメントでは「開発のみ」と
    書かれていますが実際には本番でも毎回デバッグトーストが表示されます。初回フェッチのスキップ、setTimeout ID の保存と
    clearTimeout、NODE_ENV での条件分岐が必要です。
  - src/components/auth/OnboardingForm.tsx:43-73 のユーザー名重複チェックはデバウンスこそしていますが、リクエストご
    とのキャンセルやレスポンスの世代判定を行っていないため、ユーザーが高速にタイプすると古いレスポンスが最後に届いて
    usernameCheckState を上書きしてしまいます。最新の username と一致しているか検証するか、AbortController/リクエストID
    で競合を防ぐべきです。
  - src/components/profile/ProfileEditForm.tsx:86-105 は UI に「最大5つ」と表示しているのに、トグル処理でもバリデーショ
    ンでも上限を課していません（profileEditSchema でも interests は任意配列のまま）。結果として6個以上選択してもそのまま
    保存され、画面表示と実際の制約が乖離します。スキーマ側で max(5) を課すか、コンポーネントで5件以上のチェックを抑止し
    てください。

---

## 修正履歴 (2025-11-17)

### 修正した問題

1. **CreatePostButton.tsx:22** - 画像データが捨てられる致命的なバグを修正。handleSubmitの引数型を`PostFormData & { images?: File[] }`に変更し、画像データをcreatePostに正しく渡すように修正。

2. **FollowList.tsx + connections/page.tsx:39-55, 88-102** - Mapシリアライズエラーを修正。サーバーコンポーネントから配列形式で渡し、クライアント側で`new Map()`に変換する実装に変更。

3. **ImageUploader.tsx:24-38** - URL.createObjectURLのメモリリークを修正。useEffectでプレビューURLを管理し、クリーンアップ関数で確実にURL.revokeObjectURLを実行するように実装。

4. **AvatarUploader.tsx:30-47** - 同様にURL.createObjectURLのメモリリークを修正。useEffectでファイル変更時・アンマウント時に適切にrevokeObjectURLを実行。

5. **ReactionPanel.tsx:30-33** - optimisticReactionの同期問題を修正。useEffectでuserCurrentReaction変更時にoptimisticReactionを同期させる処理を追加。

6. **NotificationBell.tsx:21, 30-39, 47-50** - ポーリングの複数の問題を修正。(1) setTimeoutのIDをuseRefで保存しクリーンアップで確実にclearTimeout、(2) デバッグ表示を`process.env.NODE_ENV !== "production"`で開発環境のみに制限。

7. **ProfileEditForm.tsx:87-105, validations.ts:97** - interests上限チェックを追加。UI側で5個以上選択できないように制限し、スキーマ側でも`.max(5, "...")`バリデーションを追加。

8. **ReplyCard.tsx (N+1問題) - 2025-11-17修正完了** - Supabaseの`.in()`クエリを使用して第1階層と第2階層の返信を2回のクエリで一括取得する`getRepliesWithNested()`関数を実装。PostWithProfile型に`nested_replies`プロパティを追加。ReplyCardからuseEffectでの個別フェッチを削除し、propsでネストされた返信を受け取るように変更。各ページ(home, everyone, tags, posts/[id])で`getRepliesWithNested()`を使用。**クエリ数: N+1回 → 2回に削減**。

### 未対応の問題

- **OnboardingForm.tsx (競合問題)** - AbortControllerまたはリクエストID管理の実装が必要なため今回は対応せず。