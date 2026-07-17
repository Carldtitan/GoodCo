# Theme 3: Production Is Manufacturing

Goal: find free data for repack/kit forecasts, line setup, volunteer turnout, staging, and yield/waste.

Scoring: **Strong** = enough public data to prototype credibly; **Medium** = useful public signals but needs food-bank internal data; **Weak** = mostly requires production/volunteer management data.

## 13. Forecast boxes, bags, and kits to build, by program, weeks ahead

Fit score: **Medium; public demand signals are good, but program orders and historical kit output are internal.**

1. [Feeding America Map the Meal Gap](https://map.feedingamerica.org/) — US; county food insecurity and meal-cost estimates. Use for demand priors. Caveat: annual/retrospective.
2. [USDA ERS Food Security Statistics](https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us/key-statistics-graphics) — US; national/household data. Use for macro demand context. Caveat: not local program-level.
3. [CDSS CalFresh Data Dashboard](https://www.cdss.ca.gov/inforesources/data-portal/research-and-data/calfresh-data-dashboard) — CA; dashboard; current county trends. Use for county benefit participation and churn signals. Caveat: Tableau/dashboard extraction may take work.
4. [UCLA AskCHIS](https://ask.chis.ucla.edu/) — CA; query tool; annual survey. Use for California food insecurity and health/demographic demand signals. Caveat: survey estimates.
5. [ACCFB Annual Report 2024](https://www.accfb.org/annual-report-2024/) — Bay Area/Alameda; annual report. Use for 60M pounds distributed and local operational scale. Caveat: not machine-readable production demand.

## 14. Recommend line setup and crew size for what is actually being packed that day

Fit score: **Weak without production task times, station layouts, and volunteer roster history.**

1. [BLS Occupational Requirements Survey](https://www.bls.gov/ors/) — US; data tables/API. Use for physical/task requirement assumptions. Caveat: broad occupation averages.
2. [BLS American Time Use Survey](https://www.bls.gov/tus/) — US; microdata. Use for volunteer/time availability macro features. Caveat: not shift-specific.
3. [OSHA Warehousing Hazards and Solutions](https://www.osha.gov/warehousing/hazards-solutions) — US; safety guidance. Use for safe staffing/line constraints. Caveat: no throughput data.
4. [California Volunteers Opportunities](https://www.californiavolunteers.ca.gov/volunteer-opportunities/) — CA; live opportunity listings. Use for regional volunteer supply context. Caveat: listing data, not attendance.
5. [SF-Marin Food Bank Volunteer Page](https://www.sfmfoodbank.org/volunteer/) — Bay Area/SF/Marin; live volunteer scheduling context. Use for comparable shift structures. Caveat: no public attendance history.

## 15. Predict volunteer turnout and flag no-show risk before the shift starts

Fit score: **Medium for macro signals; Strong only with internal volunteer signups/attendance.**

1. [AmeriCorps Civic Engagement and Volunteering Dashboard](https://data.americorps.gov/stories/s/AmeriCorps-Civic-Engagement-and-Volunteering-CEV-D/62w6-z7xa/) — US; open data/dashboard. Use for volunteering rates and demographic trends. Caveat: not event-level.
2. [BLS American Time Use Survey](https://www.bls.gov/tus/) — US; microdata/API. Use for time-use and volunteering patterns. Caveat: annual/national survey.
3. [California AmeriCorps Open Data](https://data.americorps.gov/National-Service/California/ujkm-rwgv) — CA; Socrata/open data. Use for California civic engagement baselines. Caveat: not shift signups.
4. [California Volunteers Opportunities](https://www.californiavolunteers.ca.gov/volunteer-opportunities/) — CA; live listings. Use for competition/supply of volunteer opportunities. Caveat: no attendance outcomes.
5. [VolunteerMatch San Francisco](https://www.volunteermatch.org/search?l=San%20Francisco,%20CA,%20USA) — Bay Area/SF; live listings. Use for local volunteer market signals. Caveat: login/listing platform, not open attendance.

## 16. Generate tomorrow's raw material staging plan tonight, by station, in order

Fit score: **Weak without tomorrow's production plan, inventory, recipes/BOMs, and station map.**

1. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use for food category and nutrition metadata in staging. Caveat: no internal inventory.
2. [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/) — Global/US; API/downloads. Use for barcode-level item attributes. Caveat: crowdsourced.
3. [OSHA Warehousing Hazards and Solutions](https://www.osha.gov/warehousing/hazards-solutions) — US; safety constraints. Use for staging safety logic. Caveat: qualitative.
4. [UC Davis Postharvest Center Produce Facts](https://postharvest.ucdavis.edu/produce-facts/) — CA; produce handling guidance. Use for staging perishables. Caveat: reference, not live stock.
5. [511 SF Bay Traffic API](https://511.org/open-data/traffic) — Bay Area; real-time API. Use if staging depends on inbound arrival disruptions. Caveat: road events only.

## 17. Track yield on the line and flag runs producing more waste than they should

Fit score: **Medium for waste benchmarks; Weak without line input/output/waste measurements.**

1. [ReFED Insights Engine](https://insights.refed.org/) — US; free data hub. Use for food waste benchmarks and solution assumptions. Caveat: may not expose every field by API.
2. [EPA Excess Food Opportunities Map](https://www.epa.gov/sustainable-management-food/excess-food-opportunities-map) — US; map/data. Use for excess food/waste ecosystem context. Caveat: facility-level coverage varies.
3. [USDA Food Loss and Waste](https://www.usda.gov/foodlossandwaste) — US; federal resources/data links. Use for waste definitions and benchmarks. Caveat: not line-level.
4. [CalRecycle Organics and Food Recovery](https://calrecycle.ca.gov/organics/food/) — CA; data/guidance. Use for California food recovery and organics context. Caveat: regulatory/reporting focus.
5. [StopWaste Food Waste Resources](https://www.stopwaste.org/at-work/reduce-and-reuse/food-waste) — Bay Area/Alameda; local resources. Use for Bay Area waste prevention/recovery context. Caveat: guidance, not production yield data.
