import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export default function HeroCarousel() {
  return (
    <section className="bg-gradient-to-r from-maputo-primary to-blue-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-in">
            <span className="inline-block bg-maputo-warning text-gray-900 px-4 py-1 rounded-full text-sm font-semibold mb-4 badge-pulse">
              <i className="fas fa-fire mr-2"></i>PROMOÇÃO ESPECIAL
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Tijolos por apenas <span className="text-maputo-warning">25 MZN!</span>
            </h2>
            <p className="text-xl mb-6 text-blue-100">
              Importação direta da China. Qualidade garantida, preços imbatíveis!
            </p>
            <ul className="space-y-2 mb-8 text-blue-100">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-maputo-warning mr-3" />
                <span>5.000 unidades em estoque</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-maputo-warning mr-3" />
                <span>Entrega em todo Maputo</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-maputo-warning mr-3" />
                <span>Suporte B2B para construtoras</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link href="/catalog">
                <Button 
                  className="bg-maputo-warning hover:bg-maputo-warning-dark text-gray-900 px-8 py-3 font-semibold"
                  data-testid="hero-catalog-button"
                >
                  Ver Catálogo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button 
                asChild
                variant="outline" 
                className="bg-white hover:bg-gray-100 text-maputo-primary border-white px-8 py-3 font-semibold"
              >
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Quero solicitar uma cotação.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="hero-whatsapp-button"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1590642916589-592bca10dfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Materiais de construção" 
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 hidden md:block">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 text-green-600 rounded-full p-3">
                  <i className="fas fa-truck text-xl"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Entrega Rápida</p>
                  <p className="font-bold text-gray-900">2-3 Dias Úteis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
