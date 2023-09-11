import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddTableField } from "~/components";
import type { LoaderFunction } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";
import { useStatsDispatch } from "~/components/StatsContext";
import { useLoaderData } from "@remix-run/react";
import { fetchClient } from "../utils/beff";

export const loader = (async ({ params }) => {
  invariant(params.id, "Missing id");
  return fetchClient["/supplier"].get(params.id);
}) satisfies LoaderFunction;
type LoaderType = Awaited<ReturnType<typeof loader>>;

const Supplier = () => {
  const navigate = useNavigate();
  const data = useLoaderData<LoaderType>();
  const { supplier } = data;

  const dispatch = useStatsDispatch();
  useEffect(() => {
    dispatch && data.stats && dispatch(data.stats);
  }, [dispatch, data.stats]);

  return (
    <>
      {supplier ? (
        <div className="card mb-6">
          <header className="card-header">
            <p className="card-header-title">
              <span className="icon material-icons">ballot</span>
              <span className="ml-2">Supplier information</span>
            </p>
          </header>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <AddTableField
                  name="Company Name"
                  value={supplier.CompanyName}
                />
                <AddTableField
                  name="Contact Name"
                  value={supplier.ContactName}
                />
                <AddTableField
                  name="Contact Title"
                  value={supplier.ContactTitle}
                />
                <AddTableField name="Address" value={supplier.Address} />
                <AddTableField name="City" value={supplier.City} />
              </div>
              <div>
                <AddTableField name="Region" value={supplier.Region} />
                <AddTableField name="Postal Code" value={supplier.PostalCode} />
                <AddTableField name="Country" value={supplier.Country} />
                <AddTableField name="Phone" value={supplier.Phone} />
                {supplier.Fax ? (
                  <AddTableField name="Fax" value={supplier.Fax} />
                ) : (
                  false
                )}
                {supplier.HomePage ? (
                  <AddTableField name="Home Page" value={supplier.HomePage} />
                ) : (
                  false
                )}
              </div>
            </div>

            <hr />

            <div className="field grouped">
              <div className="control">
                <button
                  type="reset"
                  onClick={() => {
                    navigate(`/suppliers`, { replace: false });
                  }}
                  className="button red"
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-content">
          <h2>No such supplier</h2>
        </div>
      )}
    </>
  );
};

export default Supplier;
