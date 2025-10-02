import { Link } from "wouter";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryGrid() {
  return (
    <section className="py-8 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
          {CATEGORIES.map((category) => (
            <Link key={category.id} href={`/catalog?category=${encodeURIComponent(category.id)}`}>
              <a 
                className="group flex flex-col items-center p-6 bg-gray-50 hover:bg-maputo-primary hover:text-white rounded-xl transition transform hover:scale-105"
                data-testid={`category-${category.id.toLowerCase()}`}
              >
                <div className="bg-maputo-primary group-hover:bg-white text-white group-hover:text-maputo-primary rounded-full p-4 mb-3 transition">
                  <i className={`${category.icon} text-3xl`}></i>
                </div>
                <h3 className="font-semibold text-center">{category.name}</h3>
                <p className="text-xs text-gray-600 group-hover:text-blue-100 mt-1 text-center">
                  {getCategoryDescription(category.id)}
                </p>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function getCategoryDescription(categoryId: string): string {
  switch (categoryId) {
    case "Construção":
      return "Tijolos, Cimento, Janelas";
    case "Móveis":
      return "Cadeiras, Mesas, Armários";
    case "Eletrônicos":
      return "Smartphones, TVs, Rádios";
    default:
      return "";
  }
}
