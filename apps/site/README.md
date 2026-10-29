# kevinschaich.com

Kevin Schaich's personal site, a front door to [Darkgrade](https://darkgrade.com). It mirrors
[drkgrd.co](https://drkgrd.co) from the [darkgrade monorepo](https://github.com/darkgrade/darkgrade)
(`apps/drkgrd.co`): same fonts, tokens and backdrop video, so keep the two in step.

```sh
bun install
bun run dev
```

`bun run build` produces the production build; `vercel.json` holds the short-link redirects
(`/linkedin`, `/github`, `/darkgrade`, …).
