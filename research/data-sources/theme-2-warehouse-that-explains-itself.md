# Theme 2: The Warehouse That Explains Itself

Goal: find free data for receiving, slotting, picking, shelf life, equipment risk, and inventory variance.

Scoring: **Strong** = enough public data to prototype credibly; **Medium** = useful public signals but needs food-bank internal data; **Weak** = mostly requires WMS/scanner/maintenance data.

## 6. Put PO and DO data on the scanner at the truck, matched as product is scanned

Fit score: **Weak from public data; this is mainly an internal ERP/WMS/scanner integration problem.**

1. [GS1 US Standards](https://www.gs1us.org/) — US; standards/docs. Use for GTIN, barcode, lot, and traceability concepts. Caveat: standards, not data.
2. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API/downloads. Use to enrich scanned foods with nutrition/category metadata. Caveat: not PO/DO matching.
3. [California Open Data Portal](https://data.ca.gov/) — CA; API/CSV portal. Use for public reference datasets if matching government food programs. Caveat: no food-bank PO data.
4. [CDFA Food Safety Program](https://www.cdfa.ca.gov/ahfss/) — CA; regulatory/reference data. Use for compliance context. Caveat: not operational receipts.
5. [DataSF Developers / SODA API](https://data.sfgov.org/developers) — Bay Area/SF; API documentation. Use as a pattern for scanning location/business datasets. Caveat: no ACCFB scanner events.

## 7. Recommend bin locations from velocity, weight, and pick frequency

Fit score: **Weak without WMS pick history; public data can only provide proxy weights/categories.**

1. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use for product categories and package/nutrition metadata. Caveat: weight may be incomplete.
2. [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/) — Global/US coverage; API/downloads. Use for barcode-level product metadata. Caveat: crowdsourced completeness varies.
3. [BLS Occupational Requirements Survey](https://www.bls.gov/ors/) — US; tables/API via BLS. Use for physical job and material handling constraints. Caveat: broad occupation-level data.
4. [Cal/OSHA Warehouse Worker Resource Center](https://www.dir.ca.gov/dosh/warehouse-distribution-centers.html) — CA; regulatory guidance. Use to avoid unsafe slotting assumptions. Caveat: not a dataset.
5. [DataSF Registered Business Locations](https://data.sfgov.org/Economy-and-Community/Registered-Business-Locations-San-Francisco/g8m3-pdis) — Bay Area/SF; API/CSV. Use for local product/donor location context. Caveat: no warehouse velocity.

## 8. Sequence every pick list for the shortest walk through the building

Fit score: **Weak without warehouse map/bin/pick data; public data helps only with routing algorithms and safety context.**

1. [OR-Tools Routing Library](https://developers.google.com/optimization/routing) — Global/US; open-source solver. Use for pick-path optimization once internal bin coordinates exist. Caveat: library, not data.
2. [OSHA Warehousing Hazards and Solutions](https://www.osha.gov/warehousing/hazards-solutions) — US; safety guidance. Use to constrain route recommendations. Caveat: qualitative.
3. [BLS Injuries, Illnesses, and Fatalities](https://www.bls.gov/iif/) — US; annual data/API. Use for safety risk context in warehousing. Caveat: not facility-level.
4. [Cal/OSHA Census of Fatal Occupational Injuries Dashboard](https://www.dir.ca.gov/dosh/cfoi/) — CA; dashboard. Use for California warehouse/forklift risk context. Caveat: fatal injuries only.
5. [511 SF Bay Open Data](https://511.org/open-data) — Bay Area; APIs. Use only for external route analogy/demo data if no warehouse map exists. Caveat: not indoor routing.

## 9. Flag produce condition and shelf life with a camera at receiving

Fit score: **Medium; public image/shelf-life references can bootstrap, but food-bank receiving images are needed.**

1. [USDA FoodKeeper App Data](https://www.foodsafety.gov/keep-food-safe/foodkeeper-app) — US; public food storage guidance. Use for shelf-life reference by food type. Caveat: consumer guidance, not condition detection.
2. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use to map product names to food categories/nutrients. Caveat: no visual condition.
3. [CDFA County Crop Reports](https://www.cdfa.ca.gov/exec/county/CountyCropReports.html) — CA; reports. Use to prioritize local produce types for condition models. Caveat: annual.
4. [UC Davis Postharvest Center Produce Facts](https://postharvest.ucdavis.edu/produce-facts/) — CA; reference pages. Use for produce handling, storage, quality, and shelf-life attributes. Caveat: reference docs, not images.
5. [UC Davis CalAg County Crop Reports](https://calag.ucdavis.edu/data/county-crop-reports.html) — CA/Bay Area; reports. Use to focus Bay Area crop examples. Caveat: no images.

## 10. Warn us when product will expire before it moves at current velocity

Fit score: **Medium only if internal inventory age and movement velocity are available; public data helps estimate shelf life.**

1. [USDA FoodKeeper App Data](https://www.foodsafety.gov/keep-food-safe/foodkeeper-app) — US; public shelf-life guidance. Use for expiration-risk assumptions. Caveat: not lot-specific.
2. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use to classify foods by category and perishability. Caveat: no inventory movement.
3. [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/) — Global/US; API. Use for barcode/product metadata. Caveat: crowdsourced.
4. [UC Davis Postharvest Center Produce Facts](https://postharvest.ucdavis.edu/produce-facts/) — CA; reference. Use for produce storage/shelf-life ranges. Caveat: not real-time.
5. [SF-Marin Food Bank Food Locator](https://www.sfmfoodbank.org/find-food/) — Bay Area/SF/Marin; live public locator. Use to approximate nearby distribution outlets for urgent movement. Caveat: no inventory/velocity API advertised.

## 11. Predict forklift and dock equipment failures before they happen

Fit score: **Weak without maintenance logs, hour meters, inspection records, and telematics.**

1. [OSHA Data](https://www.osha.gov/data) — US; downloadable inspection, severe injury, and enforcement data. Use for external risk baselines. Caveat: not predictive maintenance.
2. [BLS Injuries, Illnesses, and Fatalities](https://www.bls.gov/iif/) — US; annual data. Use for warehousing/forklift injury trends. Caveat: injury outcomes, not machine failures.
3. [NIOSH Forklift Safety Alert](https://www.cdc.gov/niosh/publications/numbered/2001-109.html) — US; safety guidance/case evidence. Use for risk factors. Caveat: not machine telemetry.
4. [Cal/OSHA CFOI Dashboard](https://www.dir.ca.gov/dosh/cfoi/) — CA; dashboard. Use for California fatal incident analysis. Caveat: fatal incidents only.
5. [Caltrans PeMS](https://dot.ca.gov/programs/traffic-operations/mpr/pems-source) — CA/Bay Area coverage; real-time/historical detector uptime context. Use only as an equipment-sensor reliability analogy. Caveat: road detectors, not forklifts.

## 12. Point cycle counts at the bins most likely to have variances

Fit score: **Weak without WMS inventory adjustments, pick exceptions, and count history.**

1. [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) — US; API. Use to normalize item/category metadata. Caveat: no count variance.
2. [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/) — Global/US; API. Use barcode/product enrichment. Caveat: incomplete labels.
3. [FDA Recalls, Market Withdrawals, and Safety Alerts](https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts) — US; public feed/pages. Use to flag products needing special count/hold attention. Caveat: not inventory variance.
4. [California Open Data Portal](https://data.ca.gov/) — CA; API/CSV. Use for reference datasets and government food program crosswalks. Caveat: no WMS.
5. [DataSF SODA APIs](https://data.sfgov.org/developers) — Bay Area/SF; API pattern. Use as a prototype target for queryable inventory-style dashboards. Caveat: not food-bank bin data.
