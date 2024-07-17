/*


"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect, ChangeEvent } from "react";
import Spinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeftIcon, CloseIcon, EditIcon } from "@/icons";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { UpdateProductAction } from "@/actions/products";
import { AlertMessageType } from "@/lib/sharedTypes";

type MeasurementType = { inches: string; centimeters: string };

type ColumnType = { index: number; name: string };

type SizeChartType = {
  columns: ColumnType[];
  values: {
    name: string;
    measurements: Record<string, MeasurementType>;
  }[];
};

type DataType = {
  id: string;
  sizes: SizeChartType;
};

export function SizeChartButton() {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editProduct.name,
    overlayName: state.pages.editProduct.overlays.sizes.name,
  }));

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 rounded-full absolute top-2 right-2 flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <EditIcon size={20} />
    </button>
  );
}

export function SizeChartOverlay({ data }: { data: DataType }) {
  const sizes =
    data.sizes && Array.isArray(data.sizes.values) ? data.sizes.values : [];
  const chartColumns =
    data.sizes && data.sizes.columns ? data.sizes.columns : [];
  const chartEntryLabels =
    sizes.length > 0 ? sizes.map((size) => size.name) : [];
  const chartEntries = sizes.length > 0 ? sizes : [];

  const chartExists = sizes.length > 0;
  const [showChart, setShowChart] = useState<boolean>(chartExists);
  const [columns, setColumns] = useState(chartColumns);
  const [entryLabels, setEntryLabels] = useState(chartEntryLabels);
  const [entries, setEntries] = useState(chartEntries);
  const [measurementInputs, setMeasurementInputs] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editProduct.name,
      overlayName: state.pages.editProduct.overlays.sizes.name,
      isOverlayVisible: state.pages.editProduct.overlays.sizes.isVisible,
    })
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

  const onHideOverlay = () => {
    setLoading(false);
    hideOverlay({ pageName, overlayName });
  };

  const hideAlertMessage = () => {
    setShowAlert(false);
    setAlertMessage("");
    setAlertMessageType(AlertMessageType.NEUTRAL);
  };

  const handleSave = async () => {
    if (
      (columns.length > 0 || entryLabels.length > 0) &&
      entries.length === 0
    ) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Click 'Create Size Chart' before saving");
      setShowAlert(true);
      return;
    }

    setLoading(true);

    const updatedChart: SizeChartType = {
      columns,
      values: entries.map((entry) => ({
        name: entry.name,
        measurements: entry.measurements,
      })),
    };

    console.log("Updated chart data:", updatedChart);

    try {
      const getSizeOptions = (
        columns: ColumnType[],
        entryLabels: string[],
        updatedChart: SizeChartType
      ): SizeChartType => {
        if (columns.length && entryLabels.length) {
          return updatedChart;
        }
        return { columns: [], values: [] };
      };

      const result = await UpdateProductAction({
        id: data.id,
        options: {
          sizes: getSizeOptions(columns, entryLabels, updatedChart),
        },
      });

      if (!(columns.length && entryLabels.length)) {
        setColumns([]);
        setEntryLabels([]);
        setEntries([]);
      }

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
      onHideOverlay();
    }
  };

  const generateNewSizes = () => {
    const newSizes = entryLabels.map((entryLabel) => {
      const name = entryLabel;
      const measurements = Object.fromEntries(
        columns
          .filter((col) => col.name.toLowerCase() !== "size")
          .map((col) => [col.name, { inches: "0", centimeters: "0" }])
      );

      return { name, measurements };
    });

    setEntries(newSizes);
    setMeasurementInputs({});
  };

  const handleColumnsInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const array = event.target.value.split(",");
    const values: string[] = array
      .map((inputValue: string) => inputValue.trim())
      .filter(Boolean);

    const newColumns = values.map((name, index) => ({
      index: index + 1,
      name: name.trim(),
    }));

    setShowChart(false);
    setColumns(newColumns);
    setMeasurementInputs({});
    generateNewSizes();
  };

  const handleEntryLabelsInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const array = event.target.value.split(",");
    const values: string[] = array
      .map((inputValue: string) => inputValue.trim())
      .filter(Boolean);

    setShowChart(false);
    setEntryLabels(values);
    setMeasurementInputs({});
    generateNewSizes();
  };

  const createSizeChart = () => {
    if (columns.length === 0) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Provide column names");
      setShowAlert(true);
    } else if (entryLabels.length === 0) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage("Input entry labels");
      setShowAlert(true);
    } else {
      generateNewSizes();
      setShowChart(true);
    }
  };

  const InchesToCentimeters = (value: number, columnName: string) => {
    const excludedColumns = ["US", "EU", "UK", "NZ", "AU", "DE"];

    if (excludedColumns.includes(columnName.toUpperCase())) {
      return value;
    }

    const convertedValue = value * 2.54;
    return convertedValue;
  };

  const handleMeasurementInputChange =
    (rowIndex: number, columnName: string) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const inputValue = event.target.value;

      setEntries((prevEntries) => {
        const newSizes = prevEntries ? [...prevEntries] : [];
        const sizeObject = newSizes[rowIndex];

        if (sizeObject) {
          const excludedColumns = ["US", "EU", "UK", "NZ", "AU", "DE"];
          const updatedValue = inputValue === "" ? "0" : inputValue;

          let measurements;

          if (excludedColumns.includes(columnName.toUpperCase())) {
            measurements = {
              inches: updatedValue,
              centimeters: updatedValue,
            };
          } else {
            const floatValue = parseFloat(updatedValue);
            const centimeters = InchesToCentimeters(
              floatValue,
              columnName
            ).toFixed(1);

            measurements = {
              inches:
                floatValue % 1 === 0
                  ? String(parseInt(updatedValue))
                  : updatedValue,
              centimeters:
                parseFloat(centimeters) % 1 === 0
                  ? String(parseInt(centimeters))
                  : centimeters,
            };
          }

          sizeObject.measurements = {
            ...sizeObject.measurements,
            [columnName]: measurements,
          };
        }

        return newSizes;
      });

      setMeasurementInputs((prevInputs) => ({
        ...prevInputs,
        [`${rowIndex}-${columnName}`]: inputValue,
      }));
    };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[500px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Sizes</h2>
                  <button
                    onClick={() => {
                      setShowChart(chartExists || false);
                      setColumns(chartColumns);
                      setEntryLabels(chartEntryLabels);
                      setEntries(chartEntries);
                      setMeasurementInputs({});
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
                    setShowChart(chartExists || false);
                    setColumns(chartColumns);
                    setEntryLabels(chartEntryLabels);
                    setEntries(chartEntries);
                    setMeasurementInputs({});
                    hideOverlay({ pageName, overlayName });
                  }}
                  type="button"
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray"
                >
                  <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                  <span className="font-semibold text-sm text-blue">Sizes</span>
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={loading}
                  className={clsx(
                    "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                    {
                      "bg-opacity-50": loading,
                      "active:bg-blue-dimmed": !loading,
                    }
                  )}
                >
                  {loading ? (
                    <div className="flex gap-1 items-center justify-center w-full h-full">
                      <Spinner />
                      <span className="text-white">Saving</span>
                    </div>
                  ) : (
                    <span className="text-white">Save</span>
                  )}
                </button>
              </div>
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 pb-28 md:pb-10 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div>
                  <div className="flex flex-col gap-5 mb-5">
                    <div className="flex flex-col gap-2">
                      <label
                        className="font-semibold text-sm"
                        htmlFor="columns"
                      >
                        Columns
                      </label>
                      <input
                        onChange={handleColumnsInputChange}
                        defaultValue={
                          columns.length
                            ? columns.map((column) => column.name).join(", ")
                            : ""
                        }
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                        type="text"
                        name="name"
                        placeholder="Size, Length, etc."
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        className="font-semibold text-sm"
                        htmlFor="entryLabels"
                      >
                        Entry labels
                      </label>
                      <input
                        onChange={handleEntryLabelsInputChange}
                        defaultValue={
                          entryLabels.length ? entryLabels.join(", ") : ""
                        }
                        className="w-full h-9 px-3 rounded-md transition duration-300 ease-in-out border focus:border-blue"
                        type="text"
                        name="entryLabels"
                        placeholder="S, M, L, etc."
                        required
                      />
                    </div>
                  </div>
                  <button
                    onClick={createSizeChart}
                    className="h-9 w-max px-3 rounded-full flex items-center justify-center transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed"
                  >
                    Create Size Chart
                  </button>
                </div>
                {showChart && (
                  <div className="mt-8 flex flex-col gap-5 cursor-context-menu">
                    <div>
                      <h2 className="font-semibold text-sm mb-4">Inches</h2>
                      <div className="border w-full max-w-[max-content] rounded overflow-y-hidden overflow-x-visible custom-x-scrollbar">
                        <table className="w-max">
                          <thead className="h-10 border-b border-neutral-200 bg-neutral-100">
                            <tr>
                              {columns.map((column, index) => (
                                <th
                                  key={index}
                                  className={`px-5 text-nowrap text-sm ${
                                    index === columns.length - 1
                                      ? ""
                                      : "border-r"
                                  } ${
                                    index === 0
                                      ? "sticky left-0 bg-neutral-100"
                                      : ""
                                  }`}
                                >
                                  {column.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry, entryIndex) => (
                              <tr
                                key={entryIndex}
                                className={`h-10 ${
                                  entryIndex === entries.length - 1
                                    ? ""
                                    : "border-b"
                                }`}
                              >
                                <td className="text-sm text-center border-r w-[100px] sticky left-0 bg-neutral-100">
                                  {entry.name}
                                </td>
                                {columns.slice(1).map((column, columnIndex) => (
                                  <td
                                    key={columnIndex}
                                    className={`text-center w-[132px] ${
                                      columnIndex === columns.length - 2
                                        ? ""
                                        : " border-r border-neutral-200"
                                    }`}
                                  >
                                    <input
                                      className="w-full h-[37px] px-3 outline-none text-center"
                                      type="text"
                                      placeholder="0"
                                      value={
                                        measurementInputs[
                                          `${entryIndex}-${column.name}`
                                        ] !== undefined
                                          ? measurementInputs[
                                              `${entryIndex}-${column.name}`
                                            ]
                                          : entry.measurements[
                                              column.name as keyof typeof entry.measurements
                                            ]?.inches === "0"
                                          ? ""
                                          : entry.measurements[
                                              column.name as keyof typeof entry.measurements
                                            ]?.inches || ""
                                      }
                                      onChange={handleMeasurementInputChange(
                                        entryIndex,
                                        column.name
                                      )}
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm mb-4">
                        Centimeters
                      </h2>
                      <div className="border w-full max-w-[max-content] rounded overflow-y-hidden overflow-x-visible custom-x-scrollbar">
                        <table className="w-max bg-white">
                          <thead className="h-10 border-b border-neutral-200 bg-neutral-100">
                            <tr>
                              {columns.map((column, index) => (
                                <th
                                  key={index}
                                  className={`px-5 text-nowrap text-sm ${
                                    index === columns.length - 1
                                      ? ""
                                      : "border-r"
                                  } ${
                                    index === 0
                                      ? "sticky left-0 bg-neutral-100"
                                      : ""
                                  }`}
                                >
                                  {column.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry, entryIndex) => (
                              <tr
                                key={entryIndex}
                                className={`h-10 ${
                                  entryIndex === entries.length - 1
                                    ? ""
                                    : " border-b"
                                }`}
                              >
                                <td className="text-sm text-center border-r w-[100px] sticky left-0 bg-neutral-100">
                                  {entry.name}
                                </td>
                                {columns.slice(1).map((column, columnIndex) => (
                                  <td
                                    key={columnIndex}
                                    className={`text-center w-[132px] ${
                                      columnIndex === columns.length - 2
                                        ? ""
                                        : " border-r border-neutral-200"
                                    }`}
                                  >
                                    {
                                      entry.measurements[
                                        column.name as keyof typeof entry.measurements
                                      ]?.centimeters
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="md:hidden w-full pb-5 pt-2 px-5 absolute bottom-0">
              <button
                onClick={handleSave}
                type="button"
                disabled={loading}
                className={clsx(
                  "relative h-12 w-full rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-blue-dimmed": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner />
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



*/

