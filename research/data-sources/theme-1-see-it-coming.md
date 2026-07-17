# Theme 1: See It Coming

Goal: find free data for forecasting volatile inbound supply, vendor reliability, purchase timing, truck arrivals, and grant/funding fit.

Scoring: **Strong** = enough public data to prototype credibly; **Medium** = useful public signals but needs food-bank internal data; **Weak** = mostly requires partner/internal data.

## 1. Build a produce forecast off harvest calendars and inbound history

Fit score: **Strong for external produce supply signals; Medium overall because inbound donation history is internal.**

1. [USDA NASS QuickStats](https://quickstats.nass.usda.gov/) — US; API/CSV; updated weekdays after releases. Use for crop production, acreage, yields, state/county history. Caveat: not real-time harvest availability.
2. [USDA AMS MyMarketNews API](https://mymarketnews.ams.usda.gov/mymarketnews-api) — US; API; timely market reports. Use for produce shipping point, terminal market, price, and movement signals. Caveat: commodity/report coverage varies.
3. [CDFA California Agricultural Production Statistics](https://www.cdfa.ca.gov/Statistics/) — CA; reports/downloads; annual. Use for California crop volumes and commodity importance. Caveat: retrospective.
4. [CDFA County Crop Reports](https://www.cdfa.ca.gov/exec/county/CountyCropReports.html) — CA; county reports; annual. Use for county-level production, including Bay Area counties where reported. Caveat: PDFs/annual lag.
5. [UC Davis CalAg County Crop Reports](https://calag.ucdavis.edu/data/county-crop-reports.html) — CA/Bay Area; downloadable county crop reports, 1908-2025. Use for Alameda, Contra Costa, Napa, Sonoma, Santa Clara, and other 9-county Bay Area crop history. Caveat: not live.

## 2. Score every donor and vendor on delivered versus committed

Fit score: **Weak from public data alone; Strong only with donor/VMS/WMS commitment and receipt exports.**

1. [USDA AMS MyMarketNews API](https://mymarketnews.ams.usda.gov/mymarketnews-api) — US; API; current market data. Use as a benchmark for expected commodity availability and volatility. Caveat: does not identify your donors.
2. [FDA Data Dashboard: Inspections, Compliance, Recalls](https://datadashboard.fda.gov/ora/index.htm) — US; downloadable/searchable federal data. Use for food firm compliance/recall context. Caveat: not a delivery reliability score.
3. [California Department of Public Health Food and Drug Branch recalls](https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/FoodRecalls.aspx) — CA; web reports. Use for California food safety risk signals. Caveat: not transactional.
4. [California Secretary of State Business Search](https://bizfileonline.sos.ca.gov/search/business) — CA; public business records. Use to normalize donor/vendor entities. Caveat: no operational performance.
5. [DataSF Registered Business Locations](https://data.sfgov.org/Economy-and-Community/Registered-Business-Locations-San-Francisco/g8m3-pdis) — Bay Area/SF; Socrata API/CSV. Use to identify SF business/donor locations. Caveat: no pledge/delivery history.

## 3. Flag the right windows to buy purchased food before prices move

Fit score: **Strong for price signals; Medium for actual purchasing because food-bank contracts and preferences are internal.**

1. [USDA AMS MyMarketNews API](https://mymarketnews.ams.usda.gov/mymarketnews-api) — US; API; timely price and movement data for produce, dairy, meat, poultry, eggs, grains, and specialty crops. Caveat: report formats differ.
2. [USDA ERS Food Price Outlook](https://www.ers.usda.gov/data-products/food-price-outlook) — US; monthly forecasts. Use for CPI-linked food price expectations. Caveat: broad categories, not SKU-level.
3. [CDFA Dairy Statistics](https://www.cdfa.ca.gov/dairy/dairy_stats.html) — CA; reports; monthly/annual. Use for California milk/dairy market context. Caveat: one commodity family.
4. [California Agricultural Statistics Review](https://www.cdfa.ca.gov/Statistics/) — CA; annual. Use for California commodity trends and supply concentration. Caveat: lagging.
5. [San Francisco Consumer Price Index, BLS Western region](https://www.bls.gov/regions/west/news-release/consumerpriceindex_sanfrancisco.htm) — Bay Area/SF; BLS releases/API. Use for local grocery/food inflation context. Caveat: consumer-level, not wholesale.

## 4. Predict actual truck arrival times from carrier behavior, not the schedule

Fit score: **Medium for external ETA/weather/traffic; Weak without internal carrier trip history.**

1. [National Weather Service API](https://www.weather.gov/documentation/services-web-api) — US; real-time JSON API. Use for weather conditions affecting truck arrivals. Caveat: no carrier behavior.
2. [Bureau of Transportation Statistics Freight Analysis Framework](https://www.bts.gov/faf) — US; downloadable freight flow data. Use for freight corridor baselines and commodity flow context. Caveat: not real-time.
3. [Caltrans PeMS](https://dot.ca.gov/programs/traffic-operations/mpr/pems-source) — CA; near-real-time and historical freeway detector data; free account. Use for California speed/congestion features. Caveat: freeway-focused.
4. [California 511 / Caltrans road information](https://roads.dot.ca.gov/) — CA; road conditions and incidents. Use for route disruption signals. Caveat: not a predictive model by itself.
5. [511 SF Bay Traffic API](https://511.org/open-data/traffic) — Bay Area; real-time incident/event API; free token. Use for Bay Area truck ETA disruptions. Caveat: major highways/events only.

## 5. Scan grant and funding streams and match them to capital and program needs

Fit score: **Strong for opportunity discovery; Medium for match quality because food-bank priorities and budgets are internal.**

1. [Grants.gov Search API](https://grants.gov/api/common/search2) — US; API; active federal opportunities. Use for food, logistics, climate, workforce, and nonprofit grants. Caveat: some details require deeper documents.
2. [USDA Grants and Loans](https://www.usda.gov/topics/farming/grants-and-loans) — US; web portal. Use for agriculture/food-system funding categories. Caveat: not always structured.
3. [California Grants Portal](https://www.grants.ca.gov/) — CA; searchable portal, API/CSV via data.ca.gov; updated daily. Use for state grants and loans. Caveat: eligibility still needs interpretation.
4. [California Grants Portal Grant Awards datasets](https://www.lab.data.ca.gov/datasets?q=Grants&tag=Grants) — CA; CSV/API. Use to learn which organizations receive awards and for what purposes. Caveat: award reporting lag.
5. [DataSF Citywide Nonprofit Spending](https://data.sfgov.org/dataset/Citywide-Nonprofit-Spending/qkex-vh98) — Bay Area/SF; Socrata API/CSV; annual close. Use for local nonprofit funding patterns. Caveat: city payments, not all grants.
