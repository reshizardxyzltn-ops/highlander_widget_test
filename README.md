# Virginia's Bluest and Reddest Counties

*The Highlander · Decision '26*

This is an interactive clicker for the Nov. 3, 2026, U.S. Senate race (Mark Warner vs. Bert Mizusawa). Readers switch between the 10 most Democratic and the 10 most Republican Virginia localities. They can rank counties only, or counties and independent cities together. A Virginia map numbers each locality on the list, and hovering a row highlights its spot on the map.

## What's in the folder

| Path | What it is |
|---|---|
| `index.html` | The widget page. |
| `css/styles.css` | All styling (Poppins, The Highlander's paper and ink colors). |
| `js/app.js` | The clicker, the map, the ranked list and auto-height for iframes. It uses no libraries. |
| `data/widget-data.js` | The data the page loads: results, top-10 lists and the projected map shapes. |
| `data/va_senate_localities_2026.json` | Clean results for all 133 localities, with shares, margins and ranks. |
| `data/va_senate_localities_raw.txt` | The vote counts as copied from the state results site, with the retrieval time. |
| `data/va_localities_geo.json` | Locality outlines (U.S. Census Bureau cartographic boundaries, 2017 edition). |
| `img/` | The Decision '26 logo and the two candidate photos. |
| `_headers` | A Cloudflare Pages setting that allows the page to be shown in an iframe on another site. |

## Put it on Cloudflare Pages

1. Unzip this folder.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Upload assets**.
3. Name the project (for example `highlander-virginia`) and drag in the **contents** of this folder. `index.html` must be at the top level, not inside another folder.
4. Click **Deploy**. Your widget is live at `https://highlander-virginia.pages.dev/`.

To update the widget later, open the project, choose **Create new deployment**, and upload the folder again.

## Embed it in SNO

Paste this into a **Custom HTML** block. Replace the address with yours.

```html
<iframe id="va-top10" src="https://highlander-virginia.pages.dev/" title="Virginia's bluest and reddest counties"
  loading="lazy" scrolling="no" style="width:100%;height:1600px;border:0;display:block"></iframe>
<script>
window.addEventListener("message", function (e) {
  if (e.data && e.data.type === "highlander-va-top10-height") {
    document.getElementById("va-top10").style.height = e.data.height + "px";
  }
});
</script>
```

The page reports its own height, so the iframe fits it automatically. If SNO removes the `<script>` part, keep only the iframe. A height of 1600px fits on desktop and phones.

To open a specific list, add one of these to the address: `#rep` (Republican), `#dem-all` or `#rep-all` (counties and cities).

## About the numbers

- **Source:** Virginia Department of Elections, retrieved Nov. 8, 2026, at 2:24 p.m. EST. The figures are **unofficial** and can change until the results are certified. The 133 localities add up exactly to the state's totals: Warner 2,202,170, Mizusawa 1,380,804, write-ins 9,538.
- **Ranking:** Warner's share minus Mizusawa's share of all Senate votes in each locality. Write-ins count toward the total.
- **Counties and cities:** Virginia's 38 independent cities are separate from its 95 counties. The "Counties" view ranks the 95 counties only.
- **Manassas Park city** was listed as partly reported when the data was retrieved. It does not appear in any of the lists.
- **Map:** U.S. Census Bureau cartographic boundary files, 2017 edition (via the `us-atlas` package). Its 133 localities match the state's list exactly, by FIPS code.

## Compact SNO embed
This version reduces the widget's **actual** vertical spacing and map footprint so the full widget fits in a shorter iframe without using negative margins or clipping the article. Start with iframe `height: 950px;` and `scrolling="no"`; if a particular viewport still cuts off the credit line, increase the iframe height slightly. Do not apply a negative bottom margin to the iframe.
