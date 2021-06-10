import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { BackendService } from "@/common/backend.service";
import { chartColors } from "../chart.colors";
import { BarChart } from "./bar-chart.class";
import { Global } from "@/common/global";

@Component({
  selector: "app-bar-chart",
  templateUrl: "./bar-chart.component.html",
  styleUrls: ["./bar-chart.component.scss"],
})
export class BarChartComponent implements OnInit {
  columnNames = ["Fuel Type", "Value"];

  noDataToShow: boolean = true;

  barCh1 = {};

  dataGeneration = [];
  dataEmissions = [];
  dataConsumption = [];
  dataWithdrawal = [];

  /* Temporary data holders */
  _dataGeneration = [];
  _dataEmissions = [];
  _dataConsumption = [];
  _dataWithdrawal = [];

  /* Used to refresh the bar chart on tab change and redraw */
  refreshBar() {
    if (this.barChart1.dataTable.length == 0) {
      this.noDataToShow = true;
      return;
    }

    this.noDataToShow = false;

    this.barChart1.component.wrapper.draw();
    this.barChart2.component.wrapper.draw();
    this.barChart3.component.wrapper.draw();
    this.barChart4.component.wrapper.draw();
    // }, 1000);
  }

  constructor(
    private backendService: BackendService,
    private cd: ChangeDetectorRef
  ) {}

  /* Data in Bar Chart (TOP 5 Data)
      Case 1 : All us => defaultViewData/plantType => Top_Records
      Case 2 : state view => getSummaryWithin/state/xxxx/plantType => Top_Records
      Case 3 : huc-view => getSummaryWithin/HUC8Name/xxxx/plantType => Top_Records
      Case 4 : county => getSummaryWithin/CountyState1/xxxx/plantType => Top_Records
    */

  /* Following Objects instantiates bar charts using bar-chart.class */
  public barChart1 = new BarChart("Generation (MWh)");
  public barChart2 = new BarChart("Emissions (MtCO₂e)");
  public barChart3 = new BarChart("Consumption (MGal)");
  public barChart4 = new BarChart("Withdrawal (MGal)");

  /* Used for setting chart data table header row */
  get resetDataTableFirstRow() {
    return [
      [
        "Types",
        "Value",
        { role: "style" },
        { role: "annotation" },
        {
          type: "string",
          label: "Tooltip Chart",
          role: "tooltip",
          p: { html: true },
        },
      ],
    ];
  }

  ngOnInit() {
    this.backendService.barChartData$.subscribe((res) => {
      /* Check for empty data */
      if (
        typeof res == "undefined" ||
        res.length == 0 ||
        (typeof res.getSummaryWithinByTypeDataBarChart["Summary"] !=
          "undefined" &&
          res.getSummaryWithinByTypeDataBarChart["Summary"].length == 0)
      ) {
        this.noDataToShow = true;

        return;
      } else {
        this.noDataToShow = false;

        this._dataGeneration = this.resetDataTableFirstRow;
        this._dataEmissions = this.resetDataTableFirstRow;
        this._dataConsumption = this.resetDataTableFirstRow;
        this._dataWithdrawal = this.resetDataTableFirstRow;

        if (
          typeof res.getSummaryWithinByTypeDataBarChart.Summary !=
            "undefined" &&
          typeof res.getSummaryWithinByTypeDataBarChart != "undefined"
        ) {
          let resData = res.getSummaryWithinByTypeDataBarChart.Summary;
          let resTotalSummary =
            res.getSummaryWithinByTypeDataBarChart["Total Summary"][0];
          let i = 0;

          /* Prepare data */
          resData.forEach((val) => {
            let gnTooltipHtml = `<b>${val.filterName}     
          <br>${val.generation
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MWh)</b>`;

            let emTooltipHtml = `<b>${
              val.filterName
            }<br>${val.emission
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MtCO₂e)</b>`;

            let wcTooltipHtml = `<b>${
              val.filterName
            }<br>${val.waterConsumption
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MGal)</b>`;

            let wwTooltipHtml = `<b>${
              val.filterName
            }<br>${val.waterWithdrawal
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MGal)</b>`;

            if (val.generation > 0) {
              this._dataGeneration.push([
                val.filterName,
                Number(val.generation),
                chartColors[i],
                val.filterName,
                gnTooltipHtml,
              ]);

              this._dataEmissions.push([
                val.filterName,
                Number(val.emission),
                chartColors[i],
                val.filterName,
                emTooltipHtml,
              ]);

              this._dataWithdrawal.push([
                val.filterName,
                Number(val.waterWithdrawal),
                chartColors[i],
                val.filterName,
                wwTooltipHtml,
              ]);

              this._dataConsumption.push([
                val.filterName,
                Number(val.waterConsumption),
                chartColors[i],
                val.filterName,
                wcTooltipHtml,
              ]);
            }

            i++;
          });
        }

        this.barChart1.dataTable = this._dataGeneration;
        this.barChart2.dataTable = this._dataEmissions;
        this.barChart3.dataTable = this._dataConsumption;
        this.barChart4.dataTable = this._dataWithdrawal;

        /* The draw functions draw the chart */
        if (this.barChart1.dataTable.length > 0) {
          try {
            this.barChart1.component.draw();
            this.barChart2.component.draw();
            this.barChart3.component.draw();
            this.barChart4.component.draw();
          } catch (e) {}
        }
      }
    });

  }
}
