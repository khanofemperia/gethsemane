"use client";

import AlertMessage from "@/components/shared/AlertMessage";
import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/ui/Spinners/Default";
import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { ArrowLeftIcon, CloseIcon, EditIcon } from "@/icons";
import clsx from "clsx";
import { AlertMessageType } from "@/lib/sharedTypes";
import { ReactSortable } from "react-sortablejs";
import { MdOutlineDragIndicator } from "react-icons/md";
import { UpdateProductAction } from "@/actions/products";
import { generateId } from "@/lib/utils";
import { TextEditor } from "@/components/shared/TextEditor";

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

export function HighlightsButton({ className }: { className?: string }) {
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.highlights.name
  );

  return (
    <button
      onClick={() => showOverlay({ pageName, overlayName })}
      type="button"
      className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray ${className}`}
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
  const [headline, setHeadline] = useState(data.highlights.headline);
  const [keyPoints, setKeyPoints] = useState<ItemType[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    data.highlights.keyPoints.sort((a, b) => a.index - b.index);
    const initialKeyPoints = data.highlights.keyPoints.map((item) => ({
      id: Number(generateId()),
      name: item.text,
      order: item.index,
    }));
    setKeyPoints(initialKeyPoints);
  }, []);

  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const pageName = useOverlayStore((state) => state.pages.editProduct.name);
  const overlayName = useOverlayStore(
    (state) => state.pages.editProduct.overlays.highlights.name
  );
  const isOverlayVisible = useOverlayStore(
    (state) => state.pages.editProduct.overlays.highlights.isVisible
  );

  useEffect(() => {
    if (isOverlayVisible || showAlert) {
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        if (overlayRef.current) {
          overlayRef.current.scrollTo(0, 0);
        }
      });
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
    setLoading(true);

    const sortedKeyPoints = [...keyPoints].sort((a, b) => a.order - b.order);
    const updatedKeyPoints = sortedKeyPoints.map((item, index) => ({
      text: item.name,
      index: index + 1,
    }));

    const updatedData = {
      id: data.id,
      highlights: {
        headline,
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
      onHideOverlay();
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
        <div
          ref={overlayRef}
          className="px-5 md:px-0 fixed top-0 bottom-0 left-0 right-0 z-50 transition duration-300 ease-in-out bg-glass-black backdrop-blur-sm overflow-x-hidden overflow-y-visible custom-scrollbar"
        >
          <div className="bg-white max-w-[520px] rounded-2xl shadow mx-auto mt-20 mb-[50vh] relative">
            <div className="flex items-center justify-between py-2 pr-4 pl-2">
              <button
                onClick={() => {
                  hideOverlay({ pageName, overlayName });
                }}
                type="button"
                className="h-9 px-3 rounded-full flex items-center gap-1 transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
              >
                <ArrowLeftIcon className="fill-blue -ml-[2px]" size={20} />
                <span className="font-semibold text-sm text-blue">
                  Highlights
                </span>
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
            <div className="w-full px-5 pt-5 pb-10">
              <div className="mb-5">
                <TextEditor
                  isSimpleEditor={true}
                  name="highlights"
                  value={headline}
                  onChange={(newValue: string) => setHeadline(newValue)}
                />
              </div>
              <div>
                <h2 className="text-xs text-gray mb-3">Key points</h2>
                <div className="rounded-md">
                  <div className="pb-3">
                    <ReactSortable
                      list={keyPoints}
                      setList={(newState) => {
                        const updatedState = newState.map((item, index) => ({
                          ...item,
                          order: index + 1,
                        }));
                        setKeyPoints(updatedState);
                      }}
                      handle=".handle"
                    >
                      {keyPoints.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 mb-2 h-10"
                        >
                          <div className="w-full h-full flex items-center overflow-hidden rounded-full transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed hover:bg-lightgray-dimmed">
                            <div className="handle cursor-grab h-10 w-12 flex items-center pl-3">
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
                              className="h-10 w-full pr-4 bg-transparent"
                            />
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="h-6 min-w-6 max-w-6 rounded-full flex items-center justify-center transition duration-300 ease-in-out bg-lightgray active:bg-lightgray-dimmed lg:hover:bg-lightgray-dimmed"
                          >
                            <CloseIcon className="fill-gray" size={16} />
                          </button>
                        </div>
                      ))}
                    </ReactSortable>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="h-9 px-6 mx-auto font-medium border text-blue rounded flex items-center justify-center transition duration-300 ease-in-out hover:bg-blue/10"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
