// src/app/page.tsx
import Calculator from "@/components/calculator";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col w-full items-center p-2 md:p-4 pt-8">
      <br /><br />
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
        Calculator With Text
      </h1>
      <Calculator />
      
      {/* CodePen Embed - SAFE IFRAME IMPLEMENTATION */}
      <div className="w-full max-w-2xl my-4">
        <iframe
          height="500"
          style={{ width: "100%", border: "2px solid #000", borderRadius: "4px" }}
          scrolling="no"
          title="Number to Text Calculator Demo"
          src="https://codepen.io/ABAnu-Sara/embed/VYjrqPp?default-tab=result&embed-version=2"
          frameBorder="0"
          loading="lazy"
          allowTransparency={true}
          allowFullScreen={true}
        >
          <a href="https://codepen.io/ABAnu-Sara/pen/VYjrqPp">
            View Calculator Demo on CodePen
          </a>
        </iframe>
      </div>
      
      <br /><br />
      
      {/* Buy Me a Coffee - Fixed alt text and URL */}
      <a 
        href="https://www.buymeacoffee.com/anusanta" 
        target="_blank" 
        rel="noopener noreferrer"
        className="rounded-lg shadow-2xl block"
      >
        <img 
          src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&slug=anusanta&button_colour=ff8e52&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" 
          alt="Buy me a coffee" 
          className="max-w-[300px]"
        />
      </a>
      
      <Card className="w-full md:w-auto md:min-w-[24rem] max-w-full mt-6 bg-white shadow-2xl rounded-2xl">
        <CardContent className="p-4">
          <ul className="list-disc pl-5 text-sm space-y-2 text-black">
            <li>
              <span className="font-bold">Why this Calculator with Text:</span> 
              Displays written text representation of numbers for learning purposes
            </li>
            <li>
              <span className="font-bold">INU:</span> International Number System (e.g., Million, Billion)
            </li>
            <li>
              <span className="font-bold">IS:</span> Indian System (e.g., Lakh, Crore)
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}