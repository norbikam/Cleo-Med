"use client";

export default function VoucherInfo() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background layer with fixed attachment for parallax effect */}
      <div
        className="absolute inset-0 z-[-1] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url(https://img.freepik.com/premium-zdjecie/kobieta-z-afro-siedzi-przed-sciana_1292121-2070.jpg?w=1380)",
        }}
      />
      
      {/* Content layer */}
      <div className="relative max-w-3xl mx-auto text-whitesmoke text-center">
        <h2 className="bg-white text-black text-2xl">Spraw sobie lub bliskiej osobie oryginalny prezent</h2><br/>
        <h2 className="text-4xl font-bold mb-6">Skorzystaj z VOUCHERA</h2>
        <p className="text-lg mb-4">
        Jeśli chcesz sprawić bliskiej Ci osobie miły prezent i szukasz wyjątkowego podarunku to specjalnie dla Ciebie przygotowaliśmy najlepszy prezent, jaki możesz wręczyć – eleganckie zaproszenie na dowolny zabieg, pakiet zabiegów lub na odpowiednią kwotę pieniędzy.
        </p>
        <p className="text-lg">
        Skontaktuj się z nami celem ustalenia zakresu i formy podarunku (rodzaj zabiegu, dla kogo). Zaproszenie jest indywidualnie komponowane do Państwa potrzeb. Może być wystawione na określoną kwotę (nie ma ograniczeń kwotowych) lub na wybrany zabieg lub pakiet zabiegów.
        </p>
      </div>
    </section>
  );
}
