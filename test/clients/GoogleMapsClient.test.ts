import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { GoogleMapsClient } from "../../src/clients/GoogleMapsClient";
import { GOOGLE_API_KEY } from "../../src/util/secrets";
import { aGoogleMapsApiDirectionResponse } from "../utils/fixtures";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

const axiosMock = new MockAdapter(axios);

let client: GoogleMapsClient;

describe("GoogleMapsClient", () => {
  beforeEach(() => {
    client = new GoogleMapsClient();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it("should extract the polygon", async () => {
    axiosMock
      .onGet(
        `https://maps.googleapis.com/maps/api/directions/json?origin=45.8725,9.73235&destination=45.464203,9.189982&key=${GOOGLE_API_KEY}`,
      )
      .reply(200, aGoogleMapsApiDirectionResponse());

    const polygon = await client.getPolylineByRoute(
      { lat: 45.8725, lng: 9.73235 },
      { lat: 45.464203, lng: 9.189982 },
    );
    expect(polygon).toBe(
      "cn~vGg{kz@dBfBJvAl@rA]nArIoC~IlE~DLrCnApAYfLkBpBFhGmBh@d@_OpKIrAlHz@zDgB`E@rAeAh@}AhDwBrD_BzD]|DC`B_B`ElBfGnG~A~DlC~@tEbE`FIlDmDpCiEnAe@rGpAnCj@lB_ErFOzAv@fD{AvByCnDv@pCpBr@lBy@wC\\_BvE~G~IzEjHnArHP~CIl@hAdC`Ch@hC`AxBnA{@HcBHy@v@Er@y@\\j@@fCr@l@bAfDh@jAtAu@|@BnAhB~CqEtAT`@|@`@zAvCzB`KnF~@dChB|@pGdFf@|GfA|HnBxNdCxDjC^d@tA^dElDlGjHjFvDbFj@fHdDnHlAp@`CQ~Ao@f@AhAzFDtFhBlB|Bx@bFmAt@vC?rEvBhLzBfBj@dCh@jHp@`En@^p@dA`@bFz@~LfApFbA|Fg@fHWdLRnQfA~DNzM@lBtAl@dF~BvFbWfBxErChDfDb@~BpB~IdF`Er@pKs@xGf@vDWJJNCFOpARbE~DnGhW^`H]zL_A`EkCjClAd_@vLnfAfDzOrGpSdEzXl@pG|B|E~FzErDpF`FvJpCrMbIjTzEfR`AbNrDdCrF~B|Bp@xB]fCaBlCyDfFmApBCtEtCdE~BpDxKdBjBdF`@rJu@xCq@xBlBlQp]fBtApBi@bCcDxBiGzEeFpEq@|EcCvC{B|DcAnIEpFuAhQuGxKeFf@p@dFxDpNvIfE|C|OhDhJfCvFLnRiBzULzO^P`@j@AJ[|CaAvy@oItHLfS|IjFjEv@GnT`J|ElAda@nItVhFtFr@hEWpJ{@z\\pB~Y|B~NvBfd@nFxQyBxF}@rKoDjIeHpTiUjZiZtRuYtIiMlF_FbH}GnA]V{AjNmRfD}C~A^bAhChDrSnAhGl@VxAJnB}@vAXzEdKxBnCbMlX`g@`gA~b@h_ApNp[dG~NrH`XlQzt@~[rsAjt@j~Cpr@byCrPpt@|Izt@nVjzBdg@fpEft@`tGdXhdDdYhrDja@zfFrZxxD|]`jEzFlw@dE|e@rBr_@hAfiAp@jYvBzRjQbfAhQ~bAlIp_@fTpn@`w@fsBv`@xdAxVxq@dDtHdBrAxFlAhH`AxF{IdFaJjH_MxCoC`JuBxSiBfQb@~SC~MT|C{@hDoH|D{LfEcLjHaIv`@_k@r]ig@tAUnXj@dKMVWhAuDd@{f@mAcEMyAxLoQjQaWvCeEjBiEg@yACI?k@P_TMaBm@aGM{QhA{Ki@_Gm@uF[S{@Og@cA}@oMg@yPlCwAjEwFvBpCj@h@Xw@HExF@d@A",
    );
  });
});
