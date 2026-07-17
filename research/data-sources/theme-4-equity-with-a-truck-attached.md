# Theme 4: Equity With a Truck Attached

Goal: find free data for routing, EV charging, driver workload, disruption replanning, and refused/short product patterns.

Scoring: **Strong** = enough public data to prototype credibly; **Medium** = useful public signals but needs food-bank internal data; **Weak** = mostly requires TMS/order/receipt data.

## 18. Route on agency access windows and product urgency, not just miles

Fit score: **Strong for external route/access signals; Medium overall because agency orders, urgency, and access windows are internal or semi-public.**

1. [National Weather Service API](https://www.weather.gov/documentation/services-web-api) — US; real-time API. Use for weather disruptions and product urgency risk. Caveat: no agency windows.
2. [USDA FoodKeeper App](https://www.foodsafety.gov/keep-food-safe/foodkeeper-app) — US; shelf-life guidance. Use to infer product urgency by food type. Caveat: generic.
3. [Caltrans PeMS](https://dot.ca.gov/programs/traffic-operations/mpr/pems-source) — CA; real-time/historical traffic. Use for route travel-time features. Caveat: freeway-focused.
4. [California 211 / local resource directories](https://www.211ca.org/) — CA; service listings. Use for partner/service hours where available. Caveat: coverage and export vary.
5. [FoodNow Alameda County](https://foodnow.net/) — Bay Area/Alameda; live pantry locator. Use for local agency locations/hours/access notes. Caveat: no documented open API found.

## 19. Match EV charging schedules to tomorrow's routes and daytime power cap

Fit score: **Strong for public grid/charger data; Medium overall because fleet routes, depot chargers, and utility account data are internal.**

1. [NREL Alternative Fuel Stations API](https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/) — US; API. Use for public/private EV station locations and route planning. Caveat: availability/utilization may be limited.
2. [CAISO OASIS](https://oasis.caiso.com/) — CA; real-time/historical grid demand, prices, outages. Use for charging cost/grid timing. Caveat: complex interface.
3. [California Energy Commission EV Chargers in California](https://www.energy.ca.gov/data-reports/energy-almanac/zero-emission-vehicle-and-infrastructure-statistics-collection/electric) — CA; dashboard/downloads; semiannual. Use for state charger counts and locations. Caveat: not live utilization.
4. [PG&E Share My Data](https://www.pge.com/en/save-energy-and-money/energy-usage-and-tips/understand-my-usage/share-my-data.html) — CA/Bay Area utility territory; Green Button/API with authorization. Use for food-bank meter interval data and power cap modeling. Caveat: requires account authorization.
5. [511 SF Bay Traffic API](https://511.org/open-data/traffic) — Bay Area; real-time API. Use for route timing that drives charging needs. Caveat: road incidents only.

## 20. Balance driver workload on stop difficulty, not stop count

Fit score: **Medium; public data can estimate difficulty, but actual dock/service time is internal.**

1. [US Census ACS API](https://www.census.gov/programs-surveys/acs/data/data-via-api.html) — US; API. Use for neighborhood access variables like vehicles, disability, poverty, age. Caveat: annual estimates.
2. [Bureau of Transportation Statistics Freight Analysis Framework](https://www.bts.gov/faf) — US; freight flow baselines. Use for freight complexity by region/commodity. Caveat: coarse.
3. [Caltrans PeMS](https://dot.ca.gov/programs/traffic-operations/mpr/pems-source) — CA; traffic speed/congestion. Use for drive-time difficulty. Caveat: freeway-focused.
4. [California Healthy Places Index](https://www.healthyplacesindex.org/) — CA; tract-level social determinants/API with account. Use for stop-neighborhood difficulty. Caveat: not operational.
5. [MTC 511 Open Data Portal](https://mtc.ca.gov/tools-resources/data-tools/511-open-data-portal) — Bay Area; traffic/transit APIs. Use for regional congestion and accessibility. Caveat: needs token.

## 21. Rebuild the day in minutes when a truck goes down or an agency cancels

Fit score: **Medium; public data supports replanning constraints, but cancellations/fleet status are internal.**

1. [National Weather Service API](https://www.weather.gov/documentation/services-web-api) — US; forecasts/alerts/observations. Use for live disruption signals. Caveat: weather only.
2. [FHWA/BTS Freight Analysis Framework](https://www.bts.gov/faf) — US; freight flow context. Use for strategic route/commodity assumptions. Caveat: not live.
3. [Caltrans QuickMap / Road Conditions](https://quickmap.dot.ca.gov/) — CA; live traffic/incidents/closures. Use for state route disruption. Caveat: not food-bank fleet status.
4. [Caltrans PeMS](https://dot.ca.gov/programs/traffic-operations/mpr/pems-source) — CA; real-time/historical freeway data. Use for updated travel times. Caveat: account/freeway focus.
5. [511 SF Bay Traffic API](https://511.org/open-data/traffic) — Bay Area; real-time traffic events. Use for Bay Area same-day replanning. Caveat: major highways.

## 22. Detect patterns in refused product and short receipts across agencies

Fit score: **Weak without agency receipt/refusal records; public data can explain why refusals may happen.**

1. [FDA Recalls, Market Withdrawals, and Safety Alerts](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts) — US; public recalls. Use to identify product safety-related refusals. Caveat: not local receipts.
2. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use to classify product types and nutrition/allergen context. Caveat: no refusal outcomes.
3. [California Department of Public Health Food Recalls](https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/FoodRecalls.aspx) — CA; public recall notices. Use for California-specific safety signals. Caveat: not agency-level.
4. [CDSS CalFresh Data Dashboard](https://www.cdss.ca.gov/inforesources/data-portal/research-and-data/calfresh-data-dashboard) — CA; county benefit data. Use to compare refusal patterns to client need/benefit churn. Caveat: indirect.
5. [FoodNow Alameda County](https://foodnow.net/) — Bay Area/Alameda; pantry/service locator. Use to map agencies and public-facing service patterns. Caveat: no refusal data.
