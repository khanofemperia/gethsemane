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

type ColumnType = {
  index: number;
  name: string;
};

type EntryLabelType = {
  index: number;
  name: string;
};

type ProductSizeType = {
  size: string;
  measurements: Record<string, { in: string; cm: string }>;
};

type DataType = {
  id: string;
  chart: SizeChartType | null;
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
      className="w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
    >
      <EditIcon size={20} />
    </button>
  );
}

export function SizeChartOverlay({ data }: { data: DataType }) {
  const chartExists =
    data.chart !== null && Object.keys(data.chart || {}).length > 0;
  const chartColumns = chartExists
    ? (data.chart?.columns || []).sort((a: any, b: any) => a.index - b.index)
    : [];
  const chartEntryLabels = chartExists
    ? (data.chart?.entryLabels || []).sort(
        (a: any, b: any) => a.index - b.index
      )
    : [];
  const chartEntries = chartExists ? data.chart?.sizes || [] : [];

  const [showChart, setShowChart] = useState<boolean>(chartExists || false);
  const [columns, setColumns] = useState<ColumnType[]>(chartColumns);
  const [entryLabels, setEntryLabels] =
    useState<EntryLabelType[]>(chartEntryLabels);
  const [entries, setEntries] = useState<ProductSizeType[]>(chartEntries);
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

    const updatedChart = {
      columns,
      entryLabels: entryLabels,
      sizes: entries,
    };

    try {
      const result = await UpdateProductAction({
        id: data.id,
        sizes: columns.length && entryLabels.length ? updatedChart : null,
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
      const size = entryLabel.name;
      const measurements = Object.fromEntries(
        columns.slice(1).map((col) => [col.name, { in: "0", cm: "0" }])
      );

      return { size, measurements };
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

    const newEntryLabels = values.map((name, index) => ({
      index: index + 1,
      name: name.trim(),
    }));

    setShowChart(false);
    setEntryLabels(newEntryLabels);
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
              in: updatedValue,
              cm: updatedValue,
            };
          } else {
            const floatValue = parseFloat(updatedValue);
            const centimeters = InchesToCentimeters(
              floatValue,
              columnName
            ).toFixed(1);

            measurements = {
              in:
                floatValue % 1 === 0
                  ? String(parseInt(updatedValue))
                  : updatedValue,
              cm:
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
                  <ArrowLeftIcon
                    className="fill-blue -ml-[2px]"
                    size={20}
                  />
                  <span className="font-semibold text-sm text-blue">
                    Sizes
                  </span>
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
                          entryLabels.length
                            ? entryLabels.map((label) => label.name).join(", ")
                            : ""
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
                          <thead className="h-10 border-b border-neutral-200 bg-gray">
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
                                  {entry.size}
                                </td>
                                {columns.slice(1).map((column, columnIndex) => (
                                  <td
                                    key={columnIndex}
                                    className={`text-center w-[100px] ${
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
                                            ]?.in === "0"
                                          ? ""
                                          : entry.measurements[
                                              column.name as keyof typeof entry.measurements
                                            ]?.in || ""
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
                          <thead className="h-10 border-b border-neutral-200 bg-gray">
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
                                  {entry.size}
                                </td>
                                {columns.slice(1).map((column, columnIndex) => (
                                  <td
                                    key={columnIndex}
                                    className={`text-center w-[100px] ${
                                      columnIndex === columns.length - 2
                                        ? ""
                                        : " border-r border-neutral-200"
                                    }`}
                                  >
                                    {
                                      entry.measurements[
                                        column.name as keyof typeof entry.measurements
                                      ]?.cm
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
