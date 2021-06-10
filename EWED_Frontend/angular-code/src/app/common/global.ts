
import {
  HistoricFormDefaults,
  PredictedForDefaults,
  QueryFormType,
} from "../components/query-form/query-form.defaults";
import { monthNames } from "../models/month-names";

/* This is the main class with holds the global state for the dashboard
 * and keeps the url in sync with all the components of the dashboard.
 * The urlObj in this Global class is updated with every interaction
 * which causes a change in URL */
export class Global {

  // static serverAddr = window.location.hostname; 
   static serverAddr = 'http://localhost'; 
  //static serverAddr = 'https://ewed.org'; 

  static urlObj: {
    /* Stores the keywords for the display value in map form
     * which sets the criteria for calculation of colors / size
     * of facility circles */
    display?: string;

    /* Stores the value of view by form in map form which selects
     * what layers are show in the map
     * States, Watersheds, Counties or facilities */
    viewBy?: string;

    /* Keyword used for API request calls */
    filterValue?: string;

    /* State / county / huc-region */
    filterField?: string;

    /* Historic form values */
    fromMonthHistoric?: string;
    fromYearHistoric?: string;
    toMonthHistoric?: string;
    toYearHistoric?: string;

    /* Predicted form date values */
    fromMonthPredicted?: string;
    fromYearPredicted?: string;
    toMonthPredicted?: string;
    toYearPredicted?: string;

    /* State/county/watershed */
    urlPrefix?: string;

    /* Stores the url string - https://ewed.org or localhost
     * this is used to prefix all the urls for frontend and backend*/
    serverAddr?: string;

    /* Keyword that appears in the url */
    filterValueUrl?: string;

    /* Keyword that appears in query form search input */
    searchKeyword?: string;

    /* Datatab keyword - stores the keyword based on selected data tab
     * i.e. table, line, bar, pie */
    dataTab?: string;

    /* The dataTab that was selected in previous url */
    previousDataTab?: string;

    /* The state name that was selected in previous url */
    previousState?: string;

    /* The current state name */
    currentState?: string;

    /* Keeps track of the previous value in the view by form */
    previousViewBy?: string;

    /* Comma separated list of fuel types in url */
    fuelTypes?: string;

    /* Keeps track of selected values in
     * the filter by fuel type form */
    selectedFuelTypesInDialog?: object;

    /* Holds the strings used in urls for
     * making requests to the three ports
     * on which the JAR files are listening */
    requestUrlPrefix?: string;
    requestUrlPrefix2?: string;
    requestUrlPrefix3?: string;

    /* Value for which query form is activated
     * i.e. historic or projected */
    formType?: string;

    /* Additional filter values for the predicted form */
    climateModel?: string;
    climateScenario?: string;
    energyScenario?: string;

    /* used to avoid navigation call to same url */
    currentUrl?: string;
  };

  static get updateActivityDuration() {
    switch (Global.urlObj.formType) {
      case QueryFormType.HISTORIC_FORM_KEYWORD: {
        if (monthNames[parseInt(Global.urlObj.fromMonthHistoric)])
          return `(${monthNames[parseInt(Global.urlObj.fromMonthHistoric)]} ${
            Global.urlObj.fromYearHistoric
          } - ${monthNames[parseInt(Global.urlObj.toMonthHistoric)]} ${
            Global.urlObj.toYearHistoric
          })`;
        break;
      }
      case QueryFormType.PROJECTED_FORM_KEYWORD: {
        if (monthNames[parseInt(Global.urlObj.fromMonthPredicted)])
          return `(${monthNames[parseInt(Global.urlObj.fromMonthPredicted)]} ${
            Global.urlObj.fromYearPredicted
          } - ${monthNames[parseInt(Global.urlObj.toMonthPredicted)]} ${
            Global.urlObj.toYearPredicted
          })`;
      }
    }
  }

  /* Projected Month-Year Validation */
  static validateProjectedFormMonthYear() {
    /* Set months from = 1 & to = 12 if out of range */
    if (
      typeof Number(Global.urlObj.fromMonthPredicted) !== "number" ||
      typeof Number(Global.urlObj.fromYearPredicted) !== "number" ||
      typeof Number(Global.urlObj.toMonthPredicted) !== "number" ||
      typeof Number(Global.urlObj.toYearPredicted) !== "number" ||
      typeof Global.urlObj.fromMonthPredicted == "undefined" ||
      Global.urlObj.fromMonthPredicted == "undefined" ||
      typeof Global.urlObj.fromYearPredicted == "undefined" ||
      Global.urlObj.fromYearPredicted == "undefined" ||
      typeof Global.urlObj.toMonthPredicted == "undefined" ||
      Global.urlObj.toMonthPredicted == "undefined" ||
      typeof Global.urlObj.toYearPredicted == "undefined" ||
      Global.urlObj.toYearPredicted == "undefined" ||
      Number(Global.urlObj.fromMonthPredicted) < 1 ||
      Number(Global.urlObj.fromYearPredicted) <
        PredictedForDefaults.MIN_DATE.year ||
      Number(Global.urlObj.fromMonthPredicted) > 12 ||
      Number(Global.urlObj.fromYearPredicted) >
        PredictedForDefaults.MAX_DATE.year ||
      Number(Global.urlObj.toMonthPredicted) < 1 ||
      Number(Global.urlObj.toYearPredicted) <
        PredictedForDefaults.MIN_DATE.year ||
      Number(Global.urlObj.toMonthPredicted) > 12 ||
      Number(Global.urlObj.toYearPredicted) > PredictedForDefaults.MAX_DATE.year
    ) {
      Global.urlObj.fromMonthPredicted = "1";
      Global.urlObj.toMonthPredicted = "12";
      Global.urlObj.fromYearPredicted =
        PredictedForDefaults.DEFAULT_FROM_DATE.year + "";
      Global.urlObj.toYearPredicted =
        PredictedForDefaults.DEFAULT_TO_DATE.year + "";
    }
  }

