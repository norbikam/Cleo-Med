"use client";


export default function VoucherInfo() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background layer with fixed attachment for parallax effect */}
      <div
        className="absolute inset-0 z-[-1] bg-cover bg-center md:bg-fixed sm:bg-scroll"
        style={{
          backgroundImage:"url('/voucherinfobg.jpeg')",
        }}
      />
      
      {/* Content layer */}
      <div className="relative max-w-3xl mx-auto text-black text-center text-xl font-extralight">
        <h2 className="bg-black text-white text-2xl font-extralight">Podaruj sobie lub bliskiej osobie nietuzinkowy prezent!</h2><br/>
        <h2 className="text-4xl font-bold mb-6">Wybierz VOUCHER</h2>
        <p className="text-lg mb-4">
        Jeśli pragniesz obdarować kogoś wyjątkowego i szukasz niebanalnego upominku, mamy dla Ciebie idealne rozwiązanie – eleganckie zaproszenie na wybrany zabieg, pakiet zabiegów lub określoną kwotę.
        </p>
        <p className="text-lg">
        Skontaktuj się z nami, aby dopasować zakres i formę prezentu (rodzaj zabiegu, odbiorcę). Każde zaproszenie jest komponowane indywidualnie, zgodnie z Twoimi oczekiwaniami. Możesz zdecydować o jego wartości – nie ma ograniczeń kwotowych – lub wybrać konkretny zabieg bądź pakiet usług.
        </p>
      </div>
    </section>
  );
}
