"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect } from "react";
import Spinner from "@/ui/Spinners/White";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeftIcon, CloseIcon, EditIcon } from "@/icons";
import clsx from "clsx";
import Overlay from "@/ui/Overlay";
import { AlertMessageType } from "@/lib/sharedTypes";
import { ReactSortable } from "react-sortablejs";
import { MdOutlineDragIndicator } from "react-icons/md";
import { UpdateProductAction } from "@/actions/products";
import { generateId } from "@/lib/utils";

type DataType = {
  id: string;
  highlights: {
    headline: string;
    keyPoints: KeyPointsType[];
  };
};

type ItemType = {
  id: number;
  name: string;
  order: number;
};

export function HighlightsButton() {
  const { showOverlay } = useOverlayStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.editProduct.name,
    overlayName: state.pages.editProduct.overlays.highlights.name,
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

export function HighlightsOverlay({ data }: { data: DataType }) {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessageType, setAlertMessageType] = useState<AlertMessageType>(
    AlertMessageType.NEUTRAL
  );
  const [keyPoints, setKeyPoints] = useState<ItemType[]>([]);

  useEffect(() => {
    data.highlights.keyPoints.sort((a, b) => a.index - b.index);
    const initialKeyPoints = data.highlights.keyPoints.map((item) => ({
      id: Number(generateId()),
      name: item.text,
      order: item.index,
    }));
    setKeyPoints(initialKeyPoints);
  }, []);

  const { hideOverlay } = useOverlayStore();

  const { pageName, isOverlayVisible, overlayName } = useOverlayStore(
    (state) => ({
      pageName: state.pages.editProduct.name,
      overlayName: state.pages.editProduct.overlays.highlights.name,
      isOverlayVisible: state.pages.editProduct.overlays.highlights.isVisible,
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

  const handleSave = async () => {
    setLoading(true);

    const sortedKeyPoints = [...keyPoints].sort((a, b) => a.order - b.order);
    const updatedKeyPoints = sortedKeyPoints.map((item, index) => ({
      text: item.name,
      index: index + 1,
    }));

    const updatedData = {
      id: data.id,
      highlights: {
        headline: "",
        keyPoints: updatedKeyPoints,
      },
    };

    try {
      const result = await UpdateProductAction(updatedData);
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
    }
  };

  const handleAdd = () => {
    const newKeyPoint = {
      id: Number(generateId()),
      name: "New Key Point",
      order: keyPoints.length + 1,
    };
    setKeyPoints((prevKeyPoints) => [...prevKeyPoints, newKeyPoint]);
  };

  const handleRemove = (id: number) => {
    setKeyPoints((prevKeyPoints) => {
      const filteredPoints = prevKeyPoints.filter((item) => item.id !== id);
      return filteredPoints.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    });
  };

  const handleInputChange = (id: number, newValue: string) => {
    setKeyPoints((prevKeyPoints) =>
      prevKeyPoints.map((item) =>
        item.id === id ? { ...item, name: newValue } : item
      )
    );
  };

  return (
    <>
      {isOverlayVisible && (
        <Overlay>
          <div className="absolute bottom-0 left-0 right-0 w-full h-[calc(100%-60px)] rounded-t-3xl overflow-hidden bg-white md:w-[520px] md:rounded-2xl md:shadow md:h-max md:mx-auto md:mt-20 md:mb-[50vh] md:relative md:bottom-auto md:left-auto md:right-auto md:top-auto md:-translate-x-0">
            <div className="w-full h-[calc(100vh-188px)] md:h-auto">
              <div className="md:hidden flex items-end justify-center pt-4 pb-2 absolute top-0 left-0 right-0 bg-white">
                <div className="relative flex justify-center items-center w-full h-7">
                  <h2 className="font-semibold text-lg">Highlights</h2>
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
                  className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray"
                >
                  <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                  <span className="font-semibold text-sm text-blue">
                    Highlights
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
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
              <div className="w-full h-full mt-[52px] md:mt-0 p-5 pb-28 md:pb-10 flex flex-col gap-5 overflow-x-hidden overflow-y-visible invisible-scrollbar md:overflow-hidden">
                <div>
                  <div>
                    <h2 className="font-semibold text-sm mb-3">Key points</h2>
                    <div className="rounded-md">
                      <div className="pb-3">
                        <ReactSortable
                          list={keyPoints}
                          setList={(newState) => {
                            const updatedState = newState.map(
                              (item, index) => ({
                                ...item,
                                order: index + 1,
                              })
                            );
                            setKeyPoints(updatedState);
                          }}
                          handle=".handle"
                        >
                          {keyPoints.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 mb-2 h-10"
                            >
                              <div className="w-full h-full flex items-center overflow-hidden rounded-full bg-lightgray">
                                <div className="handle cursor-move h-10 w-12 flex items-center pl-3">
                                  <MdOutlineDragIndicator
                                    size={22}
                                    className="fill-gray"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) =>
                                    handleInputChange(item.id, e.target.value)
                                  }
                                  className="h-10 w-full text-sm bg-transparent"
                                />
                              </div>
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="h-8 min-w-8 max-w-8 rounded-full flex items-center justify-center transition duration-300 ease-in-out bg-red/15 active:bg-red/25 lg:hover:bg-red/25"
                              >
                                <CloseIcon className="fill-red" size={18} />
                              </button>
                            </div>
                          ))}
                        </ReactSortable>
                      </div>
                      <button
                        onClick={handleAdd}
                        className="h-9 px-6 mx-auto font-medium border border-blue/20 text-blue rounded flex items-center justify-center transition duration-300 ease-in-out hover:bg-blue/10"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
