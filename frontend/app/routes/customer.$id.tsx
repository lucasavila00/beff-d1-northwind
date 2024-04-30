import type { LoaderFunction } from "@remix-run/cloudflare";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddTableField } from "~/components/AddTableField";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { useStatsDispatch } from "~/components/StatsContext";
import { fetchClient } from "../utils/beff";

export const loader = (async ({ params }) => {
  invariant(params.id, "Missing id");
  return fetchClient["/customer"].get(params.id);
}) satisfies LoaderFunction;
type LoaderType = Awaited<ReturnType<typeof loader>>;

const Customer = () => {
  const navigate = useNavigate();
  const data = useLoaderData<LoaderType>();
  const { customer } = data;

  const dispatch = useStatsDispatch();
  useEffect(() => {
    dispatch && data.stats && dispatch(data.stats);
  }, [dispatch, data.stats]);

  return (
    <>
      {customer ? (
        <div className="card mb-6">
          <header className="card-header">
            <p className="card-header-title">
              <span className="icon material-icons">ballot</span>
              <span className="ml-2">Customer information</span>
            </p>
          </header>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <AddTableField
                  name="Company Name"
                  value={customer.CompanyName}
                />
                <AddTableField
                  name="Contact Name"
                  value={customer.ContactName}
                />
                <AddTableField
                  name="Contact Title"
                  value={customer.ContactTitle}
                />
                <AddTableField name="Address" value={customer.Address} />
                <AddTableField name="City" value={customer.City} />
              </div>
              <div>
                <AddTableField name="Postal Code" value={customer.PostalCode} />
                <AddTableField name="Region" value={customer.Region} />
                <AddTableField name="Country" value={customer.Country} />
                <AddTableField name="Phone" value={customer.Phone} />
                <AddTableField name="Fax" value={customer.Fax} />
                {customer.HomePage ? (
                  <AddTableField name="HomePage" value={customer.HomePage} />
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
                    navigate(`/customers`, { replace: false });
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
          <h2>No such customer</h2>
        </div>
      )}
    </>
  );
};

export default Customer;
