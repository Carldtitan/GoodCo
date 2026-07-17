# Theme 6: Every Team Member an Analyst

Goal: find free data for plain-language analytics, shift briefs, voice-to-proposal workflows, training simulation, and searchable operating guidance.

Scoring: **Strong** = enough public data to prototype credibly; **Medium** = useful public/open data but needs food-bank internal data; **Weak** = mostly requires internal docs/conversations.

## 28. Answer a plain question from anyone on the team, no ticket, no SQL

Fit score: **Medium; strong for open-data demo, but real value requires connecting internal WMS/TMS/CRM data.**

1. [Census API](https://www.census.gov/data/developers/data-sets.html) — US; API. Use for natural-language questions over demographics and need.
2. [USDA ERS Food Environment Atlas](https://www.ers.usda.gov/data-products/food-environment-atlas/data-access-and-documentation-downloads) — US; CSV. Use for food environment questions. Caveat: mixed years.
3. [California Open Data Portal API](https://data.ca.gov/) — CA; CKAN API/CSV. Use for state grants, health, transportation, agriculture datasets. Caveat: dataset schemas vary.
4. [CHHS Open Data Portal](https://data.chhs.ca.gov/) — CA; Socrata/API. Use for health/human-services questions. Caveat: dataset discovery needed.
5. [DataSF Developers](https://data.sfgov.org/developers) — Bay Area/SF; SODA APIs. Use for local civic data query examples. Caveat: SF only.

## 29. Brief every lead at shift start: inbound, at risk, what changed overnight

Fit score: **Medium; external change feeds are strong, but inbound/inventory risk is internal.**

1. [National Weather Service API](https://www.weather.gov/documentation/services-web-api) — US; real-time API. Use for overnight weather/alert changes. Caveat: weather only.
2. [USDA AMS MyMarketNews API](https://mymarketnews.ams.usda.gov/mymarketnews-api) — US; API. Use for price/market movement changes. Caveat: commodity report complexity.
3. [Caltrans PeMS](https://dot.ca.gov/programs/traffic-operations/mpr/pems-source) — CA; real-time/historical traffic. Use for commute/inbound route changes. Caveat: freeway-focused.
4. [CDSS CalFresh Data Dashboard](https://www.cdss.ca.gov/inforesources/data-portal/research-and-data/calfresh-data-dashboard) — CA; dashboard. Use for changing assistance-demand context. Caveat: not daily.
5. [511 SF Bay Traffic API](https://511.org/open-data/traffic) — Bay Area; real-time incidents/events. Use for Bay Area route/driver brief. Caveat: needs token.

## 30. Turn a voice note from the floor into a structured proposal

Fit score: **Weak as a data-source problem; this is workflow/NLP plus internal policy templates.**

1. [OSHA Warehousing Hazards and Solutions](https://www.osha.gov/warehousing/hazards-solutions) — US; guidance. Use as structured safety taxonomy for proposals. Caveat: not food-bank-specific.
2. [NIOSH Forklift Safety Alert](https://www.cdc.gov/niosh/publications/numbered/2001-109.html) — US; safety cases. Use for risk language/examples. Caveat: not proposal data.
3. [California Grants Portal](https://www.grants.ca.gov/) — CA; API/CSV. Use to structure proposals around fundable categories. Caveat: funding-oriented.
4. [Cal/OSHA Publications](https://www.dir.ca.gov/dosh/puborder.asp) — CA; safety guidance. Use for California compliance wording. Caveat: documents, not incident data.
5. [DataSF Citywide Nonprofit Spending](https://data.sfgov.org/dataset/Citywide-Nonprofit-Spending/qkex-vh98) — Bay Area/SF; API/CSV. Use to benchmark proposal categories against funded nonprofit work. Caveat: city spending only.

## 31. Simulate receiving, picking, and agency scenarios so new staff practice before live product

Fit score: **Medium; public data can generate realistic scenarios, but internal process maps are needed.**

1. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use realistic food/product categories. Caveat: no warehouse events.
2. [USDA AMS MyMarketNews API](https://mymarketnews.ams.usda.gov/mymarketnews-api) — US; API. Use realistic inbound commodities/prices. Caveat: not donations.
3. [Caltrans PeMS](https://dot.ca.gov/programs/traffic-operations/mpr/pems-source) — CA; traffic history. Use route-delay simulation. Caveat: highways only.
4. [UC Davis Postharvest Produce Facts](https://postharvest.ucdavis.edu/produce-facts/) — CA; reference. Use shelf-life/condition scenarios. Caveat: not event data.
5. [FoodNow Alameda County](https://foodnow.net/) — Bay Area/Alameda; live locator. Use realistic agency/site scenarios. Caveat: no order/receipt history.

## 32. Capture long-tenured staff knowledge into searchable operating guidance

Fit score: **Weak from public data; real data is internal interviews, SOPs, incident notes, and tribal knowledge.**

1. [OSHA Warehousing Hazards and Solutions](https://www.osha.gov/warehousing/hazards-solutions) — US; guidance. Use as a safety knowledge backbone. Caveat: generic.
2. [USDA Food Safety and Inspection Service](https://www.fsis.usda.gov/food-safety) — US; food safety guidance. Use for receiving/storage guidance. Caveat: broad.
3. [Cal/OSHA Publications](https://www.dir.ca.gov/dosh/puborder.asp) — CA; guidance docs. Use for California safety compliance. Caveat: not local SOPs.
4. [CDFA Food Safety](https://www.cdfa.ca.gov/ahfss/) — CA; regulatory/reference. Use for California agriculture/food safety context. Caveat: not warehouse SOPs.
5. [ACCFB Public Reports and Financials](https://www.accfb.org/financials/) — Bay Area/Alameda; reports. Use for public operating context and language. Caveat: not internal procedures.
