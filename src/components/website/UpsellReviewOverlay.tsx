"use client";

import { useOverlayStore } from "@/zustand/admin/overlayStore";
import { useNavbarMenuStore } from "@/zustand/admin/navbarMenuStore";
import { CloseIconThin } from "@/icons";

export function UpsellReviewButton() {
  const { showOverlay } = useOverlayStore();
  const { setNavbarMenu } = useNavbarMenuStore();

  const { pageName, overlayName } = useOverlayStore((state) => ({
    pageName: state.pages.products.name,
    overlayName: state.pages.products.overlays.newProduct.name,
  }));

  const openOverlay = () => {
    setNavbarMenu(false);
    showOverlay({ pageName, overlayName });
  };

  return (
    <button
      type="button"
      className="h-9 w-[calc(100%-10px)] mx-auto px-4 rounded-md flex items-center cursor-pointer transition duration-300 ease-in-out active:bg-lightgray lg:hover:bg-lightgray"
      onClick={openOverlay}
    >
      New product
    </button>
  );
}

export function UpsellReviewOverlay() {
  return (
    <div className="custom-scrollbar flex justify-center py-20 w-screen h-screen overflow-x-hidden overflow-y-visible z-20 fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="relative overflow-hidden shadow rounded-2xl bg-white">
        <div className="w-[640px] h-full pt-8 pb-[85px] flex flex-col relative">
          <div className="mb-2">
            <div className="w-max mx-auto flex gap-y-1 gap-x-2 *:w-7 *:h-7 *:rounded-full *:bg-lightgray *:flex *:items-center *:justify-center *:text-xs">
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
            </div>
          </div>
          <div className="custom-scrollbar overflow-x-hidden overflow-y-visible">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Est
            recusandae amet rem sint aliquid quod architecto quas iure, tenetur
            enim, aperiam cupiditate. Possimus iusto et commodi facere alias
            eius deleniti. Enim maxime architecto asperiores sit illum cum
            provident debitis nesciunt, corporis totam quis omnis, inventore
            expedita error, eum voluptatem quibusdam eveniet? Molestiae quis
            laboriosam quaerat eos cupiditate atque, nemo totam? Possimus
            repellendus maiores repudiandae et quidem, quas tempore aspernatur
            eligendi facere voluptate sequi deleniti animi harum eum eius
            quisquam hic iusto odio qui voluptas ducimus! Nobis aliquam
            inventore consequuntur corrupti! A neque quia vero voluptas,
            nesciunt culpa facilis dolorem est accusantium, ipsum vel asperiores
            fugiat molestias, praesentium repellendus rem nostrum magni enim.
            Aliquid quidem laudantium expedita ipsa. Dicta, labore excepturi!
            Esse mollitia perspiciatis officiis blanditiis nesciunt natus.
            Voluptas quae quis ipsam suscipit laboriosam porro eos numquam
            temporibus repellendus, molestias qui nihil expedita nisi maiores
            enim dignissimos ducimus perspiciatis eveniet! Est? Beatae iure
            commodi consectetur possimus nobis ullam ad inventore ipsum
            provident, ab fuga repudiandae accusantium nesciunt illum quasi
            quibusdam numquam sit quidem. Quisquam unde repudiandae, quibusdam
            vitae tenetur repellendus doloremque? Fugiat labore ipsum ut id
            cupiditate exercitationem, nam alias vitae illo repellendus
            perspiciatis sequi ducimus? Magnam laborum sit similique! Veritatis,
            corrupti? Excepturi officiis impedit aspernatur quae incidunt
            aliquid ipsam esse! Nihil iure animi repellat cumque tempora eaque,
            voluptatum autem illo. Aliquid dolorum laboriosam deserunt quia
            animi hic, corrupti natus modi dolore! Ea suscipit magni alias
            dolore optio voluptatibus ratione minima!
          </div>
          <div className="absolute left-0 right-0 bottom-0">
            <div className="h-[85px] pt-2 flex justify-center">
              <button className="h-12 w-max px-20 inline-block text-center align-middle border border-[rgba(0,0,0,0.1)_rgba(0,0,0,0.1)_rgba(0,0,0,0.25)] rounded-full ease-in-out duration-300 transition bg-amber hover:bg-amber-dimmed active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.2)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]">
                All Set! Add Upgrade to Cart
              </button>
            </div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full absolute top-[6px] right-[6px] flex items-center justify-center ease-in-out transition duration-300 hover:bg-lightgray">
          <CloseIconThin size={24} className="text-gray" />
        </button>
      </div>
    </div>
  );
}
