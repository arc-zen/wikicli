# wikiCLI

deno cli so you can quickly look up wikipedia definitions.

# install using deno install

```
deno install --allow-net -n wikicli --root "$HOME" https://raw.githubusercontent.com/arc-zen/wikicli/master/main.ts
```

then move both files to your root directory.

# usage

`wikicli (wikitype) (prompt)`<br> wikitype: `wikipedia`, OR `wp`, OR `simple_wikipedia`, OR `swp`<br> prompt: any amount of words optionally seperated by spaces or underscores (i.e. `Burts_Bees` or `Burts Bees`)<br>
