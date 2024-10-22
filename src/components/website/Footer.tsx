import Link from "next/link";

export default function Footer() {
  const sections = [
    {
      title: "Get Help",
      links: [
        { name: "Contact us", href: "#" },
        { name: "Track order", href: "#" },
        { name: "Returns & refunds", href: "#" },
        { name: "Shipping info", href: "#" },
        { name: "FAQs", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About us", href: "#" },
        { name: "Privacy policy", href: "#" },
        { name: "Terms of service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full p-10 pb-16 mt-16 bg-lightgray">
      <div className="w-[948px] mx-auto">
        <div className="grid grid-cols-3 gap-10">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              {section.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="block w-max text-sm text-gray mb-2 hover:underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          ))}
          <div>
            <h3 className="font-semibold mb-4">Stay Connected</h3>
            <span className="block text-sm text-gray mb-3">
              Subscribe to our newsletter <br /> for exclusive deals and updates
            </span>
            <div className="relative h-11 w-[270px]">
              <button className="peer w-[104px] h-[40px] absolute left-[164px] top-1/2 -translate-y-1/2 rounded font-semibold text-white">
                Subscribe
              </button>
              <div className="peer-hover:bg-[#cc8100] peer-hover:[background:linear-gradient(to_bottom,_#cc8100_5%,_#e29000_100%)] peer-active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.14)] w-full h-full p-[2px] rounded-lg shadow-[inset_0px_1px_0px_0px_#ffa405] [background:linear-gradient(to_bottom,_#e29000_5%,_#cc8100_100%)] bg-[#e29000]">
                <input
                  className="w-40 h-[40px] px-3 rounded-md"
                  type="text"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
