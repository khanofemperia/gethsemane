import Link from "next/link";

export default function Footer() {
  const sections = [
    {
      title: "Get Help",
      links: [
        { name: "Track order", href: "#" },
        { name: "FAQs", href: "#" },
        { name: "Shipping info", href: "#" },
        { name: "Returns & refunds", href: "#" },
        { name: "Contact us", href: "#" },
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
    <footer className="w-full p-10 mt-10 bg-lightgray">
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
            <span className="block text-sm text-gray mb-2">
              Subscribe to our newsletter for exclusive deals and updates.
            </span>
            <div>
              <input
                className="mb-2 w-48 h-11 px-3 border rounded"
                type="text"
                placeholder="Enter your email"
              />
              <button className="w-48 h-11 rounded font-semibold text-amber bg-[#f6ecdb] border border-[#e4cfc1]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
