import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Paginate } from "~/components";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useStatsDispatch } from "~/components/StatsContext";
import { fetchClient } from "../utils/beff";

export const loader = (async ({ request }) => {
  const url = new URL(request.url);

  const page = Number(url.searchParams.get("page")) || 1;
  const count = url.searchParams.get("count");

  return fetchClient["/suppliers"].get(Number(count) == 0, page);
}) satisfies LoaderFunction;
type LoaderType = Awaited<ReturnType<typeof loader>>;

const Suppliers = () => {
  const data = useLoaderData<LoaderType>();
  const navigate = useNavigate();
  const { suppliers, page, pages } = data;
  const dispatch = useStatsDispatch();

  useEffect(() => {
    dispatch && data.stats && dispatch(data.stats);
  }, [dispatch, data.stats]);

  const setPage = (page: number) => {
    navigate(`/suppliers?page=${page}`);
  };

  return (
    <>
      {suppliers.length ? (
        <div className="card has-table">
          <header className="card-header">
            <p className="card-header-title">Suppliers</p>
            <button className="card-header-icon">
              <span
                className="material-icons"
                onClick={() => {
                  //eslint-disable-next-line
                  window.location.href = window.location.href;
                }}
              >
                redo
              </span>
            </button>
          </header>
          <div className="card-content">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Title</th>
                  <th>City</th>
                  <th>Country</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td className="image-cell">
                        <div className="image">
                          <img
                            alt="supplier"
                            src={`https://avatars.dicebear.com/v2/initials/${
                              supplier.ContactName.split(" ")[0]
                            }-${
                              supplier.ContactName.split(" ").slice(-1)[0]
                            }.svg`}
                            className="rounded-full"
                          />
                        </div>
                      </td>
                      <td data-label="Company">
                        <Link className="link" to={`/supplier/${supplier.Id}`}>
                          {supplier.CompanyName}
                        </Link>
                      </td>
                      <td data-label="Contact">{supplier.ContactName}</td>
                      <td data-label="Title">{supplier.ContactTitle}</td>
                      <td data-label="Title">{supplier.City}</td>
                      <td data-label="Title">{supplier.Country}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Paginate pages={pages} page={page} setPage={setPage} />
          </div>
        </div>
      ) : (
        <div className="card-content">
          <h2>Loading suppliers...</h2>
        </div>
      )}
    </>
  );
};

export default Suppliers;
