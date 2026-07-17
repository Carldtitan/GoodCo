# Theme 7: A Smarter Movement

Goal: find free data for cross-food-bank benchmarks, surplus-to-shortage matching, and policy/economic impact modeling.

Scoring: **Strong** = enough public data to prototype credibly; **Medium** = useful public signals but needs food-bank network/internal data; **Weak** = mostly requires private network data.

## 33. Benchmark receiving, picking, production, and routing across food banks on anonymized data

Fit score: **Weak for true operations benchmarks; public data can benchmark scale/need/spending, not internal productivity.**

1. [Feeding America Network](https://www.feedingamerica.org/our-work/food-bank-network) — US; public network context. Use to identify food-bank network structure. Caveat: no operational KPI dataset.
2. [Feeding America Map the Meal Gap](https://map.feedingamerica.org/) — US; county estimates. Use to normalize food-bank service-area need. Caveat: not warehouse productivity.
3. [IRS Exempt Organizations Business Master File](https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf) — US; downloads. Use nonprofit identity and financial context. Caveat: tax/admin data.
4. [California Association of Food Banks Members](https://www.cafoodbanks.org/our-members/) — CA; member list. Use for California food-bank peer set. Caveat: no KPI data.
5. [ACCFB Annual Report 2024](https://www.accfb.org/annual-report-2024/) — Bay Area/Alameda; annual report. Use for local distribution volume and food recovery benchmarks. Caveat: one organization and annual.

## 34. Match one food bank's surplus to another's shortage before product ages out

Fit score: **Medium for external supply/need signals; Weak without live inventory across food banks.**

1. [USDA AMS MyMarketNews API](https://mymarketnews.ams.usda.gov/mymarketnews-api) — US; API. Use for market surplus/price/movement signals by commodity. Caveat: not food-bank inventory.
2. [USDA NASS QuickStats](https://quickstats.nass.usda.gov/) — US; API/CSV. Use crop production and regional supply history. Caveat: lagging.
3. [CDFA County Crop Reports](https://www.cdfa.ca.gov/exec/county/CountyCropReports.html) — CA; county annual reports. Use California production/surplus geography. Caveat: annual/PDF.
4. [California Association of Food Banks Farm to Family](https://www.cafoodbanks.org/farm-to-family/) — CA; program context. Use for California produce recovery/movement concept. Caveat: no public live inventory API found.
5. [UC Davis CalAg County Crop Reports](https://calag.ucdavis.edu/data/county-crop-reports.html) — CA/Bay Area; downloadable reports. Use Bay Area and surrounding county crop supply history. Caveat: retrospective.

## 35. Model how a SNAP change or economic shift hits our service area, by neighborhood

Fit score: **Strong; this is one of the most buildable ideas with public data.**

1. [US Census ACS API](https://www.census.gov/programs-surveys/acs/data/data-via-api.html) — US; API. Use tract-level poverty, income, household composition, vehicle access, disability, language. Caveat: annual estimates.
2. [USDA ERS Food Security Statistics](https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us/key-statistics-graphics) — US; national data. Use macro food insecurity assumptions. Caveat: not tract-level.
3. [CDSS CalFresh Data Dashboard](https://www.cdss.ca.gov/inforesources/data-portal/research-and-data/calfresh-data-dashboard) — CA; county dashboard. Use CalFresh participation, churn, timeliness, and demographics. Caveat: county-level.
4. [California Healthy Places Index](https://www.healthyplacesindex.org/) — CA; tract-level API/download. Use socioeconomic vulnerability and neighborhood resilience. Caveat: periodic updates.
5. [Healthy Alameda County Food Insecurity Indicator](https://www.healthyalamedacounty.org/indicators/index/view?indicatorId=2107&localeId=238) — Bay Area/Alameda; local indicator. Use local food insecurity baseline. Caveat: not a real-time policy simulator.
