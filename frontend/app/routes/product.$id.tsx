import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddTableField } from "~/components";
import { useLoaderData } from "@remix-run/react";
import { useStatsDispatch } from "~/components/StatsContext";
import type { LoaderFunction } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";
import { fetchClient } from "../utils/beff";

export const loader = (async ({ params }) => {
  invariant(params.id, "Missing id");
  return fetchClient["/product"].get(params.id);
}) satisfies LoaderFunction;
type LoaderType = Awaited<ReturnType<typeof loader>>;

const Product = () => {
  const navigate = useNavigate();
  const data = useLoaderData<LoaderType>();
  const { product } = data;

  const dispatch = useStatsDispatch();
  useEffect(() => {
    dispatch && data.stats && dispatch(data.stats);
  }, [dispatch, data.stats]);

  return (
    <>
      {product ? (
        <div className="card mb-6">
          <header className="card-header">
            <p className="card-header-title">
              <span className="icon material-icons">ballot</span>
              <span className="ml-2">Product information</span>
            </p>
          </header>

          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <AddTableField
                  name="Product Name"
                  value={product.ProductName}
                />
                <AddTableField
                  name="Supplier"
                  link={`/supplier/${product.SupplierId}`}
                  value={product.SupplierName}
                />
                <AddTableField
                  name="Quantity Per Unit"
                  value={product.QuantityPerUnit}
                />
                <AddTableField
                  name="Unit Price"
                  value={`$${product.UnitPrice}`}
                />
              </div>
              <div>
                <AddTableField
                  name="Units In Stock"
                  value={product.UnitsInStock}
                />
                <AddTableField
                  name="Units In Order"
                  value={product.UnitsOnOrder}
                />
                <AddTableField
                  name="Reorder Level"
                  value={product.ReorderLevel}
                />
                <AddTableField
                  name="Discontinued"
                  value={product.Discontinued}
                />
              </div>
            </div>

            <hr />

            <div className="field grouped">
              <div className="control">
                <button
                  type="reset"
                  onClick={() => {
                    navigate(`/products`, { replace: false });
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
          <h2>No such product</h2>
        </div>
      )}
    </>
  );
};

export default Product;