"use client";

import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { EditIcon } from "@/icons";
import Overlay from "@/ui/Overlay";
import { useState, useEffect, useCallback } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import SizesTable from "./SizesTable";
import { clsx } from "clsx";
import AlertMessage from "@/components/shared/AlertMessage";
import Spinner from "@/ui/Spinners/White";
import { ArrowLeftIcon } from "@/icons";
import { AlertMessageType } from "@/lib/sharedTypes";

export function SizeChartButton() {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editProduct.name,
    overlayName: state.pages.editProduct.overlays.sizes.name,
  }));

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className="w-9 h-9 rounded-full absolute top-2 right-2 flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <EditIcon size={20} />
    </button>
  );
}

type TableRow = {
  [key: string]: string;
};

type TableData = {
  inches: TableRow[];
  centimeters: TableRow[];
};

type DataType = {
  id: string;
  sizes: TableData;
};

export function SizeChartOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );

  const [tableData, setTableData] = useState<TableData>({
    inches: [],
    centimeters: [],
  });

  useEffect(() => {
    setTableData(data.sizes || { inches: [], centimeters: [] });
  }, [data]);

  const columns =
    tableData.inches.length > 0 ? Object.keys(tableData.inches[0]) : [];

  const addRow = useCallback(() => {
    const newRow =
      columns.length > 0
        ? Object.fromEntries(columns.map((col) => [col, ""]))
        : { Column1: "" };
    setTableData((prevData) => ({
      inches: [...prevData.inches, newRow],
      centimeters: [...prevData.centimeters, newRow],
    }));
  }, [columns]);

  const removeRow = useCallback(() => {
    setTableData((prevData) => {
      if (prevData.inches.length > 1) {
        return {
          inches: prevData.inches.slice(0, -1),
          centimeters: prevData.centimeters.slice(0, -1),
        };
      }
      return prevData;
    });
  }, []);

  const addColumn = useCallback(() => {
    const newColumnName = `Column${columns.length + 1}`;
    setTableData((prevData) => ({
      inches:
        prevData.inches.length > 0
          ? prevData.inches.map((row) => ({ ...row, [newColumnName]: "" }))
          : [{ [newColumnName]: "" }],
      centimeters:
        prevData.centimeters.length > 0
          ? prevData.centimeters.map((row) => ({ ...row, [newColumnName]: "" }))
          : [{ [newColumnName]: "" }],
    }));
  }, [columns]);

  const removeColumn = useCallback(() => {
    if (columns.length > 2) {
      const lastColumn = columns[columns.length - 1];
      setTableData((prevData) => ({
        inches: prevData.inches.map(({ [lastColumn]: _, ...rest }) => rest),
        centimeters: prevData.centimeters.map(
          ({ [lastColumn]: _, ...rest }) => rest
        ),
      }));
    }
  }, [columns]);

  const updateInchesData = (updatedData: TableRow[]) => {
    setTableData((prevData) => ({
      ...prevData,
      inches: updatedData,
    }));
  };

  const updateCentimetersData = (updatedData: TableRow[]) => {
    setTableData((prevData) => ({
      ...prevData,
      centimeters: updatedData,
    }));
  };

  const updateColumns = (updatedColumns: string[]) => {
    setTableData((prevData) => {
      const updateRows = (rows: TableRow[]) =>
        rows.map((row) => {
          const newRow: TableRow = {};
          updatedColumns.forEach((col) => {
            newRow[col] = row[col] || "";
          });
          return newRow;
        });

      return {
        inches: updateRows(prevData.inches),
        centimeters: updateRows(prevData.centimeters),
      };
    });
  };

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editProduct.name,
      overlayName: state.pages.editProduct.overlays.sizes.name,
      isOverlayVisible: state.pages.editProduct.overlays.sizes.isVisible,
    })
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

  // const handleSave = () => {
  //   // What do we console.log here?
  //   // How do we get data from the table?
  //   // How do we ensure both tables are correctly synched; if cell5/row3 in Inches table is filled, is cell5/row3 also filled in Centimeters table?
  // };

  const handleSave = () => {
    console.log("Inches Table Data:", tableData.inches);
    console.log("Centimeters Table Data:", tableData.centimeters);

    // Check if the data is synchronized
    const isSynchronized =
      tableData.inches.length === tableData.centimeters.length &&
      tableData.inches.every(
        (row, index) =>
          Object.keys(row).length ===
          Object.keys(tableData.centimeters[index]).length
      );

    if (!isSynchronized) {
      setAlertMessageType(AlertMessageType.ERROR);
      setAlertMessage(
        "Tables are not synchronized. Please ensure they have the same number of rows and columns."
      );
      setShowAlert(true);
      return;
    }

    // Additional save logic here
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-max md:max-w-[740px] md:min-w-[516px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="hidden md:flex md:items-center md:justify-between py-2 pr-4 pl-2">
              <button
                onClick={() => {
                  hideOverlay({ pageName, overlayName });
                }}
                type="button"
                className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray"
              >
                <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                <span className="font-semibold text-sm text-blue">Sizes</span>
              </button>
              <button
                onClick={handleSave}
                type="button"
                disabled={loading}
                className={clsx(
                  "relative h-9 w-max px-4 rounded-full overflow-hidden transition duration-300 ease-in-out text-white bg-blue",
                  {
                    "bg-opacity-50": loading,
                    "active:bg-blue-dimmed": !loading,
                  }
                )}
              >
                {loading ? (
                  <div className="flex gap-1 items-center justify-center w-full h-full">
                    <Spinner />
                    <span className="text-white">Saving</span>
                  </div>
                ) : (
                  <span className="text-white">Save</span>
                )}
              </button>
            </div>
            <div className="p-5">
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
              {tableData.inches.length > 0 ? (
                <>
                  <div className="mb-5">
                    <h2 className="font-semibold text-sm text-gray mb-2">
                      Inches
                    </h2>
                    <SizesTable
                      data={tableData.inches}
                      columns={columns}
                      onUpdate={updateInchesData}
                      onColumnUpdate={updateColumns}
                    />
                  </div>
                  <div className="mb-5">
                    <h2 className="font-semibold text-sm text-gray mb-2">
                      Centimeters
                    </h2>
                    <SizesTable
                      data={tableData.centimeters}
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