  /* Historic Month-Year Validation 
  Redirect all to default :
  Jan 2015 - Dec 2015
  */
  static validateHistoricFormMonthYear() {
    /* Set months from = 1 & to = 12 if out of range */
    if (
      typeof Number(Global.urlObj.fromMonthHistoric) !== "number" ||
      typeof Number(Global.urlObj.fromYearHistoric) !== "number" ||
      typeof Number(Global.urlObj.toMonthHistoric) !== "number" ||
      typeof Number(Global.urlObj.toYearHistoric) !== "number" ||
      typeof Global.urlObj.fromMonthHistoric == "undefined" ||
      Global.urlObj.fromMonthHistoric == "undefined" ||
      typeof Global.urlObj.fromYearHistoric == "undefined" ||
      Global.urlObj.fromYearHistoric == "undefined" ||
      typeof Global.urlObj.toMonthHistoric == "undefined" ||
      Global.urlObj.toMonthHistoric == "undefined" ||
      typeof Global.urlObj.toYearHistoric == "undefined" ||
      Global.urlObj.toYearHistoric == "undefined" ||
      Number(Global.urlObj.fromYearHistoric) <
        HistoricFormDefaults.MIN_DATE.year ||
      Number(Global.urlObj.toYearHistoric) <
        HistoricFormDefaults.MIN_DATE.year ||
      Number(Global.urlObj.fromMonthHistoric) < 1 ||
      Number(Global.urlObj.toMonthHistoric) < 1 ||
      Number(Global.urlObj.fromYearHistoric) >
        HistoricFormDefaults.MAX_DATE.year ||
      Number(Global.urlObj.toYearHistoric) >
        HistoricFormDefaults.MAX_DATE.year ||
      Number(Global.urlObj.fromMonthHistoric) > 12 ||
      Number(Global.urlObj.toMonthHistoric) > 12
    ) {
      Global.urlObj.fromMonthHistoric = "1";
      Global.urlObj.toMonthHistoric = "12";
      Global.urlObj.fromYearHistoric =
        HistoricFormDefaults.DEFAULT_FROM_DATE.year + "";
      Global.urlObj.toYearHistoric =
        HistoricFormDefaults.DEFAULT_TO_DATE.year + "";
    }
  }

  /* Checks for undefined fields in the energy climate fields */
  static validateProjectedEnergyClimateFields() {
    if (
      typeof Global.urlObj.climateModel == "undefined" ||
      typeof Global.urlObj.climateScenario == "undefined" ||
      typeof Global.urlObj.energyScenario == "undefined" ||
      Global.urlObj.climateModel == "undefined" ||
      Global.urlObj.climateScenario == "undefined" ||
      Global.urlObj.energyScenario == "undefined" ||
      Global.urlObj.climateModel === "na" ||
      Global.urlObj.climateScenario === "na" ||
      Global.urlObj.energyScenario === "na"
    ) {
      Global.urlObj.energyScenario = "REF2019";
      Global.urlObj.climateScenario = "RCP45";
      Global.urlObj.climateModel = "AVG45";
    }
  }

  static validate() {
    this.validateHistoricFormMonthYear();
    this.validateProjectedEnergyClimateFields();
    this.validateProjectedFormMonthYear();
  }

  static get getUrlString(): string {
    if (Global.urlObj.formType == QueryFormType.HISTORIC_FORM_KEYWORD) {
      return (
        `${Global.urlObj.formType}/${Global.urlObj.urlPrefix}/${Global.urlObj.filterValueUrl}/${Global.urlObj.viewBy}/${Global.urlObj.display}/` +
        `na/na/na/` +
        `${Global.urlObj.fromYearHistoric}/${Global.urlObj.fromMonthHistoric}/${Global.urlObj.toYearHistoric}/${Global.urlObj.toMonthHistoric}/` +
        `${Global.urlObj.dataTab}/fuelTypes/${Global.urlObj.fuelTypes}`
      );
    } else if (Global.urlObj.formType == QueryFormType.PROJECTED_FORM_KEYWORD) {
      return (
        `${Global.urlObj.formType}/${Global.urlObj.urlPrefix}/${Global.urlObj.filterValueUrl}/${Global.urlObj.viewBy}/${Global.urlObj.display}/` +
        `${Global.urlObj.energyScenario}/${Global.urlObj.climateScenario}/${Global.urlObj.climateModel}/` +
        `${Global.urlObj.fromYearPredicted}/${Global.urlObj.fromMonthPredicted}/${Global.urlObj.toYearPredicted}/${Global.urlObj.toMonthPredicted}/` +
        `${Global.urlObj.dataTab}/fuelTypes/${Global.urlObj.fuelTypes}`
      );
    }
  }

  static APP_VERSION: string = "3.0";
}
