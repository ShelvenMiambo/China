import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { CONTACT_INFO, EXCHANGE_RATE, WHATSAPP_NUMBER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-maputo-primary rounded-lg p-2">
                <i className="fas fa-shipping-fast text-2xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">Maputo Import Hub</h3>
                <p className="text-sm text-gray-400">Desde 2024</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Importação direta da China para Maputo. Materiais de construção, móveis e eletrônicos com os melhores preços.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition" data-testid="footer-link-home">
                    Início
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/catalog">
                  <a className="text-gray-400 hover:text-white transition" data-testid="footer-link-catalog">
                    Catálogo
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition" data-testid="footer-link-about">
                    Sobre Nós
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-gray-400 hover:text-white transition"
                  data-testid="footer-link-contact"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/catalog?category=Construção">
                  <a className="text-gray-400 hover:text-white transition" data-testid="footer-category-construction">
                    Construção
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Móveis">
                  <a className="text-gray-400 hover:text-white transition" data-testid="footer-category-furniture">
                    Móveis
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Eletrônicos">
                  <a className="text-gray-400 hover:text-white transition" data-testid="footer-category-electronics">
                    Eletrônicos
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/catalog">
                  <a className="text-gray-400 hover:text-white transition" data-testid="footer-category-all">
                    Ver Tudo
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacte-nos</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mt-1 mr-3 text-maputo-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-maputo-primary" />
                <a 
                  href={`tel:${CONTACT_INFO.phone}`} 
                  className="text-gray-400 hover:text-white transition"
                  data-testid="footer-phone-link"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-maputo-primary" />
                <a 
                  href={`mailto:${CONTACT_INFO.email}`} 
                  className="text-gray-400 hover:text-white transition"
                  data-testid="footer-email-link"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition mt-2"
                  data-testid="footer-whatsapp-link"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp Business
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Maputo Import Hub. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Câmbio: 1 USD = {EXCHANGE_RATE} MZN</span>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Termos de Serviço</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacidade</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
