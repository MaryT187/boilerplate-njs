import Link from "next/link";
import { filled } from "@/lib/utils";
import { Section } from "@/components/ui/Section";
import { SvgInline } from "@/components/ui/SvgInline";

type Item = { title: string; text?: string; icon?: string; href?: string };

type Props = Omit<React.ComponentProps<typeof Section>, "children"> & {
  items: Item[];
  columns?: 2 | 3 | 4;
};

const cols = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function FeatureGrid({ items, columns = 3, ...section }: Props) {
  const list = items.filter((i) => filled(i.title));
  if (list.length === 0) return null;

  return (
    <Section {...section}>
      <ul className={`grid gap-5 sm:gap-6 ${cols[columns]}`}>
        {list.map((item) => {
          const body = (
            <>
              {filled(item.icon) && (
                <span className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <SvgInline src={item.icon} className="size-6" />
                </span>
              )}
              <h3 className="text-lg sm:text-xl">{item.title}</h3>
              {filled(item.text) && <p className="mt-2 text-muted">{item.text}</p>}
            </>
          );
          return (
            <li
              key={item.title}
              className="rounded-xl border border-line bg-white p-6 transition-shadow has-[a:hover]:shadow-lg"
            >
              {filled(item.href) ? (
                <Link href={item.href} className="block">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
