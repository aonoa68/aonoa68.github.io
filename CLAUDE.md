# CLAUDE.md — aonoa68.github.io 編集ガイド

このリポジトリは小野原彩香の研究者個人サイト（GitHub Pages）。
素のHTML + 共通CSSで構成されており、ビルドは不要。`git push` で即デプロイされる。

## ディレクトリ構造

```
.
├── index.html              # JA トップ
├── style.css               # 共通CSS（JA/EN 兼用）
├── cosmic-language-map.png # トップ画像
├── en/
│   ├── index.html          # EN トップ
│   ├── projects/index.html
│   └── publications/index.html
├── projects/index.html     # JA Projects
└── publications/index.html # JA Publications
```

JA と EN は完全パラレル構造。**JA を更新したら、対応する EN も同じ箇所を更新する**ことを原則とする。

## NEWS セクションの追記ルール

`index.html` の「NEWS・最新情報」セクション（130行目付近）に、**新しい項目を最上部に挿入**する（降順、新しい日付が上）。

### 書式（1行で記述）

```html
<div class="news-item" data-aos="fade-up" data-aos-delay="100"><div class="news-date"><i class="fas fa-calendar"></i> YYYY.MM.DD</div><div class="news-content"><strong>カテゴリ：</strong>本文。</div></div>
```

### ルール

- 日付は `YYYY.MM.DD`（ピリオド区切り）。期間は `2025.08.19-20` のようにハイフン
- カテゴリ例：`学会発表`、`論文出版`、`社会貢献活動`、`研究プロジェクト`、`受賞`、`講演`
- `data-aos-delay` は最上部を `100` にし、以降 `120, 140, 150, ...` と既存の流れに合わせる（厳密でなくてよい）
- 本文中のリンクは `<a href="..." target="_blank">テキスト</a>` の形式
- 本文末尾は句点「。」で終える
- 既存項目の `data-aos-delay` を毎回付け直す必要はない（最上部だけ揃っていればよい）

### EN 側の対応

`en/index.html` の同じセクションにも英訳を追加する。
- 論文タイトル・固有名詞・組織名は英語版があればそれを、なければオリジナル日本語のまま
- 日付書式は JA と同じ（`YYYY.MM.DD`）
- カテゴリ訳の目安：`学会発表` → `Conference Talk`, `論文出版` → `Publication`, `社会貢献活動` → `Outreach`, `研究プロジェクト` → `Research Project`, `受賞` → `Award`

## 論文・発表リストの追記

- JA: `publications/index.html`
- EN: `en/publications/index.html`

既存の項目の書式（DOI バッジ、Zenodo バッジ、role 表記など）に揃える。新規論文を追加したらトップページの「代表論文（Selected）」にも反映を検討する（ユーザーに確認）。

## プロジェクト追加

- JA: `projects/index.html`
- EN: `en/projects/index.html`

## 編集後に必ず行うこと

1. **フッターの「最終更新」日付を更新**：`index.html` 末尾の `最終更新：YYYY-MM-DD` を当日に。EN 側にも同じ表記があれば合わせる
2. ブラウザで `index.html` を開いて表示崩れがないか目視確認（ローカルなら `open index.html`）
3. コミット＆プッシュ：

```bash
git add -A
git commit -m "簡潔な要約（例: NEWS: FOSS4G 2026 academic track 採択を追記）"
git push
```

GitHub Pages が自動デプロイするので、数十秒〜数分後に反映される。

## やらないこと

- Jekyll や npm 系ツールチェーンの導入（静的HTMLの素直さを保つ）
- `style.css` の大規模リファクタ（既存クラス名は複数ページから参照されている）
- メールアドレス・所属・JSON-LD など、サイト根幹のメタ情報を一括変更すること（必ずユーザーに確認してから行う）
- `cosmic-language-map.png` のような大きなバイナリの安易な差し替え（git 履歴が肥大化するため、必要なときはユーザーに確認）

## Dropbox 運用上の注意

このリポジトリは Dropbox 配下に置かれているが、`.git` ディレクトリは `xattr com.dropbox.ignored=1` により Dropbox 同期から除外されている。**新しい端末で clone した場合は必ず以下を実行すること**：

```bash
xattr -w com.dropbox.ignored 1 .git
```

これを忘れると複数端末間で git の内部状態が競合し、リポジトリが破損する可能性がある。

## 参考：所属・肩書きの現状

- **現所属**：北星学園大学 情報科学科 准教授（2026年4月〜）／北海道大学 非常勤講師（兼任）
- **旧所属**：立教大学 社会情報教育研究センター 助教（〜2026年3月）

サイト本文・JSON-LD（`<script type="application/ld+json">` 内の `jobTitle` と `affiliation`）・メールアドレス（`aonohara@rikkyo.ac.jp`）には旧所属の記述が残っている。所属移行に伴う更新は**段階的に**行い、一括書き換えはしない。更新時は必ずユーザーに「どこを今回変更するか」確認する。
