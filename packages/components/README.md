# @kevinschaich/components

Shared branding for Kevin's projects: shadcn zinc tokens, Public Sans + JetBrains Mono, shadcn/typeset, 8px radius, and the byline.

```js
import { Byline } from '@kevinschaich/components'
import '@kevinschaich/components/styles.css'
```

No build step? Load the runtime kit instead, which always matches `main`:

```html
<link rel="stylesheet" href="https://kevinschaich.com/kit/v1/brand.css">
<script type="module" src="https://kevinschaich.com/kit/v1/brand.js"></script>
<span data-ks-byline></span>
```
