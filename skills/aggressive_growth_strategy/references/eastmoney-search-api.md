# 东方财富搜索 API 配方（最新动态检索）

本文件是 `aggressive_growth_strategy` 第 7 步「最新动态」的取数配方。接口为东方财富网站搜索框同源的 CMS 文章检索端点，免鉴权，通过 `execute_code` + `urllib.request` 调用；不依赖第三方 SDK。

## 1. 端点与请求形态

| 项目 | 内容 |
|---|---|
| 方法 | GET |
| URL | `https://search-api-web.eastmoney.com/search/jsonp` |
| 查询参数 | `cb`（JSONP 回调名，固定用 `cb`）、`param`（JSON 字符串，需 URL 编码） |
| 返回形态 | JSONP，形如 `cb({...})`，需先剥壳再解析 |
| 鉴权 | 免鉴权；由平台统一工具执行， skill 内不保存任何凭据 |

## 2. `param` 结构

```json
{
  "uid": "",
  "keyword": "贵州茅台",
  "type": ["cmsArticleWebOld"],
  "client": "web",
  "clientType": "web",
  "clientVersion": "curr",
  "param": {
    "cmsArticleWebOld": {
      "searchScope": "default",
      "sort": "default",
      "pageIndex": 1,
      "pageSize": 10,
      "preTag": "<em>",
      "postTag": "</em>"
    }
  }
}
```

| 字段 | 说明 |
|---|---|
| `keyword` | 裸检索词。个股用**裸股票名**，不要拼「最新消息 / 研报」后缀，否则容易被全站热点污染 |
| `sort` | `default`（相关度优先，适合个股）或 `time`（时间优先，适合事件/行业追踪） |
| `searchScope` | `default` |
| `pageIndex` / `pageSize` | 分页；通常第 1 页取 10–20 条即可 |
| `type` | 固定 `["cmsArticleWebOld"]`，对应 CMS 文章列表 |

## 3. 调用模板（execute_code + urllib.request）

```python
import json
import re
import urllib.parse
import urllib.request

ENDPOINT = "https://search-api-web.eastmoney.com/search/jsonp"

def eastmoney_search(keyword: str, sort: str = "default", page_size: int = 10):
    param = {
        "uid": "",
        "keyword": keyword,
        "type": ["cmsArticleWebOld"],
        "client": "web",
        "clientType": "web",
        "clientVersion": "curr",
        "param": {
            "cmsArticleWebOld": {
                "searchScope": "default",
                "sort": sort,
                "pageIndex": 1,
                "pageSize": page_size,
                "preTag": "<em>",
                "postTag": "</em>",
            }
        },
    }
    url = ENDPOINT + "?" + urllib.parse.urlencode({
        "cb": "cb",
        "param": json.dumps(param, ensure_ascii=False, separators=(",", ":")),
    })
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://so.eastmoney.com/",
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw = resp.read().decode("utf-8", errors="replace")

    m = re.search(r"^cb\((.*)\)\s*$", raw, re.S)
    if not m:
        raise RuntimeError("东财搜索返回非预期 JSONP 格式")
    data = json.loads(m.group(1))
    items = (data.get("result") or {}).get("cmsArticleWebOld") or []

    out = []
    for it in items:
        out.append({
            "title": it.get("title", ""),
            "url": it.get("url", ""),
            "date": it.get("date") or it.get("published") or "",
            "source": it.get("source") or it.get("mediaName") or "",
            "snippet": (it.get("content") or it.get("summary") or it.get("snippet") or "")[:280],
        })
    return out
```

## 4. 检索策略（与 SKILL.md 第 7 步一致）

任务要求三连搜，结果按 `title + date + source` 去重后写入报告：

1. `"[名称] 最新消息"` — 用 `sort=default`
2. `"[名称] 研报"` — 用 `sort=default`
3. `"[行业] 趋势 2026"` — 用 `sort=time`

约定：
- 个股检索使用**裸股票名**；加后缀会把全站热点混入结果。
- 行业词过宽容易污染，优先用具体公司名或事件名，并把 `sort` 切到 `time`。
- 每条动态必须保留 `url` 与 `date`，报告中可溯源；检索失败时如实标注「动态检索不可用」，不得编造新闻。

## 5. 失败处理

- JSONP 剥壳失败 / 返回空列表：记录为一次降级，改用 `stock_5d_deep_analysis` 已有的公告与研报字段，不得伪造动态。
- 请求超时或限流：降低 `pageSize` 后重试一次；仍失败则标注数据缺口。
