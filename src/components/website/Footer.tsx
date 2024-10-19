import Link from "next/link";

export default function Footer() {
  const sections = [
    {
      title: "Customer Service",
      links: [
        { name: "Track Your Order", href: "#" },
        { name: "FAQs", href: "#" },
        { name: "Shipping", href: "#" },
        { name: "Returns", href: "#" },
        { name: "Contact Us", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full p-10 mt-10 bg-lightgray">
      <div className="w-[948px] h-[600px] mx-auto">
        <div className="grid grid-cols-3 gap-10">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              {section.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="block text-sm text-gray mb-2 hover:underline"
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
            <input type="text" placeholder="you@domain" />
          </div>
        </div>
      </div>
    </footer>
  );
}
