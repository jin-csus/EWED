import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EmptyComponent } from "../components/empty/empty.component";
import { AuthGuard } from "../common/auth.guard";
import { LoginComponent } from "../components/login/login.component";

const routes: Routes = [
  {
    /* This route is being used for all the routes in the dashboard.
    This route contains all the URL parameters that are required
    for updating the global object. Check front-end documentation
    for more details on how URL parameters are being used.
    
    Example URL:
    projected/state/north-dakota/huc-regions/withdrawal/REF2019/RCP45/AVG45/2049/1/2050/12/bar/fuelTypes/all */
    path:
      ":formType/:urlPrefix/:filterValueUrl/:viewBy/:display/:energyScenario/:climateScenario/:climateModel/:fromYear/:fromMonth/:toYear/:toMonth/:dataTab/fuelTypes/:fuelTypes",
    component: EmptyComponent,
    /* AuthGuard check if the user is logged in or not */
    canActivate: [AuthGuard],
  },

  /* Redirects here if the user is not logged in */
  { path: "login", component: LoginComponent },

  /* Redirect to default URL for the cases of invalid URL */
  {
    path: "**",
    redirectTo:
      "historic/all-us/na/states/consumption/na/na/na/2015/1/2015/12/table/fuelTypes/all",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
