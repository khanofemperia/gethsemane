"use client";

import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { CloseIcon, EditIcon } from "@/icons";
import Overlay from "@/ui/Overlay";
import { useState, useEffect, useCallback } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import SizesTable from "./SizesTable";
import { clsx } from "clsx";
import AlertMessage from "@/components/shared/AlertMessage";
import { Spinner } from "@/ui/Spinners/Default";
import { ArrowLeftIcon } from "@/icons";
import { AlertMessageType } from "@/lib/sharedTypes";
import { UpdateProductAction } from "@/actions/products";

export function SizeChartButton() {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.sizes.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <EditIcon size={20} />
    </button>
  );
}

type TableRowType = {
  [key: string]: string;
};

type DataType = {
  id: string;
  sizes: SizeChartType;
};

export function SizeChartOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );

  const [tableData, setTableData] = useState<SizeChartType>({
    inches: { columns: [], rows: [] },
    centimeters: { columns: [], rows: [] },
  });

  useEffect(() => {
    if (Object.keys(data.sizes || {}).length === 0) {
      setTableData({
        inches: { columns: [], rows: [] },
        centimeters: { columns: [], rows: [] },
      });
    } else {
      setTableData(data.sizes);
    }
  }, [data]);

  const columns = tableData.inches.columns
    .sort((a, b) => a.order - b.order)
    .map((col) => col.label);

  const addRow = useCallback(() => {
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: "" }), {});
    setTableData((prevData) => ({
      inches: { ...prevData.inches, rows: [...prevData.inches.rows, newRow] },
      centimeters: {
        ...prevData.centimeters,
        rows: [...prevData.centimeters.rows, newRow],
      },
    }));
  }, [columns]);

  const removeRow = useCallback(() => {
    setTableData((prevData) => ({
      inches: { ...prevData.inches, rows: prevData.inches.rows.slice(0, -1) },
      centimeters: {
        ...prevData.centimeters,
        rows: prevData.centimeters.rows.slice(0, -1),
      },
    }));
  }, []);

  const addColumn = useCallback(() => {
    const newColumnName = `Column${columns.length + 1}`;
    const newColumnOrder =
      Math.max(...tableData.inches.columns.map((col) => col.order), 0) + 1;
    setTableData((prevData) => ({
      inches: {
        columns: [
          ...prevData.inches.columns,
          { label: newColumnName, order: newColumnOrder },
        ],
        rows: prevData.inches.rows.map((row) => ({
          ...row,
          [newColumnName]: "",
        })),
      },
      centimeters: {
        columns: [
          ...prevData.centimeters.columns,
          { label: newColumnName, order: newColumnOrder },
        ],
        rows: prevData.centimeters.rows.map((row) => ({
          ...row,
          [newColumnName]: "",
        })),
      },
    }));
  }, [columns, tableData]);

  const removeColumn = useCallback(() => {
    if (columns.length > 2) {
      const lastColumn = columns[columns.length - 1];
      setTableData((prevData) => ({
        inches: {
          columns: prevData.inches.columns.slice(0, -1),
          rows: prevData.inches.rows.map(
            ({ [lastColumn]: _, ...rest }) => rest
          ),
        },
        centimeters: {
          columns: prevData.centimeters.columns.slice(0, -1),
          rows: prevData.centimeters.rows.map(
            ({ [lastColumn]: _, ...rest }) => rest
          ),
        },
      }));
    }
  }, [columns]);

  const updateInchesData = (
    updatedData: Array<{
      [key: string]: string;
    }>
  ) => {
    setTableData((prevData) => ({
      ...prevData,
      inches: {
        ...prevData.inches,
        rows: updatedData,
      },
    }));
  };

  const updateCentimetersData = (
    updatedData: Array<{
      [key: string]: string;
    }>
  ) => {
    setTableData((prevData) => ({
      ...prevData,
      centimeters: {
        ...prevData.centimeters,
        rows: updatedData,
      },
    }));
  };

  const updateColumns = (
    updatedColumns: { label: string; order: number }[]
  ) => {
    setTableData((prevData) => {
      const updateRows = (rows: TableRowType[]) =>
        rows.map((row) => {
          const newRow: TableRowType = {};
          updatedColumns.forEach(({ label }) => {
            newRow[label] = row[label] || "";
          });
          return newRow;
        });

      return {
        inches: {
          columns: updatedColumns,
          rows: updateRows(prevData.inches.rows),
        },
        centimeters: {
          columns: updatedColumns,
          rows: updateRows(prevData.centimeters.rows),
        },
      };
    });
  };

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.sizes.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.sizes.isVisible
  );

  useEffect(() => {
    if (isOverlayVisible || showAlert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      if (!isOverlayVisible && !showAlert) {
        document.body.style.overflow = "visible";
      }
    };
  }, [isOverlayVisible, showAlert]);

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const updatedSizes = {
        id: data.id,
        options: { sizes: tableData },
      };

      const result = await UpdateProductAction(updatedSizes);
      setAlertMessageType(result.type);
      setAlertMessage(result.message);
      setShowAlert(true);
    } catch (error) {
      console.error("Error updating product:", error);
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Failed to update product");
      setShowAlert(true);
    } finally {
      setLoading(false);
      hideOverlay({ pageName, overlayName });
    }
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-max md:min-w-[516px] md:max-w-[740px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Sizes</h2>
                  <button
                    onClick={() => {
                      hideOverlay({ pageName, overlayName });
                    }}
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center absolute right-4 transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
                <button
                  onClick={() => {
                    hideOverlay({ pageName, overlayName });
                  }}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
                >
                  <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                  <span className="font-semibold text-sm text-blue">Sizes</span>
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-neutral-700": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner color="white" />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div className="mb-5 flex gap-5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Rows</span>
                    <div className="w-max flex border rounded-full overflow-hidden">
                      <button
                        type="button"
                        onClick={removeRow}
                        className="h-6 w-9 grid place-items-center ease-in-out duration-300 transition hover:bg-neutral-200"
                      >
                        <HiMinus className="fill-stone-500" size={20} />
                      </button>
                      <div className="w-[1px] bg-[#dcdfe4]"></div>
                      <button
                        type="button"
                        onClick={addRow}
                        className="h-6 w-9 grid place-items-center ease-in-out duration-300 transition hover:bg-neutral-200"
                      >
                        <HiPlus className="fill-gray" size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Columns</span>
                    <div className="w-max flex border rounded-full overflow-hidden">
                      <button
                        type="button"
                        onClick={removeColumn}
                        className="h-6 w-9 grid place-items-center ease-in-out duration-300 transition hover:bg-neutral-200"
                      >
                        <HiMinus className="fill-gray" size={20} />
                      </button>
                      <div className="w-[1px] bg-[#dcdfe4]"></div>
                      <button
                        type="button"
                        onClick={addColumn}
                        className="h-6 w-9 grid place-items-center ease-in-out duration-300 transition hover:bg-neutral-200"
                      >
                        <HiPlus className="fill-gray" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                {tableData.inches.rows.length > 0 ? (
                  <>
                    <div className="mb-5">
                      <h2 className="text-xs text-gray mb-2">Inches</h2>
                      <SizesTable
                        data={tableData.inches.rows}
                        columns={columns}
                        onUpdate={updateInchesData}
                        onColumnUpdate={updateColumns}
                      />
                    </div>
                    <div className="mb-5">
                      <h2 className="text-xs text-gray mb-2">Centimeters</h2>
                      <SizesTable
                        data={tableData.centimeters.rows}
                        columns={columns}
                        onUpdate={updateCentimetersData}
                        onColumnUpdate={updateColumns}
                      />
                    </div>
                  </>
                ) : (
                  <p>No data available. Add a row to start.</p>
                )}
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0">
              <button
                onClick={handleSave}
                type="button"
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-neutral-700",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-neutral-700/85": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner color="white" />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}
      {showAlert && (
        <AlertMessage
          message={alertMessage}
          hideAlertMessage={hideAlertMessage}
          type={alertMessageType}
        />
      )}
    </>
  );
}
