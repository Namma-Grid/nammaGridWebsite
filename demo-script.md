# NammaGrid — 5-Minute Investor Demo Script

> **Project:** CurrentState — Spatio-Temporal Intelligence for Grid-Aware EV Infrastructure
> **Built for:** BESCOM × AI for Bharat Hackathon 2026
> **Runtime target:** 5:00 (≈600 spoken words at 120 wpm)
> **Audience:** Investors. Mixed format — point to widget, say why it exists commercially. No deep technical dives.

---

## Format key

- **[POINT]** — move cursor to this element before speaking.
- **[SAY]** — exact line. Keep delivery conversational.
- Timestamps are hard caps.

---

## 0. Opening — 0:00 → 0:25

**[ON SCREEN]** Dashboard hero.

**[SAY]**
> India adds electric vehicles faster than it adds charging infrastructure. And almost every EV in Bengaluru plugs in at the same time — 6 to 9 PM — creating concentrated grid stress that BESCOM has no predictive tool to manage.
>
> That's a 100-billion-rupee planning gap. No utility in India has solved it. What you're looking at is **NammaGrid** — a living digital twin of Bengaluru's EV demand layer, built to solve exactly that, without touching a single piece of existing distribution hardware.

---

## 1. Dashboard — 0:25 → 0:42

**[ON SCREEN]** Dashboard. Pause on stats bar, then sweep cards.

**[POINT]** 4 stat cards at top.

**[SAY]**
> Up here — 4 live stats. Total zones, split by residential, workplace, and marketplace. These are the city's cells. Everything else is built on top of them.

**[POINT]** Sweep all 6 feature cards.

**[SAY]**
> Six modules below. Each one answers a specific question BESCOM cannot answer today. We didn't build anything that wasn't in the brief.

---

## 2. Hex Grid — 0:42 → 1:00

**[ON SCREEN]** Hex Grid page. Map loaded.

**[POINT]** Zone legend.

**[SAY]**
> Here — the spatial skeleton of the twin. Three zone types in the legend: residential, workplace, marketplace. 1,519 cells covering the city.

**[POINT]** Hover a high-demand cell.

**[SAY]**
> We built this because demand prediction without land-use context is noise. A residential zone peaks at 7 PM. A workplace zone at 10 AM. If you don't encode that, your forecast is wrong from the start — and wrong forecasts lead to wrong infrastructure spend.

---

## 3. EV Routes — 1:00 → 1:15

**[ON SCREEN]** EV Routes. MG Road → Whitefield loaded.

**[POINT]** Red corridor segments on map.

**[SAY]**
> Here — the route intelligence layer. Two location pickers, one map, one stats panel.

**[POINT]** Stats panel.

**[SAY]**
> We built this because BESCOM's problem isn't just stationary demand — it's corridor stress. The red segments show where EV density is highest. Those are the corridors where a new fast-charger generates the fastest commercial return, and they feed directly into the siting model coming up.

---

## 4. Demand Forecast — 1:15 → 1:38

**[ON SCREEN]** Demand page. Slider at 18:00. Koramangala selected.

**[POINT]** Time slider.

**[SAY]**
> Four interactive widgets here — date selector, time slider, area list, and the forecast chart.

**[POINT]** ML forecast chart. Then peak-risk badges.

**[SAY]**
> The chart is a 24-hour forward view of EV plus base grid load. The red badges below it are the overload hours — the ones a scheduler needs to act on before they happen.

**[POINT]** Area selector list.

**[SAY]**
> We built this because BESCOM today operates on historical averages. Averages cannot predict an 8 PM spike in Koramangala on a Monday. This can. And once you know which hours will spike, you can shift them — which is exactly what the next screen does.

---

## 5. Scheduler — Part A — 1:38 → 2:28

**[ON SCREEN]** Planner → Scheduler. Residential, Koramangala.

**[POINT]** Zone toggle buttons.

**[SAY]**
> Seven widgets on this page. These three toggles — residential, workplace, marketplace — switch the entire view. Everything downstream reacts.

**[POINT]** 24-hour load profile grid.

**[SAY]**
> Here — the 24-hour load profile. Each slot colour-coded from peak red to optimal green. This is the constraint map. Hover any slot, the tooltip tells you exactly what load looks like at that hour.

**[POINT]** LP Schedule chart bars.

**[SAY]**
> This chart is the output — managed load versus unmanaged load, hour by hour, against the grid capacity line. We built this because the cheapest way to protect a grid is not hardware — it's shifting when people charge.

**[POINT]** Peak reduction KPI card.

**[SAY]**
> This number — 30 to 40 percent peak reduction in residential zones. Zero hardware changes. For BESCOM, deferring a single substation upgrade by two years more than pays for this entire system.

**[POINT]** Charging window pills.

**[SAY]**
> These pills — the exact safe hours the optimizer found. Operator sends these to drivers. Done.

**[POINT]** AI Insights accordion. Open one panel.

