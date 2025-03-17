"use client";

export default function InfoBlocks() {
  return (
    <div className="infoblocks pb-12 sm:pt-0 font-medium md:pt-12">
      <div className="flex justify-center">
        {/* Responsive container */}
        <div className="flex flex-col md:flex-row w-4/5 bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Left Block */}
          <div className="w-full md:w-1/2 bg-blue-200 text-white p-6">
            <div className="text-2xl text-center mb-4">📄</div>
            <h2 className="text-xl font-bold text-black text-center">
              Karta stałego klienta
            </h2>
            <ul className="mt-4 space-y-2 text-black text-xl">
              <li>➜ Karta jest imienna.</li>
              <li>➜ Karta wydawana jest bezterminowo.</li>
              <li>➜ Karty nie można sprzedać ani odstępować innej osobie.</li>
            </ul>
            <div className="text-2xl text-center mt-6 mb-4">💳</div>
            <h3 className="text-lg font-bold text-black text-center">
              Płatność kartą i gotówką
            </h3>
            <div className="flex justify-center mt-4">
              <img
                src="/treatments/formy-platnosci.png"
                alt=""
                className="h-10"
              />
            </div>
          </div>

          {/* Right Block */}
          <div className="w-full md:w-1/2 bg-red-200 p-6 bg-white">
            <div className="text-2xl text-center text-black-500 mb-4">ℹ️</div>
            <h2 className="text-xl font-bold text-black text-center">
              Informacja
            </h2>
            <p className="mt-10 text-black text-xl">
              Każdy Klient odwiedzający nasz salon, otrzymuje Kartę stałego
              klienta, przy każdej wizycie karta klienta jest uzupełniana.
            </p>
            <p className="mt-4 text-black text-xl">
              Przy wykonaniu 10 usług w naszym gabinecie, sumujemy wszystkie
              kwoty wydatkowane na każdą usługę. Z kwoty jaką uzyskamy łącznie
              odejmujemy 10%, które stanowi rabat na kolejny zabieg.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
