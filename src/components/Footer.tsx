import React from "react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10">
      <div className="mx-6 border-t border-slate-600"></div>
      <div className="mt-[1px] rounded-t-[2px] px-6 py-6 text-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/afi-reservas.png"
              alt="AFI Reservas"
              className="h-14 w-auto object-contain"
            />
            <a
              href="https://certificaciones.uaf.gob.do/certificaciones_so_view.php?editid1=262"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/certification/certification.png"
                alt="Certificación"
                className="h-14 w-auto object-contain hidden"
              />
            </a>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://cdneafireservaspeastus.azureedge.net/afireservas/media/35fi0rgd/pol%C3%ADtica-de-privacidadpagina-web.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Política de Privacidad
              </a>
              <span className="opacity-50">|</span>
              <a
                href="https://cdneafireservaspeastus.azureedge.net/afireservas/media/iwihcsvf/t%C3%A9rminos-y-condiciones-pagina-web.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Términos y Condiciones
              </a>
            </div>
            <div className="text-xs opacity-90">
              Copyright {new Date().getFullYear()} AFI Reservas. Todos los
              derechos reservados.
            </div>
            <div className="mt-1 flex items-center gap-3">
              <a
                href="https://www.facebook.com/AFIReservas/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="http://www.instagram.com/AfiReservas"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/i/flow/login?redirect_after_login=%2FAfiReservas"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
              >
                <img
                  src="/iconos/x.svg"
                  alt="X"
                  className="h-4 w-4 text-white"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/afireservas/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@AFIReservas"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-600 bg-slate-800/40 p-1.5 hover:bg-slate-700"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}