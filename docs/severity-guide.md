# Severity ガイド

## Error（必ず修正が必要）

Vue 3 / Nuxt 3 で**廃止された API**。そのままではビルドエラーまたは実行時エラーになる。

| ルール | 検出対象 |
|---|---|
| filters / パイプ構文 | `filters:{}`, テンプレート内 `\| filterName`, `Vue.filter()` |
| $listeners | `$listeners` |
| $on/$off/$once | イベントバスメソッド |
| $set / Vue.set | `this.$set()`, `Vue.set()`, `$delete()` |
| slot-scope / $scopedSlots | 旧スロット構文 |
| イベントバスパターン | `new Vue()` でバスを作るパターン |
| v-bind.sync | `.sync` 修飾子 |
| v-on.native | `.native` 修飾子 |
| /deep/ / >>> セレクタ | `/deep/`, `>>>`, `::v-deep`（引数なし） |
| transition クラス名変更 | `.v-enter`, `.v-leave`, `enter-class`, `leave-class` |
| keyCode 修飾子 | `@keyup.13` 等の数値キーコード, `Vue.config.keyCodes` |
| inline-template | `inline-template` 属性 |
| $destroy | `this.$destroy()` |
| $on('hook:') パターン | `$on('hook:beforeDestroy')` 等のライフサイクルフック監視 |
| render(h) 旧API | `render(h)` — `h` は `import { h } from 'vue'` に変更 |
| propsData 廃止 | `propsData` オプション |
| fetch/asyncData | Nuxt 2 の `async fetch()`, `asyncData()` |
| Nuxt Context | `$nuxt`, `context.app`, `app.$xxx` |
| `<Nuxt>` / `<NuxtChild>` | `<Nuxt />` → `<slot />`, `<NuxtChild />` → `<NuxtPage />` |
| watchQuery | `watchQuery` は Nuxt 3 で廃止 |
| v-model 変更 | `v-model` 修飾子, `value`/`input` パターン, `model` オプション — prop/event 名が変わり暗黙に壊れる |

## Warning（対応を推奨）

非推奨または大幅に変更された API。動作する場合もあるが、将来削除される可能性が高い。

| ルール | 検出対象 |
|---|---|
| カスタムディレクティブ hooks | `bind(el)`, `inserted(el)`, `componentUpdated(el)`, `unbind(el)` |
| v-if / v-for 同一要素 | 同一要素上の `v-if` + `v-for`（優先順位が Vue 3 で変更） |
| Vue.nextTick 等 | `Vue.nextTick`, `Vue.observable`, `Vue.version`, `Vue.compile` |
| data オブジェクト直書き | `data: {}` — 関数で返す必要がある |
| TransitionGroup ラッパー | `<transition-group>` に `tag` 属性がない（デフォルトラッパー廃止） |
| $children | `$children` アクセス |
| beforeDestroy/destroyed | 旧ライフサイクルフック名 |
| 旧非同期コンポーネント | `(): () => import()` パターン |
| Vue.*グローバルAPI | `Vue.component()`, `Vue.mixin()`, `Vue.use()`, `Vue.prototype`, `new Vue({})` |
| functional | `functional: true`, `<template functional>` |
| Vuex Store | `this.$store`, `mapState()`, `mapGetters()` 等 |
| inject パターン | `inject('key')`, `export default ctx inject` |
| this.$router / this.$route | `useRouter()` / `useRoute()` に変更 |
| process.env | `useRuntimeConfig()` に変更 |
| serverMiddleware | `server/api/` ディレクトリに移行 |
| buildModules | Nuxt config の `buildModules` |
| RuntimeConfig (v2) | `publicRuntimeConfig`, `privateRuntimeConfig` |
| mode/target (v2) | `mode: 'spa'`, `target: 'static'` |
| webpack 設定 | `webpack(){}` カスタム設定 |

## Info（確認推奨）

動作に直接影響しないが、Nuxt 3 の新方式に書き換えることで保守性が向上する。

| ルール | 検出対象 |
|---|---|
| layout オプション | `layout: 'name'` |
| middleware | `middleware: 'name'` |
| head() | `head(){}`, `head:{}` |
