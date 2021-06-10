import { Component, OnInit, ViewChild } from "@angular/core";

import { GoogleChartComponent } from "angular-google-charts";
import { GoogleChartInterface } from "ng2-google-charts/google-charts-interfaces";
import { BackendService } from "@/common/backend.service";
import { PieChart } from "./pie-chart.class";

@Component({
  selector: "app-pie-chart",
  templateUrl: "./pie-chart.component.html",
  styleUrls: ["./pie-chart.component.scss"],
})
export class PieChartComponent implements OnInit {
  wrapper: any;

  noDataToShow: boolean = true;

  pieComp1;
  pieComp2;
  pieComp3;
  pieComp4;

  pieWrapper1;
  pieWrapper2;
  pieWrapper3;
  pieWrapper4;

  pieChartSubscription;

  /* Temporary data holders */
  _dataGeneration = [];
  _dataEmissions = [];
  _dataConsumption = [];
  _dataWithdrawal = [];

  @ViewChild("chart", { static: true })
  chart: GoogleChartComponent;

  public pieChart1: GoogleChartInterface = new PieChart("Generation (MWh)");
  public pieChart3: GoogleChartInterface = new PieChart("Consumption (MGal)");
  public pieChart4: GoogleChartInterface = new PieChart("Withdrawal (MGal)");
  public pieChart2: GoogleChartInterface = new PieChart("Emissions (MtCO₂e)");

  refreshPie() {
    if (this.pieChart1) this.pieComp1.draw();
    if (this.pieChart2) this.pieComp2.draw();
    if (this.pieChart3) this.pieComp3.draw();
    if (this.pieChart4) this.pieComp4.draw();
  }

  columnNames = [
    "Fuel Type",
    "Value",
    {
      type: "string",
      label: "Tooltip Chart",
      role: "tooltip",
      p: { html: true },
    },
  ];

  dataGeneration = [];
  dataEmissions = [];
  dataConsumption = [];
  dataWithdrawal = [];

  constructor(private backendService: BackendService) {}

  tabFocus(index) {}

  ngAfterViewInit() {}

  resetPieChartData() {
    this._dataGeneration = [];
    this._dataEmissions = [];
    this._dataConsumption = [];
    this._dataWithdrawal = [];

    this.dataGeneration = [];
    this.dataConsumption = [];
    this.dataEmissions = [];
    this.dataWithdrawal = [];

    this._dataGeneration.push(this.columnNames);
    this._dataEmissions.push(this.columnNames);
    this._dataConsumption.push(this.columnNames);
    this._dataWithdrawal.push(this.columnNames);
  }

  ngOnInit() {
    this.pieComp1 = this.pieChart1.component;
    this.pieComp2 = this.pieChart2.component;
    this.pieComp3 = this.pieChart3.component;
    this.pieComp4 = this.pieChart4.component;

    /* Data in Pie Chart
      Case 1 : All us => defaultViewData/plantType
      Case 2 : state view => getSummaryWithin/state/xxxx/plantType
      Case 3 : huc-view => getSummaryWithin/HUC8Name/xxxx/plantType
      Case 4 : county => getSummaryWithin/CountyState1/xxxx/plantType
    */

    this.pieChartSubscription = this.backendService.pieChartData$.subscribe(
      (res) => {
        if (typeof res == "undefined" || res.length == 0) {
          return;
        }

        this.noDataToShow =
          res.getSummaryWithinDataByTypePieChart.Summary.length == 0
            ? true
            : false;

        this.resetPieChartData();

        res = res.getSummaryWithinDataByTypePieChart;

        // let _keys = Object.keys(resData);
        let num, num2, num3, num4;

        if (typeof res != "undefined" && typeof res.Summary != "undefined") {
          res.Summary.forEach((val) => {
            if (val.filterName == null) val.filterName = "Null";

            // set negetive values to zero
            Number(val.generation) < 0
              ? (num = 0)
              : (num = Number(val.generation));

            Number(val.emission) < 0
              ? (num2 = 0)
              : (num2 = Number(val.emission));

            Number(val.waterConsumption) < 0
              ? (num3 = 0)
              : (num3 = Number(val.waterConsumption));

            Number(val.waterWithdrawal) < 0
              ? (num4 = 0)
              : (num4 = Number(val.waterWithdrawal));

            // Prepare tooltips HTML
            let gnTooltipHtml = `<b>${val.filterName}</b>: ${Number(
              (Number(num) / Number(res["Total Summary"][0].totalGeneration)) *
                100
            ).toFixed(1)}%
            <br><b>${num
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MWh)</b>`;

            let emTooltipHtml = `<b>${val.filterName}</b>: ${Number(
              (Number(num2) / Number(res["Total Summary"][0].totalEmission)) *
                100
            ).toFixed(1)}%
            <br><b>${num2
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MtCO₂e)</b>`;

            let wcTooltipHtml = `<b>${val.filterName}</b>: ${Number(
              (Number(num3) /
                Number(res["Total Summary"][0].totalWaterConsumption)) *
                100
            ).toFixed(1)}%
              <br><b>${num3
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MGal)</b>`;

            let wwTooltipHtml = `<b>${val.filterName}</b>: ${Number(
              (Number(num4) /
                Number(res["Total Summary"][0].totalWaterWithdrawal)) *
                100
            ).toFixed(1)}%
            <br><b>${num4
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (MGal)</b>`;

            // prepare chart data
            this._dataGeneration.push([
              val.filterName,
              Number(Number(num).toFixed(0)),
              gnTooltipHtml,
            ]);

            this._dataEmissions.push([
              val.filterName,
              Number(Number(num2).toFixed(0)),
              emTooltipHtml,
            ]);

            this._dataConsumption.push([
              val.filterName,
              Number(Number(num3).toFixed(0)),
              wcTooltipHtml,
            ]);

            this._dataWithdrawal.push([
              val.filterName,
              Number(Number(num4).toFixed(0)),
              wwTooltipHtml,
            ]);
          });
        }

        this.pieChart1.dataTable = this._dataGeneration;
        this.pieChart2.dataTable = this._dataEmissions;
        this.pieChart3.dataTable = this._dataConsumption;
        this.pieChart4.dataTable = this._dataWithdrawal;

        if (
          typeof this.pieChart1.component !== "undefined" &&
          this.pieChart1.dataTable
        ) {
          this.pieComp1 = this.pieChart1.component;
          this.pieWrapper1 = this.pieComp1.wrapper;
        }

        if (typeof this.pieChart2.component !== "undefined") {
          this.pieComp2 = this.pieChart2.component;
          this.pieWrapper2 = this.pieComp2.wrapper;
        }

        if (typeof this.pieChart3.component !== "undefined") {
          this.pieComp3 = this.pieChart3.component;
          this.pieWrapper3 = this.pieComp3.wrapper;
        }

        if (typeof this.pieChart4.component !== "undefined") {
          this.pieComp4 = this.pieChart4.component;
          this.pieWrapper4 = this.pieComp4.wrapper;
        }

        if (typeof this.pieWrapper1 !== "undefined") this.pieComp1.draw();
        if (typeof this.pieWrapper2 !== "undefined") this.pieComp2.draw();
        if (typeof this.pieWrapper3 !== "undefined") this.pieComp3.draw();
        if (typeof this.pieWrapper4 !== "undefined") this.pieComp4.draw();
      }
    );
  }

  ngOnDestroy() {
    this.pieChartSubscription.unsubscribe();
  }
}
