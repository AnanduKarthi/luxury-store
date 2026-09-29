import Link from "next/link";

const services = [
  {
    title: "Complimentary Shipping",
    body: "Free express delivery and returns on every order, wrapped in our signature packaging.",
    link: "Shipping details",
  },
  {
    title: "Private Appointments",
    body: "Shop in-store or by video call with a client advisor, at a time that suits you.",
    link: "Book an appointment",
  },
  {
    title: "Personalisation",
    body: "Add hot-stamped initials to selected leather goods and luggage.",
    link: "Learn more",
  },
];

export function Services() {
  return (
    <section className="container-page section-y">
      <ul className="grid border-t border-divider md:grid-cols-3">
        {services.map((service) => (
          <li
            key={service.title}
            className="border-b border-divider py-8 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
          >
            <h2 className="type-title-s mb-3">{service.title}</h2>
            <p className="mb-5 max-w-sm text-muted">{service.body}</p>
            <Link href="#" className="type-cta link-underline">
              {service.link}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
