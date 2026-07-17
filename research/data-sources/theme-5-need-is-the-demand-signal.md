# Theme 5: Need Is the Demand Signal

Goal: find free data for neighborhood need, replenishment, access friction, preference/diet fit, and multilingual food access information.

Scoring: **Strong** = enough public data to prototype credibly; **Medium** = useful public signals but needs food-bank/internal partner data; **Weak** = mostly requires agency/client data.

## 23. Flag when an agency's ordering drifts from what their neighborhood actually needs

Fit score: **Strong for neighborhood need signals; Medium overall because agency ordering is internal.**

1. [US Census ACS API](https://www.census.gov/programs-surveys/acs/data/data-via-api.html) — US; API. Use poverty, household size, language, age, disability, vehicle access by tract. Caveat: annual estimates.
2. [Feeding America Map the Meal Gap](https://map.feedingamerica.org/) — US; county food insecurity. Use for need baseline. Caveat: county-level and annual.
3. [CDSS CalFresh Data Dashboard](https://www.cdss.ca.gov/inforesources/data-portal/research-and-data/calfresh-data-dashboard) — CA; county current trends. Use for benefit participation/churn. Caveat: county-level.
4. [California Health Interview Survey / AskCHIS](https://ask.chis.ucla.edu/) — CA; survey query tool. Use for food insecurity by demographic/geography. Caveat: survey margins.
5. [Healthy Alameda County Food Insecurity Indicator](https://www.healthyalamedacounty.org/indicators/index/view?indicatorId=2107&localeId=238) — Bay Area/Alameda; local indicator. Use for Alameda-specific need context. Caveat: not real-time.

## 24. Replace pre-allocation with pull-based replenishment signals

Fit score: **Medium; public data helps define need, but pull signals require agency inventory/orders/client demand.**

1. [USDA Food Environment Atlas](https://www.ers.usda.gov/data-products/food-environment-atlas/data-access-and-documentation-downloads) — US; CSV/Excel. Use for county food access, stores, local food, assistance indicators. Caveat: mixed years.
2. [USDA Food Access Research Atlas](https://www.ers.usda.gov/data-products/food-access-research-atlas/download-the-data) — US; tract-level Excel. Use for low-income/low-access indicators. Caveat: not live.
3. [CDSS CalFresh Data Dashboard](https://www.cdss.ca.gov/inforesources/data-portal/research-and-data/calfresh-data-dashboard) — CA; current county dashboard. Use for public-benefit demand signal. Caveat: not agency-specific.
4. [California Healthy Places Index](https://www.healthyplacesindex.org/) — CA; tract-level API/download with account. Use for social determinants and need scoring. Caveat: not pantry demand.
5. [FoodNow Alameda County](https://foodnow.net/) — Bay Area/Alameda; live locator. Use for local distribution network and access points. Caveat: no public order volume.

## 25. Warn us when access friction is building, before neighbors quietly stop coming

Fit score: **Strong for access-friction proxies; Medium overall without pantry visit/drop-off data.**

1. [Urban Institute charitable food access research](https://www.urban.org/research/publication/why-many-struggle-access-charitable-food-while-demand-remains-high) — US; public survey/report. Use for barriers like awareness, stigma, transportation, hours. Caveat: report data, not live local feed.
2. [US Census ACS API](https://www.census.gov/programs-surveys/acs/data/data-via-api.html) — US; API. Use vehicle access, disability, age, poverty, language, work schedules. Caveat: annual.
3. [CalEnviroScreen 4.0](https://data.ca.gov/dataset/calenviroscreen-4-0) — CA; download/API via state portal. Use environmental and socioeconomic vulnerability by tract. Caveat: not food-specific.
4. [California Healthy Places Index](https://www.healthyplacesindex.org/) — CA; API/download. Use transportation, economic, housing, and health access factors. Caveat: periodic.
5. [SF-Marin Food Bank Food Locator](https://www.sfmfoodbank.org/find-food/) — Bay Area/SF/Marin; live locator. Use for hours, languages, and program availability. Caveat: no documented public API.

## 26. Match inbound product to neighborhood preferences and dietary patterns

Fit score: **Medium; demographic/nutrition data helps, but true preference requires agency/client feedback.**

1. [US Census ACS API](https://www.census.gov/programs-surveys/acs/data/data-via-api.html) — US; API. Use language, ancestry, household composition, income. Caveat: preference is inferred.
2. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use nutrition, allergens, and food categorization. Caveat: no cultural preference.
3. [UCLA AskCHIS](https://ask.chis.ucla.edu/) — CA; survey tool. Use diet, health, food insecurity by demographic where available. Caveat: survey estimates and geography limits.
4. [CDC PLACES](https://www.cdc.gov/places/index.html) — US/CA; county/place/tract/ZCTA open data. Use diet/health-related local risk measures. Caveat: modeled estimates.
5. [San Francisco API Council Food Assets Map](https://foodmap.apicouncil.org/) — Bay Area/SF; public map. Use for culturally specific food-resource context, especially API communities. Caveat: map-first, export/API unclear.

## 27. Translate pantry hours, eligibility, and locations into plain language, in any language

Fit score: **Strong for public locator/translation prototype; Medium for authoritative eligibility because providers change rules.**

1. [USDA SNAP State Directory](https://www.fns.usda.gov/snap/state-directory) — US; web directory. Use for benefit application links and eligibility routing. Caveat: state rules vary.
2. [US Census ACS Language Data via API](https://www.census.gov/programs-surveys/acs/data/data-via-api.html) — US; API. Use to prioritize languages by tract/community. Caveat: annual estimates.
3. [CDSS CalFresh](https://www.cdss.ca.gov/calfresh) — CA; official program pages. Use for California eligibility and application language. Caveat: website content, not API.
4. [211 California](https://www.211ca.org/) — CA; service directory. Use for multilingual referral resources. Caveat: API/export varies by county/provider.
5. [FoodNow Alameda County](https://foodnow.net/) and [comidaahora.net](https://comidaahora.net/) — Bay Area/Alameda; live bilingual food locator. Use for local pantry hours/locations in English and Spanish. Caveat: no documented open API found.