**[SAY]**
> And down here — five AI insight panels, collapsed by default so the page doesn't fire eight agent calls every load. Open one and it answers in plain language, cached for the session.

---

## 6. Infrastructure Planner — Part B — 2:28 → 3:15

**[ON SCREEN]** Planner → Infra Planner.

**[POINT]** 4-card stat bar.

**[SAY]**
> Five widgets here. Top row — the headline numbers. 1,519 zones analysed, 47 flagged as priority, 23 recommended sites, 340,000 EVs projected by 2027. This is the opening slide of a BESCOM board presentation.

**[POINT]** Zone distribution bars.

**[SAY]**
> Below that — zone distribution. The baseline the ML model scores against.

**[POINT]** ML Recommendations table. First URGENT row.

**[SAY]**
> This table is the commercial core of Part B. We built this because BESCOM's current siting process is field surveys and gut instinct. Every row here is ML-scored across demand pressure, EV growth, and coverage gap. URGENT means all three are critical simultaneously. Each row outputs exact port count and kilowatt capacity — that is a procurement input, not a recommendation.

**[POINT]** Underserved Zones table.

**[SAY]**
> Below — underserved zones. Fewer than two ports per thousand EVs. The deficit column is what CapEx planning is built on. Multiply this gap across ten Indian cities and you see why the market is 500 billion rupees.

**[POINT]** AI Insights accordion — 8 panels.

**[SAY]**
> Eight agent panels covering everything from growth corridors to a three-phase rollout roadmap. Collapsed — loads on demand.

---

## 7. 3D City Explorer — 3:15 → 3:48

**[ON SCREEN]** 3D City. Drive. Let all HUD elements populate.

**[POINT]** Sim clock top-centre.

**[SAY]**
> Six HUD widgets — this is the navigable face of the digital twin. The clock top-centre advances simulated time so a planner can fast-forward to the evening peak without waiting for 6 PM.

**[POINT]** Controls panel top-left.

**[SAY]**
> Controls top-left — arrow keys, space to brake. Any operator picks this up in thirty seconds.

**[POINT]** Speedometer top-right.

**[SAY]**
> Speedometer top-right — live speed and a load bar. The city feels alive, not like a dashboard.

**[POINT]** Priority Zone alert.

**[SAY]**
> When you pass an underserved zone — the pink Priority Zone alert fires. That's the Infra Planner's intelligence surfaced inside the drive. A fleet manager doing a physical site visit sees the same data as the boardroom.

**[POINT]** Station card bottom-left.

**[SAY]**
> Pull up to a station — the card shows live load, tariff, and the LP solver's recommendation. Charge now, shift off-peak, or try alternate. Same logic as the Scheduler, surfaced for the driver.

**[POINT]** Minimap bottom-right.

**[SAY]**
> Minimap bottom-right — station dots and priority zone markers so the operator always knows the nearest nodes of the twin. This is how operator decisions and driver behaviour get unified in one interface — which is the only way to actually move the demand curve.

---

## 8. Architecture — The Moat — 3:48 → 4:45

**[ON SCREEN]** Scheduler with AI Insights visible.

**[SAY]**
> Three layers — together the twin's brain.
>
> **Spatial layer** — here in the hex grid and route maps. An Attentive Hypergraph clusters zones by land-use; a Graph Attention Network models how demand spills when one cluster saturates. Built because static zone averages cannot predict spillover. This layer enables the twin to simulate counterfactuals — what does the grid look like if HSR Layout shifts to midnight charging?
>
> **Temporal layer** — here in the forecast chart. Transformer-based attention on historical peaks, re-weighted in real time by grid load, weather, and tariff. Built because BESCOM needs a 24-hour forward view, not a rear-view mirror.
>
> **Agentic layer** — here in every AI Insights panel. A BESCOM-hosted LLM agent with tool access to forecast, schedule, and location APIs. Never touches raw grid data — data sovereignty met by design. Responses cached and de-duplicated: a hundred planners querying simultaneously cost one inference.
>
> The entire stack runs on-premise. One recalibration deploys it to any utility — TATA Power Mumbai, CESC Kolkata, TNEB Chennai.

---

## 9. The Ask — 4:45 → 5:00

**[ON SCREEN]** Dashboard. 6 feature cards visible.

**[SAY]**
> Six modules. One digital twin. 500 billion rupees of grid investment that needs to be placed precisely, not guessed at.
>
> Non-intrusive. Explainable. On-premise. Ready to deploy across every distribution utility in India.
>
> We are looking for partners who want to own this infrastructure intelligence layer before the grid crisis becomes front-page news.

---

## Recording Checklist

- Pre-load MG Road → Whitefield on Routes.
- Demand slider at 18:00, Koramangala selected.
- Open one AI Insights panel on Scheduler, close it — second open shows **cached** badge live.
- Drive past a Priority Zone alert before pulling into a station in 3D City.
- Hold Planner dropdown open ~1 second on tab transitions — visible UX payoff.
- 120 wpm. Architecture is densest — slow down there.
- Every timestamp is a hard cut.
